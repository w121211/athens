function handleInlineItemClick = (state: BlockElState, uid: string, expansion) => {
  const id = '#editable-uid-' + uid,
    target = document.querySelector(id)
  let fn
  switch(state.search.type) {
    case 'hashtag':
      fn = autoCompleteHashtag
    case 'template':
      fn = autoCompleteTemplate
  }
  fn(state, target, exapansion)
}

const InlineSearchEl = ({
  block,
  state,
  setState,
}: {
  block: Block
  state: BlockElState
  setState: BlockElStateSetFn
}): JSX.Element | null => {
  const ref = null,
    handleClickOutside = () => {
      //
    }

  const { query, results, index, type } = state.search,
    { createPosition } = state

  if (type === null) return null
  if (createPosition === undefined) return null

  return (
    <div style={{ top: createPosition.top + 24, left: createPosition.left + 24 }}>
      <div className="dropdown-menu">
        {query === '' || results.length === 0 ? (
          <Button>Search for {type}</Button>
        ) : (
          results?.map((e, i) => {
            const { nodeTitle, blockStr, blockUid } = e
            return (
              <Button
                key={'inline-search-item-' + blockUid}
                id={'dropdown-item-' + i}
                isPressed={index === i}
                // ;; if page link, expand to title. otherwise expand to uid for a block ref
                onClick={() => {
                  inlineItemClick(state, block.uid, nodeTitle ?? blockUid)
                }}
              >
                {nodeTitle ?? blockStr}
              </Button>
            )
          })
        )}
      </div>
    </div>
  )
}
