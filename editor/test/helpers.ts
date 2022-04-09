import { getAllEntities } from '@ngneat/elf-entities'
import { Block } from '../src/interfaces'
import { blocksStore } from '../src/stores/block.repository'

/**
 *  a0
 *  - b1
 *    - c3
 *       - d5
 *       - d7
 *         - e8
 *    - c4
 *       - d9
 *       - d10
 *    - c6
 *  - b2
 */
export const blocks: Block[] = [
  {
    uid: 'a0',
    str: 'a0',
    order: 0,
    parentUid: null,
    childrenUids: ['b1', 'b2'],
    docTitle: 'page-0',
    open: true,
  },
  {
    uid: 'b1',
    str: 'b1',
    order: 0,
    parentUid: 'a0',
    childrenUids: ['c3', 'c4', 'c6'],
    open: true,
  },
  {
    uid: 'b2',
    str: 'b2',
    order: 1,
    parentUid: 'a0',
    childrenUids: [],
    open: true,
  },
  {
    uid: 'c3',
    str: 'c3',
    order: 0,
    parentUid: 'b1',
    childrenUids: ['d5', 'd7'],
    open: true,
  },
  {
    uid: 'c4',
    str: 'c4',
    order: 1,
    parentUid: 'b1',
    childrenUids: ['d9', 'd10'],
    open: true,
  },
  {
    uid: 'd5',
    str: 'd5',
    order: 0,
    parentUid: 'c3',
    childrenUids: [],
    open: true,
  },
  {
    uid: 'c6',
    str: 'c6',
    order: 2,
    parentUid: 'b1',
    childrenUids: [],
    open: true,
  },
  {
    uid: 'd7',
    str: 'd7',
    order: 1,
    parentUid: 'c3',
    childrenUids: ['e8'],
    open: true,
  },
  {
    uid: 'e8',
    str: 'e8',
    order: 0,
    parentUid: 'd7',
    childrenUids: [],
    open: true,
  },
  {
    uid: 'd9',
    str: 'd9',
    order: 0,
    parentUid: 'c4',
    childrenUids: [],
    open: true,
  },
  {
    uid: 'd10',
    str: 'd10',
    order: 1,
    parentUid: 'c4',
    childrenUids: [],
    open: true,
  },
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
  return blocksStore.query(getAllEntities()).map((e) => e.uid)
}
