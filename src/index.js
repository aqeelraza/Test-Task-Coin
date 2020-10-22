import React from 'react'
import ReactDOM from 'react-dom'
import { Provider } from 'react-redux'
import ErrorBoundary from './components/ErrorBoundary'
import App from './App'
import store from './initializers/store'
import './initializers/ga'
import './initializers/axios'

// initialising the app
ReactDOM.render(
  <Provider store={store}>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </Provider>,
  document.getElementById('root')
)

//registerServiceWorker();
// unregisterServiceWorker();
