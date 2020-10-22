import React, { PureComponent } from 'react'
import { withRouter } from 'react-router-dom'
import connect from 'react-redux/es/connect/connect'
import { syncFinished } from '../../redux/reducers/syncStatus'
import axios from 'axios'
import Flag, { FlagGroup } from '@atlaskit/flag'
import SuccessIcon from '@atlaskit/icon/glyph/check-circle'
import { Colors } from '../../common'
import queryString from 'query-string'

class SyncStatusPoller extends PureComponent {
  state = {
    loading: false,
    statuses: null,
    showRefresh: false,
    scheduled: false,
  }

  componentDidMount() {
    if (!this.state.scheduled) {
      this.beginPollStatus()
    }
  }

  componentDidUpdate(prevProps) {
    if (!this.state.scheduled) {
      this.beginPollStatus()
    }

    // hide refresh message when user changes the page
    if (!this.props.shouldPoll && !this.state.scheduled && this.state.showRefresh && prevProps.location.key !== this.props.location.key) {
      this.setState({ showRefresh: false })
    }
  }

  pollStatusInternal = () => {
    if (!this.props.shouldPoll) {
      this.setState({ loading: false })
      return
    }

    axios
      .get('/api/job_statuses')
      .then(response => {
        // when no jobs are being synced we display nothing
        // when jobs were being synced in previous check but are not being synced anymore, we want to display the 'refresh' message
        // if jobs are being synced, we display them
        let statuses = response.data.job_statuses
        if (statuses.length === 0) {
          this.props.syncFinished()
          this.setState(prevState => {
            return { loading: false, statuses: null, scheduled: false, showRefresh: !!prevState.statuses }
          })
        } else {
          this.setState({ loading: false, statuses: statuses, showRefresh: false, scheduled: true })
          setTimeout(this.pollStatusInternal, 5000)
        }
      })
      .catch(() => this.setState({ loading: false }))
  }

  beginPollStatus = () => {
    if (this.props.shouldPoll && !this.state.loading) {
      this.setState({ loading: true })
      setTimeout(this.pollStatusInternal, 1000)
    }
  }

  refreshPage = () => {
    let location = this.props.location
    let parsed = queryString.parse(location.search)
    parsed.rel = Math.random()
      .toString(36)
      .substring(5)
    let search = queryString.stringify(parsed)
    this.props.history.push({ ...location, search })
  }

  dismissFlag = () => {
    this.setState({ showRefresh: false })
  }

  render() {
    if (this.state.statuses) {
      return (
        <FlagGroup onDismissed={() => this.dismissFlag()}>
          <Flag
            id="1"
            icon={<div className="spinner-border text-secondary" />}
            title={`${this.state.statuses[0].name}...`}
            description={<span className="small text-muted text-uppercase">{this.state.statuses[0].status}</span>}
            isDismissAllowed={false}
          />
        </FlagGroup>
      )
    } else if (this.state.showRefresh) {
      return (
        <FlagGroup onDismissed={() => this.dismissFlag()}>
          <Flag
            id="1"
            actions={[
              { content: 'Refresh', onClick: () => this.refreshPage() },
              { content: 'Dismiss', onClick: () => this.dismissFlag() },
            ]}
            icon={<SuccessIcon primaryColor={Colors.green} label="Info" />}
            title="Your portfolio has been updated."
            description="You should refresh the current page to view the latest changes."
          />
        </FlagGroup>
      )
    }

    return null
  }
}

function mapStateToProps({ syncStatus, session }) {
  return {
    shouldPoll: syncStatus && session,
  }
}

export default withRouter(connect(mapStateToProps, { syncFinished })(SyncStatusPoller))
