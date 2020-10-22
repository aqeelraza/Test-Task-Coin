// converts 1e-5 to 100000
export function toString(num) {
  let str = num.toString()
  if (str.indexOf('e-') === -1) return str

  if (Math.abs(num) < 1.0) {
    let e = parseInt(num.toString().split('e-')[1])
    if (e) {
      let negative = num < 0
      if (negative) num *= -1
      num *= Math.pow(10, e - 1)
      str = '0.' + new Array(e).join('0') + num.toString().substring(2)
      if (negative) str = '-' + str
    }
  } else {
    let e = parseInt(num.toString().split('+')[1])
    if (e > 20) {
      e -= 20
      num /= Math.pow(10, e)
      str = num.toString() + new Array(e + 1).join('0')
    }
  }

  return str
}

export function decimal(num, round) {
  if (!num) return 0

  let amount = parseFloat(num)
  if (round !== null && round !== undefined) {
    return parseFloat(amount.toFixed(round))
  }

  return amount
}

export function abs(number, round) {
  return Math.abs(decimal(number, round))
}

export function zero(number) {
  return decimal(number) == 0
}

export function pos(number) {
  return decimal(number) > 0
}

export function neg(number) {
  return decimal(number) < 0
}

export function same(number1, number2, round = null) {
  return decimal(number1, round) === decimal(number2, round)
}

export function div(number1, number2) {
  if (zero(number1) || zero(number2)) return 0
  return decimal(number1) / decimal(number2)
}

export function mul(number1, number2) {
  return decimal(number1) * decimal(number2)
}

export function add(number1, number2) {
  return decimal(number1) + decimal(number2)
}

export function sub(number1, number2) {
  return decimal(number1) - decimal(number2)
}

export function min(number1, number2) {
  return decimal(number1) > decimal(number2) ? number2 : number1
}
