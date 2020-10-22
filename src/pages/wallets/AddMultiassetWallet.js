import AppLayout from '../../layouts/AppLayout'
import React from 'react'
import PageHeader from '../../components/PageHeader'
import { Redirect, Link } from 'react-router-dom'
import { Button } from 'reactstrap'

export default class AddMultiassetWallet extends React.Component {
  render() {
    let service = this.props.location.state
    if (!service) {
      return <Redirect to={'/wallets'} />
    }

    return (
      <AppLayout>
        <div className="page-body container">
          <div className="row">
            <div className="col" />
            <div className="col-lg-6 col-md-8 col-10">
              <PageHeader title={`${service.name}`} showBack />
              <p>You can auto-sync {service.name} by adding the public keys and addresses for your coins to Koinly.</p>
              <ul>
                <li>
                  For <b>Ethereum</b> and any ETH tokens:
                  <ol>
                    <li>Click on the Connect Blockchain button below</li>
                    <li>Find and select ETH on the following page</li>
                    <li>Click on Auto-sync → enter your ETH public address → Save</li>
                    <li>Wait a few mins for Koinly to import all your ETH and ERC20 transactions</li>
                  </ol>
                </li>
                <li>
                  For <b>Bitcoin, Bitcoin Cash, Dogecoin, Dash, Litecoin, BSV</b>:
                  <ol>
                    <li>
                      Find the <b>xpub, ypub or zpub keys</b> for each of your coins on {service.name}. For help, you can refer to our
                      instructions page and help center.
                    </li>
                    <li>Click on the Connect Blockchain button below</li>
                    <li>
                      Create separate wallets for each of your coins by selecting the auto-sync option and entering the key you found in
                      step 1
                    </li>
                    <li>Hit save and wait a few mins for Koinly to import transactions</li>
                  </ol>
                </li>
                <li>
                  For <b>all other coins</b>:
                  <ol>
                    <li>Click on the Connect Blockchain button below</li>
                    <li>Find your coin in the list → Setup auto-sync → Enter your public address → Save</li>
                    <li>
                      If you can't find your coin, it means Koinly can not auto-sync transactions for it yet. Let us know through Live Chat
                      so we can add support!
                    </li>
                  </ol>
                </li>
              </ul>
              Alternatively, you can download a CSV file with all your transactions from {service.name} and import that into Koinly instead.
              Go back to the previous page to do so.
              <Button className={'mt-4 d-block'} color="primary" tag={Link} to={'/wallets/select?type=blockchain'}>
                Connect Blockchain
              </Button>
            </div>
            <div className="col" />
          </div>
        </div>
      </AppLayout>
    )
  }
}
