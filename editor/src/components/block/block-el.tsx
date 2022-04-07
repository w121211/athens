import React, { useMemo, useState } from 'react'
import { useObservable } from '@ngneat/react-rxjs'

import * as events from '../../events'
import {
  blockDragLeave,
  blockDragOver,
  blockDrop,
  bulletDragEnd,
  bulletDragStart,
} from '../../handlers/drag-handlers'
import {
  CaretPosition,
  DestructTextareaKeyEvent,
  DragTarget,
  Search,
} from '../../interfaces'
import { blockRepo } from '../../stores/block.repository'
import { rfdbRepo } from '../../stores/rfdb.repository'
import { InlineSearchEl } from '../autocomplete-search/autocomplete-search'
import { Anchor } from './anchor'
import { BlockBody } from './block-body'
import { BlockContainer } from './block-container'
import { BlockContent } from './block-content'
import { DropAreaIndicator } from './drop-area-indicator'
import { Toggle } from './toggle'
import { throttle } from 'lodash'

// export const BlockContainer = ({
//   uid,
// }: {
//   uid: string
// }): JSX.Element | null => {
//   const [block] = useObservable(blockRepo.getBlock$(uid)),
//     [children] = useObservable(
//       blockRepo
//         .getBlockChildren$(uid)
//         .pipe(tap((e) => console.log(`children$: ${uid}`))),
//     ),
//     [search, setSearch] = useState<Search>({
//       type: null,
//       query: null,
//       index: null,
//       results: [],
//     }),
//     [caret, setCaret] = useState<CaretPosition>({ top: 0, left: 0, height: 0 }),
//     [contextMenu, setContextMenu] = useState({ x: null, y: null, show: false }),
//     [dragging, setDragging] = useState(false),
//     [dragTarget, setDragTarget] = useState<DragTarget | null>(null),
//     [showEditableDom, setShowEditableDom] = useState(false)

//   // useEffect(() => {}, [])

//   if (block === undefined) {
//     console.debug('bk === undefined', uid)
//     return null
//   }

//   // const comp = (block, linkedRefData, opts) => {
//   // const ident = [':block/uid', originalUid || uid]
//   // const { uid, string, open, children, _refs } = merge(getReactiveBlockDocument(ident), block)['block']
//   // const { str, open = false } = block
//   // const uidSanitizedBlock = transform([
//   //   // specterRecursivePath(e => e.contains('block/uid')),
//   //   // () => {}
//   // ])
//   // const { dragging } = state
//   // const isEditing = subscribe(':editing/is-editing', uid)
//   // const isSelected = subscribe('::select-subs/selected?', uid)
//   // const presentUser = subscribe(':presence/has-presence', uid)
//   // const isPresence = seq(presentUser)

//   // if (state.str.previous !== block.str) {
//   //   setState({
//   //     ...state,
//   //     str: { previous: block.str, local: block.str },
//   //   })
//   // }

//   return (
//     <div
//       className="block-container"
//       data-uid={uid}
//       data-childrenuids={children.map((e) => e.uid).join(',')}
//       onMouseEnter={() => setShowEditableDom(true)}
//       onMouseLeave={() => setShowEditableDom(false)}
//       onDragOver={(e) => blockDragOver(e, block, setDragTarget)}
//       onDragLeave={(e) => blockDragLeave(e, block, setDragTarget)}
//       onDrop={(e) => blockDrop(e, block, dragTarget, setDragTarget)}
//     >
//       {/* {state.dragTarget === 'before' && <DropAreaIndicator gridArea={'above'}/> */}

//       <div className="block-body">
//         {/* {children.length > 0 && (
//           <Toggle
//             isOpen={block.open}
//             onClick={e => {
//               e.stopPropagation()
//               events.blockOpen(uid, !open)
//             }}
//           />
//         )} */}
//         {/* {state.contextMenu.show && <ContextMenuEl props={{ uidSanitizedBlock, state }} />} */}
//         {/* <Anchor
//           props={{
//             isClosedWithChildren,
//             block,
//             shouldShowDebugDetails: reFrame10xOpen(),
//             onClick = e => {
//               router.navigateUid(uid, e)
//             },
//             onContextMenu = e => {
//               bulletContextMenu(e, uid, state)
//             },
//             onDragStart = e => {
//               bulletDragStart(e, uid, state)
//             },
//             onDragEnd = e => {
//               bulletDragEnd(e, uid, state)
//             },
//           }}
//         /> */}

//         <BlockContent
//           {...{
//             uid,
//             localStr: block.str,
//             showEditableDom,
//             caret,
//             setCaret,
//             search,
//             setSearch,
//           }}
//         />

//         {/* <InlinePresenceEl props={{ uid }} /> */}
//       </div>

//       {/* <InlineSearchEl {...{ block, caret, search, setSearch }} /> */}
//       {/* <SlashMenuEl props={{ block, state }} /> */}

//       {block.open &&
//         children.length > 0 &&
//         children.map((e) => <BlockContainer key={e.uid} uid={e.uid} />)}

//       {/* {state.dragTarget === ':first' && <DropAreaIndicator grid-area={'below'} child={true} />} */}
//       {/* {state.dragTarget === ':after' && <DropAreaIndicator grid-area={'below'} />} */}
//     </div>
//   )
// }

