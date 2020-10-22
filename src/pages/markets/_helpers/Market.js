import React from 'react'
import { Link } from 'react-router-dom'
import { connect } from 'react-redux'
import { formatMoney, formatNumber, getDeltaColor } from '../../../common'
import { Sparklines, SparklinesLine } from 'react-sparklines'
import millify from 'millify'

const Market = ({ item, displayCurrency }) => {
  const assetCurrency = item
  const price = formatMoney(item.market.price || 0, { symbol: 'USD', fiat: true })
  const marketCap = '$' + millify(parseInt(item.market.market_cap || 0), 2)
  const volume = '$' + millify(parseInt(item.market.volume || 0), 2)
  const display1dDelta = formatNumber(item.market.change1d || 0, { maxFraction: 2 }) + '%'
  const sparkColor = getDeltaColor(item.market.change1d || 0)
  const sparkline = item.market.sparkline.length > 1 ? item.market.sparkline : [0, 0]

  return (
    <div className="row well">
      <div className="col-1 text-center">{item.market.rank}</div>
      <div className="col-3 col-md-2">
        <div className="media align-items-center">
          <img className="asset-icon" src={assetCurrency.icon} alt={assetCurrency.name} />
          <div className="media-body">
            <Link to={`/markets/${assetCurrency.id}`}>{assetCurrency.symbol}</Link>
            <div className="text-muted small pt-1 overflow-ellipsis">{assetCurrency.name}</div>
          </div>
        </div>
      </div>
      <div className="col d-none d-md-block text-center">
        <div>{marketCap}</div>
      </div>
      <div className="col text-center">
        <div>{price}</div>
      </div>
      <div className="col text-center">
        <div>{volume}</div>
      </div>
      <div className="col text-center">
        <div style={{ color: sparkColor }}>{display1dDelta}</div>
      </div>
      <div className="col-2 text-right">
        <Sparklines data={sparkline}>
          <SparklinesLine color={sparkColor} />
        </Sparklines>
      </div>
    </div>
  )
}

function mapStateToProps({ session }) {
  return { displayCurrency: session.base_currency }
}

export default connect(mapStateToProps)(Market)
