import { useObservable } from '@ngneat/react-rxjs'
import React, { memo, useState } from 'react'
import { tap } from 'rxjs'
import { blockDragLeave, blockDragOver, blockDrop } from '../../handlers/drag-handlers'
import { BlockElState } from '../../interfaces'
import { blockRepo } from '../../stores/block.repository'
import { BlockContent, MemoBlockContent } from './block-content'

// const BlockRefsCountEl = (count, clickFn) => {
//   return (
//     <div>
//       <button
//         onClick={e => {
//           e.stopPropagation()
//           clickFn(e)
//         }}
//       />
//     </div>
//   )
// }

export const BlockContainer = ({ uid }: { uid: string }): JSX.Element | null => {
  const [block] = useObservable(blockRepo.getBlock$(uid)),
    [children] = useObservable(blockRepo.getBlockChildren$(uid).pipe(tap(e => console.log(`children$: ${uid}`)))),
    [state, setState] = useState<BlockElState>({
      str: {
        local: null,
        previous: null,
      },
      search: {
        type: null,
        results: [],
        query: '',
        index: -1,
      },
      dragging: false,
      dragTarget: null,
      lastKeydown: null,
      contextMenu: {
        x: null,
        y: null,
        show: false,
      },
      showEditableDom: false,
    })

  // useEffect(() => {}, [])

  if (block === undefined) {
    console.debug('bk === undefined', uid)
    return null
  }
  // const saveFn = () => {
  //   transactStateForUid(originalUid || uid, state)
  // }
  // const idleFn = () => {
  //   debounce(saveFn, 2000)
  // }
  // setState({ ...state, string: { ...state.string, saveFn, idleFn } })

  // const comp = (block, linkedRefData, opts) => {
  // const ident = [':block/uid', originalUid || uid]
  // const { uid, string, open, children, _refs } = merge(getReactiveBlockDocument(ident), block)['block']
  // const { str, open = false } = block
  // const uidSanitizedBlock = transform([
  //   // specterRecursivePath(e => e.contains('block/uid')),
  //   // () => {}
  // ])
  // const { dragging } = state
  // const isEditing = subscribe(':editing/is-editing', uid)
  // const isSelected = subscribe('::select-subs/selected?', uid)
  // const presentUser = subscribe(':presence/has-presence', uid)
  // const isPresence = seq(presentUser)

  if (state.str.previous !== block.str) {
    setState({
      ...state,
      str: { previous: block.str, local: block.str },
    })
  }

  return (
    <div
      className="block-container"
      data-uid={uid}
      data-childrenuids={children.map(e => e.uid).join(',')}
      onMouseEnter={() => {
        setState({ ...state, showEditableDom: true })
      }}
      onMouseLeave={() => {
        setState({ ...state, showEditableDom: false })
      }}
      onDragOver={e => {
        blockDragOver(e, block, state, setState)
      }}
      onDragLeave={e => {
        blockDragLeave(e, block, state, setState)
      }}
      onDrop={e => {
        blockDrop(e, block, state, setState)
      }}
    >
      {/* {state.dragTarget === 'before' && <DropAreaIndicator gridArea={'above'}/> */}

      <div className="block-body">
        {/* {children.length > 0 && (
          <Toggle
            isOpen={block.open}
            onClick={e => {
              e.stopPropagation()
              events.blockOpen(uid, !open)
            }}
          />
        )} */}
        {/* {state.contextMenu.show && <ContextMenuEl props={{ uidSanitizedBlock, state }} />} */}
        {/* <Anchor
          props={{
            isClosedWithChildren,
            block,
            shouldShowDebugDetails: reFrame10xOpen(),
            onClick = e => {
              router.navigateUid(uid, e)
            },
            onContextMenu = e => {
              bulletContextMenu(e, uid, state)
            },
            onDragStart = e => {
              bulletDragStart(e, uid, state)
            },
            onDragEnd = e => {
              bulletDragEnd(e, uid, state)
            },
          }}
        /> */}
        <BlockContent {...{ block, state, setState }} />

        {/* <InlinePresenceEl props={{ uid }} /> */}
      </div>

      {/* <InlineSearchEl props={{ block, state }} /> */}
      {/* <SlashMenuEl props={{ block, state }} /> */}

      {block.open && children.length > 0 && children.map(e => <BlockContainer key={e.uid} uid={e.uid} />)}

      {/* {state.dragTarget === ':first' && <DropAreaIndicator grid-area={'below'} child={true} />} */}
      {/* {state.dragTarget === ':after' && <DropAreaIndicator grid-area={'below'} />} */}
    </div>
  )
  // }

  // return comp
}

export const MemoBlockContainer = memo(BlockContainer)
