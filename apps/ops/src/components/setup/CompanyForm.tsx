'use client'

import { Button } from '@indus/ops-ui/controls'
import { cn } from '@indus/ops-ui/lib/cn'
import { Chip } from '@indus/ops-ui/status'
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import { saveCompanyProfileAction } from '../../actions/setup'
import {
  addressLinesFrom,
  addressText,
  copiedUnconfirmed,
  normaliseTrn,
  trnError,
  type CompanyAssets,
  type CompanyImageSlot,
  type CompanyProfile,
} from '../../lib/company-profile'
import ImageSlot, { type UploadedImage } from './ImageSlot'
import LetterheadPreview from './LetterheadPreview'
import { useSaveStatus } from './SaveStatus'

/**
 * Setup 1 · Company and documents (board 79), the client half. One draft shared by the fields (the
 * T9 body) and the live letterhead preview (the T9 aside), so the preview follows every keystroke.
 *
 * Autosave: 800 ms after the last change the profile is saved with its version (`company.profile`,
 * updateSetting's version check). Saves never overlap: a change during a save is saved right after it.
 * A refused version ("Someone changed this a moment ago…", another tab or person) stops autosaving and
 * offers Reload, so nothing is silently overwritten. An invalid TRN is shown under the field and not
 * saved until it is 15 digits (or empty).
 */

export const AUTOSAVE_MS = 800

export type CompanyPerson = {
  id: string
  name: string
  firstName: string
  role: 'owner' | 'helper'
}

export interface CompanyDraftProps {
  profile: CompanyProfile
  profileVersion: number
  assets: CompanyAssets
  assetsVersion: number
  fileNames: Record<string, string>
  people: CompanyPerson[]
  maxUploadMb: number
  children: ReactNode
}

type Draft = {
  profile: CompanyProfile
  address: string
  assets: CompanyAssets
  assetsVersion: number
  fileNames: Record<string, string>
  people: CompanyPerson[]
  maxUploadMb: number
  conflict: string | null
  trnProblem: string | null
  setField: (
    field: 'legalName' | 'tradingName' | 'trn' | 'phone' | 'website',
    value: string
  ) => void
  setAddress: (value: string) => void
  confirm: () => void
  confirming: boolean
  imageUploaded: (slot: CompanyImageSlot, image: UploadedImage) => void
}

const DraftContext = createContext<Draft | null>(null)

function useDraft(): Draft {
  const d = useContext(DraftContext)
  if (!d) throw new Error('company form part outside CompanyDraftProvider')
  return d
}