/**
 * Refs:
 * - block-el <- blocks/core.cljs
 * - Block.tsx
 */
export const BlockEl = ({
  uid,
  isEditable,
}: {
  uid: string
  isEditable: boolean
}): JSX.Element | null => {
  const [block] = useObservable(blockRepo.getBlock$(uid)),
    [children] = useObservable(blockRepo.getBlockChildren$(uid)),
    [isEditing] = useObservable(rfdbRepo.getIsEditing$(uid)),
    [isSelected] = useObservable(rfdbRepo.getIsSelected$(uid)),
    [search, setSearch] = useState<Search>({
      type: null,
      query: null,
      index: null,
      results: [],
    }),
    [caret, setCaret] = useState<CaretPosition>({ top: 0, left: 0, height: 0 }),
    [contextMenu, setContextMenu] = useState({ x: null, y: null, show: false }),
    [dragging, setDragging] = useState(false),
    [dragTarget, setDragTarget] = useState<DragTarget | null>(null),
    [lastKeyDown, setLastKeyDown] =
      useState<DestructTextareaKeyEvent | null>(null),
    [showEditableDom, setShowEditableDom] = useState(false)

  //   const [avatarAnchorEl, setAvatarAnchorEl] =
  //     React.useState<HTMLDivElement | null>(null)

  if (block === undefined) {
    console.debug('<Block> block === undefined', uid)
    return null
  }

  const { open, str: localStr } = block,
    isOpen = open ?? true,
    childrenBlockEls = useMemo(() => {
      return children.map((e) => (
        <BlockEl key={e.uid} uid={e.uid} isEditable={isEditable} />
      ))
    }, [children])

  return (
    <BlockContainer
      data-uid={uid}
      data-childrenuids={children.map((e) => e.uid).join(',')}
      className={
        // [
        `block-container
        ${children.length > 0 && isOpen && 'show-tree-indicator'}
           ${isOpen ? 'is-open' : 'is-closed'}
           ${isSelected ? 'is-selected' : ''}
           ${isSelected && dragging && 'is-dragging'}
           ${isEditing && 'is-editing'}`
        // ]
        // isLocked && 'is-locked',
        // linkedRef && 'is-linked-ref',
        // presentUser && showPresentUser && 'is-presence',
        //   .filter(Boolean)
        //   .join(' ')
      }
      //   onDragOver={handleDragOver}
      //   onDragLeave={handleDragLeave}
      //   onDrop={handleDrop}
      // onDragOver={(e) => console.log('onDragOver')}
      onDragOver={(e) => blockDragOver(e, block, setDragTarget)} // TODO: throttle
      onDragLeave={(e) => blockDragLeave(e, block, setDragTarget)}
      onDrop={(e) => blockDrop(e, block, dragTarget, setDragTarget)}
    >
      {dragTarget === 'before' && (
        <DropAreaIndicator style={{ gridArea: 'above' }} />
      )}

      <BlockBody
        //   ref={showPresentUser && setAvatarAnchorEl}
        onMouseEnter={() => {
          // handleMouseEnterBlock
          // isEditable && setRenderEditableDom(true)
          isEditable && setShowEditableDom(true)
        }}
        onMouseLeave={() => {
          // handleMouseLeaveBlock
          // isEditable && setRenderEditableDom(false)
          isEditable && setShowEditableDom(false)
        }}
      >
        {children.length > 0 && (
          <Toggle
            isOpen={isOpen}
            onClick={(e) => {
              e.stopPropagation()
              events.blockOpen(uid, !isOpen)
            }}
          />
        )}
        <Anchor
          anchorElement="circle"
          // handlePressAnchor={handlePressAnchor}
          isClosedWithChildren={!isOpen && children.length > 0}
          shouldShowDebugDetails={false}
          // block,
          // onClick={(e) => router.navigateUid(uid, e)}
          // onContextMenu={(e) => bulletContextMenu(e, uid, state)}
          onDragStart={(e) => bulletDragStart(e, uid, setDragging)}
          onDragEnd={() => bulletDragEnd(setDragging)}
        />

        <BlockContent
          {...{
            uid,
            isEditing,
            localStr,
            showEditableDom,
            caret,
            setCaret,
            search,
            setSearch,
            setLastKeyDown,
          }}
        />
        {/* {refsCount >= 1 && <Refs refsCount={refsCount} />} */}
      </BlockBody>

      <InlineSearchEl {...{ block, caret, search, setSearch }} />
      {/* <SlashMenuEl props={{ block, state }} /> */}

      {isOpen && children.length > 0 && childrenBlockEls}

      {dragTarget === 'first' && (
        <DropAreaIndicator style={{ gridArea: 'below' }} child={true} />
      )}
      {dragTarget === 'after' && (
        <DropAreaIndicator style={{ gridArea: 'below' }} />
      )}
    </BlockContainer>
  )
}

// Block.Anchor = Anchor
// Block.Container = Container
// Block.Toggle = Toggle
// Block.Body = Body
// Block.Content = Content
// BlockEl.ListContainer = styled.div`
//   display: flex;
//   flex-direction: column;
// `
