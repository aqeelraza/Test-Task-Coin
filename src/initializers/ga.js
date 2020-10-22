import ReactGA from 'react-ga'

// setup google analytics
ReactGA.initialize('UA-136024426-1')
ReactGA.pageview('/app' + window.location.pathname + window.location.search)
