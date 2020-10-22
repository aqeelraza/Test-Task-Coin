import React from 'react'
import { withRouter } from 'react-router-dom'
import { Button, ButtonGroup } from '../controls'

const ErrorPage = ({ error, onRetry, history }) => {
  let message = error.message
  let status = 0
  if (error.response) {
    status = error.response.status
    const res = error.response.data
    if (res && res.errors) {
      if (res.errors.length === 0 || res.status === 500) {
        message = res.meta.message
      } else {
        message = res.errors[0].detail
      }
    } else {
      // Probably html error response
    }
  } else if (error.request) {
    // The request was made but no response was received
  } else {
    // Error in our code
  }

  const title = status === 404 ? 'Page not found' : 'Oops, something went wrong...'

  return (
    <div className="page-body container">
      <div className="row">
        <div className="col-5 mx-auto" style={{ textAlign: 'center' }}>
          {status !== undefined && <div style={{ fontSize: '120px' }}>{status}</div>}
          <h3>{title}</h3>
          <div className="small text-muted" style={{ paddingBottom: '1rem' }}>
            {message}
          </div>
          <ButtonGroup>
            <Button color="primary" onClick={() => history.goBack()}>
              Go Back
            </Button>
            {onRetry ? <Button onClick={() => onRetry()}>Try again</Button> : <Button onClick={() => history.push('/')}>Home</Button>}
          </ButtonGroup>
        </div>
      </div>
    </div>
  )
}

export default withRouter(ErrorPage)
