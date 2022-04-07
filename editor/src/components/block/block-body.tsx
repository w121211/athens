import React, { ReactNode } from 'react'
import styled from 'styled-components'

const _BlockBody = styled.div`
  display: grid;
  grid-template-areas:
    'above above above above'
    'toggle bullet content refs'
    'below below below below';
  grid-template-columns: 1em 1em 1fr auto;
  grid-template-rows: 0 1fr 0;
  border-radius: 0.5rem;
  position: relative;
`

interface BlockBodyProps {
  children: ReactNode
  onMouseEnter: () => void
  onMouseLeave: () => void
}

export const BlockBody = ({
  children,
  onMouseEnter,
  onMouseLeave,
}: BlockBodyProps) => {
  return (
    <div
      className='
      relative 
      grid [grid-template-areas:"above_above_above_above"_"toggle_bullet_content_refs"_"below_below_below_below"] 
      grid-cols-[1em_1em_1fr_auto] 
      grid-rows-[0_1fr_0] 
      rounded-lg'
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      {children}
    </div>
  )
}