export function CompanyDraftProvider(props: CompanyDraftProps) {
  const status = useSaveStatus()
  const [profile, setProfile] = useState(props.profile)
  const [address, setAddressText] = useState(addressText(props.profile.addressLines))
  const [assets, setAssets] = useState(props.assets)
  const [assetsVersion, setAssetsVersion] = useState(props.assetsVersion)
  const [fileNames, setFileNames] = useState(props.fileNames)
  const [conflict, setConflict] = useState<string | null>(null)
  const [confirming, setConfirming] = useState(false)

  const version = useRef(props.profileVersion)
  const latest = useRef(profile)
  const dirty = useRef(false)
  const inFlight = useRef(false)
  const timer = useRef<number | null>(null)
  const stopped = useRef(false)

  const trnProblem = trnError(profile.trn)
  // The follow-up save after a change made mid-save (a ref: a callback cannot name itself).
  const saveAgain = useRef<(() => Promise<void>) | null>(null)

  const save = useCallback(
    async (confirm = false) => {
      if (stopped.current) return
      if (inFlight.current) {
        dirty.current = true
        return
      }
      // An invalid TRN is shown under its field and not saved ("· not saved" in the foot).
      if (trnError(latest.current.trn) && !confirm) {
        status.report('error')
        return
      }
      inFlight.current = true
      dirty.current = false
      status.report('saving')
      const res = await saveCompanyProfileAction({
        profile: latest.current,
        expectedVersion: version.current,
        ...(confirm ? { confirm: true } : {}),
      })
      inFlight.current = false
      if (res.success) {
        version.current = res.data.version
        // A change made during the save is saved next; until then the foot keeps "saving…".
        status.report(dirty.current ? 'saving' : 'saved', res.data.savedAt)
        if (confirm) setProfile((p) => ({ ...p, confirmedAt: res.data.savedAt }))
        if (dirty.current) void saveAgain.current?.()
      } else {
        status.report('error')
        stopped.current = true
        setConflict(res.error)
      }
    },
    [status]
  )

  useEffect(() => {
    saveAgain.current = () => save()
  }, [save])

  const schedule = useCallback(() => {
    if (timer.current !== null) window.clearTimeout(timer.current)
    timer.current = window.setTimeout(() => {
      timer.current = null
      void save()
    }, AUTOSAVE_MS)
  }, [save])

  useEffect(
    () => () => {
      if (timer.current !== null) window.clearTimeout(timer.current)
    },
    []
  )

  const update = useCallback(
    (next: CompanyProfile) => {
      latest.current = next
      setProfile(next)
      if (stopped.current) return
      // "saving…" from the first keystroke: the change is not stored until the save returns.
      status.report('saving')
      schedule()
    },
    [schedule, status]
  )

  const value = useMemo<Draft>(
    () => ({
      profile,
      address,
      assets,
      assetsVersion,
      fileNames,
      people: props.people,
      maxUploadMb: props.maxUploadMb,
      conflict,
      trnProblem,
      confirming,
      setField: (field, raw) =>
        update({ ...latest.current, [field]: field === 'trn' ? normaliseTrn(raw) : raw }),
      setAddress: (raw) => {
        setAddressText(raw)
        update({ ...latest.current, addressLines: addressLinesFrom(raw) })
      },
      confirm: () => {
        if (timer.current !== null) window.clearTimeout(timer.current)
        timer.current = null
        setConfirming(true)
        void save(true).finally(() => setConfirming(false))
      },
      imageUploaded: (slot, image) => {
        setAssets((a) =>
          slot.kind === 'logo'
            ? { ...a, logoFileId: image.fileId }
            : slot.kind === 'stamp'
              ? { ...a, stampFileId: image.fileId }
              : { ...a, signatures: { ...a.signatures, [slot.userId]: image.fileId } }
        )
        setAssetsVersion(image.version)
        setFileNames((f) => ({ ...f, [image.fileId]: image.filename }))
        status.report('saved', image.savedAt)
      },
    }),
    [
      profile,
      address,
      assets,
      assetsVersion,
      fileNames,
      props.people,
      props.maxUploadMb,
      conflict,
      trnProblem,
      confirming,
      update,
      save,
      status,
    ]
  )

  return <DraftContext.Provider value={value}>{props.children}</DraftContext.Provider>
}

const CONTROL =
  'io-focus-field border-io-line bg-io-card text-io-ink rounded-io-ctl h-io-btn-lg w-full min-w-0 border px-3 text-[13px] outline-none placeholder:text-io-ink-3 aria-invalid:border-io-bad-solid'

function TextField({
  label,
  value,
  onChange,
  copied,
  error,
  full,
  maxLength,
  inputMode,
  autoComplete,
  placeholder,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  copied?: boolean
  error?: string | null
  full?: boolean
  maxLength: number
  inputMode?: 'numeric' | 'tel' | 'url' | 'text'
  autoComplete?: string
  placeholder?: string
}) {
  const id = useId()
  return (
    <div className={cn('flex min-w-0 flex-col gap-[5px]', full && 'col-span-2')}>
      <label
        htmlFor={id}
        className="text-io-ink-2 flex items-center gap-1.5 text-[12px] font-medium"
      >
        {label}
        {copied ? <Chip tone="warn" size="sm" label="Copied from previous setup — check" /> : null}
      </label>
      <input
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        maxLength={maxLength}
        spellCheck={false}
        {...(inputMode ? { inputMode } : {})}
        {...(autoComplete ? { autoComplete } : {})}
        {...(placeholder ? { placeholder } : {})}
        {...(error ? { 'aria-invalid': true, 'aria-describedby': `${id}-err` } : {})}
        className={CONTROL}
      />
      {error ? (
        <span id={`${id}-err`} className="text-io-bad text-[11.5px]">
          {error}
        </span>
      ) : null}
    </div>
  )
}

