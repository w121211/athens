//
// Component state
//
//
//
//
//
//

export type SearchType = 'page' | 'slash' | 'hashtag' | 'template'

export type DragTarget = 'first' | 'before' | 'after'

export type Search = {
  type: SearchType | null
  index: number | null // search-hit index
  query: string | null // search-term
  results: {
    nodeTitle?: string
    blockStr?: string
    blockUid?: string
  }[]
}

export type CaretPosition = {
  top: number
  left: number
  height: number
}

// export type BlockElState = {
//   // uid: string
//   str: {
//     local: string | null
//     previous: string | null
//     saveFn?: () => void
//     idleFn?: () => void
//   }
//   search: {
//     type: SearchType | null
//     index: number | null // search-hit index
//     query: string | null // search-term
//     results: {
//       nodeTitle?: string
//       blockStr?: string
//       blockUid?: string
//     }[]
//   }
//   dragging?: boolean
//   dragTarget: DragTarget | null
//   lastKeydown?: DestructTextareaKeyEvent | null
//   contextMenu?: {
//     x: null
//     y: null
//     show: boolean
//   }
//   showEditableDom: boolean
//   caretPosition: {
//     top: number
//     left: number
//     height: number
//   }
// }

// export type BlockElStateSetFn = React.Dispatch<
//   React.SetStateAction<BlockElState>
// >

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
// Server-side Data
//
//
//
//
//
//

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
