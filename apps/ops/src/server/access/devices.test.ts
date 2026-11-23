import { describe, expect, it } from 'vitest'
import { newDeviceEmail } from '../mail/system-templates'
import { deviceHash, describeDevice, gstStamp, requestLocation } from './devices'

/** Device labels, the keyed device hash and the Vercel geo headers (S03-T02). */
const UA = {
  chromeMac:
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
  chromeMacNext:
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/132.0.0.0 Safari/537.36',
  safariIpad:
    'Mozilla/5.0 (iPad; CPU OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1',
  safariIphone:
    'Mozilla/5.0 (iPhone; CPU iPhone OS 18_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.1 Mobile/15E148 Safari/604.1',
  edgeWindows:
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36 Edg/131.0.0.0',
  firefoxLinux: 'Mozilla/5.0 (X11; Linux x86_64; rv:133.0) Gecko/20100101 Firefox/133.0',
  chromeAndroid:
    'Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Mobile Safari/537.36',
  headless:
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/131.0.0.0 Safari/537.36',
}

describe('describeDevice', () => {
  it.each([
    [UA.chromeMac, 'Chrome on macOS'],
    [UA.safariIpad, 'Safari on iPad'],
    [UA.safariIphone, 'Safari on iPhone'],
    [UA.edgeWindows, 'Edge on Windows'],
    [UA.firefoxLinux, 'Firefox on Linux'],
    [UA.chromeAndroid, 'Chrome on Android'],
    [UA.headless, 'Chrome on macOS'],
  ])('%s → %s', (ua, label) => {
    expect(describeDevice(ua).label).toBe(label)
  })

  it('never returns a blank label', () => {
    expect(describeDevice(null).label).toBe('Unknown browser')
    expect(describeDevice('').label).toBe('Unknown browser')
    expect(describeDevice('curl/8.4.0').label).toBe('Unknown browser')
  })
})

describe('deviceHash', () => {
  const secret = 'device-hash-test-secret-0123456789abcdef'

  it('is stable across browser versions and differs by browser, OS and device type', () => {
    const mac = deviceHash(describeDevice(UA.chromeMac), secret)
    expect(deviceHash(describeDevice(UA.chromeMacNext), secret)).toBe(mac)
    expect(deviceHash(describeDevice(UA.safariIpad), secret)).not.toBe(mac)
    expect(deviceHash(describeDevice(UA.edgeWindows), secret)).not.toBe(mac)
    expect(deviceHash(describeDevice(UA.safariIphone), secret)).not.toBe(
      deviceHash(describeDevice(UA.safariIpad), secret)
    )
  })

  it('is keyed: another secret gives another hash', () => {
    const info = describeDevice(UA.chromeMac)
    expect(deviceHash(info, secret)).not.toBe(deviceHash(info, `${secret}-other`))
    expect(deviceHash(info, secret)).toMatch(/^[0-9a-f]{64}$/)
  })
})

describe('requestLocation', () => {
  it('decodes the URI-encoded city and keeps a two-letter country', () => {
    const h = new Headers({ 'x-vercel-ip-city': 'Ras%20Al%20Khaimah', 'x-vercel-ip-country': 'ae' })
    expect(requestLocation(h)).toEqual({ city: 'Ras Al Khaimah', country: 'AE' })
  })

  it('is null without the headers (local) and for a malformed country', () => {
    expect(requestLocation(new Headers())).toEqual({ city: null, country: null })
    const h = new Headers({ 'x-vercel-ip-city': '%E0%A4%A', 'x-vercel-ip-country': 'XX1' })
    expect(requestLocation(h)).toEqual({ city: '%E0%A4%A', country: null })
  })
})

describe('new-device email', () => {
  it('names the device, city and time in GST and points at Devices', () => {
    const at = new Date('2026-11-23T04:41:00Z')
    expect(gstStamp(at)).toBe('23 Nov 2026 08:41 GST')
    const mail = newDeviceEmail({
      device: 'Safari on iPad',
      city: 'Dubai',
      when: gstStamp(at),
      devicesUrl: 'http://localhost:3132/settings/team#devices',
    })
    expect(mail.text).toContain(
      'New sign-in to Indus Operations: Safari on iPad, Dubai, 23 Nov 2026 08:41 GST.'
    )
    expect(mail.text).toContain('sign out that device in Settings › Team › Devices')
    expect(mail.html).toContain('href="http://localhost:3132/settings/team#devices"')
    const noCity = newDeviceEmail({
      device: 'Chrome on macOS',
      city: null,
      when: 'x',
      devicesUrl: 'u',
    })
    expect(noCity.text).toContain('Chrome on macOS, x.')
  })
})
