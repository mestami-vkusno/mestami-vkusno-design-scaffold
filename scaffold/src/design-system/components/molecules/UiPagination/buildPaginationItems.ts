import type { PaginationItem } from './types'

const page = (value: number): PaginationItem => ({ type: 'page', page: value })

/** Компактный список страниц: 1 2 3 … 24, 1 … 11 12 13 … 24, 1 … 22 23 24. */
export function buildPaginationItems(current: number, count: number): PaginationItem[] {
  if (count <= 7) return Array.from({ length: count }, (_, index) => page(index + 1))
  if (current <= 3) return [page(1), page(2), page(3), { type: 'gap', key: 'gap-end' }, page(count)]
  if (current >= count - 2) return [page(1), { type: 'gap', key: 'gap-start' }, page(count - 2), page(count - 1), page(count)]
  return [page(1), { type: 'gap', key: 'gap-start' }, page(current - 1), page(current), page(current + 1), { type: 'gap', key: 'gap-end' }, page(count)]
}
