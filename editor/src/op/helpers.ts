import { hasEntity } from '@ngneat/elf-entities'
import { blocksStore, getBlock } from '../stores/block.repository'
import { Block, BlockPosition, BlockPositionRelation } from '../interfaces'
import { allDescendants } from './queries'
import { getDoc } from '../stores/doc.repository'

/**
 * Helpers for blocks-store, no mutations are allowed here
 *
 */

// export function uidAndEmbedId(uid: string) {
//   const reUid = /^(.+)-embed-(.+)/,
//     res = uid.match(reUid)
//   return res ? [res[1], res[2]] : [uid, null]
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
export function compatPosition({
  refBlockUid,
  docTitle,
  relation,
}: BlockPosition) {
  if (refBlockUid === undefined && docTitle === undefined) {
    throw new Error('refBlockUid === undefined && docTitle === undefined')
  }

  const block = refBlockUid ? getBlock(refBlockUid) : null,
    title = (block && block.docTitle) ?? undefined

  return {
    refBlockUid,
    docTitle: docTitle ? docTitle : title,
    relation,
  }
}

export function getRefBlockOfPosition(position: BlockPosition): Block {
  const { refBlockUid: refUid, docTitle: refTitle, relation } = position

  if (refTitle) {
    const refDoc = getDoc(refTitle),
      refBlock = getBlock(refDoc.blockUid)
    return refBlock
  } else if (refUid) {
    return getBlock(refUid)
  } else {
    throw new Error('refTitle === undefined && refUid === undefined')
  }
}

export function blocksDict(blocks: Block[]): Record<string, Block> {
  return Object.fromEntries(blocks.map((e) => [e.uid, e]))
}

//
// Validaters
//
//
//
//
//
//

export function validatePosition({
  refBlockUid: uid,
  docTitle: title,
}: BlockPosition) {
  const titleBlockUid = title && getDoc(title).blockUid,
    block = uid ? getBlock(uid) : null

  let failMsg: string | undefined
  if (block && block.docTitle) {
    failMsg =
      '[validatePosition] Location uid is a doc, location must use title instead.'
  } else if (title && titleBlockUid === undefined) {
    failMsg = '[validatePosition] Location title does not exist:' + title
  } else if (uid) {
    try {
      getBlock(uid)
    } catch (err) {
      failMsg = '[validatePosition] Location uid does not exist:' + uid
    }
  }

  if (failMsg) {
    // throw new Error(failMsg, position)
    throw new Error(failMsg)
  }
}

/**
 * Exaustively check every block's children-uids is matching the children's parent
 *
 */
export function validateChildrenUids(dict: Record<string, Block>): void {
  Object.entries(dict).forEach(([k, v]) => {
    const { childrenUids, uid } = v

    childrenUids.forEach((e, i) => {
      const child = dict[e]

      if (child === undefined) {
        console.error(dict, childrenUids, child)
        throw new Error(
          '[validateChildrenUids] child not found by children-uid',
        )
      }
      if (child.parentUid !== uid) {
        console.error(dict, childrenUids, child)
        throw new Error(
          "[validateChildrenUids] children-uids not match child's parent-uid",
        )
      }
      if (child.order !== i) {
        console.error(dict, childrenUids, child)
        throw new Error(
          "[validateChildrenUids] children-uids not match child's order",
        )
      }
    })
  })

  // Reverse check
  Object.entries(dict).forEach(([k, v]) => {
    const { parentUid, order, uid } = v,
      parent = parentUid ? dict[parentUid] : null

    if (parent) {
      if (parent.childrenUids[order] !== uid) {
        console.error(dict, parent, v)
        throw new Error(
          "[validateChildrenUids] child's parent-uid, order not match children-uids",
        )
      }
    }
  })

  // Check orphans
}

export function validateUid(newUid: string): void {
  if (blocksStore.query(hasEntity(newUid))) {
    throw new Error('[validateUid] Given uid is not unique')
  }
}

/**
 * @returns a is descendant of b?
 *
 */
export function isDescendant(a: Block, b: Block): boolean {
  const kids = allDescendants(b),
    found = kids.find((e) => e.uid === a.uid)

  return found !== undefined
}

export function isChildRelation(relation: BlockPositionRelation): boolean {
  return ['first', 'last'].includes(relation)
}

export function isSiblingRelation(relation: BlockPositionRelation): boolean {
  return ['before', 'after'].includes(relation)
}

/**
 * Given a coll of uids, determine if uids are all direct children of the same parent.
 */
export function areSameParent(blocks: Block[]): boolean {
  const parentUids = new Set()
  for (const e of blocks) {
    parentUids.add(e.parentUid)
  }
  return parentUids.size === 1
}
