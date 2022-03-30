import { setEntities } from '@ngneat/elf-entities'
import { diff } from 'deep-object-diff'
import { blockSaveOp } from '../../src/op/ops'
import { blockRepo, blocksStore } from '../../src/stores/block.repository'
import { blocks, clean } from '../helpers'

beforeEach(() => {
  blockRepo.update([setEntities(blocks)])
})

it('blockSaveOp()', () => {
  let cur, next

  cur = blocksStore.getValue().entities
  blocksStore.update(...blockSaveOp('a0', 'hello world'))
  next = clean(blocksStore.getValue().entities)
  expect(diff(cur, next)).toMatchInlineSnapshot(`
    Object {
      "a0": Object {
        "str": "hello world",
      },
    }
  `)

  cur = blocksStore.getValue().entities
  blocksStore.update(...blockSaveOp('a0', 'hello hello world'))
  next = clean(blocksStore.getValue().entities)
  expect(diff(cur, next)).toMatchInlineSnapshot(`
    Object {
      "a0": Object {
        "str": "hello hello world",
      },
    }
  `)

  cur = blocksStore.getValue().entities
  blocksStore.update(...blockSaveOp('a0', ''))
  next = clean(blocksStore.getValue().entities)
  expect(diff(cur, next)).toMatchInlineSnapshot(`
    Object {
      "a0": Object {
        "str": "",
      },
    }
  `)

  cur = blocksStore.getValue().entities
  blocksStore.update(...blockSaveOp('c3', 'hello world'))

  next = clean(blocksStore.getValue().entities)
  expect(diff(cur, next)).toMatchInlineSnapshot(`
    Object {
      "c3": Object {
        "str": "hello world",
      },
    }
  `)
})
