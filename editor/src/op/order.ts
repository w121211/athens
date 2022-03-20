import assert from 'assert'
import { Block, PositionRelation } from '../interfaces'
import { isSiblingRelation } from './helpers'

export function remove(v: Block[], x: Block): Block[] {
  return v.filter((e) => e.uid !== x.uid)
}

function insertAt(v: Block[], x: Block, index: number): Block[] {
  return [...v.slice(0, index), x, ...v.slice(index)]
}

/**
 * "Insert x in v, in a position defined by relation to target.
See athens.common-events.graph.schema for position values."
  */
export function insert(
  v: Block[],
  x: Block,
  relation: PositionRelation,
  ref: Block,
): Block[] {
  // use if-else because index=0 is interpretated as 'false'
  const index = isSiblingRelation(relation)
    ? v.findIndex((e) => e.uid === ref.uid)
    : null

  if (relation === 'first') {
    return [x, ...v]
  } else if (relation === 'last') {
    return [...v, x]
  } else if (relation === 'before' && index !== null && index >= 0) {
    return insertAt(v, x, index)
  } else if (relation === 'after' && index !== null && index >= 0) {
    return insertAt(v, x, index + 1)
  } else {
    return v
  }
}

/**
 * Move x from origin to destination, to a position defined by relation to target.
 * @returns [modified-src, modified-dest]
 *
 */
export function moveBetween(
  src: Block[],
  dest: Block[],
  x: Block,
  relation: PositionRelation,
  ref: Block,
) {
  console.debug(src, dest, x, relation, ref)

  assert(x.uid !== ref.uid, '[moveBetween] x and ref are the same block')
  assert(
    src.find((e) => e.uid === x.uid),
    '[moveBetween] x is not in src',
  )
  if (
    isSiblingRelation(relation) &&
    dest.find((e) => e.uid === ref.uid) === undefined
  ) {
    throw new Error('[moveBetween] ref is not in dest')
  }

  return [remove(src, x), insert(dest, x, relation, ref)]
}

/**
 * Move x within v, to a position defined by relation to target.
 * @warn no params check, if x or ref is not within v, it still runs but returns false result
 * @returns modified v
 *
 */
export function moveWithin(
  v: Block[],
  x: Block,
  relation: PositionRelation,
  ref: Block,
): Block[] {
  console.debug(v, x, relation, ref)

  assert(x.uid !== ref.uid, '[moveWithin] x and ref are the same block')
  assert(
    v.find((e) => e.uid === x.uid),
    '[moveWithin] x is not in v',
  )
  if (isSiblingRelation(relation) && !v.find((e) => e.uid === ref.uid))
    throw new Error('[moveWithin] ref is not in v')

  const vRemoveX = remove(v, x),
    insertX = insert(vRemoveX, x, relation, ref)
  return insertX
}

function makeKey(block: Block) {
  return `${block.uid}%${block.order}`
}

/**
 *   "Maps each element in before and after using map-indexed over map-fn.
Returns all elements in after that are not in before.
Use with block-map-fn and shortcut-map-fn to obtain valid datascript
transactions that will reorder those elements using absolute positions."
  */
export function reorder(before: Block[], after: Block[]): Block[] {
  const _before = before.map((e, i) => {
      return { ...e, order: i }
    }),
    _after = after.map((e, i) => {
      return { ...e, order: i }
    }),
    _beforeSet = new Set(_before.map(makeKey)),
    diff = _after.filter((e) => !_beforeSet.has(makeKey(e)))

  return diff
}
