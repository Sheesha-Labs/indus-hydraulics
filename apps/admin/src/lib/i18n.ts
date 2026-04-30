import { createNavigation } from 'next-intl/navigation'
import { routing } from '@indus/i18n'

export { routing }
export const { Link, redirect, usePathname, useRouter, getPathname } = createNavigation(routing)
