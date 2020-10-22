import { Colors } from '../common'
import React from 'react'
import classnames from 'classnames'

const RoundFaIcon = ({ icon, size, color, className }) => (
  <span className={classnames('fa-img fa-stack fa-2x', className)} style={{ fontSize: size, color: color || Colors.muted }}>
    <i className="far fa-circle fa-stack-2x" />
    <i className={`fas fa-stack-1x fa-${icon}`} />
  </span>
)

export default RoundFaIcon
