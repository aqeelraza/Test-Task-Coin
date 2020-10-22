import React from 'react'
import { Label as BsLabel } from 'reactstrap'
import AtlasButton from '@atlaskit/button'
import { ButtonGroup as AtlasButtonGroup } from '@atlaskit/button'
import Panel from '@atlaskit/panel'

export function Label(props) {
  return (
    <BsLabel className="text-muted" {...props}>
      <small>{props.children}</small>
    </BsLabel>
  )
}

export function Button(props) {
  return <AtlasButton {...props} appearance={props.color} />
}

export const ButtonGroup = AtlasButtonGroup

export const MoreInfo = ({ title, children }) => (
  <div style={{ marginLeft: '24px' }}>
    <Panel header={title}>{children}</Panel>
  </div>
)
