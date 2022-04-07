import React from 'react'
import styled from 'styled-components'
import {
  Today,
  MoreHoriz,
  Delete,
  Bookmark,
  BubbleChart,
} from '@material-ui/icons'
import PopperUnstyled from '@mui/base/PopperUnstyled'
import ModalUnstyled from '@mui/base/ModalUnstyled'

// import { mockPeople } from '@/Avatar/mockData'
// import { DOMRoot } from '@/utils/config'
// import { Button } from '@/Button'
// import { Overlay } from '@/Overlay'
// import { Menu } from '@/Menu'
// import { Block } from '@/concept/Block'
// import { EmptyMessage } from './components/EmptyMessage'
// import { References, ReferencesProps } from './components/References'
// import { usePresenceProvider } from '@/concept/Block/hooks/usePresenceProvider'

import { BlockEl } from '../block/block-el'
import { DocPlaceholder } from './doc-placeholder'
import { DOMRoot } from '../utils'
import { BlockListContainer } from '../block/block-list'
import { blockRepo, getBlock } from '../../stores/block.repository'
import { Doc } from '../../interfaces'
import { MouseEvent } from 'react'
import { useObservable } from '@ngneat/react-rxjs'
import { docRemove, docSave } from '../../events'
import { ReactNode } from 'react'

// const PageWrap = styled.article`
//   padding: 1rem;
//   flex-basis: 100%;
//   align-self: stretch;
//   width: 100%;
//   max-width: 60em;
//   margin-left: auto;
//   margin-right: auto;
// `
const PageWrap = ({ children }: { children: ReactNode }) => {
  return (
    <article
      className="
    basis-full 
    self-stretch 
    w-full max-w-[60em] 
    mx-auto 
    p-4"
    >
      {children}
    </article>
  )
}

const PageHeader = styled.header`
  position: relative;
  padding: 0 3rem;
`

const Title = styled.h1`
  font-size: 2.5rem;
  position: relative;
  overflow: visible;
  flex-grow: 1;
  margin: 0.1em 0;
  white-space: pre-line;
  word-break: break-word;
  line-height: 1.1em;

  textarea {
    padding: 0;
    margin: 0;
    width: 100%;
    min-height: 100%;
    font-weight: inherit;
    letter-spacing: inherit;
    font-size: inherit;
    appearance: none;
    cursor: text;
    resize: none;
    transform: translate3d(0, 0, 0);
    color: inherit;
    caret-color: var(--link-color);
    background: transparent;
    line-height: inherit;
    border: 0;
    font-family: inherit;
    visibility: hidden;
    position: absolute;

    &::webkit-scrollbar {
      display: none;
    }

    &:focus,
    &.is-editing {
      outline: none;
      visibility: visible;
      position: relative;
    }

    abbr {
      z-index: 4;
    }

    &.is-editing + span {
      visibility: hidden;
      position: absolute;
    }
  }
`

// const PageMenuToggle = styled.button`
//   float: left;
//   border-radius: 1000px;
//   margin-left: -2.5rem;
//   margin-top: 0.5rem;
//   width: 2rem;
//   height: 2rem;
//   color: var(--body-text-color---opacity-high);
//   vertical-align: bottom;
// `

