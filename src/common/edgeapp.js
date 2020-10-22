export function onEdgeInit(callback) {
  if (window.edgeProvider != null) {
    callback(window.edgeProvider)
  } else {
    document.addEventListener('edgeProviderReady', function() {
      callback(window.edgeProvider)
    })
  }
}

export function usingEdgeApp() {
  return window.edgeTesting || window.navigator.userAgent.indexOf('app.edge') >= 0
}

export async function getEdgeCredentials() {
  return await window.edgeProvider.readData(['email', 'password'])
}

export async function saveEdgeCredentials(email, password) {
  return await window.edgeProvider.writeData({ email, password })
}

export async function fetchEdgeTransactions() {
  return await window.edgeProvider.getWalletHistory()
}
