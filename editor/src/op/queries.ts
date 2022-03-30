import { Block } from '../interfaces'
import { getBlock, getBlockChildren } from '../stores/block.repository'

// export function uidAndEmbedId(uid: string) {
//   const reUid = /^(.+)-embed-(.+)/,
//     res = uid.match(reUid)
//   return res ? [res[1], res[2]] : [uid, null]
// }

export function allDescendants(block: Block): Block[] {
  const stack: Block[] = [block]
  let kids: Block[] = []

  while (stack.length > 0) {
    const block = stack.pop()
    if (block) {
      const children = getBlockChildren(block.uid)
      children.forEach((e) => stack.push(e))
      kids = kids.concat(children)
    }
  }
  return kids
}

/**
 * (recusive)
 *
 */
function deepestChildBlock(block: Block): Block {
  const { childrenUids, open } = block
  if (childrenUids.length === 0 || !open) {
    return block
  }

  const child = getBlock(childrenUids[childrenUids.length - 1])
  return deepestChildBlock(child)
}

/**
 * "1-arity:
    if open and children, go to child 0
    else recursively find next sibling of parent
  2-arity:
    used for multi-block-selection; ignores child blocks"
 */
export function nextBlock(block: Block, selection?: true): Block | null {
  const nextSibling = nextSiblingRecusively(block)
  if (selection) {
    return nextSibling
  }

  const { open, pageTitle, childrenUids } = block
  if ((open || pageTitle) && childrenUids.length > 0) {
    return getBlock(childrenUids[0])
  }
  return nextSibling
}

/**
 * "Search for next sibling. If not there (i.e. is last child), find sibling of parent.
  If parent is root, go to next sibling."
 */
function nextSiblingRecusively(block: Block): Block | null {
  const parent = block.parentUid && getBlock(block.parentUid),
    sib = parent && nthSiblingBlock(block, parent, 1)

  if (sib) {
    return sib
  } else if ((parent && parent.pageTitle) || block.pageTitle) {
    return null
  } else if (parent) {
    return nextSiblingRecusively(parent)
  }
  return null
}

/**
 * "Find sibling that has order+n of current block.
  Negative n means previous sibling.
  Positive n means next sibling."
 */
export function nthSiblingBlock(
  block: Block,
  parent: Block,
  n: number,
): Block | null {
  if (block.parentUid !== parent.uid)
    throw new Error('[nthSiblingBlock] block.parentUid !== parent.uid')

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
export function prevBlock(block: Block, parent: Block): Block | null {
  // const [, embedId] = uidAndEmbedId(uid),
  const prevSibling = nthSiblingBlock(block, parent, -1)

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
