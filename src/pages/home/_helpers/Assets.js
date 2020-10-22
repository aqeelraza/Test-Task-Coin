import React, { Component, Fragment } from 'react'
import connect from 'react-redux/es/connect/connect'
import { formatMoney, getDelta, getDeltaColor, math } from '../../../common'
import PageLoader from '../../../components/PageLoader'
import Tooltip from '../../../components/Tooltip'
import ReactTable from 'react-table'
import 'react-table/react-table.css'
import NiceDecimal from '../../../components/NiceDecimal'
import NicePercent from '../../../components/NicePercent'
import { Sparklines, SparklinesLine, SparklinesSpots } from 'react-sparklines'

class Assets extends Component {
  state = {
    showZeroValue: false,
    assets: null,
  }

  updateAssets(assets) {
    let totalValue = 0
    let base = this.props.session.base_currency

    // find total value
    for (let i = 0; i < assets.length; i += 1) {
      const asset = assets[i]

      // live data is in usd so we convert it to users base currency
      asset.total_amount = math.decimal(asset.total_amount)
      asset.total_reported_amount = math.decimal(asset.total_reported_amount)
      asset.current_price = math.div(asset.currency.usd_rate, base.usd_rate)
      asset.total_value = math.decimal(math.mul(asset.total_reported_amount, asset.current_price), 2)
      asset.change1d = asset.currency.market ? asset.currency.market.change1d : 0
      asset.invested_amount = math.decimal(asset.invested_amount, 2)
      asset.roiAmount = asset.total_value - asset.invested_amount
      asset.averageCost =
        asset.invested_amount > 0 && asset.total_reported_amount > 0 && math.div(asset.invested_amount, asset.total_reported_amount)
      if (math.zero(asset.invested_amount)) asset.roiAmount = 0
      if (math.pos(asset.total_value)) totalValue += asset.total_value
    }

    for (let i = 0; i < assets.length; i += 1) {
      const asset = assets[i]
      if (math.pos(asset.total_value) && totalValue) {
        asset.percent = math.div(asset.total_value, totalValue) * 100
      } else {
        asset.percent = 0
      }
    }

    return assets
  }

  filterAssets(assets) {
    return assets.filter(asset => math.decimal(asset.total_value, 0) > 0)
  }

  renderTable(assets) {
    let base = this.props.session.base_currency
    return (
      <ReactTable
        data={assets}
        columns={[
          {
            id: 'asset',
            Header: 'Asset',
            headerClassName: 'text-left',
            accessor: 'currency.symbol',
            Cell: ({ original }) => (
              <Fragment>
                <img className="asset-icon" src={original.currency.icon} alt={original.currency.name} />
                <Tooltip content={original.currency.name} tag="span">
                  <span>{original.currency.symbol}</span>
                </Tooltip>
              </Fragment>
            ),
          },
          {
            id: 'balance',
            Header: 'Balance',
            headerClassName: 'text-right',
            className: 'text-right',
            accessor: item => math.decimal(item.total_reported_amount),
            Cell: ({ original }) => (
              <NiceDecimal
                number={original.total_reported_amount}
                decimals={4}
                info={formatMoney(original.total_reported_amount, original.currency)}
              />
            ),
          },
          {
            id: 'cost',
            Header: `Cost (${base.symbol})`,
            headerClassName: 'text-right',
            className: 'text-right',
            accessor: item => math.decimal(item.invested_amount),
            Cell: ({ original }) => (
              <div>
                <NiceDecimal number={original.invested_amount} decimals={0} />
                <Tooltip content={`Average cost per ${original.currency.symbol}`} tag="span">
                  <div className="small text-muted">
                    {formatMoney(original.averageCost, base)} <span className="small">/ unit</span>
                  </div>
                </Tooltip>
              </div>
            ),
          },
          {
            id: 'value',
            Header: `Market Value`,
            headerClassName: 'text-right',
            className: 'text-right',
            accessor: item => math.decimal(item.total_value),
            Cell: ({ original }) => (
              <div>
                <NiceDecimal number={original.total_value} decimals={0} />
                <div className="small text-muted">
                  {formatMoney(original.current_price, base)} <span className="small">/ unit</span>
                </div>
              </div>
            ),
          },
          {
            id: 'roi',
            Header: 'ROI',
            headerClassName: 'text-left',
            accessor: item => math.decimal(item.roiAmount),
            Cell: ({ original }) => (
              <NicePercent
                number={getDelta(original.total_value, original.total_value === 0 ? 0 : original.invested_amount)}
                format={'0a'}
                info={formatMoney(original.roiAmount, base)}
              />
            ),
          },
          {
            id: 'change',
            Header: '24h',
            headerClassName: 'text-right',
            className: 'text-right',
            accessor: item => math.decimal(item.currency.market.change1d),
            Cell: ({ original }) => (
              <Tooltip
                content={original.currency.market.change1d ? original.currency.market.change1d.toString() + ' %' : 'No change'}
                tag="span"
              >
                <Sparklines
                  data={original.currency.market.sparkline.length > 1 ? original.currency.market.sparkline : [0, 0]}
                  width={100}
                  height={20}
                >
                  <SparklinesLine color={getDeltaColor(original.currency.market.change1d || 0)} />
                  <SparklinesSpots />
                </Sparklines>
              </Tooltip>
            ),
          },
        ]}
        defaultSorted={[{ id: 'value', desc: true }]}
        className="-highlight assets-table"
        showPagination={false}
        resizable={false}
        pageSize={assets.length}
        getTheadTrProps={() => {
          return { className: 'text-muted small px-2' }
        }}
        getTrProps={() => {
          return { className: 'px-2 py-1 d-flex align-items-center' }
        }}
      />
    )
  }

  onAssetsLoaded = data => {
    let assets = this.updateAssets(data.assets)
    this.setState({ assets })
    this.props.onAssetsLoaded(assets)
  }

  render() {
    let { assets } = this.state
    if (!assets) {
      return <PageLoader url="/api/assets?per_page=200" onLoad={this.onAssetsLoaded} />
    }

    if (!this.state.showZeroValue) assets = this.filterAssets(this.state.assets)
    let hiddenCount = this.state.assets.length - assets.length

    return (
      <div className="border rounded whitebg p-0 p-2">
        <div className="d-flex justify-content-between px-3 py-1 pb-2">
          <div className="text-muted">
            <i className="fas fa-university pr-2" />
            Holdings
          </div>
        </div>
        {assets.length === 0 && (
          <div className="mx-auto" style={{ textAlign: 'center' }}>
            <div className="text-muted pb-3">You don't have any holdings yet!</div>
          </div>
        )}
        {assets.length > 0 && this.renderTable(assets)}
        {hiddenCount > 0 && (
          <div className="pointer text-muted small px-3 pt-2" onClick={e => this.setState({ showZeroValue: true })}>
            {hiddenCount} assets hidden
          </div>
        )}
      </div>
    )
  }
}

function mapStateToProps({ session }) {
  return { session }
}

export default connect(mapStateToProps)(Assets)
