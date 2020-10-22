import React, { PureComponent } from 'react'
import { withRouter } from 'react-router-dom'
import connect from 'react-redux/es/connect/connect'
import { hideNetworkError } from '../../redux/reducers/networkError'
import Flag, { FlagGroup } from '@atlaskit/flag'
import WarningIcon from '@atlaskit/icon/glyph/editor/warning'
import axios from 'axios'
import queryString from 'querystring'

export function apiCloudflareUrl(state) {
  let loc = window.location
  let ref = loc.protocol + '//' + loc.hostname + (loc.port ? ':' + loc.port : '') + loc.pathname
  if (state) {
    ref += '?' + state
  }

  let apiUrl = axios.defaults.baseURL + '/cf'
  return apiUrl + '?' + queryString.stringify({ ref })
}

class CloudflareErrorBox extends PureComponent {
  render() {
    return (
      <FlagGroup onDismissed={this.props.hideNetworkError}>
        <Flag
          id="1"
          actions={[
            { content: 'Retry', onClick: () => (window.location = apiCloudflareUrl()) },
            { content: 'Dismiss', onClick: () => this.props.hideNetworkError() },
          ]}
          icon={<WarningIcon />}
          appearance={'warning'}
          title={
            <>
              Connectivity issues... <a href={apiCloudflareUrl()}>Retry</a>
            </>
          }
          description="Looks like something is wrong with the internet connection."
        />
      </FlagGroup>
    )
  }
}

export default withRouter(connect(null, { hideNetworkError })(CloudflareErrorBox))
