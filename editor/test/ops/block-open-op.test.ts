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
