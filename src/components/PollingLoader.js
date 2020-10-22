import React, { Component } from 'react'
import axios from 'axios'
import Loader from './Loader'
import { Modal, ModalBody } from 'reactstrap'
import RoundFaIcon from './RoundFaIcon'
import { poll } from '../common'

class PollingLoader extends Component {
  state = {
    response: null,
    finished: false,
    startTime: Date.now(),
  }

  componentDidMount() {
    this.load()
  }

  load = () => {
    this.setState({ finished: false })
    poll(
      (resolve, reject) =>
        axios.get(this.props.url).then(res => {
          let response = res.data
          if (this.props.shouldPoll(response)) {
            resolve(true)
          } else {
            resolve(false)
            this.setState({ response })
            // hide the dialog after 500 ms to show the success icon to users
            setTimeout(() => {
              this.setState({ finished: true })
              this.props.onFinished(response)
            }, 1000)
          }
        }),
      {
        interval: this.props.interval || 3000,
        timeout: (this.props.timeoutSeconds || 120) * 1000,
      }
    )
  }

  renderSuccess() {
    return (
      <div className="row align-items-center justify-content-center w-100">
        <RoundFaIcon icon="check" size="3em" className="d-block mx-auto mb-3 text-success" />
      </div>
    )
  }

  render() {
    if (this.state.finished) {
      return null
    }

    return (
      <Modal isOpen={!this.state.response}>
        <ModalBody>
          <div className="text-center">
            {this.state.response ? this.renderSuccess() : <Loader />}
            {!this.state.response && (
              <h2 className="text-muted" style={{ marginTop: '-1em', marginBottom: '2em' }}>
                {this.props.title || 'Please wait...'}
              </h2>
            )}
          </div>
        </ModalBody>
      </Modal>
    )
  }
}

export default PollingLoader
