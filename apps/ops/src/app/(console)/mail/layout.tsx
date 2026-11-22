import { PageHeader } from '@indus/ops-ui/shell'
import { T3Mail } from '@indus/ops-ui/templates'
import type { ReactNode } from 'react'
import MailFolders from '../../../components/route/MailFolders'
import Arrives from '../../../components/skeleton/Arrives'

/**
 * T3 Three-pane mail (boards 91, 94): the page header and the folder rail persist across folders and
 * threads; the folder and thread pages fill the reading pane. Not an authorization boundary: every page
 * under it calls requireOpsUser() (apps/ops/CLAUDE.md §5.3). The thread list arrives with S05, which
 * reads it per folder.
 */
export default function MailLayout({ children }: { children: ReactNode }) {
  return (
    <T3Mail
      header={<PageHeader crumb="Workspace" title="Mail" />}
      folders={<MailFolders />}
      list={
        <div className="p-4">
          <Arrives
            sprint="S05"
            what="The folder’s threads, newest first, with who sent them and what they are about."
          />
        </div>
      }
      reading={children}
    />
  )
}
