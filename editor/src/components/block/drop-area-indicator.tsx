import styled from 'styled-components'

export const DropAreaIndicatorWrap = styled.div`
  display: block;
  height: 1px;
  pointer-events: none;
  margin-bottom: -1px;
  opacity: 0.75;
  color: #0075E1;
  position: relative;
  transform-origin: left;
  z-index: 3;
  width: 100%;

  &:after {
    position: absolute;
    content: '';
    top: -0.5px;
    right: 0;
    bottom: -0.5px;
    left: calc(2em - 4px);
    border-radius: 100px;
    background: currentcolor;
  }

  &.child {
    --indent: 1.95em;
    width: calc(100% - var(--indent));
    margin-left: var(--indent)
  }
  
  &.child:after {
    border-top-left-radius: 0;
    border-bottom-left-radius: 0;
  }
  
  &.child:before {
    position: absolute;
    content: '';
    border-radius: 10em;
    border: 2px solid ;
    --size: 4px;
    width: var(--size);
    height var(--size);
    left: var(--indent);
    top: 50%;
    transform: translateY(-50%) translateX(-100%) translateX(-2px);
  }
`

export const DropAreaIndicator = ({
  child,
  style,
}: {
  child?: true
  style: React.CSSProperties
}) => {
  // const mergedStyle =
  return (
    <DropAreaIndicatorWrap
      style={style}
      className={child && 'child'}
    ></DropAreaIndicatorWrap>
  )
}
