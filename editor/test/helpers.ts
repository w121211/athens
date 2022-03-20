import { getAllEntities } from '@ngneat/elf-entities'
import { blocksStore } from '../src/stores/block.repository'

/**
 *  a0
 *  - b1
 *    - c3
 *       -d5
 *    - c4
 *    - c6
 *  - b2
 *
 */
export const blocks: Block[] = [
  { uid: 'a0', str: '', order: 0, parentUid: null, childrenUids: ['b1', 'b2'], pageTitle: 'page-0' },
  { uid: 'b1', str: '', order: 0, parentUid: 'a0', childrenUids: ['c3', 'c4', 'c6'] },
  { uid: 'b2', str: '', order: 1, parentUid: 'a0', childrenUids: [] },
  { uid: 'c3', str: '', order: 0, parentUid: 'b1', childrenUids: ['d5'] },
  { uid: 'c4', str: '', order: 1, parentUid: 'b1', childrenUids: [] },
  { uid: 'd5', str: '', order: 0, parentUid: 'c3', childrenUids: [] },
  { uid: 'c6', str: '', order: 2, parentUid: 'b1', childrenUids: [] },
]

export function clean(cur: Record<string, Block>): Record<string, Block> {
  for (const [k, v] of Object.entries(cur)) {
    delete cur[k].editTime
  }
  return cur
}

/**
 * Mainly use for testing
 */
export function getAllBlockUids(): string[] {
  return blocksStore.query(getAllEntities()).map(e => e.uid)
}
