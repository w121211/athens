import styled from 'styled-components'
import React from 'react'
import {
  blockDragLeave,
  blockDragOver,
  blockDrop,
} from '../../handlers/drag-handlers'
import { ReactNode } from 'react'
import { useObservable } from '@ngneat/react-rxjs'
import { blockRepo } from '../../stores/block.repository'
import { Block, DragTarget } from '../../interfaces'

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

interface BlockContainerProps {
  uid: string
  childrenuids: string
  children: ReactNode
  block: Block
  dragTarget: DragTarget | null
  setDragTarget: () => void
  className: string
}

const myBlockContainer = ({
  className,
  children,
  childrenuids,
  uid,
  block,
  dragTarget,
  setDragTarget,
}: BlockContainerProps) => {
  return (
    <div
      data-uid={uid}
      data-chihldrenuids={childrenuids}
      className={`relative flex flex-col flex-1 justify-start leading-7 rounded-sm text-inherit 
    after:content-[''] after:absolute after:top-[0.75px] after:right-0 after:bottom-[0.75px] after:left-0 after:opacity-0 after:pointer-events-none after:rounded-sm ${className}`}
      onDragOver={(e) => blockDragOver(e, block, setDragTarget)} // TODO: throttle
      onDragLeave={(e) => blockDragLeave(e, block, setDragTarget)}
      onDrop={(e) => blockDrop(e, block, dragTarget, setDragTarget)}
    >
      {children}
    </div>
  )
}

export const BlockContainer = styled.div`
  display: flex;
  line-height: var(--line-height, 1.75em);
  position: relative;
  border-radius: 0.125rem;
  justify-content: flex-start;
  flex-direction: column;
  flex: 1 1 100%;
  color: inherit;

  &.show-tree-indicator:before {
    content: '';
    position: absolute;
    width: 1px;
    left: calc(1.375em + 1px);
    top: 2em;
    bottom: 0;
    transform: translateX(50%);
    transition: background-color 0.2s ease-in-out;
    background: var(--user-color, var(--border-color));
  }

  &.is-presence.show-tree-indicator:before {
    opacity: var(--opacity-low);
    transform: translateX(50%) scaleX(2);
  }

  &:after {
    content: '';
    position: absolute;
    top: 0.75px;
    right: 0;
    bottom: 0.75px;
    left: 0;
    opacity: 0;
    pointer-events: none;
    border-radius: 0.25rem;
    transition: opacity 0.075s ease;
    background: var(--link-color---opacity-lower);
  }

  &.is-selected:after {
    opacity: 1;
  }

  .is-selected &.is-selected {
    &:after {
      opacity: 0;
    }
  }

  .user-avatar {
    position: absolute;
    transition: transform 0.3s ease;
    left: 4px;
    top: 4px;
  }

  .block-edit-toggle {
    position: absolute;
    appearance: none;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: none;
    border: none;
    cursor: text;
    display: block;
    z-index: 1;
  }

  .block-content {
    grid-area: content;
    min-height: 1.5em;

    &:hover + .user-avatar {
      transform: translateX(-2em);
    }
  }

  &.is-linked-ref {
    background-color: var(--background-plus-2);
  }

  /* Inset child blocks */
  & & {
    margin-left: var(--block-child-inset-margin, 2em);
    grid-area: body;
  }
`
