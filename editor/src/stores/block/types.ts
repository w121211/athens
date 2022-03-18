export type Block = {
  uid: string
  str: string
  open?: boolean
  order: number
  pageTitle?: string // only for node-block (ie, root)
  parentUid: string | null
  childrenUids: string[]
  editTime?: number
  // _refs?: []
  // originalUid: string
}

export type Position = {
  blockUid?: string
  pageTitle?: string // for page-node should reference by page-title
  relation: PositionRelation
}

/**
 * - parent-child: 'first' | 'last'
 * - siblings: 'before' | 'after'
 *
 */
export type PositionRelation = 'first' | 'last' | 'before' | 'after'
