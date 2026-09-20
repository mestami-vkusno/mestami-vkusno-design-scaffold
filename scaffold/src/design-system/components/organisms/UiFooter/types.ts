import type { IconName } from '../../../icons'

export interface FooterLink {
  label: string
  href: string
}

export interface FooterColumn {
  title: string
  links: readonly FooterLink[]
}

export interface FooterSocial {
  icon: IconName
  label: string
  href: string
}

export interface UiFooterProps {
  description?: string
  columns: readonly FooterColumn[]
  socials?: readonly FooterSocial[]
  homeHref?: string
}
