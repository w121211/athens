import { addEntities } from '@ngneat/elf-entities'
import { diff } from 'deep-object-diff'
import { events } from '../../src/events'
import { blockRepo, blocksStore, getBlock } from '../../src/stores/block.repository'
import { rfdbRepo } from '../../src/stores/rfdb.repository'

function clean(cur: Record<string, Block>) {
  for (const [k, v] of Object.entries(cur)) {
    delete cur[k].editTime
  }
  return cur
}

/**
 *  0
 *  - 1
 *    - 3
 *  - 2
 */

const blocks: Block[] = [
  { uid: '0', str: '0', order: 0, parentUid: null, childrenUids: ['1', '2'] },
  { uid: '1', str: '1', order: 0, parentUid: '0', childrenUids: ['3'] },
  { uid: '2', str: '2', order: 1, parentUid: '0', childrenUids: [] },
  { uid: '3', str: '3', order: 0, parentUid: '1', childrenUids: [] },
]

const [p, b1, b2, b3] = blocks

beforeEach(() => {
  blockRepo.update([addEntities(blocks)])
})

it('enterAddChild()', () => {
  rfdbRepo.setProps({ editing: { uid: '1' } })

  /**
   *  0
   *  (- x)
   *  - 1
   *    - 3
   *  - 2
   */
  let cur = blocksStore.getValue().entities,
    next

  events.enterAddChild(p, 'x')
  next = clean(blocksStore.getValue().entities)
  expect(diff(cur, next)).toMatchInlineSnapshot(`
    Object {
      "0": Object {
        "childrenUids": Object {
          "0": "x",
          "1": "1",
          "2": "2",
        },
      },
      "1": Object {
        "order": 1,
      },
      "2": Object {
        "order": 2,
      },
      "x": Object {
        "childrenUids": Array [],
        "open": true,
        "order": 0,
        "parentUid": "0",
        "str": "",
        "uid": "x",
      },
    }
  `)

  /**
   *  0
   *  - x
   *    (- y)
   *  - 1
   *    - 3
   *  - 2
   */
  const x = getBlock('x')
  events.enterAddChild(x, 'y')
  cur = next
  next = clean(blocksStore.getValue().entities)
  expect(diff(cur, next)).toMatchInlineSnapshot(`
    Object {
      "x": Object {
        "childrenUids": Object {
          "0": "y",
        },
      },
      "y": Object {
        "childrenUids": Array [],
        "open": true,
        "order": 0,
        "parentUid": "x",
        "str": "",
        "uid": "y",
      },
    }
  `)

  /**
   *  0
   *  - x
   *    - y
   *      (- z)
   *  - 1
   *    - 3
   *  - 2
   */
  const y = getBlock('y')
  events.enterAddChild(y, 'z')
  cur = next
  next = clean(blocksStore.getValue().entities)
  expect(diff(cur, next)).toMatchInlineSnapshot(`
    Object {
      "y": Object {
        "childrenUids": Object {
          "0": "z",
        },
      },
      "z": Object {
        "childrenUids": Array [],
        "open": true,
        "order": 0,
        "parentUid": "y",
        "str": "",
        "uid": "z",
      },
    }
  `)

  /**
   *  0
   *  - x
   *    (- y2)
   *    - y
   *      (- z)
   *  - 1
   *    - 3
   *  - 2
   */
  events.enterAddChild(x, 'y2')
  cur = next
  next = clean(blocksStore.getValue().entities)
  expect(diff(cur, next)).toMatchInlineSnapshot(`
    Object {
      "x": Object {
        "childrenUids": Object {
          "0": "y2",
          "1": "y",
        },
      },
      "y": Object {
        "order": 1,
      },
      "y2": Object {
        "childrenUids": Array [],
        "open": true,
        "order": 0,
        "parentUid": "x",
        "str": "",
        "uid": "y2",
      },
    }
  `)
})

it('enterNewBlock()', () => {
  rfdbRepo.setProps({ editing: { uid: '0' } })

  const parent = blocks[0],
    block = blocks[1]

  // events.up('1', 'end')
  events.enterNewBlock(block, parent, 'x')
  expect(blocksStore.getValue().entities).toMatchSnapshot()

  // expect(rfdbRepo.getValue().editing?.uid).toEqual('1')
})

it('enterNewBlock, enterNewBlock, up', () => {
  rfdbRepo.setProps({ editing: { uid: '0' } })

  const parent = blocks[0]

  // events.up('1', 'end')
  events.enterNewBlock(blocks[1], parent, 'x')
  expect(rfdbRepo.getValue().editing?.uid).toEqual('x')

  events.up('x', 0)
  expect(rfdbRepo.getValue().editing?.uid).toEqual('1')

  events.enterNewBlock(getBlock('x'), parent, 'y')
  expect(blocksStore.getValue().entities).toMatchSnapshot()
  expect(rfdbRepo.getValue().editing?.uid).toEqual('y')

  events.up('y', 0)
  expect(rfdbRepo.getValue().editing?.uid).toEqual('x')

  // expect(rfdbRepo.getValue().editing?.uid).toEqual('1')
})
