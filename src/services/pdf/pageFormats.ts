export interface PageFormat {
  id: 'a5' | 'letter'
  name: string
  displayName: string
  width: number
  height: number
  margins: {
    top: number
    bottom: number
    left: number
    right: number
  }
}

export const PAGE_FORMATS: Record<string, PageFormat> = {
  a5: {
    id: 'a5',
    name: 'A5 Binder',
    displayName: 'A5 Binder (148×210mm)',
    width: 148,
    height: 210,
    margins: { top: 12, bottom: 12, left: 12, right: 12 },
  },
  letter: {
    id: 'letter',
    name: 'US Letter',
    displayName: 'US Letter (8.5×11in)',
    width: 215.9,
    height: 279.4,
    margins: { top: 15, bottom: 15, left: 15, right: 15 },
  },
}
