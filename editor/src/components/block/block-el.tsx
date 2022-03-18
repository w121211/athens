import { useObservable } from '@ngneat/react-rxjs'
import React from 'react'
import { useEffect } from 'react'
import { memo } from 'react'
import { useState } from 'react'
import { tap } from 'rxjs'
import { events } from '../../events'
import { blockRepo } from '../../stores/block/block.repository'
import { BlockContentEl } from './block-content'

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

// const blockDragOver = (e: React.DragEvent<HTMLDivElement>, block, state) => {
//   e.preventDefault()
//   e.stopPropagation()
//   const { children, uid, open } = block.block,
//     closestContainer = (e.target as HTMLElement).closest('.block-container'),
//     [x, y] = mouseOffset(e, closestContainer),
//     middleY = verticalCenter(closestContainer),
//     draggingAncestor = (e.target as HTMLElement).closest('..dragging'),
//     dragging = draggingAncestor,
//     isSelected = subscribe('::select-subs/selected?', uid)

//   let target
//   if (dragging) target = null
//   else if (isSelected) target = null
//   else if (y < 0 || y < middleY) target = ':before'
//   else if (!open || (children.isEmpty() && 50 < x)) target = ':first'
//   else if (middleY < y) target = ':after'

//   if (target) {
//     swap(state, { dragTarget: target })
//   }
// }

// const dropBullet = (sourceUid, targetUid, dragTarget, actionAllowed) => {
//   const moveAction = actionAllowed === 'move'
//   const event = [moveAction ? ':block/move' : ':block/link', { sourceUid, targetUid, dragTarget }]
//   dispatch(event)
// }

// const dropBulletMulti = (sourceUids, targetUid, dragTarget) => {
//   const sourceUids = mapv(comp(first, uidAndEmbedId), sourceUids)
//   const targetUid = uidAndEmbedId(targetUid)[0]
//   const event =
//     dragTarget === ':first'
//       ? ['drop-multi/child', { sourceUids, targetUid }]
//       : ['drop-multi/sibling', { sourceUids, targetUid, dragTarget }]
//   dispatch('::select-events/clear')
//   dispatch(event)
// }

// const blockDrop = (e, block, state) => {
//   const { uid: _targetUid } = block.block
//   const [targetUid] = uidAndEmbedId(_targetUid)
//   const { dragTarget } = state
//   const sourceUid = getData(e.dataTransfer, 'text/plain')
//   const effectAllowed = e.dataTransfer.effectAllowed
//   const items = array(e.dataTransfer.items)
//   const item = items[0]
//   const datatype = item.type
//   const imgRgex = /(?i)^image\/(p?jpeg|gif|png)$/
//   const validTextDrop =
//     dragTarget !== null && sourceUid !== targetUid && (effectAllowed === 'link' || effectAllowed === 'move')
//   const selectedItem = subscribe('select-subs/items')

//   if (reFind(imgRgex, datatype)) {
//     //
//   } else if (reFind('text/plain', datatype)) {
//     if (validTextDrop) {
//       if (selectedItem === undefined) {
//         dropBullet(sourceUid, targetUid, dragTarget, effectAllowed)
//       } else {
//         dropBulletMulti(selectedItem, targetUid, dragTarget)
//       }
//     }
//   }

//   dispatch(':mouse-down/unset')
//   swap(state, { dragTarget: null })
// }

// const blockDragLeave = (e, block, state) => {
//   e.preventDefault()
//   e.stopPropagation()
//   const { uid: targetUid } = block.block
//   const relatedUid = getDatasetUid(e.relatedTarget)
//   if (relatedUid !== targetUid) {
//     swap(state, { dragTarget: null })
//   }
// }

// const BlockEl = (block, linkedRefData, _opts) => {
export const BlockEl = ({ uid }: { uid: string }): JSX.Element | null => {
  // const { linkedRef, initialOpen, linkedRefUid, parentUids } = linkedRefData
  // const { uid, originalUid } = block.block

  const [bk] = useObservable(blockRepo.getBlock$(uid)),
    [children] = useObservable(blockRepo.getBlockChildren$(uid).pipe(tap(e => console.log(`children$: ${uid}`)))),
    [] = useState()

  // [state, setState] = useState<BlockElState>({
  //   string: {
  //     local: null,
  //     previous: null,
  //   },
  //   search: {
  //     type: null,
  //     results: null,
  //     query: null,
  //     index: null,
  //   },
  //   dragging: false,
  //   dragTarget: null,
  //   lastKeydown: null,
  //   contextMenu: {
  //     x: null,
  //     y: null,
  //     show: false,
  //   },
  //   createPosition: null,
  //   showEditableDom: false,
  // })

  if (bk === undefined) {
    console.error('bk === undefined', bk, uid)
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
  const { str, open = false } = bk
  const childrenUids = children.map(e => e.uid)
  // const uidSanitizedBlock = transform([
  //   // specterRecursivePath(e => e.contains('block/uid')),
  //   // () => {}
  // ])
  // const { dragging } = state
  // const isEditing = subscribe(':editing/is-editing', uid)
  // const isSelected = subscribe('::select-subs/selected?', uid)
  // const presentUser = subscribe(':presence/has-presence', uid)
  // const isPresence = seq(presentUser)

  // if (string !== state.string.previous) {
  //   swap(state, {
  //     string: {
  //       previous: string,
  //       local: string,
  //     },
  //   })
  // }

  return (
    <div
      data-uid={uid}
      data-childrenuids={childrenUids.join(',')}
      onMouseEnter={() => {
        // swap(state, { showEditableDom: true })
        setState({ ...state, showEditableDom: true })
      }}
      onMouseLeave={() => {
        // swap(state, { showEditableDom: false })
        setState({ ...state, showEditableDom: false })
      }}
      // onDragOver={e => {
      //   blockDragOver(e, block, state)
      // }}
      // onDragLeave={e => {
      //   blockDragLeave(e, block, state)
      // }}
      // onDrop={() => {
      //   blocDrop(e, block, state)
      // }}
    >
      <div>
        {children.length > 0 && (
          <button
            onClick={e => {
              e.stopPropagation()
              events.blockOpen(uid, !open)
            }}
          >
            Toggle
          </button>
        )}
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

        <BlockContentEl {...{ block: bk, state, setState }} />
        {/* <InlinePresenceEl props={{ uid }} /> */}

        {/* {count(_refs) > 0 && ':block-embed?' !== opts && <BlockRefsCountEl />} */}
      </div>

      {/* <InlineSearchEl props={{ block, state }} />
      <SlashMenuEl props={{ block, state }} /> */}

      {/* {count(_refs) > 0 && ':block-embed?' !== opts && state.inlineRefs.open && <BlockRefsCountEl />} */}

      {/* {children.length > 0 &&
        ((linkedRef && state.linkedRef.open) || (linkedRef === false && open)) &&
        children.map(child => {
          linkedRefData.initialOpen = contains(parentUids, child.block.uid)
          return (
            <span key={child.db.id}>
              <BlockEl
                props={{
                  child,
                  linkedRefData,
                  opts,
                }}
              />
            </span>
          )
        })} */}

      {/* {state.dragTarget === ':first' && <DropAreaIndicator child={true} />}
      {state.dragTarget === ':after' && <DropAreaIndicator />} */}
    </div>
  )
  // }

  // return comp
}

export const MemoBlockEl = memo(BlockEl)
