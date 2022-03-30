import { useEffect } from 'react'
// import { MouseEvent } from 'react'
import { useRef } from 'react'
import {
  autoCompleteHashtag,
  autoCompleteInline,
} from '../../handlers/textarea-keydown'
import { Block, CaretPosition, Search } from '../../interfaces'

function inlineItemClick(
  uid: string,
  expansion: string | null,
  search: Search,
  setSearch: React.Dispatch<React.SetStateAction<Search>>,
) {
  const id = '#editable-uid-' + uid,
    target = document.querySelector(id)

  if (target) {
    switch (search.type) {
      case 'hashtag':
        autoCompleteHashtag(target as HTMLTextAreaElement, expansion, setSearch)
        break
      // case 'template':
      //   fn = autoCompleteTemplate
      default:
        autoCompleteInline(
          target as HTMLTextAreaElement,
          expansion,
          search,
          setSearch,
        )
    }
  }
}

export const InlineSearchEl = ({
  block,
  caret,
  search,
  setSearch,
}: {
  block: Block
  caret: CaretPosition
  search: Search
  setSearch: React.Dispatch<React.SetStateAction<Search>>
}): JSX.Element | null => {
  const searchPanel = useRef<HTMLDivElement>(null),
    handleClickOutside = (e: MouseEvent) => {
      const { type } = search
      if (
        type &&
        e.target &&
        !searchPanel.current?.contains(e.target as Node)
      ) {
        setSearch({ type: null, results: [], query: '', index: null })
      }
    }

  const inlineSearch = (): JSX.Element | null => {
    useEffect(() => {
      document.addEventListener('mousedown', handleClickOutside)

      return () => {
        document.removeEventListener('mousedown', handleClickOutside)
      }
    }, [])

    const { query, results, index, type } = search

    if (type === null) return null
    return (
      <div
        style={{ top: caret.top + 24, left: caret.left + 24 }}
        ref={searchPanel}
        // ;; don't blur textarea when clicking to auto-complete
        onMouseDown={(e) => {
          e.preventDefault()
        }}
      >
        <div className="dropdown-menu">
          {query === '' || results.length === 0 ? (
            <button>Search for {type}</button>
          ) : (
            results?.map((e, i) => {
              const { nodeTitle, blockStr, blockUid } = e
              return (
                <button
                  key={'inline-search-item-' + blockUid}
                  id={'dropdown-item-' + i}
                  // isPressed={index === i}
                  // ;; if page link, expand to title. otherwise expand to uid for a block ref
                  onClick={() => {
                    inlineItemClick(
                      block.uid,
                      nodeTitle ?? blockUid ?? null,
                      search,
                      setSearch,
                    )
                  }}
                >
                  {nodeTitle ?? blockStr}
                </button>
              )
            })
          )}
        </div>
      </div>
    )
  }

  return inlineSearch()
}
