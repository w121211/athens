import React from 'react'
import styled from 'styled-components'
import { useFocusRing } from '@react-aria/focus'
import { useTooltipTrigger } from '@react-aria/tooltip'
import { mergeProps } from '@react-aria/utils'
import { useTooltipTriggerState } from '@react-stately/tooltip'
import { TooltipTriggerProps } from '@react-types/tooltip'
import { Block } from '../../interfaces'
// import { DetailPopover } from '@/Block/components/DetailPopover'

export const AnchorButton = styled.button`
  flex-shrink: 0;
  grid-area: bullet;
  position: relative;
  z-index: 2;
  cursor: pointer;
  appearance: none;
  border: 0;
  // background: transparent;
  transition: all 0.05s ease;
  color: inherit;
  margin-right: 0.25em;
  display: flex;
  place-items: center;
  place-content: center;
  padding: 0;
  height: 2em;
  width: 1em;

  svg {
    pointer-events: none;
    transform: scale(1.0001); // Prevents the bullet being squished
    overflow: visible; // Prevents the bullet being cropped
    width: 1em;
    height: 1em;
    color: var(--user-color, var(--body-text-color---opacity-low));

    * {
      vector-effect: non-scaling-stroke;
    }
  }

  circle {
    fill: currentColor;
    transition: fill 0.05s ease, opacity 0.05s ease;
  }

  &:focus {
    outline: none;
  }

  &:before {
    content: '';
    inset: 0.25rem -0.125rem;
    z-index: -1;
    transition: opacity 0.1s ease;
    position: absolute;
    border-radius: 0.25rem;
    opacity: 0;
    background: var(--background-plus-2);
    box-shadow: var(--depth-shadow-8);
  }

  &:hover {
    color: var(--link-color);
    z-index: 100;
  }

  &:hover,
  &:hover:before,
  &:focus-visible:before {
    opacity: 1;
  }

  &.closed-with-children {
    circle {
      stroke: var(--body-text-color);
      fill: var(--body-text-color---opacity-low);
      r: 5;
      stroke-width: 2px;
      opacity: var(--opacity-med);
    }
  }

  &:hover svg {
    transform: scale(1.3);
  }

  &.dragging {
    z-index: 1;
    cursor: grabbing;
    color: var(--body-text-color);
  }
`

const anchorElements = {
  circle: (
    <svg viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="4" />
    </svg>
  ),
  dash: (
    <svg viewBox="0 0 1 1">
      <line
        x1="-1"
        y1="0"
        x2="1"
        y2="0"
        stroke="currentColor"
        strokeWidth="0.5"
      />
    </svg>
  ),
}

// const FocusRing = styled.div`
//   position: absolute;
//   inset: 0.25rem -0.125rem;
//   border: 2px solid var(--link-color);
//   border-radius: 0.25rem;
// `
const FocusRing = () => {
  return (
    <div className="absolute inset-y-1 inset-x-[-0.125rem] border-2 border-[#0075E1] rounded"></div>
  )
}

export interface AnchorProps extends TooltipTriggerProps {
  /**
   * What style of anchor to display
   */
  // anchorElement?: 'circle' | 'dash' | number
  anchorElement: 'circle' | 'dash'

  /**
   * Whether block is closed and has children
   */
  isClosedWithChildren: boolean

  shouldShowDebugDetails: boolean

  // block: Block

  onClick?: React.MouseEventHandler<HTMLButtonElement>
  onContextMenu?: React.MouseEventHandler<HTMLButtonElement>
  onDragStart?: React.DragEventHandler<HTMLButtonElement>
  onDragEnd?: React.DragEventHandler<HTMLButtonElement>
}

/**
 * A handle and indicator of a block's position in the document
 *
 * @bug firefox draggable won't work, possibly caused by styled-component
 */
export const Anchor = (props: AnchorProps) => {
  const { isClosedWithChildren, anchorElement, shouldShowDebugDetails } = props,
    ref = React.useRef<HTMLButtonElement>(null),
    state = useTooltipTriggerState(props),
    { triggerProps, tooltipProps } = useTooltipTrigger(
      { delay: 500 },
      state,
      ref,
    ),
    { isFocusVisible, focusProps } = useFocusRing()

  return (
    <>
      {/* <button
        draggable={true}
        onDragStart={(e) => {
          console.log('onDragStart')
        }}
        onDragEnd={(e) => {
          console.log('onDragEnd')
        }}
      >
        firefox drag-drop works here
      </button> */}
      <button
        className={['anchor', isClosedWithChildren && 'closed-with-children']
          .filter(Boolean)
          .join(' ')}
        ref={ref}
        draggable={true}
        {...mergeProps(props, focusProps, triggerProps)}
      >
        {anchorElements[anchorElement] ?? anchorElements['circle']}
        {isFocusVisible && <FocusRing />}
      </button>
      {/* {shouldShowDebugDetails && state.isOpen && (
        <DetailPopover block={block} {...tooltipProps} state={state} />
      )} */}
    </>
  )
}
