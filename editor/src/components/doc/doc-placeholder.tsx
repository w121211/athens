import { ReactNode } from 'react'
import styled from 'styled-components'

// const Message = styled.span`
//   color: var(--body-text-color---opacity-med);
// `

const Message = ({ children }: { children: ReactNode }) => {
  return <span className="text-[#AAA]/50">{children}</span>
}

export const DocPlaceholder = () => <Message>Doc placeholder</Message>
