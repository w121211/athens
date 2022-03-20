import { addEntities } from '@ngneat/elf-entities'
import { diff } from 'deep-object-diff'
import { BlockOp } from '../../src/op/ops'
import { blockRepo, blocksStore } from '../../src/stores/block.repository'
import { rfdbRepo } from '../../src/stores/rfdb.repository'
import { clean } from '../helpers'

/**
 *  0
 *  - 1
 *    - 3
 *  - 2
 */

const blocks: Block[] = [
  { uid: '0', str: '0', order: 0, parentUid: null, childrenUids: ['1', '2'], pageTitle: 'page-0' },
  { uid: '1', str: '1', order: 0, parentUid: '0', childrenUids: ['3'] },
  { uid: '2', str: '2', order: 1, parentUid: '0', childrenUids: [] },
  { uid: '3', str: '3', order: 0, parentUid: '1', childrenUids: [] },
]

beforeEach(() => {
  blockRepo.update([addEntities(blocks)])
})

it('blockOpenOp() "', () => {
  const ops = new BlockOp()
  let cur, next

  cur = blocksStore.getValue().entities
  blocksStore.update(...ops.blockOpenOp('0', true))
  next = clean(blocksStore.getValue().entities)
  expect(diff(cur, next)).toMatchInlineSnapshot(`
    Object {
      "0": Object {
        "open": true,
      },
    }
  `)

  cur = blocksStore.getValue().entities
  blocksStore.update(...ops.blockOpenOp('0', false))
  next = clean(blocksStore.getValue().entities)
  expect(diff(cur, next)).toMatchInlineSnapshot(`
    Object {
      "0": Object {
        "open": false,
      },
    }
  `)
})
