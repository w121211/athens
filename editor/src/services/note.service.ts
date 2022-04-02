import { Note } from '../interfaces'
import { hello, helloNoteOnly } from './mock-data'

interface INoteService {
  queryNote(symbol: string): Promise<Note | null>
}

class MockNoteService implements INoteService {
  async queryNote(symbol: string): Promise<Note | null> {
    // throw new Error('not implemented')
    let note: Note | undefined
    switch (symbol) {
      case hello.title:
        note = hello.note
        break
      case helloNoteOnly.title:
        note = helloNoteOnly.note
        break
    }
    return note ?? null
  }
}

export const noteService = new MockNoteService()
