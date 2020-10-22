import React, { useState } from 'react'
import { Modal, ModalHeader, ModalBody } from 'reactstrap'
import { getDeltaColor } from '../../../common'
import { LINKS } from '../../../Constants'
import moment from 'moment'
import WarningIcon from '../../../components/WarningIcon'
import _ from 'lodash'

function missingBalancesString(array) {
  let end = 'not match what you actually have on the wallet. Click for more info'
  if (array.length === 1) {
    return array[0] + ' balance does ' + end
  } else if (array.length === 2) {
    return array[0] + ' & ' + array[1] + ' balances do ' + end
  } else if (array.length > 2) {
    return array[0] + ', ' + array[1] + ' & ' + array.length + ' other balances do ' + end
  }
  return ''
}

const MissingBalancesDlg = props => {
  return (
    <Modal isOpen={props.open} toggle={props.onClose} className={props.className}>
      <ModalHeader toggle={props.onClose}>{props.wallet.name}</ModalHeader>
      <ModalBody>
        <p className="small">
          Some of your balances on this app do not match the balances reported by the API. The differences are listed below.{' '}
          <a href={LINKS.missing_txns} target="_blank">
            Learn more
          </a>
        </p>
        <p className="small text-muted">This list was updated {moment(props.wallet.synced_at).fromNow()}.</p>
        <table className="table table-striped">
          <thead>
            <tr>
              <td>Asset</td>
              <td>Difference</td>
            </tr>
          </thead>
          <tbody>
            {Object.keys(props.wallet.balance_diff).map(key => (
              <tr>
                <td>{key}</td>
                <td style={{ color: getDeltaColor(props.wallet.balance_diff[key]) }}>{props.wallet.balance_diff[key]}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </ModalBody>
    </Modal>
  )
}

export default ({ wallet }) => {
  if (_.isEmpty(wallet.balance_diff)) return null
  const [showMissing, setShowMissing] = useState(false)
  return (
    <>
      <WarningIcon text={missingBalancesString(Object.keys(wallet.balance_diff))} onClick={() => setShowMissing(true)} />
      <MissingBalancesDlg open={showMissing} wallet={wallet} onClose={() => setShowMissing(false)} />
    </>
  )
}
