import type { VenueCardProps } from '../VenueCard/types'

/** Те же данные, что у карточки; строка компактнее: фото слева 104 px, без блока «Открыто сейчас». */
export type VenueRowProps = Omit<VenueCardProps, 'open'>
