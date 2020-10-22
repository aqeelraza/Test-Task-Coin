import React from 'react'
import Tooltip from '../components/Tooltip'

const WarningIcon = ({ text, size, onClick }) => (
  <Tooltip content={text} tag="span">
    <i
      className="fa fa-exclamation-circle ml-2"
      onClick={onClick}
      style={{
        opacity: '0.5',
        fontSize: size ? size : undefined,
        color: 'orange',
        cursor: onClick ? 'pointer' : 'inherit',
      }}
    />
  </Tooltip>
)

export default WarningIcon
