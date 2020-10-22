import Tooltip from '../../../components/Tooltip'
import { Link } from 'react-router-dom'
import React from 'react'

export function formatApiError(wallet) {
  return wallet.friendly_error ? (
    <Tooltip content={wallet.last_error} tag="span" position="bottom">
      <div className="text-danger small pt-1">
        {wallet.friendly_error} <Link to={`/wallets/${wallet.id}/api`}>Update now</Link>
      </div>
    </Tooltip>
  ) : (
    wallet.last_error && <div className="text-danger small pt-1">{wallet.last_error}</div>
  )
}
