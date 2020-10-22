import fp from 'fingerprintjs2'
import { random } from './index'

function generateAndSetCsrfToken(components) {
  let values = components.map(function(component) {
    return component.value
  })
  let murmur = fp.x64hash128(values.join(''), 31)
  window.csrfToken = window.btoa(murmur)
}

export function loadCsrfToken() {
  if (window.requestIdleCallback) {
    window.requestIdleCallback(() => fp.get(generateAndSetCsrfToken))
  } else {
    setTimeout(() => fp.get(generateAndSetCsrfToken), 500)
  }
}

export function setServerToken(token) {
  if (window.csrfToken && token && window.csrfToken !== token) {
    window.vst = false
    if (window.ast === undefined) {
      window.ast = null
      setTimeout(() => (window.ast = false), random(2000, 10000))
    }
  }
}

export function validServerToken() {
  return window.vst !== false
}

export function ast() {
  return window.ast === false
}
