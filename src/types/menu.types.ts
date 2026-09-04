export interface MenuItem {
    label: string
    icon: string
    routeName?: string
    phase?: string
    badge?: string | number
    badgeColor?: string
    action?: () => void
    disabled?: boolean
    permissions?: string[]
}

export interface MenuPhase {
    id: string
    label: string
    icon: string
    items: MenuItem[]
}

export interface MenuGroup {
    label: string
    icon?: string
    items: MenuItem[]
}