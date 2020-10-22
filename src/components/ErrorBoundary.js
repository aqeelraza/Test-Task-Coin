import React from 'react'
import { Button } from 'reactstrap'

export default class ErrorBoundary extends React.Component {
  state = {
    error: null,
  }

  componentDidCatch(error, info) {
    window.Rollbar.error(error, info)
    this.setState({ error })
  }

  render() {
    if (this.state.error) {
      return (
        <div className="page-body container">
          <div className="row">
            <div className="col-5 mx-auto" style={{ textAlign: 'center' }}>
              <h3>Oops, something went wrong...</h3>
              <div className="small text-muted" style={{ paddingBottom: '1rem' }}>
                {this.state.error.message}
              </div>
              <Button tag="a" color="primary" href="/">
                Reload
              </Button>
            </div>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}
