import { InlineItem } from '../../interfaces'
import { parse } from '../../parse-renderer'

const InlineEl = ({ inline: { type, str } }: { inline: InlineItem }) => {
  switch (type) {
    case 'inline-discuss':
      return <span style={{ color: 'red' }}>{str}</span>
    case 'inline-symbol':
      return <span color="green">{str}</span>
    case 'text':
      return <span>{str}</span>
  }
  return null
}

const InlineParseRenderer = ({ str }: { str: string }) => {
  const inlineItems = parse(str)

  return (
    <>
      {inlineItems.map((e, i) => (
        <InlineEl key={i} inline={e} />
      ))}
    </>
  )
}

export default InlineParseRenderer
