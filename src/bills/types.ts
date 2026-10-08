import type { ComponentType } from 'react'

export interface BillFormProps<T> {
  data: T
  onChange: (patch: Partial<T>) => void
}

export interface BillPreviewProps<T> {
  data: T
}

export interface BillModule<T> {
  initialData: () => T
  Form: ComponentType<BillFormProps<T>>
  Preview: ComponentType<BillPreviewProps<T>>
  fileName?: (data: T) => string
}

export interface BillMeta {
  id: string
  name: string
  emoji: string
  isNew?: boolean
}

export interface BillEntry extends BillMeta {
  // biome-ignore lint/suspicious/noExplicitAny: modules are heterogeneous; each is typed where defined
  module?: BillModule<any>
}

export function defineBill<T>(module: BillModule<T>): BillModule<T> {
  return module
}
