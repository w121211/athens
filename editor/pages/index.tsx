import Script from 'next/script'
import { useState } from 'react'
import { memo } from 'react'
import { useEffect } from 'react'
import { KeyboardEvent, ReactNode } from 'react'
import { debounceTime, fromEvent, of, Subject, tap, throttle, throttleTime } from 'rxjs'
import { NodePageEl } from '../src/components/node-page'

// document.addEventListener('mousedown', unfocus)
// window.addEventListener('keydown', multiBlockSelection)
// window.addEventListener('keydown', keyDown)
// window.addEventListener('copy', copy)
// window.addEventListener('cut', cut)

if (typeof window !== 'undefined') {
  const dispatcher$ = new Subject<() => void>()
  const throttleDispatcher$ = dispatcher$.pipe(
    throttleTime(3000),
    // debounceTime(3000),
    tap(fn => {
      fn()
    }),
  )

  const keydown$ = fromEvent<KeyboardEvent>(window, 'keydown').pipe(
    tap(() => {
      console.log('ping')
      dispatcher$.next(() => {
        console.log('pong!!!')
      })
    }),
  )

  // throttleDispatcher$.subscribe()
  // keydown$.subscribe()
  // keydown$.subscribe(x => console.log(x))
}

const DummyUser = ({ user }: { user: string }): JSX.Element => {
  useEffect(() => {
    console.info('render <DummyUser />' + user)
  })
  return <h3>{user}</h3>
}

const DummyWelcome = ({ welcome }: { welcome: string }): JSX.Element => {
  useEffect(() => {
    console.info('render <DummyWelcome />' + welcome)
  })
  return <h1>{welcome}</h1>
}

const MemoDummyWelcome = memo(DummyWelcome)

const RenderHook = (): JSX.Element => {
  const [welcome, setWelcome] = useState('hello')
  const [user, setUser] = useState('abc')

  return (
    <div>
      <DummyWelcome welcome={welcome} />
      <MemoDummyWelcome welcome={welcome + '-memo'} />

      <DummyUser user={user} />

      <button
        onClick={() => {
          setWelcome(welcome + '!')
        }}
      >
        reset welcome
      </button>

      <button
        onClick={() => {
          setUser(user + '#')
        }}
      >
        reset user
      </button>
    </div>
  )
}

export const Home = (): JSX.Element => {
  return (
    <>
      <Script src="./textarea.js" strategy="beforeInteractive" />
      {/* <NodePageEl ident={'haha'} /> */}

      <RenderHook />
    </>
  )
}

export default Home