const PageMenuToggle = ({
  onClick,
  children,
}: {
  onClick: (e: MouseEvent<HTMLButtonElement>) => void
  children: ReactNode
}) => {
  return (
    <button
      className="
      float-left 
      w-8 h-8 
      rounded-full 
      -ml-10 mt-2 
      align-bottom 
      text-[#AAA]/75"
      onClick={onClick}
    >
      {children}
    </button>
  )
}

const BlocksContainer = styled(BlockListContainer)`
  padding-left: 1rem;
  padding-right: 1rem;
  display: flex;
  flex-direction: column;
`

interface DocProps {
  // assume to be block-els, if given, use it and ignore doc-block's children
  children?: React.ReactNode

  // /**
  //  * Whether the page is a Daily Note
  //  */
  // isDailyNote: boolean
  // /**
  //  * Whether the page has a corresponding shortcut
  //  */
  // hasShortcut?: boolean
  // /**
  //  * The title of the page
  //  */
  // title: React.ReactNode
  // /**
  //  * Whether the page can be edited
  //  */
  isEditable?: boolean
  // /**
  //  * The unique identifier of the page
  //  */
  // uid: string
  // handlePressRemoveShortcut(): void
  // handlePressAddShortcut(): void
  // handlePressShowLocalGraph(): void
  // handlePressDelete(): void

  doc: Doc
}

export const DocEl = ({
  // isDailyNote,
  // hasShortcut,
  // children,
  // title,
  // uid,
  // isLinkedReferencesOpen,
  // isUnlinkedReferencesOpen,
  // handlePressLinkedReferencesToggle,
  // handlePressUnlinkedReferencesToggle,
  // handlePressRemoveShortcut,
  // handlePressAddShortcut,
  // handlePressShowLocalGraph,
  // handlePressDelete,
  isEditable = true,
  children,
  doc,
}: DocProps): JSX.Element | null => {
  const [isPageMenuOpen, setIsPageMenuOpen] = React.useState(false)
  const [pageMenuAnchor, setPageMenuAnchor] =
    React.useState<HTMLButtonElement | null>(null)
  // const { PresenceProvider, clearPresence } = usePresenceProvider({
  //   presentPeople: mockPresence,
  // })
  const handlePressMenuToggle = (e: MouseEvent<HTMLButtonElement>) => {
    setPageMenuAnchor(e.currentTarget)
    setIsPageMenuOpen(true)
  }
  const handleClosePageMenu = () => {
    setPageMenuAnchor(null)
    setIsPageMenuOpen(false)
  }

  // const { title } = doc,
  //   block = getBlock(doc.blockUid)

  const [docBlock] = useObservable(blockRepo.getBlock$(doc.blockUid))

  if (docBlock === undefined) {
    return null
  }

  return (
    <PageWrap>
      <PageMenuToggle
        // shape="round"
        // isPressed={isPageMenuOpen}
        onClick={handlePressMenuToggle}
      >
        <MoreHoriz />
      </PageMenuToggle>
      <PopperUnstyled
        open={isPageMenuOpen}
        anchorEl={pageMenuAnchor}
        disablePortal={true}
        placement="bottom-start"
      >
        <button>hello</button>
        <button>world</button>
      </PopperUnstyled>

      {/* <PageHeader>
        <Title>
          <PageMenuToggle
            // shape="round"
            // isPressed={isPageMenuOpen}
            onClick={handlePressMenuToggle}
          >
            <MoreHoriz />
          </PageMenuToggle>
          <Modal
            onClose={handleClosePageMenu}
            BackdropProps={{ invisible: true }}
            container={DOMRoot}
            open={isPageMenuOpen}
          >
            <Popper
              open={isPageMenuOpen}
              anchorEl={pageMenuAnchor}
              disablePortal={true}
              placement="bottom-start"
            >
              <Overlay className="animate-in">
                <Menu>
                  {hasShortcut ? (
                    <Button onClick={handlePressRemoveShortcut}>
                      <Bookmark /> <span>Remove Shortcut</span>
                    </Button>
                  ) : (
                    <Button onClick={handlePressAddShortcut}>
                      <Bookmark /> <span>Add Shortcut</span>
                    </Button>
                  )}
                  <Button onClick={handlePressShowLocalGraph}>
                    <BubbleChart /> <span>Show Local Graph</span>
                  </Button>
                  <Menu.Separator />
                  <Button onClick={handlePressDelete}>
                    <Delete /> <span>Delete Page</span>
                  </Button>
                </Menu>
              </Overlay>
            </Popper>
          </Modal>
          {title} {isDailyNote && <Today />}
          {title}
        </Title>
      </PageHeader> */}

      {/* {children ? (
        children
      ) : isEditable ? (
        <BlocksContainer>
          {block.childrenUids.map((e) => (
            <BlockEl key={e} uid={e} isEditable={isEditable} />
          ))}
        </BlocksContainer>
      ) : (
        <DocPlaceholder />
      )} */}

      <button
        onClick={() => {
          docSave(doc)
        }}
      >
        Save
      </button>

      <button
        onClick={() => {
          docRemove(doc)
        }}
      >
        Remove
      </button>

      {children ? (
        children
      ) : docBlock.childrenUids.length > 0 ? (
        // <BlocksContainer>
        <div>
          {docBlock.childrenUids.map((e) => (
            <BlockEl key={e} uid={e} isEditable={isEditable} />
          ))}
        </div>
      ) : (
        <DocPlaceholder />
      )}
    </PageWrap>
  )
}
