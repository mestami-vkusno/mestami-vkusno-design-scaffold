import type { IconName } from '../../../icons'

export interface FooterLink {
  label: string
  href: string
  /** Ведёт в другой контур или на другой сайт: открывается в новой вкладке, помечается иконкой. */
  external?: boolean
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
  /** На узком экране (до 720 px) колонки сворачиваются в раскрывающиеся разделы. */
  collapsible?: boolean
}
