import Tooltip from './Tooltip'
import numeral from 'numeral'
import React from 'react'
import { getDeltaColor, math } from '../common'

export default ({ number, format, info }) => {
  number = math.decimal(number)
  return (
    <Tooltip content={info} tag="span">
      <span style={{ color: getDeltaColor(number) }}>
        {number > 0 ? '+' : ''}
        {numeral(number).format(format)}
        <small>%</small>
      </span>
    </Tooltip>
  )
}
