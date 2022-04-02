import { useEffect } from 'react'
import { useObservable } from '@ngneat/react-rxjs'
import { editorRepo } from '../../stores/editor.repository'
import { DocEl } from '../doc/doc-el'
import { editorRouteChange } from '../../events'

type EditorElProps = {
  route: {
    symbol: string
    modal?: {
      symbol?: string
      discussId?: string
      discussTitle?: string
    }
  }
}

export const EditorEl = ({ route }: EditorElProps): JSX.Element | null => {
  const [mainDoc] = useObservable(editorRepo.mainDoc$)

  useEffect(() => {
    console.log(route)
    // editorRouteChange(route.symbol)
  }, [route])

  if (mainDoc === undefined) {
    return null // wait until doc is loaded
  }

  return <DocEl doc={mainDoc} />

  // return <>{mainDoc ? <DocEl doc={mainDoc} /> : <DocEl doc={mainDoc} />}</>
}
