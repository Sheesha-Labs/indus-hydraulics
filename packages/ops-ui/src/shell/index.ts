// Shell kit (S02): `@indus/ops-ui/shell`. S02-T01: the Sidebar, its navigation model and menus, OpsIcon.
// Client parts: SidebarClient (collapse, live badges, tooltips), ProfileMenu, AssistantPillMenu and
// ShellLiveProvider. Sidebar itself is shared; nav.ts is pure (server, proxy, tests).
export { default as Sidebar, LogoPlaceholder, type SidebarProps } from './Sidebar'
export {
  default as SidebarClient,
  navItemName,
  type SidebarClientProps,
  type SidebarPreview,
  type SidebarUser,
} from './SidebarClient'
export {
  default as ProfileMenu,
  ProfileMenuFrame,
  type ProfileMenuProps,
  type ProfileMenuUser,
} from './ProfileMenu'
export { default as AssistantPillMenu, type AssistantPillMenuProps } from './AssistantPillMenu'
export { ShellLiveProvider, useShellLive, type ShellLive } from './live'
export {
  activeKeyFromPathname,
  activeKeyFromSegment,
  ASSISTANT_SEVERITY,
  AUTOPILOT_HREF,
  DEVICES_HREF,
  isSidebarCollapsed,
  NAV_ALIASES,
  NAV_DESTINATIONS,
  NAV_GROUPS,
  PROFILE_HREF,
  SETTINGS_ITEM,
  SIDEBAR_COOKIE,
  SIDEBAR_COOKIE_COLLAPSED,
  SIDEBAR_COOKIE_EXPANDED,
  worstAssistantStatus,
  type NavGroup,
  type NavItem,
  type NavKey,
} from './nav'
export {
  default as OpsIcon,
  OPS_ICON_NAMES,
  type OpsIconName,
  type OpsIconProps,
} from '../icons/OpsIcon'
