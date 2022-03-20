import { addEntities } from '@ngneat/elf-entities'
import { diff } from 'deep-object-diff'
import { BlockOp } from '../../src/op/ops'
import { blockRepo, blocksStore } from '../../src/stores/block.repository'
import { pagesStore } from '../../src/stores/page.repository'
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

const page: Page = { title: 'page-0', blockUid: '0' }

beforeEach(() => {
  blockRepo.update([addEntities(blocks)])
})

it('blockNewOp() throws', () => {
  const ops = new BlockOp()

  // require to use page-title for position
  expect(() => ops.blockNewOp('x', { blockUid: '0', relation: 'first' })).toThrowError()

  // require page-repo to have corresponding page
  expect(() => ops.blockNewOp('x', { pageTitle: 'page-0', relation: 'first' })).toThrowError()
  pagesStore.update(addEntities([page]))

  // thrown: "Location uid is a page, location must use title instead."
  expect(() => ops.blockNewOp('x', { blockUid: '0', pageTitle: 'page-0', relation: 'first' })).toThrowError()

  // thrown: "Given uid is not unique"
  expect(() => ops.blockNewOp('1', { blockUid: '2', relation: 'first' })).toThrowError()
})

it('blockNewOp() ', () => {
  const ops = new BlockOp()
  let cur, next, op

  /**
   *  0
   *  - x1*
   *  - 1
   *    - 3
   *  - 2
   */
  cur = blocksStore.getValue().entities
  blocksStore.update(...ops.blockNewOp('x1', { pageTitle: 'page-0', relation: 'first' }))
  next = clean(blocksStore.getValue().entities)
  expect(diff(cur, next)).toMatchInlineSnapshot(`
     Object {
       "0": Object {
         "childrenUids": Object {
           "0": "x1",
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
       "x1": Object {
         "childrenUids": Array [],
         "open": true,
         "order": 0,
         "parentUid": "0",
         "str": "",
         "uid": "x1",
       },
     }
   `)

  /**
   *  0
   *  - x1
   *    - x2*
   *  - 1
   *    - 3
   *  - 2
   */
  cur = next
  blocksStore.update(...ops.blockNewOp('x2', { blockUid: 'x1', relation: 'first' }))
  next = clean(blocksStore.getValue().entities)
  expect(diff(cur, next)).toMatchInlineSnapshot(`
    Object {
      "x1": Object {
        "childrenUids": Object {
          "0": "x2",
        },
      },
      "x2": Object {
        "childrenUids": Array [],
        "open": true,
        "order": 0,
        "parentUid": "x1",
        "str": "",
        "uid": "x2",
      },
    }
  `)

  /**
   *  0
   *  - x1
   *    - x2
   *  - 1
   *    - 3
   *    - x3
   *  - 2
   */
  cur = next
  blocksStore.update(...ops.blockNewOp('x3', { blockUid: '1', relation: 'last' }))
  next = clean(blocksStore.getValue().entities)
  expect(diff(cur, next)).toMatchInlineSnapshot(`
     Object {
       "1": Object {
         "childrenUids": Object {
           "1": "x3",
         },
       },
       "x3": Object {
         "childrenUids": Array [],
         "open": true,
         "order": 1,
         "parentUid": "1",
         "str": "",
         "uid": "x3",
       },
     }
   `)

  /**
   *  0
   *  - x1
   *    - x2
   *  - 1
   *    - 3
   *    - x3
   *  - 2
   *   - x4*
   */
  cur = next
  blocksStore.update(...ops.blockNewOp('x4', { blockUid: '2', relation: 'last' }))
  next = clean(blocksStore.getValue().entities)
  expect(diff(cur, next)).toMatchInlineSnapshot(`
    Object {
      "2": Object {
        "childrenUids": Object {
          "0": "x4",
        },
      },
      "x4": Object {
        "childrenUids": Array [],
        "open": true,
        "order": 0,
        "parentUid": "2",
        "str": "",
        "uid": "x4",
      },
    }
  `)

  /**
   *  0
   *  - x1
   *    - x2
   *  - x5*
   *  - 1
   *    - 3
   *    - x3
   *  - 2
   *   - x4
   */
  cur = next
  blocksStore.update(...ops.blockNewOp('x5', { blockUid: '1', relation: 'before' }))
  next = clean(blocksStore.getValue().entities)
  expect(diff(cur, next)).toMatchInlineSnapshot(`
    Object {
      "0": Object {
        "childrenUids": Object {
          "1": "x5",
          "2": "1",
          "3": "2",
        },
      },
      "1": Object {
        "order": 2,
      },
      "2": Object {
        "order": 3,
      },
      "x5": Object {
        "childrenUids": Array [],
        "open": true,
        "order": 1,
        "parentUid": "0",
        "str": "",
        "uid": "x5",
      },
    }
  `)

  /**
   *  0
   *  - x6
   *  - x1
   *    - x2
   *  - x5
   *  - 1
   *    - 3
   *    - x3
   *  - 2
   *   - x4
   */
  cur = next
  blocksStore.update(...ops.blockNewOp('x6', { blockUid: 'x1', relation: 'before' }))
  next = clean(blocksStore.getValue().entities)
  expect(diff(cur, next)).toMatchInlineSnapshot(`
    Object {
      "0": Object {
        "childrenUids": Object {
          "0": "x6",
          "1": "x1",
          "2": "x5",
          "3": "1",
          "4": "2",
        },
      },
      "1": Object {
        "order": 3,
      },
      "2": Object {
        "order": 4,
      },
      "x1": Object {
        "order": 1,
      },
      "x5": Object {
        "order": 2,
      },
      "x6": Object {
        "childrenUids": Array [],
        "open": true,
        "order": 0,
        "parentUid": "0",
        "str": "",
        "uid": "x6",
      },
    }
  `)

  /**
   *  0
   *  - x6
   *  - x1
   *    - x2
   *    - x7
   *  - x5
   *  - 1
   *    - 3
   *    - x3
   *  - 2
   *   - x4
   */
  cur = next
  blocksStore.update(...ops.blockNewOp('x7', { blockUid: 'x2', relation: 'after' }))
  next = clean(blocksStore.getValue().entities)
  expect(diff(cur, next)).toMatchInlineSnapshot(`
    Object {
      "x1": Object {
        "childrenUids": Object {
          "1": "x7",
        },
      },
      "x7": Object {
        "childrenUids": Array [],
        "open": true,
        "order": 1,
        "parentUid": "x1",
        "str": "",
        "uid": "x7",
      },
    }
  `)

  /**
   *  0
   *  - x6
   *  - x1
   *    - x2
   *    - x8
   *    - x7
   *  - x5
   *  - 1
   *    - 3
   *    - x3
   *  - 2
   *   - x4
   */
  cur = next
  blocksStore.update(...ops.blockNewOp('x8', { blockUid: 'x7', relation: 'before' }))
  next = clean(blocksStore.getValue().entities)
  expect(diff(cur, next)).toMatchInlineSnapshot(`
    Object {
      "x1": Object {
        "childrenUids": Object {
          "1": "x8",
          "2": "x7",
        },
      },
      "x7": Object {
        "order": 2,
      },
      "x8": Object {
        "childrenUids": Array [],
        "open": true,
        "order": 1,
        "parentUid": "x1",
        "str": "",
        "uid": "x8",
      },
    }
  `)

  /**
   *  0
   *  - x6
   *  - x1
   *    - x8
   *    - x9
   *    - x2
   *    - x7
   *  - x5
   *  - 1
   *    - 3
   *    - x3
   *  - 2
   *   - x4
   */
  cur = next
  blocksStore.update(...ops.blockNewOp('x9', { blockUid: 'x8', relation: 'after' }))
  next = clean(blocksStore.getValue().entities)
  expect(diff(cur, next)).toMatchInlineSnapshot(`
    Object {
      "x1": Object {
        "childrenUids": Object {
          "2": "x9",
          "3": "x7",
        },
      },
      "x7": Object {
        "order": 3,
      },
      "x9": Object {
        "childrenUids": Array [],
        "open": true,
        "order": 2,
        "parentUid": "x1",
        "str": "",
        "uid": "x9",
      },
    }
  `)
})
