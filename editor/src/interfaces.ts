//
// Component State - commonly used in various components & handlers
//
//
//
//
//
//

export type CaretPosition = {
  top: number
  left: number
  height: number
}

export type DragTarget = 'first' | 'before' | 'after'

/**
 * athens naming:
 * - term -> query
 * - hit-index -> index
 * - hits -> results
 */
export type Search = {
  type: SearchType | null
  term: string | null
  hitIndex: number | null
  hits: SearchHit[]
}

export type SearchHit = {
  id: string
  discussTitle?: string
  note?: {
    symbol: string
    webpageTitle?: string
  }
}

export type SearchType = 'page' | 'slash' | 'hashtag' | 'template'

//
// Events & Dom events
//
//
//
//
//
//

export type DestructTextareaKeyEvent = {
  value: string
  start: number
  end: number
  head: string
  tail: string
  selection: string
  key: string // keyboard key
  keyCode: number
  target: HTMLTextAreaElement
  shift: boolean
  meta: boolean
  ctrl: boolean
  alt: boolean
}

/**
 * A block's relative position, defined by a reference block / a doc
 *
 * @param refBlockUid ref-block uid
 * @param docTitle if ref-block is a doc, use doc-title instead of block-uid
 * @param relation position relate to ref-block
 */
export type BlockPosition = {
  refBlockUid?: string
  docTitle?: string
  relation: BlockPositionRelation
}

/**
 * parent-child relation: 'first' | 'last'
 * siblings relation: 'before' | 'after'
 */
export type BlockPositionRelation = 'first' | 'last' | 'before' | 'after'

//
// Stores
//
//
//
//
//
//

// export type NodeProps = {
//   db: {
//     id?: string
//   }
//   block: {
//     uid?: string
//     children?: { uid: string }[]
//   }
//   node: {
//     title?: string
//   }
//   page: {
//     sidebar?: false
//   }
// }

// export type NodeElProps = {
//   menu: {
//     show: boolean
//   }
//   title: {
//     initial?: string
//     local?: string
//   }
//   alert: {
//     show?: null
//     message?: null
//     confirmFn?: null
//     cancelFn?: null
//   }
//   // LinkedReferences: true
//   // UnlinkedReferences: false
//   node?: NodeProps
// }

export type Block = {
  uid: string
  str: string
  open?: boolean
  order: number
  docTitle?: string // only for doc-block
  parentUid: string | null // null for doc-block
  childrenUids: string[]

  editTime?: number // TBC, consider to drop
}

/**
 * In athensresearch, 'Doc' is named as 'Node' and 'Page',
 * with a concept of node-block (node-page-block), ndoe-title, page-title, page-block (or context-block)
 */
export type Doc = {
  title: string // use as id, no duplicated titles area allowed
  blockUid: string // corresponding root block

  noteCopy?: Note // the latest note by query
  noteDraftCopy?: NoteDraft // the latest note-draft

  noteMeta?: NoteMeta // updates in note meta
}

export type EditorProps = {
  alert: {
    show?: null
    message?: null
    confirmFn?: null
    cancelFn?: null
  }
  leftSidebar: {
    show: boolean
    entries: string[]
  }
  modal: {
    discuss?: {
      id?: string
      title: string
    }
    doc?: {
      title: string
    }
    mainEditorCursor?: {
      blockUid: string
      anchor: number
      offset: number
    }
  }
  route: {
    symbolMain: string
    symbolModal?: string

    // (future) when open a block
    blockUid?: string
  }
}

//
// Server-side datatypes
//
//
//
//
//
//

export type Discuss = {
  id: string
  title: string
}

type NoteMeta = {
  webTitle?: string
  keywords?: string[]
}

export type Note = {
  id: string
  branch: string
  symbol: string
  doc: NoteDoc
}

export type NoteDoc = {
  id: string
  userId: string
  noteMeta: NoteMeta
  content: Block[]
}

export type NoteDraft = {
  id: string
  content: Block[]
  fromNoteDocId?: string
}

//
// Inline Items
//
//
//
//
//
//

export type InlineText = {
  type: 'text'
  str: string
}

// export type InlineAuthor = {
//   type: 'author'
//   str: string
//   authorName: string
// }

export type InlineDiscuss = {
  type: 'inline-discuss'
  str: string
  title: string
  id?: string
}

export type InlineFiltertag = {
  type: 'inline-filtertag'
  str: string
}

// export type InlineMirror = {
//   type: 'inline-mirror'
//   str: string
//   // symbolType: SymbolType
//   mirrorSymbol: string
//   author?: string // 需要 parse 取得，eg ::$XX @cnyes
// }

// export type InlineEmoji = {
//   type: 'emoji'
//   str: string
//   id: number
//   hashtag?: GQLHashtag
// }

// export type InlineNewHashtag = {
//   type: 'new-hashtag'
//   str: string
// }

export type InlinePoll = {
  type: 'inline-poll'
  str: string
  id?: string
  choices: string[]
  // pollCopy?: PollFragment
  // vote?: author vote
}

export type InlineRate = {
  type: 'inline-rate'
  str: string
  id?: string
  params: string[]
  // rateCopy?: RateFragment
  authorName?: string
  targetSymbol?: string
  // choice?: RateChoice
  // vote?: author vote
}

export type InlineSymbol = {
  type: 'inline-symbol'
  str: string
  // symbolType: SymbolType
  symbol: string
}

export type InlineComment = {
  type: 'inline-comment'
  str: string
}

export type InlineItem =
  | InlineText
  // | InlineAuthor
  | InlineDiscuss
  | InlineFiltertag
  // | InlineMirror
  // | InlineHashtag
  // | InlineNewHashtag
  | InlinePoll
  | InlineRate
  | InlineSymbol
  | InlineComment

function isInlinePoll(item: InlineItem): item is InlinePoll {
  return item.type === 'inline-poll'
}

function isInlineRate(item: InlineItem): item is InlineRate {
  return item.type === 'inline-rate'
}
