import type { NAVIGATION_QUERY_RESULT } from '../../../sanity.types'

export type Navigation = NonNullable<NAVIGATION_QUERY_RESULT>
export type Menu = NonNullable<Navigation['menus']>[number]
export type MenuColumn = NonNullable<Menu['columns']>[number]
export type MenuLink = NonNullable<MenuColumn['links']>[number]
export type MenuFeature = NonNullable<Menu['featured']>[number]
export type SearchSettings = NonNullable<Navigation['search']>

/** Links for the "Sandbox" dropdown, from Site settings. */
export type SandboxLink = { key: string; label: string; href: string }
