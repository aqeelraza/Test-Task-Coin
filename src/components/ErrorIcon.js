import React from 'react'
import Tooltip from '../components/Tooltip'

const ErrorIcon = ({ text, size }) => (
  <Tooltip content={text} tag="span">
    <i
      className="fa fa-exclamation-circle ml-2"
      style={{
        opacity: '0.5',
        fontSize: size ? size : undefined,
        color: 'red',
      }}
    />
  </Tooltip>
)

export default ErrorIcon
