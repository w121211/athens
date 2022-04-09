import { Block, Doc, Note, NoteDraft, SearchHit } from '../interfaces'

//
// Mock note, note-draft
//
//
//
//
//
//

type MockData = {
  title: string
  note?: Note
  draft?: NoteDraft
}

const helloContent: Block[] = [
  {
    uid: 'k1D353kSry',
    str: '[[Hello]]',
    docTitle: '[[Hello]]',
    order: 0,
    parentUid: null,
    childrenUids: ['6Y097lLu9g', 'St7fTuJyDG'],
  },
  {
    uid: '6Y097lLu9g',
    str: 'a [[Hello]] doc block',
    order: 0,
    parentUid: 'k1D353kSry',
    childrenUids: [],
  },
  {
    uid: 'St7fTuJyDG',
    str: 'a [[Hello Note]] draft block',
    order: 1,
    parentUid: 'k1D353kSry',
    childrenUids: [],
  },
]

const helloNoteContent: Block[] = [
  {
    uid: '8YKgEDhlUX',
    str: '[[Hello Note]]',
    docTitle: '[[Hello Note]]',
    order: 0,
    parentUid: null,
    childrenUids: ['15aO4YfzgD'],
  },
  {
    uid: '15aO4YfzgD',
    str: 'a [[Hello Note]] child block',
    order: 0,
    parentUid: '8YKgEDhlUX',
    childrenUids: [],
  },
]

const helloDraftContent: Block[] = [
  {
    uid: 'cb2g_hLzPU',
    str: '[[Hello Draft]]',
    docTitle: '[[Hello Draft]]',
    order: 0,
    parentUid: null,
    childrenUids: ['drYi_YJ0pZ'],
  },
  {
    uid: 'drYi_YJ0pZ',
    str: 'a [[Hello Draft]] child block',
    order: 0,
    parentUid: 'cb2g_hLzPU',
    childrenUids: [],
  },
]

/**
 * Got both note & draft
 */
export const hello: MockData = {
  title: '[[Hello]]',
  note: {
    symbol: '[[Hello]]',
    id: 'ttsZotJMy9',
    branch: 'playground',
    doc: {
      id: 'isy9ApWV0c',
      userId: 'nESCpMF5lg',
      noteMeta: {},
      content: helloContent.slice(0, 2),
    },
  },
  draft: {
    id: 'afxAdVY2U',
    content: helloContent,
  },
}

/**
 * Got note only
 */
export const helloNoteOnly: MockData = {
  title: '[[Hello Note]]',
  note: {
    symbol: '[[Hello Note]]',
    id: 'ttsZotJMy9',
    branch: 'playground',
    doc: {
      id: 'isy9ApWV0c',
      userId: 'nESCpMF5lg',
      noteMeta: {},
      content: helloNoteContent,
    },
  },
}

/**
 * Got draft only
 */
export const helloDraftOnly: MockData = {
  title: '[[Hello Draft]]',
  draft: {
    id: '08xc91MX8v',
    content: helloDraftContent,
  },
}

/**
 * Got nothing
 */
export const helloNothing: MockData = {
  title: '[[Hello Nothing]]',
}

export const myAllDrafts: NoteDraft[] = [
  hello.draft,
  helloDraftOnly.draft,
].filter((e): e is NoteDraft => e !== undefined)

//
// Mock search hits
//
//
//
//
//
//

const searchHitSymbols: SearchHit[] = [
  { id: '3zRRf0i5iB', note: { symbol: 'Apple' } },
  { id: 'x6F8ffEA4z', note: { symbol: 'Banana' } },
  { id: 'Inz8albP1X', note: { symbol: 'Campfire' } },
  { id: 'Fm5HyxvyVe', note: { symbol: 'DOM' } },
  { id: 'ZM3Ffvg6EM', note: { symbol: 'Elephant' } },
]

export const mockSearchHit = {
  symbols: searchHitSymbols,
}

//
// Mock local doc
//
//
//
//
//
//

export const mockLocalDoc = {
  doc: {
    title: '[[Mock Local Doc]]',
    blockUid: 'Nu9RRlYtUm',
  },
  blocks: [
    {
      uid: 'Nu9RRlYtUm',
      docTitle: '[[Mock Local Doc]]',
      parentUid: null,
      order: 0,
      childrenUids: ['v3HRC2gEyq'],
      str: '[[Mock Local Doc]]',
    },
    {
      uid: 'v3HRC2gEyq',
      parentUid: 'Nu9RRlYtUm',
      order: 0,
      childrenUids: [],
      str: '[[Mock Local Doc]] child block',
    },
  ],
}
