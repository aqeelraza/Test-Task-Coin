import React from 'react'
import { Sparklines, SparklinesLine } from 'react-sparklines'
import { Colors, math, formatMoney } from '../../../common'
import { ListGroup, ListGroupItem } from 'reactstrap'
import { withRouter } from 'react-router-dom'
import ReactMinimalPieChart from 'react-minimal-pie-chart'
import { canShowGains } from '../../../common'
import Highcharts from 'highcharts'
import * as cryptoColors from '../../../common/cryptoColors'

function hashCode(str) {
  // java String#hashCode
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash)
  }
  return hash
}

function intToRGB(i) {
  let c = (i & 0x00ffffff).toString(16).toUpperCase()

  return '#' + '00000'.substring(0, 6 - c.length) + c
}

function SubItem({ title, amount, currency }) {
  if (math.zero(amount)) {
    return null
  }

  return (
    <ListGroupItem className="border-0" action>
      <div className="d-flex">
        <div className="my-auto mr-auto">
          <h5 style={{ fontSize: '1rem' }} className="mb-0">
            {title}
          </h5>
        </div>
        <div className="my-auto ml-3 text-right" style={{ fontSize: '1rem' }}>
          {formatMoney(math.decimal(amount, 0), currency, { minimumFractionDigits: 0 })}
        </div>
      </div>
    </ListGroupItem>
  )
}

class SideStats extends React.Component {
  TIPS = [
    'Invite your friends to get early access to new features.',
    'Koinly automatically matches your deposits & withdrawals if you set a transaction hash.',
    'Koinly has created hundreds of tax reports for people from USA, Canada, Sweden, Germany and other countries.',
    'Reduce your taxable gains by selling loss-making assets at the end of the year and buying them back right after.',
  ]

  state = {
    randomTipIdx: Math.floor(Math.random() * this.TIPS.length),
  }

  componentDidUpdate(prevProps) {
    if (this.props.assets && this.props.assets !== prevProps.assets) {
      this.configureChart(this.props.assets)
    }
  }

  configureChart(assets) {
    let sortedAssets = assets.sort((a, b) => (a.percent > b.percent ? -1 : 1))
    let minor = assets.filter(asset => asset.percent < 2)
    let chartAssets = sortedAssets
      .filter(asset => asset.percent >= 2)
      .map(asset => {
        return {
          symbol: asset.currency.symbol,
          percent: asset.percent,
        }
      })

    if (minor.length > 0) {
      let percent = minor.reduce((sum, x) => sum + x.percent, 0)
      if (percent > 1) {
        chartAssets.push({ symbol: 'Other', percent })
      }
    }

    return Highcharts.chart('percentchart', {
      chart: {
        type: 'pie',
        height: '100%',
        backgroundColor: 'transparent',
      },
      plotOptions: {
        pie: {
          borderWidth: 5,
          borderColor: '#fafafa',
        },
      },
      title: {
        text: '',
      },
      legend: {
        enabled: false,
      },
      credits: {
        enabled: false,
      },
      tooltip: {
        useHTML: true,
        headerFormat: '',
        pointFormat: '<b>{point.name}:</b> {point.y} %',
      },
      series: [
        {
          minPointSize: 5,
          innerSize: '75%',
          zMin: 0,
          name: 'Portfolio',
          data: chartAssets.map(asset => {
            return {
              name: asset.symbol,
              y: math.decimal(asset.percent, 0),
              color: cryptoColors[asset.symbol] || intToRGB(hashCode(asset.symbol)),
            }
          }),
        },
      ],
    })
  }

  renderFiatPct(assets) {
    let totalValue = assets.reduce((sum, asset) => sum + asset.total_value, 0)
    let fiatValue = assets.filter(asset => asset.currency.fiat).reduce((sum, asset) => sum + asset.total_value, 0)
    if (totalValue === 0) totalValue = 0.1 // otherwise reactminimalpiechart raises NaN errors...
    return (
      <div className="border rounded mb-3 whitebg d-flex justify-content-between">
        <div className="pl-3 pt-2 mt-1 pb-1">
          <div className="text-muted pb-2 small text-uppercase">Fiat on exchanges</div>
          <h3>{formatMoney(fiatValue, this.props.currency, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</h3>
        </div>
        <ReactMinimalPieChart
          data={[
            {
              value: totalValue - fiatValue,
              color: '#e8e8e8',
            },
            {
              value: fiatValue,
              color: Colors.blue,
            },
          ]}
          totalValue={totalValue}
          lineWidth={20}
          label={data => data.data[1].percentage > 0 && math.decimal(data.data[1].percentage, 0) + '%'}
          labelStyle={{ fontSize: '1.2em' }}
          labelPosition={0}
          style={{ width: '65px', marginRight: '20px' }}
        />
      </div>
    )
  }

  render() {
    let { stats, assets } = this.props
    return (
      <>
        <h5 className="text-right pointer pt-3" onClick={() => this.props.history.push(`/transactions?from=${this.props.from}`)}>
          {stats.txns_in_period} <small className="text-muted">transactions</small>
        </h5>
        <div className="py-3">
          <Sparklines data={stats.txn_sparkline.length > 0 ? stats.txn_sparkline : [0, 0]}>
            <SparklinesLine size={4} color={Colors.grey} style={{ fill: 'none' }} />
          </Sparklines>
        </div>
        {stats.txns_in_period > 0 && (
          <ListGroup className="border rounded mb-3">
            <ListGroupItem className="border-0" style={{ backgroundColor: 'white' }}>
              <div className="d-flex">
                <div className="my-auto mr-auto">
                  <div className="mb-0 small text-muted text-uppercase">Breakdown</div>
                </div>
              </div>
            </ListGroupItem>
            <SubItem title="Received" amount={stats.amount_received} currency={this.props.currency} />
            <SubItem title="Sent" amount={stats.amount_sent} currency={this.props.currency} />
            <SubItem title="Income" amount={stats.income} currency={this.props.currency} />
            <SubItem title="Fees & costs" amount={stats.costs} currency={this.props.currency} />
            {canShowGains(this.props.session) && <SubItem title="Realized Gains" amount={stats.gains} currency={this.props.currency} />}
          </ListGroup>
        )}
        {assets && this.renderFiatPct(assets)}
        <div id={'percentchart'} className="rounded mb-3 px-3 pt-2 pb-1 text-muted small">
          Tip: {this.TIPS[this.state.randomTipIdx]}
        </div>
      </>
    )
  }
}

export default withRouter(SideStats)
