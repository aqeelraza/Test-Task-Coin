import createBrowserHistory from 'history/createBrowserHistory'
import ReactGA from 'react-ga'

const history = createBrowserHistory()
history.listen((loc, action) => {
  // Don't scroll to top if user presses back
  if (action === 'POP' || loc.action === 'REPLACE') return
  ReactGA.pageview('/app' + loc.pathname + loc.search)
  // Allow the client to control scroll-to-top using location.state
  if (loc.state && loc.state.scroll !== undefined && !loc.state.scroll) return
  window.scrollTo(0, 0)
})

export default history
