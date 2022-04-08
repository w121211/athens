import { Search, SearchHit } from '../interfaces'
import { mockSearchHit } from './mock-data'

interface ISearchService {
  searchAuthor(term: string): Promise<SearchHit[]>

  searchDiscuss(term: string): Promise<SearchHit[]>

  /**
   * Fuzzy search on all notes which include web-note
   * for basic notes, search by their symbols
   * for web-notes, search by their webpage-titles
   */
  searchNote(term: string): Promise<SearchHit[]>

  /**
   * Client-side helpers
   */

  getAutoCompleteStr(search: Search): string | null
}

class MockSearchService implements ISearchService {
  async searchAuthor(term: string): Promise<SearchHit[]> {
    throw new Error('not implemented')
  }

  async searchDiscuss(term: string): Promise<SearchHit[]> {
    throw new Error('not implemented')
  }

  async searchNote(term: string): Promise<SearchHit[]> {
    return mockSearchHit.symbols
  }

  /**
   * Get hit by index, transforms to corresponding inline-str
   * If `hitClicked` is given, use it
   * If index is out of bound, return null
   *
   * @param hitClicked hit clicked by mouse
   */
  getAutoCompleteStr(search: Search, hitClicked?: SearchHit): string | null {
    const { hits, hitIndex } = search,
      hit = hitClicked ?? (hitIndex !== null ? hits[hitIndex] : undefined)

    if (hit) {
      const { note, discussTitle } = hit
      if (note) {
        return note.symbol
      } else if (discussTitle) {
        return discussTitle
      }
    }
    return null
  }
}

export const searchService = new MockSearchService()
