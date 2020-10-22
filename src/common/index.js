import React from 'react'
import formatNum from 'format-num'
import Blockies from 'react-blockies'
import _ from 'lodash'
import moment from 'moment'
import Cookies from 'universal-cookie'
import { BuilderTransactionTypes, COST_BASIS_METHODS, TransactionTypes } from '../Constants'
import * as maths from './math'

export const math = maths

export const Colors = {
  red: 'rgb(255, 99, 132)',
  orange: 'rgb(255, 159, 64)',
  yellow: 'rgb(255, 205, 86)',
  green: 'rgb(75, 192, 192)',
  blue: 'rgb(54, 162, 235)',
  purple: 'rgb(153, 102, 255)',
  grey: 'rgb(201, 203, 207)',
  // bootstrap colors
  muted: 'rgb(108, 117, 125)',
  mutedIcon: '#BDBDBD',
  warning: '#856404', // warning alert color
}

export function formatNumber(amount, opt = {}) {
  opt.minFraction = opt.minFraction || (opt.maxFraction < 4 ? opt.maxFraction : 4)
  opt.maxFraction = opt.maxFraction || 8
  return formatNum(amount || 0, opt)
}

export function formatMoney(amount, currency, opt = {}) {
  if (currency.fiat) {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.symbol,
      ...opt,
    }).format(amount || 0)
  }

  return `${formatNumber(amount, opt)} ${currency.symbol}`
}

export function getDelta(currentAmount, initialAmount) {
  currentAmount = math.decimal(currentAmount)
  initialAmount = math.decimal(initialAmount)
  if (initialAmount === 0) return '0.00%'
  if (currentAmount === 0) return '-100.00%'
  const delta = (currentAmount / initialAmount) * 100.0
  if (delta < 100) return `-${(100 - delta).toFixed(2)}%`
  if (delta == 100) return '0.00%'
  return `+${(delta - 100).toFixed(2)}%`
}

export function getDeltaColor(delta) {
  delta = math.decimal(delta)
  if (delta > 0) {
    return Colors.green
  }
  if (delta < 0) {
    return Colors.red
  }
  return Colors.grey
}

export function poll(fn, options = { delay: 0, interval: 2000, timeout: 30000 }) {
  let endTime = Number(new Date()) + options.timeout

  let checkCondition = (resolve, reject) =>
    new Promise(fn)
      .then(result => {
        if (result) {
          // If the condition is met, we're done!
          resolve(result)
        } else if (Number(new Date()) < endTime) {
          // If the condition isn't met but the timeout hasn't elapsed, go again
          setTimeout(checkCondition, options.interval, resolve, reject)
        } else {
          // Didn't match and too much time, reject!
          reject('timed out')
        }
      })
      .catch(reject)

  return new Promise((resolve, reject) => setTimeout(() => checkCondition(resolve, reject), options.delay))
}

export function displayDate(date) {
  //  moment(new Date(item.date)).format('lll')
  return moment(date)
    .parseZone()
    .format('lll')
}

// converts a local timezone into utc without changing time
export function localToUTC(date) {
  return new Date(
    Date.UTC(
      date.getFullYear(),
      date.getMonth(),
      date.getDate(),
      date.getHours(),
      date.getMinutes(),
      date.getSeconds(),
      date.getMilliseconds()
    )
  )
}

export function utcToLocal(utc) {
  return new Date(
    utc.getUTCFullYear(),
    utc.getUTCMonth(),
    utc.getUTCDate(),
    utc.getUTCHours(),
    utc.getUTCMinutes(),
    utc.getUTCSeconds(),
    utc.getUTCMilliseconds()
  )
}

export function random(min, max) {
  return parseInt(Math.random() * (max - min) + min)
}

// this works for both wallets and wallet_services
export function getWalletIcon(service, size) {
  return service && service.icon ? (
    <img
      src={service.icon[size > 30 ? 'medium' : 'small']}
      alt={service.name}
      width={size}
      height={size}
      className="identicon mr-2"
      style={{ borderRadius: '10px' }}
    />
  ) : (
    <Blockies size={size / 5} scale={5} seed={service.name} className={'mr-2 identicon'} />
  )
}

export function cleanLabel(label) {
  if (label === 'realized_gain') {
    return 'Realized P&L'
  } else if (label === 'margin_interest_fee') {
    return 'Margin Interest'
  } else if (label === 'margin_trade_fee') {
    return 'Margin Fee'
  } else if (label === 'other_income') {
    return 'Income'
  } else if (label === 'staking') {
    return 'Reward'
  }
  return _.capitalize(label.replace(/_/g, ' '))
}

export function getTxnIcon(type) {
  let icon = { icon: 'fas fa-unknown', color: '#BDBDBD' }
  switch (type) {
    case BuilderTransactionTypes.Trade:
    case TransactionTypes.Exchange:
    case TransactionTypes.Buy:
    case TransactionTypes.Sell:
      icon.icon = 'fas fa-exchange-alt'
      icon.color = '#35baf6'
      break
    case BuilderTransactionTypes.Transfer:
      icon.icon = 'fas fa-angle-double-right'
      icon.color = '#8561c5'
      break
    case BuilderTransactionTypes.Deposit:
    case TransactionTypes.CryptoDeposit:
    case TransactionTypes.FiatDeposit:
      icon.icon = 'fas fa-arrow-down'
      icon.color = '#6fbf73'
      break
    case BuilderTransactionTypes.Withdrawal:
    case TransactionTypes.CryptoWithdrawal:
    case TransactionTypes.FiatWithdrawal:
      icon.icon = 'fas fa-arrow-up'
      icon.color = '#f73378'
      break
  }
  return icon
}

// can leave the params empty
export function trackingParams(via, source, medium) {
  return {
    via: new Cookies().get('via') || via,
    utm_source: new Cookies().get('utm_source') || source,
    utm_medium: new Cookies().get('utm_medium') || medium,
  }
}

export function canShowGains(session) {
  return session.active_subscription || (session.country.code !== 'FRA' && session.country.code !== 'CAN')
}

export function getCostBasisMethodName(session, method_id) {
  method_id = method_id || session.cost_basis_method
  if (session.country.code === 'SWE' && method_id === 'average_cost') {
    return 'Genomsnittsmetoden'
  }

  let method = COST_BASIS_METHODS.find(method => method.id === method_id)
  return method ? method.name : method_id
}

export function planColor(plan) {
  switch (plan.name) {
    case 'Hodler':
      return Colors.green
    case 'Trader':
      return Colors.blue
    case 'Oracle':
      return Colors.purple
    default:
      return Colors.red
  }
}
