export interface UiPaginationProps {
  pageCount: number
  label?: string
}

export type PaginationItem = { type: 'page'; page: number } | { type: 'gap'; key: string }
