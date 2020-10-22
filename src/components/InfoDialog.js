import React from 'react'
import { Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap'
import { Button } from '../controls'

export default function InfoDialog(props) {
  return (
    <Modal isOpen={props.open} toggle={props.onClose} className={props.className}>
      <ModalHeader toggle={props.onClose}>{props.title}</ModalHeader>
      <ModalBody>{props.text}</ModalBody>
      <ModalFooter>
        <Button color="primary" onClick={props.onClose}>
          OK
        </Button>
      </ModalFooter>
    </Modal>
  )
}
