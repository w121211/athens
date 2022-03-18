import { isSiblingRelation } from './helpers'
import { Block, PositionRelation } from './types'

function remove(v: Block[], x: Block): Block[] {
  return v.filter(e => e.uid === x.uid)
}

function insertAt(v: Block[], x: Block, index: number): Block[] {
  return [...v.slice(0, index), x, ...v.slice(index)]
}

/**
 * "Insert x in v, in a position defined by relation to target.
See athens.common-events.graph.schema for position values."
  */
export function insert(v: Block[], x: Block, relation: PositionRelation, ref: Block): Block[] {
  const index = isSiblingRelation(relation) ? v.findIndex(e => e.uid === ref.uid) : null

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
     * "Move x from origin to destination, to a position defined by relation to target.
    See athens.common-events.graph.schema for position values.
    Returns [modified-origin modified-destination]."
     */
export function moveBetween(origin: Block[], dest: Block[], x: Block, relation: PositionRelation, ref: Block) {
  return [remove(origin, x), insert(dest, x, relation, ref)]
}

/**
     * "Move x within v, to a position defined by relation to target.
    See athens.common-events.graph.schema for position values.
    Returns modified v."
     */
export function moveWithin(v: Block[], x: Block, relation: PositionRelation, ref: Block): Block[] {
  const removeX = remove(v, x),
    insertX = insert(v, x, relation, ref)
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
    diff = _after.filter(e => !_beforeSet.has(makeKey(e)))

  return diff
}
