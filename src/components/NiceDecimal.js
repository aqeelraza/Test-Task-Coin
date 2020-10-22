import Tooltip from './Tooltip'
import numeral from 'numeral'
import React from 'react'
import { formatNumber, getDeltaColor, math } from '../common'

export default ({ number, decimals, info, colored }) => {
  number = math.decimal(number, decimals)
  let abs = math.abs(number)
  let zeroes = '0'.repeat(decimals)
  let whole = Math.floor(abs)
  let dec = Math.round((abs - whole) * math.decimal('1' + zeroes))
  if (number < 0) whole = -whole // negative numbers are rounded up ex. 301.521 will become 302 so we do this hack to display the correct one
  let showMinusSign = number < 0 && whole === -0 // numbers like -0.232 show up as 0.232 as the whole number's sign gets removed - this reverts it
  return (
    <Tooltip content={info} tag="span">
      <span style={colored && { color: getDeltaColor(number) }}>
        {showMinusSign && '-'}
        {formatNumber(whole, { minFraction: 0, maxFraction: 0 })}
        {decimals > 0 && (
          <span className={colored ? 'small' : 'text-muted small'} style={colored && { color: getDeltaColor(number) }}>
            .{numeral(dec).format(zeroes)}
          </span>
        )}
      </span>
    </Tooltip>
  )
}
