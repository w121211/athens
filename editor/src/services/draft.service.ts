import { NoteDraft } from '../interfaces'
import { hello, helloDraftOnly, myAllDrafts } from './mock-data'

interface IDraftService {
  queryDraft(symbol: string): Promise<NoteDraft | null>

  queryMyAllDrafts(): Promise<Partial<NoteDraft>[] | null>

  saveDraft(draftInput: NoteDraft, id?: string): Promise<NoteDraft>
}

class MockDraftService implements IDraftService {
  async queryDraft(symbol: string): Promise<NoteDraft | null> {
    // throw new Error('not implemented')
    let draft: NoteDraft | undefined
    switch (symbol) {
      case hello.title:
        draft = hello.draft
        break
      case helloDraftOnly.title:
        draft = helloDraftOnly.draft
        break
    }
    return draft ?? null
  }

  async queryMyAllDrafts(): Promise<Partial<NoteDraft>[] | null> {
    // throw new Error('not implemented')
    return myAllDrafts
  }

  async saveDraft(draftInput: NoteDraft, id?: string): Promise<NoteDraft> {
    throw new Error('not implemented')
  }
}

export const draftService = new MockDraftService()
