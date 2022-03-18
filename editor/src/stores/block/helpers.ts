/**
 * Helpers for blocks, no mutations are allowed here (only queries)
 *
 * ns athens.db
 */

import { getPage, getPageTitle } from '../page.repository'
import { getBlock, getBlockChildren } from './block.repository'
import { Block, Position, PositionRelation } from './types'

// export function uidAndEmbedId(uid: string) {
//   const reUid = /^(.+)-embed-(.+)/,
//     res = uid.match(reUid)
//   return res ? [res[1], res[2]] : [uid, null]
// }

/**
 * (recusive)
 *
 */
function deepestChildBlock(block: Block): Block {
  const { childrenUids, open } = block
  if (childrenUids.length === 0 || !open) {
    return block
  }

  const child = getBlock(childrenUids[childrenUids.length])
  return deepestChildBlock(child)
}

/**
 * "Find sibling that has order+n of current block.
  Negative n means previous sibling.
  Positive n means next sibling."
 */
export function getNthSiblingBlock(block: Block, parent: Block, n: number): Block | null {
  const findOrder = block.order + n,
    sibUid = parent.childrenUids[findOrder]

  if (sibUid) {
    return getBlock(sibUid)
  }
  return null
}

/**
 *   "If order 0, go to parent.
   If order n but block is closed, go to prev sibling.
   If order n and block is OPEN, go to prev sibling's deepest child."
 */
export function getPrevBlock(block: Block, parent: Block): Block | null {
  // const [, embedId] = uidAndEmbedId(uid),
  const prevSibling = getNthSiblingBlock(block, parent, -1)

  let prevBlock: Block | undefined
  if (block.order === 0 && parent.pageTitle === undefined) {
    prevBlock = parent
  } else if (prevSibling && !prevSibling.open) {
    prevBlock = prevSibling
  } else if (prevSibling && prevSibling.open) {
    prevBlock = deepestChildBlock(prevSibling)
  }

  if (prevBlock) {
    return prevBlock
  }
  return null
}

/**
 * "Search for next sibling. If not there (i.e. is last child), find sibling of parent.
  If parent is root, go to next sibling."
 */
function nextSiblingRecusively(block: Block): Block | null {
  const parent = block.parentUid && getBlock(block.parentUid),
    sib = parent && getNthSiblingBlock(block, parent, 1)

  if (sib) {
    return sib
  } else if ((parent && parent.nodeTitle) || block.nodeTitle) {
    return null
  } else if (parent) {
    return nextSiblingRecusively(parent)
  }
  return null
}

/**
 * "1-arity:
    if open and children, go to child 0
    else recursively find next sibling of parent
  2-arity:
    used for multi-block-selection; ignores child blocks"
 */
export function getNextBlock(block: Block, selection?: true): Block | null {
  const nextSibling = nextSiblingRecusively(block)
  if (selection) {
    return nextSibling
  }

  // const nextBlock =
  const { open, nodeTitle, childrenUids } = block
  if ((open || nodeTitle) && childrenUids.length > 0) {
    return getBlock(childrenUids[0])
  }
  return nextSibling
}

// export function getPrevSiblingBlock(block: Block, parent: Block): Block | null {
//   return getNthSiblingBlock(block, parent, -1)
// }

/**
 * "Build a position by coercing incompatible arguments into compatible ones.
  uid to a page will instead use that page's title.
  Integer relation will be converted to :first if 0, or :after (with matching uid) if not.
  Accepts the `{:block/uid <parent-uid> :relation <integer>}` old format based on order number.
  Output position will be athens.common-events.graph.schema/child-position for the first block,
  and athens.common-events.graph.schema/sibling-position for others.
  It's safe to use a position that does not need coercing of any arguments, like the output formats."
 */
export function compatPosition({ blockUid, pageTitle, relation }: Position) {
  if (blockUid === undefined && pageTitle === undefined) {
    throw ''
  }

  const block = blockUid && getBlock(blockUid),
    title = block && block.pageTitle

  return {
    relation,
    pageTitle: pageTitle ? pageTitle : title,
    blockUid,
  }
}

export function validatePosition({ blockUid: uid, pageTitle: title }: Position) {
  const titleBlockUid = title && getPage(title).blockUid,
    uidTitle = uid && getPageTitle(uid)

  let failMsg: string | undefined
  if (uid && uidTitle) {
    failMsg = 'Location uid is a page, location must use title instead.'
  } else if (title && !titleBlockUid) {
    failMsg = 'Location title does not exist:' + title
  } else if (uid && !getBlock(uid)) {
    failMsg = 'Location uid does not exist:' + uid
  }

  if (failMsg) {
    // throw new Error(failMsg, position)
    throw failMsg
  }
}

export function isChildRelation(relation: PositionRelation): boolean {
  return ['first', 'last'].includes(relation)
}

export function isSiblingRelation(relation: PositionRelation): boolean {
  return ['before', 'after'].includes(relation)
}

export function getAllDescendants(block: Block): Block[] {
  const stack: Block[] = [block]
  let kids: Block[] = []

  while (stack.length > 0) {
    const block = stack.pop()
    if (block) {
      const children = getBlockChildren(block.uid)
      kids = kids.concat(children)
    }
  }
  return kids
}
