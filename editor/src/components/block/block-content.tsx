import React, { useState } from 'react'
import { tap } from 'rxjs'
import {
  CaretPosition,
  DestructTextareaKeyEvent,
  Search,
} from '../../interfaces'
import { textareaKeyDown } from '../../handlers/textarea-keydown'
import styled from 'styled-components'
import {
  textareaBlur,
  textareaChange,
  textareaClick,
  textareaMouseDown,
  textareaMouseEnter,
  textareaUnmount,
} from '../../handlers/textarea-handlers'
import { useEffect } from 'react'

const ContentWrap = styled.div`
  grid-area: content;
  display: grid;
  grid-template-areas: 'main';
  place-items: stretch;
  place-content: stretch;
  position: relative;
  overflow: visible;
  z-index: 2;
  flex-grow: 1;
  word-break: break-word;

  .rendered-content,
  textarea {
    grid-area: main;
    cursor: text;
    font-size: inherit;
    font-family: inherit;
    color: inherit;
  }

  textarea {
    color: inherit;
    font-size: inherit;
    position: relative;
    display: block;
    -webkit-appearance: none;
    resize: none;
    transform: translate3d(0, 0, 0);
    outline: none;
    background: transparent;
    caret-color: var(--link-color);
    min-height: 100%;
    padding: 0;
    margin: 0;
    border: 0;
    opacity: 0;
  }

  &.is-editing,
  &.show-editable-dom {
    textarea {
      z-index: 3;
      line-height: inherit;
      opacity: 0;
    }
  }

  &.is-editing {
    textarea {
      opacity: 1;
    }

    .rendered-content {
      opacity: 0;
    }
  }

  &:not(.is-editing):hover textarea {
    line-height: inherit;
  }

  .is-locked > .block-body > & {
    opacity: 0.5;
  }

  span.text-run {
    pointer-events: none;

    > a {
      position: relative;
      z-index: 2;
      pointer-events: auto;
    }
  }

  span {
    grid-area: main;

    > span {
      > a {
        position: relative;
        z-index: 2;
      }
    }
  }

  abbr {
    grid-area: main;
    z-index: 4;

    > span {
      > a {
        position: relative;
        z-index: 2;
      }
    }
  }

  code,
  pre {
    font-family: 'IBM Plex Mono';
  }

  .media-16-9 {
    height: 0;
    width: calc(100% - 0.25rem);
    z-index: 1;
    transform-origin: right center;
    transition: all 0.2s ease;
    padding-bottom: calc(9 / 16 * 100%);
    margin-block: 0.25rem;
    margin-inline-end: 0.25rem;
    position: relative;
  }

  iframe {
    border: 0;
    box-shadow: inset 0 0 0 0.125rem var(background-minus-1);
    position: absolute;
    height: 100%;
    width: 100%;
    cursor: default;
    top: 0;
    right: 0;
    left: 0;
    bottom: 0;
    border-radius: 0.25rem;
  }

  img {
    border-radius: 0.25rem;
    max-width: calc(100% - 0.25rem);
  }

  h1,
  h2,
  h3,
  h4,
  h5,
  h6 {
    margin: 0;
    color: var(--body-text-color---opacity-higher);
    font-weight: 500;
  }

  h1 {
    padding: 0;
    margin-block-start: '-0.1em';
  }

  h2,
  h3 {
    padding: 0;
  }

  h4 {
    padding: 0.25em 0;
  }

  h5 {
    padding: 1em 0;
  }

  h6 {
    text-transform: uppercase;
    letter-spacing: 0.06em;
    padding: 1em 0;
  }

  p {
    margin: 0;
    padding-bottom: 1em;
  }

  blockquote {
    margin-block: 0.125rem;
    margin-inline: 0.5em;
    padding-block: calc(0.5em - 0.125rem - 0.125rem);
    padding-inline: 1.5em;
    border-radius: 0.25em;
    background: var(--background-minus-1);
    color: var(--body-text-color---opacity-high);

    p {
      padding-bottom: 1em;

      &:last-child {
        padding-bottom: 0;
      }
    }
  }

  mark.content-visibility.highlight {
    padding: 0 0.2em;
    border-radius: 0.125rem;
    background-color: var(--text-highlight-color);
  }
`

/**
 * "Actual string contents. Two elements, one for reading and one for writing.
  The CSS class is-editing is used for many things, such as block selection.
  Opacity is 0 when block is selected, so that the block is entirely blue, rather than darkened like normal editing.
  is-editing can be used for shift up/down, so it is used in both editing and selection."
 */
