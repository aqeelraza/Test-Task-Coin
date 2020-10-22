import React from 'react'
import { UncontrolledTooltip } from 'reactstrap'

export default class Tooltip extends React.Component {
  constructor(props) {
    super(props)
    this.ref = React.createRef()
  }

  render() {
    let { children, content, tag, ...others } = this.props
    const Wrapper = tag || 'div'
    return (
      <>
        <Wrapper {...others} ref={this.ref}>
          {children}
        </Wrapper>
        {content && (
          <UncontrolledTooltip delay={1} boundariesElement={'window'} placement={'bottom'} target={this.ref} innerClassName={'mytooltip'}>
            {content}
          </UncontrolledTooltip>
        )}
      </>
    )
  }
}
