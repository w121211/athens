import React from 'react'
import styled from 'styled-components'
import { useFocusRing } from '@react-aria/focus'
import { mergeProps } from '@react-aria/utils'
import { ReactNode } from 'react'

interface MyToggleProps {
  children: ReactNode
}

// export const ToggleButton = React.forwardRef<HTMLButtonElement, MyToggleProps>(
//   (props: MyToggleProps, ref) => {
//     const { isFocusVisible, focusProps } = useFocusRing()
//     const { children } = props
//     return (
//       <button
//         className='[grid-area:toggle] flex-shrink-0 relative flex items-center justify-center z-[2]
//     w-[1em] h-[2em] bg-none border-none p-0 appearance-none transition-[color_.05s_ease] text-[#AAA]/25
//      cursor-pointer focus:outline-none hover:text-[#AAA]/50
//      before:content-[""] before:absolute before:-inset-x-[0.125rem] before:inset-y-1 before:rounded before:-z-[1] before:opacity-0
//      before:transition-[opacity_.1s_ease] before:bg-[#333] before:shadow-[0_4px_8px_rgba(0,0,0,0.2)]
//      before:hover:opacity-100 before:focus-visible:opacity-100 empty:pointer-events-none'
//         ref={ref}
//          {...mergeProps(focusProps, props)}
//       >
//         {children}
//       </button>
//     )
//   },
// )

// export const ToggleButton = styled.button`
//   width: 1em;
//   grid-area: toggle;
//   height: 2em;
//   position: relative;
//   z-index: 2;
//   flex-shrink: 0;
//   display: flex;
//   background: none;
//   border: none;
//   transition: color 0.05s ease;
//   align-items: center;
//   justify-content: center;
//   cursor: pointer;
//   color: inherit;
//   padding: 0;
//   -webkit-appearance: none;
//   color: var(--body-text-color---opacity-low);

//   &:focus {
//     outline: none;
//   }

//   &:hover {
//     color: var(--body-text-color---opacity-med);
//   }

//   &:before {
//     content: '';
//     inset: 0.25rem -0.125rem;
//     z-index: -1;
//     position: absolute;
//     transition: opacity 0.1s ease;
//     border-radius: 0.25rem;
//     opacity: 0;
//     background: var(--background-plus-2);
//     box-shadow: var(--depth-shadow-8);
//   }

//   &:hover:before,
//   &:focus-visible:before {
//     opacity: 1;
//   }

//   svg {
//     transform: rotate(90deg);
//     vector-effect: non-scaling-stroke;
//     transition: transform 0.1s ease-in-out;
//   }

//   &.closed {
//     svg {
//       transform: rotate(0deg);
//     }
//   }

//   &:empty {
//     pointer-events: none;
//   }
// `

// const FocusRing = styled.div`
//   position: absolute;
//   inset: 0.25rem -0.125rem;
//   border: 2px solid var(--link-color);
//   border-radius: 0.25rem;
// `
const FocusRing = () => {
  return (
    <div className="absolute inset-y-1 -inset-x-[0.125rem] border-2 border-[#0075E1] rounded"></div>
  )
}

interface ToggleProps extends React.HTMLAttributes<HTMLButtonElement> {
  isOpen: boolean
}

/**
 * Button to toggle the visibility of a block's child blocks.
 */
export const Toggle = React.forwardRef<HTMLButtonElement, ToggleProps>(
  (props: ToggleProps, ref) => {
    const { isFocusVisible, focusProps } = useFocusRing()
    const { isOpen } = props

    return (
      <button
        className='
        [grid-area:toggle] 
        flex-shrink-0 
        relative z-[2]
        flex items-center justify-center 
        w-[1em] h-[2em] 
        bg-none 
        border-none 
        p-0 
        appearance-none 
        transition-[color_.05s_ease] 
        text-[#AAA]/25
        cursor-pointer 
        focus:outline-none 
        hover:text-[#AAA]/50 
        before:content-[""] 
        before:absolute before:z-[-1]
        before:-inset-x-[0.125rem] before:inset-y-1 
        before:rounded 
        before:opacity-0 
        before:transition-[opacity_.1s_ease] 
        before:bg-[#333] 
        before:shadow-[0_4px_8px_rgba(0,0,0,0.2)]
        before:hover:opacity-100 
        before:focus-visible:opacity-100 
        empty:pointer-events-none'
        ref={ref}
        {...mergeProps(focusProps, props)}
      >
        <svg
          className={`rotate-90 [vector-effect:non-scaling-stroke] transition-[transform_.1s_ease-in-out] ${
            isOpen ? '' : 'rotate-0'
          }`}
          width="24"
          height="24"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M10 6L16 11.5L10 17"
            fill="none"
            stroke="currentColor"
            strokeWidth={3}
            strokeLinecap="round"
          />
        </svg>
        {isFocusVisible && <FocusRing />}
      </button>
    )
  },
)
