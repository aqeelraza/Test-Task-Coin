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
import classNames from "classnames";
import './test.css'
import {
  Accordion,
  AccordionItem,
  AccordionItemHeading,
  AccordionItemButton,
  AccordionItemPanel,
} from 'react-accessible-accordion';

// Demo styles, see 'Styles' section below for some notes on use.
import 'react-accessible-accordion/dist/fancy-example.css';
import axios from "axios";

import Progress from 'react-progressbar';



class TestTask extends Component {
  state = {
    showZeroValue: false,
    assets: null,
    response: null
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


  getWalletData = async (id) => {
   await axios
        .get(`https://koinly-staging.herokuapp.com/api/accounts?q=${id}`)
        .then(res => {
          console.log(res.data)
          this.setState({
            loading: false,
            response: res.data,
            error: null,
          },function () {
              console.log(this.state.response)
          })
          if (this.props.onLoad) {
            this.props.onLoad(res.data)
          }
        })
        .catch(error => {
          console.log(error)
          this.setState({
            loading: false,
            response: null,
            error,
          })
        })
  }

  render() {
    let { assets } = this.state
    if (!assets) {
      return <PageLoader url="/api/assets?per_page=200" onLoad={this.onAssetsLoaded} />
    }

    if (!this.state.showZeroValue) assets = this.filterAssets(this.state.assets)
    let hiddenCount = this.state.assets.length - assets.length

    return (
        <section className="bg-light">
          <div className="container">
            <div className="border rounded whitebg p-4 mt-4">
              <div className="row">
                <div className="col">
                  <h3 className="m-0 font-weight-bold">Your assets</h3>
                </div>
                <div className="col-auto">
                  <select className="form-control">
                    <option>By Value</option>
                  </select>
                </div>
              </div>

              <div className="row my-3 align-items-center">
                <div className="col-md-3">
                  <h6 className="m-0 text-muted font-weight-bold">Coin</h6>
                </div>
                <div className="col-md-3">
                  <h6 className="m-0 text-muted font-weight-bold">Balance</h6>
                </div>
                <div className="col-md-3">
                  <h6 className="m-0 text-muted font-weight-bold">Market Value</h6>
                </div>
                <div className="col-md-3">
                  <div className="d-flex align-items-center" dir="rtl">
                    <ul className="" dir="ltr">
                      <li className="text-muted active font-weight-bold">All</li>
                      <li className=" text-muted font-weight-bold">24H</li>
                      <li className=" text-muted font-weight-bold">7D</li>
                    </ul>
                    <h6 className="m-0 mr-2 text-muted font-weight-bold">ROI</h6>
                  </div>
                </div>
              </div>

              <Accordion allowZeroExpanded>
                {assets.length > 0 && assets.map((item,index) => (
                    <AccordionItem>
                      <AccordionItemHeading>
                        <AccordionItemButton>
                          <div className="accordion-header" onClick={()=> this.getWalletData(item.currency.id)}>
                            <div className="row align-items-center mb-4 mt-3">
                              <div className="col-md-3">
                                <div className="d-flex align-items-center">
                                  <div className={"currency-logo"}><img src={item.currency.icon} alt="" className=""/></div>
                                  <h5 className="m-0">{item.currency.symbol}</h5>
                                </div>
                              </div>
                              <div className="col-md-3">
                                <h5 className="m-0">{item.total_amount}</h5>
                              </div>
                              <div className="col-md-3">
                                <h5 className="m-0">${item.currency.market.price}</h5>
                                <p className="m-0 text-muted">$12,809 <span className="font-weight-normal">/ Unit</span></p>
                              </div>
                              <div className="col-md-3 text-right">
                                <h5 className={index%2 == 0 ? 'm-0 text-success' : 'm-0 text-danger' }>{item.currency.market.change1d}</h5>
                                <span className={index%2 == 0 ? 'badge badge-success' : 'badge badge-danger' }>35.14%</span>
                              </div>
                            </div>
                            <Progress color={index%2 == 0 ? 'purple' : 'orange'} height={3} completed={index%2 == 0 ? 75 : 35} />
                          </div>
                        </AccordionItemButton>
                      </AccordionItemHeading>
                      <AccordionItemPanel>
                        <div className="accordion-body">
                          {!this.state.response &&
                          <div className="text-center">
                            <div className="spinner-border text-dark" role="status">
                              <span className="sr-only">Loading...</span>
                            </div>
                          </div>
                          }
                          {this.state.response &&
                          <div>
                            <div className="row align-items-center">
                              <div className="col-md-3">
                                <h1 className="m-0 text-muted">#{item.currency.market.rank}</h1>
                              </div>
                              <div className="col-md-3">
                                <p className="m-0 text-muted">Price</p>
                                <h5 className="m-0">${item.currency.market.price}</h5>
                              </div>
                              <div className="col-md-3">
                                <p className="m-0 text-muted">24h Volume</p>
                                <h5 className="m-0">${item.currency.market.change1d} <span
                                    className="text-danger">-14%</span></h5>
                              </div>
                              <div className="col-md-3">
                                <Sparklines
                                    data={item.currency.market.sparkline.length > 1 ? item.currency.market.sparkline : [0, 0]}
                                    width={100}
                                    height={20}
                                >
                                  <SparklinesLine color={getDeltaColor(item.currency.market.change1d || 0)}/>
                                  <SparklinesSpots/>
                                </Sparklines>
                              </div>
                            </div>
                            <div className="row align-items-center mt-3">
                              <div className="col-md-3">
                                <p className="m-0 text-muted">Total Cost</p>
                                <h5 className="m-0">${item.total_amount}</h5>
                              </div>
                              <div className="col-md-3">
                                <p className="m-0 text-muted">Cost / Unit</p>
                                <h5 className="m-0">${item.currency.usd_rate}</h5>
                              </div>
                              <div className="col-md-3">
                                <p className="m-0 text-muted">Market Value</p>
                                <h5 className="m-0">${item.currency.market.price}</h5>
                              </div>
                              <div className="col-md-3">
                                <p className="m-0 text-muted">Gains</p>
                                <h5 className="m-0">${item.currency.market.change1d}</h5>
                              </div>
                            </div>
                            <div className="progress mt-4">
                              <div className="progress-bar" role="progressbar" style={{width: "15%"}} aria-valuenow="15"
                                   aria-valuemin="0" aria-valuemax="100"></div>
                              <div className="progress-bar bg-success" role="progressbar" style={{width: "15%"}}
                                   aria-valuenow="30" aria-valuemin="0" aria-valuemax="100"></div>
                              <div className="progress-bar bg-info" role="progressbar" style={{width: "15%"}}
                                   aria-valuenow="20" aria-valuemin="0" aria-valuemax="100"></div>
                            </div>

                            <div className="row align-items-center mt-4">
                              <div className="col-md-5">
                                <p className="m-0 text-muted">Wallet</p>
                              </div>
                              <div className="col-md-3">
                                <p className="m-0 text-muted">Balance</p>
                              </div>
                              <div className="col-md-2">
                                <p className="m-0 text-muted">Value</p>
                              </div>
                              <div className="col-md-2 text-right">
                                <p className="m-0 text-muted">Allocations</p>
                              </div>
                            </div>
                          </div>
                          }

                          <div className="wallet-wrapper container">
                            {this.state.response && this.state.response.accounts.map((item,index)=>(
                                <div className="row align-items-center mt-4">
                                  <div className="col-md-5">
                                    <div className="d-flex align-items-center">
                                      <div className={"currency-logo"}><img src={item.wallet.wallet_service.icon.small} alt="" className=""/></div>
                                      <h6 className="m-0 text-truncate">{item.wallet.name}</h6>
                                    </div>
                                  </div>
                                  <div className="col-md-3">
                                    <h6 className="m-0">${item.balance}</h6>
                                  </div>
                                  <div className="col-md-2">
                                    <h6 className="m-0">${item.fees}</h6>
                                  </div>
                                  <div className="col-md-2">
                                    <div className="d-flex align-items-center justify-content-end">
                                      <h6 className="m-0">72%</h6>
                                      <span className={index%2 == 0 ? 'color-box bg-primary' : 'color-box bg-success' } ></span>
                                    </div>
                                  </div>
                                </div>
                            ))}
                          </div>



                        </div>
                      </AccordionItemPanel>
                    </AccordionItem>
                ))
                }
              </Accordion>

              {hiddenCount > 0 && (
                  <div className="pointer text-muted small px-3 pt-2" onClick={e => this.setState({ showZeroValue: true })}>
                    {hiddenCount} assets hidden
                  </div>
              )}
            </div>
          </div>
        </section>
    )
  }
}

function mapStateToProps({ session }) {
  return { session }
}

export default connect(mapStateToProps)(TestTask)
