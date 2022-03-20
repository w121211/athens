import { addEntities } from '@ngneat/elf-entities'
import { diff } from 'deep-object-diff'
import { validateChildrenUids } from '../../src/op/helpers'
import { blockRemoveOp } from '../../src/op/ops'
import { allDescendants } from '../../src/op/queries'
import { blockRepo, blocksStore } from '../../src/stores/block.repository'
import { clean } from '../helpers'

/**
 *  0
 *  - 1
 *    - 3
 *       -5
 *    - 4
 *  - 2
 */

const blocks: Block[] = [
    { uid: '0', str: '', order: 0, parentUid: null, childrenUids: ['1', '2'], pageTitle: 'page-0' },
    { uid: '1', str: '', order: 0, parentUid: '0', childrenUids: ['3', '4'] },
    { uid: '2', str: '', order: 1, parentUid: '0', childrenUids: [] },
    { uid: '3', str: '', order: 0, parentUid: '1', childrenUids: ['5'] },
    { uid: '4', str: '', order: 1, parentUid: '1', childrenUids: [] },
    { uid: '5', str: '', order: 0, parentUid: '3', childrenUids: [] },
  ],
  [a0, b1, b2, c3, c4, d5] = blocks

beforeEach(() => {
  blockRepo.update([addEntities(blocks)])
  validateChildrenUids(blocksStore.getValue().entities)
})

it('allDescendants() "', () => {
  expect(allDescendants(a0)).toEqual([b1, b2, c3, c4, d5])
  expect(allDescendants(b1)).toEqual([c3, c4, d5])
  expect(allDescendants(b2)).toEqual([])
  expect(allDescendants(c3)).toEqual([d5])
  expect(allDescendants(c4)).toEqual([])
})
