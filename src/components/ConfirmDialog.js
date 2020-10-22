import React, { Fragment } from 'react'
import { Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap'
import { Button } from '../controls'
import ReactDOM from 'react-dom'

export default class ConfirmDialog extends React.Component {
  state = {
    open: false,
  }

  constructor(props) {
    super(props)
    this.portalRoot = document.getElementById('portal')
    this.el = document.createElement('div')
  }

  componentDidMount = () => {
    this.portalRoot.appendChild(this.el)
  }

  componentWillUnmount = () => {
    this.portalRoot.removeChild(this.el)
  }

  onClose = () => {
    this.setState({ open: false })
  }

  onClick = e => {
    if (e) {
      e.preventDefault()
    }
    this.setState({ open: true })
  }

  onConfirm = e => {
    this.setState({ open: false })
    this.props.onConfirm(e)
  }

  render() {
    let { tag, text, onConfirm, ...passThrough } = this.props
    let Tag = tag

    let isOpen = this.props.open || this.state.open
    let onClose = this.props.onClose || this.onClose

    const modal = (
      <Modal isOpen={isOpen} toggle={onClose}>
        <ModalHeader toggle={onClose}>Confirm</ModalHeader>
        <ModalBody>{text}</ModalBody>
        <ModalFooter>
          <Button color="secondary" onClick={onClose}>
            No
          </Button>
          <Button color="primary" onClick={this.onConfirm}>
            Yes
          </Button>
        </ModalFooter>
      </Modal>
    )

    return (
      <>
        {Tag && <Tag onClick={this.onClick} {...passThrough} />}
        {ReactDOM.createPortal(modal, this.el)}
      </>
    )
  }
}