// export const BlockContent = ({
//   uid,
//   localStr,
//   showEditableDom,
//   caret,
//   setCaret,
//   search,
//   setSearch,
// }: {
//   uid: string
//   localStr: string
//   showEditableDom: boolean
//   caret: CaretPosition
//   setCaret: React.Dispatch<React.SetStateAction<CaretPosition>>
//   search: Search
//   setSearch: React.Dispatch<React.SetStateAction<Search>>
// }): JSX.Element => {
//   // const { uid, originalUid, header } = block.block,
//   // selectedItems = subscribe('select-subs/items')

//   const [isEditing] = useObservable(rfdbRepo.getBlockIsEditing$(uid)),
//     [lastKeyDown, setLastKeyDown] =
//       useState<DestructTextareaKeyEvent | null>(null)

//   useEffect(() => {
//     console.debug('BlockContentEl::mount ' + uid)

//     return () => {
//       console.log('BlockContentEl::unmount ' + uid)
//     }
//   })

//   return (
//     <div className="block-content">
//       {(showEditableDom || isEditing) && (
//         // TODO: autosize/textarea
//         <textarea
//           id={'editable-uid-' + uid}
//           data-testid="block-content-textarea"
//           // className={['textarea', empty(selectedItems) && editing ? 'is-editing' : undefined].join('')}
//           style={{ lineHeight: '1.40em' }}
//           rows={1}
//           value={localStr}
//           onChange={(e) => textareaChange(e, uid)}
//           // onPaste={(e) => textareaPaste(e, uid, state)}
//           // onKeyDown={(e) => textareaKeyDown(e, uid, editing, state, setState)}
//           onKeyDown={(event) =>
//             textareaKeyDown({
//               event,
//               uid,
//               editing: isEditing,
//               caret,
//               setCaret,
//               search,
//               setSearch,
//               localStr,
//               setLastKeyDown,
//             })
//           }
//           // onBlur={state.str.saveFn}
//           onClick={(e) => textareaClick(e, uid)}
//           onMouseEnter={(e) => textareaMouseEnter()}
//           onMouseDown={(e) => textareaMouseDown(e)}
//         />
//       )}

//       {/* {parseAndRender(state.string.local, originalUid || uid)} */}
//       <div className="rendered-content">
//         {/* {state.str.local}xxxxxxxxxxxx{uid} */}
//         {localStr}xxxxxxxxxxxx{uid}
//       </div>
//     </div>
//   )
// }

export const BlockContent = ({
  // rawContent,
  // renderedContent,
  // isLocked,
  // isEditable,
  // handleContentChange,
  // contentProps,
  // textareaProps,
  uid,
  isEditing,
  defaultLocalStr,
  showEditableDom,
  caret,
  setCaret,
  search,
  setSearch,
  setLastKeyDown,
}: {
  uid: string
  isEditing: boolean
  defaultLocalStr: string
  showEditableDom: boolean
  caret: CaretPosition
  setCaret: React.Dispatch<React.SetStateAction<CaretPosition>>
  search: Search
  setSearch: React.Dispatch<React.SetStateAction<Search>>
  setLastKeyDown: React.Dispatch<
    React.SetStateAction<DestructTextareaKeyEvent | null>
  >
}): JSX.Element => {
  const [localStr, setLocalStr] = useState(defaultLocalStr)

  useEffect(() => {
    if (localStr !== defaultLocalStr) {
      console.debug('textareaUnmount')
      textareaUnmount(uid, localStr)
    }
  }, [isEditing, showEditableDom])

  return (
    <ContentWrap
      className={[
        'block-content',
        // isLocked ? 'is-locked' : '',
        isEditing ? 'is-editing' : '',
        showEditableDom ? 'show-editable-dom' : '',
      ].join(' ')}
    >
      {(isEditing || showEditableDom) && (
        <textarea
          // rows={1}
          // placeholder="Enter text"
          // {...textareaProps}
          // onKeyUp={handleContentChange}
          // defaultValue={rawContent}
          //
          id={'editable-uid-' + uid}
          data-testid="block-content-textarea"
          // className={['textarea', empty(selectedItems) && editing ? 'is-editing' : undefined].join('')}
          // style={{ lineHeight: '1.40em' }}
          rows={1}
          value={localStr}
          onChange={(e) => textareaChange(e, uid, setLocalStr)}
          // onPaste={(e) => textareaPaste(e, uid, state)}
          onKeyDown={(e) =>
            textareaKeyDown({
              e,
              uid,
              editing: isEditing,
              localStr,
              caret,
              setCaret,
              search,
              setSearch,
              setLastKeyDown,
            })
          }
          onBlur={(e) => textareaBlur(e, uid)}
          onClick={(e) => textareaClick(e, uid)}
          onMouseDown={(e) => textareaMouseDown(e)}
          onMouseEnter={(e) => textareaMouseEnter(e, uid)}
        />
      )}
      <div className="rendered-content" style={{ color: 'red' }}>
        {localStr}
      </div>
      {/* {parseAndRender(state.string.local, originalUid || uid)} */}
    </ContentWrap>
  )
}
