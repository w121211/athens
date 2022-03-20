/* eslint-disable @typescript-eslint/no-unused-vars */

/**
 * Component properties
 *
 */
export type SearchType = 'page' | 'slash' | 'hashtag' | 'template'

export type DragTarget = 'first' | 'before' | 'after'

export type BlockElState = {
  // uid: string
  str: {
    local: string | null
    previous: string | null
    saveFn?: () => void
    idleFn?: () => void
  }
  search: {
    type: SearchType | null
    index: number
    query: string
    results: string[]
  }
  dragging?: boolean
  dragTarget: DragTarget | null
  lastKeydown?: DestructTextareaKeyEvent | null
  contextMenu?: {
    x: null
    y: null
    show: boolean
  }
  createPosition?: {
    top: number
    left: number
  }
  showEditableDom: boolean
}

export type BlockElStateSetFn = React.Dispatch<React.SetStateAction<BlockElState>>

export type NodeProps = {
  db: {
    id?: string
  }
  block: {
    uid?: string
    children?: { uid: string }[]
  }
  node: {
    title?: string
  }
  page: {
    sidebar?: false
  }
}

export type NodeElProps = {
  menu: {
    show: boolean
  }
  title: {
    initial?: string
    local?: string
  }
  alert: {
    show?: null
    message?: null
    confirmFn?: null
    cancelFn?: null
  }
  // LinkedReferences: true
  // UnlinkedReferences: false
  node?: NodeProps
}

/**
 * Dom events
 */

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

// /**
//  * A person interacting with Athens in a multiplayer context
//  */
// type Person = {
//   personId: string
//   username: string
//   color: string // CSS color
// }

// /**
//  * OS the name of supported OSs
//  */
// type OS = 'mac' | 'windows' | 'linux'

// /**
//  * The state of a session's connection to the Athens host
//  */
// type ConnectionStatus = 'local' | 'connecting' | 'connected' | 'reconnecting' | 'offline'

// type HostAddress = string

// /**
//  * A knowledge graph
//  */
// type Database = {
//   id: string
//   name: string
//   isRemote: boolean
//   icon?: string // Emoji
//   color?: string // CSS color
// }

/**
 * Stores
 */

export type Page = {
  title: string // as id
  blockUid: string // corresponding block
}

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
  blockUid?: string // ref-block uid
  pageTitle?: string // ref-block is a page-block, use page-title instead of block-uid
  relation: PositionRelation // position relate to ref-block
}

/**
 * - parent-child: 'first' | 'last'
 * - siblings: 'before' | 'after'
 *
 */
export type PositionRelation = 'first' | 'last' | 'before' | 'after'
