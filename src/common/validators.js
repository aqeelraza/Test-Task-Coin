/* eslint-disable */

export function required(val) {
  if (val === null || val === undefined || val.length === 0) {
    return "This can't be empty!"
  }
}

export function minLength(length) {
  return val => {
    if (!val || val.length < length) {
      return `Must be at least ${length} characters!`
    }
  }
}

export function email(val) {
  const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
  if (!re.test(val.toLowerCase())) {
    return 'Must be valid!'
  }
}