/** The fields (T9 body): legal details, the bank note, and the four image tiles. */
export function CompanyFields() {
  const d = useDraft()
  const copied = copiedUnconfirmed(d.profile)
  const owner = d.people.find((p) => p.role === 'owner')
  const helper = d.people.find((p) => p.role === 'helper')
  const signatureSlots = [owner, helper].filter((p): p is CompanyPerson => Boolean(p))
  const maxBytes = d.maxUploadMb * 1024 * 1024
  return (
    <div data-company-form="" className="flex flex-col gap-[18px]">
      {d.conflict ? (
        <div
          role="alert"
          className="bg-io-bad-tint text-io-banner-bad-ink rounded-io-card flex items-center gap-3 px-4 py-3 text-[13px]"
        >
          <span className="flex-1">{d.conflict} Your last change was not saved.</span>
          <Button size="sm" onClick={() => window.location.reload()}>
            Reload
          </Button>
        </div>
      ) : null}
      <div className="grid grid-cols-2 gap-3.5">
        <TextField
          full
          label="Legal name"
          value={d.profile.legalName}
          onChange={(v) => d.setField('legalName', v)}
          copied={copied && d.profile.legalName !== ''}
          maxLength={200}
          autoComplete="organization"
        />
        <TextField
          label="Trading name"
          value={d.profile.tradingName}
          onChange={(v) => d.setField('tradingName', v)}
          maxLength={200}
        />
        <TextField
          label="TRN"
          value={d.profile.trn}
          onChange={(v) => d.setField('trn', v)}
          copied={copied && d.profile.trn !== ''}
          error={d.trnProblem}
          maxLength={20}
          inputMode="numeric"
          placeholder="15 digits"
        />
        <TextField
          full
          label="Address"
          value={d.address}
          onChange={d.setAddress}
          maxLength={600}
          autoComplete="street-address"
          placeholder="Office, building, street, area, city"
        />
        <TextField
          label="Phone"
          value={d.profile.phone}
          onChange={(v) => d.setField('phone', v)}
          maxLength={40}
          inputMode="tel"
          autoComplete="tel"
        />
        <TextField
          label="Website"
          value={d.profile.website}
          onChange={(v) => d.setField('website', v)}
          maxLength={200}
          inputMode="url"
        />
      </div>

      {copied ? (
        <div className="flex items-center gap-3 text-[12.5px]">
          <span className="text-io-ink-2 flex-1">
            Check the copied values, then confirm them. The tags clear once confirmed.
          </span>
          <Button
            size="sm"
            busy={d.confirming}
            onClick={d.confirm}
            disabled={d.trnProblem !== null}
          >
            Confirm these details
          </Button>
        </div>
      ) : null}

      <div className="flex flex-col gap-2">
        <span className="io-eyebrow">Bank accounts</span>
        <p className="border-io-line bg-io-card rounded-io-ctl text-io-ink-2 border px-3 py-2.5 text-[13px] leading-[1.5]">
          Bank details are confirmed in Settings › Bank accounts before any client document is
          issued.
        </p>
      </div>

      <div className="grid grid-cols-4 gap-3">
        <ImageSlot
          label="Logo"
          slot={{ kind: 'logo' }}
          accept={['image/png', 'image/jpeg']}
          emptyText="Drop PNG or JPEG"
          fileName={d.assets.logoFileId ? (d.fileNames[d.assets.logoFileId] ?? 'logo') : null}
          assetsVersion={d.assetsVersion}
          maxBytes={maxBytes}
          onUploaded={(img) => d.imageUploaded({ kind: 'logo' }, img)}
        />
        <ImageSlot
          label="Stamp"
          slot={{ kind: 'stamp' }}
          accept={['image/png']}
          emptyText="Drop PNG"
          fileName={d.assets.stampFileId ? (d.fileNames[d.assets.stampFileId] ?? 'stamp') : null}
          assetsVersion={d.assetsVersion}
          maxBytes={maxBytes}
          onUploaded={(img) => d.imageUploaded({ kind: 'stamp' }, img)}
        />
        {signatureSlots.map((person) => {
          const fileId = d.assets.signatures[person.id]
          return (
            <ImageSlot
              key={person.id}
              label={`Signature · ${person.firstName}`}
              slot={{ kind: 'signature', userId: person.id }}
              accept={['image/png']}
              emptyText="Drop PNG"
              fileName={fileId ? (d.fileNames[fileId] ?? 'signature') : null}
              assetsVersion={d.assetsVersion}
              maxBytes={maxBytes}
              onUploaded={(img) => d.imageUploaded({ kind: 'signature', userId: person.id }, img)}
            />
          )
        })}
      </div>
    </div>
  )
}

/** The aside (board 79 right column): the live letterhead and the ownership note. */
export function CompanyPreview() {
  const d = useDraft()
  const owner = d.people.find((p) => p.role === 'owner') ?? null
  return (
    <div className="flex flex-col gap-2">
      <span className="io-eyebrow">Live preview · quotation header and footer</span>
      <LetterheadPreview
        profile={d.profile}
        logoFileId={d.assets.logoFileId}
        signatory={
          owner
            ? { name: owner.name, signatureFileId: d.assets.signatures[owner.id] ?? null }
            : null
        }
      />
      <p className="text-io-ink-3 text-[12px] leading-[1.45]">
        Copied once from the previous setup. From now on Indus Operations owns these values; nothing
        depends on the website admin.
      </p>
    </div>
  )
}
