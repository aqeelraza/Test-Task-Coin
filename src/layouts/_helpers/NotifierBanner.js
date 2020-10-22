import React, { PureComponent } from 'react'
import connect from 'react-redux/es/connect/connect'
import CheckIcon from '@atlaskit/icon/glyph/check'
import ErrorIcon from '@atlaskit/icon/glyph/error'
import Banner from '@atlaskit/banner'
import { clearNotification } from '../../redux/reducers/notifier'

class NotifierBanner extends PureComponent {
  static getDerivedStateFromProps(nextProps) {
    if (nextProps.notifier) {
      // dont show notification if it was created more than 1 second ago
      // this is to avoid reopening a notification on page loads. this component
      // is recreated on every page
      let diff = new Date().getTime() - nextProps.notifier.time
      if (diff < 1000) {
        window.scrollTo(0, 0)
        return {
          isOpen: true,
          notification: nextProps.notifier,
          scheduledClose: false,
        }
      }
    }

    return { isOpen: false }
  }

  state = {
    isOpen: false,
  }

  componentDidMount() {
    this.scheduleClose()
  }

  componentDidUpdate() {
    this.scheduleClose()
  }

  scheduleClose = () => {
    if (this.state.isOpen && !this.state.scheduledClose) {
      this.setState({ scheduledClose: true })
      const id = this.state.notification.id
      setTimeout(() => this.props.clearNotification(id), 8000)
    }
  }

  render() {
    if (!this.state.notification) {
      return null
    }

    let appearance
    let icon
    switch (this.state.notification.type) {
      case 'error':
        appearance = 'error'
        icon = <ErrorIcon label="" secondaryColor="inherit" />
        break
      default:
        appearance = 'announcement'
        icon = <CheckIcon label="" secondaryColor="inherit" />
    }

    return (
      <Banner icon={icon} isOpen={this.state.isOpen} appearance={appearance}>
        {this.state.notification.message}
      </Banner>
    )
  }
}

function mapStateToProps({ notifier }) {
  return {
    notifier,
  }
}

export default connect(mapStateToProps, { clearNotification })(NotifierBanner)
