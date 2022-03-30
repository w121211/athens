import React from 'react'
// import {rest} from 'msw'
// import {setupServer} from 'msw/node'
import { setEntities } from '@ngneat/elf-entities'
import { render, fireEvent, waitFor, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
// import '@testing-library/jest-dom'
import { BlockContainer } from '../../src/components/block/block-container'
import { blockRepo, blocksStore } from '../../src/stores/block.repository'
import { blocks } from '../helpers'
import { validateChildrenUids } from '../../src/op/helpers'
// import Fetch from '../fetch'

// const server = setupServer(
//   rest.get('/greeting', (req, res, ctx) => {
//     return res(ctx.json({greeting: 'hello there'}))
//   }),
// )

beforeEach(() => {
  blockRepo.update([setEntities(blocks)])
  validateChildrenUids(blocksStore.getValue().entities)
})

// beforeAll(() => server.listen())
// afterEach(() => server.resetHandlers())
// afterAll(() => server.close())

// test('loads and displays greeting', async () => {
//   render(<Fetch url="/greeting" />)
//   fireEvent.click(screen.getByText('Load Greeting'))
//   await waitFor(() => screen.getByRole('heading'))
//   expect(screen.getByRole('heading')).toHaveTextContent('hello there')
//   expect(screen.getByRole('button')).toBeDisabled()
// })

// test('handles server error', async () => {
//   server.use(
//     rest.get('/greeting', (req, res, ctx) => {
//       return res(ctx.status(500))
//     }),
//   )
//   render(<Fetch url="/greeting" />)
//   fireEvent.click(screen.getByText('Load Greeting'))
//   await waitFor(() => screen.getByRole('alert'))
//   expect(screen.getByRole('alert')).toHaveTextContent('Oops, failed to fetch!')
//   expect(screen.getByRole('button')).not.toBeDisabled()
// })

test('BlockContainer', async () => {
  const { container, getByText } = render(<BlockContainer uid={'a0'} />)
  // fireEvent.click(container)
  // userEvent.hover(container)
  fireEvent.mouseEnter(screen.getByText(/a0/))
  await waitFor(() => screen.getByTestId('block-content-textarea'))
  screen.debug()
})
