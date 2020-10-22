import React from 'react'
import { LINKS } from '../../../Constants'

// NOTE: THIS FILE IS ALSO USED AS-IS ON koinly.io

const ExtLink = ({ to, children, noIcon }) => (
  <strong>
    <a href={to} target="_BLANK" rel="noopener noreferrer nofollow">
      {children}
      {!noIcon && ' '}
      {!noIcon && <i className="fas fa-external-link-alt" />}
    </a>
  </strong>
)

const ApiSteps = ({ children }) => (
  <>
    <b>Instructions</b>
    <ol className="">{children}</ol>
  </>
)

const CsvSteps = ({ children, omitFinalStep, multiple }) => (
  <>
    <b>Instructions</b>
    <ol className="">
      {children}
      {!multiple && !omitFinalStep && <li>Upload the downloaded file to Koinly</li>}
      {multiple && <li>Upload the downloaded files to Koinly</li>}
    </ol>
  </>
)

const Limits = ({ children }) => <p className="alert alert-warning">{children}</p>

export default {
  bibox: {
    api: (
      <ApiSteps>
        <li>
          Open the Bibox <ExtLink to="https://www.bibox.com/ManAPI">API Settings</ExtLink> page
        </li>
        <li>
          Enter a name for the API key, such as <strong>Koinly</strong>, and click <strong>Create</strong>
        </li>
        <li>
          If applicable, enter your <strong>two-factor authentication code</strong>
        </li>
        <li>
          Click <strong>Show</strong> under <strong>Secret</strong>
        </li>
        <li>
          Copy the <strong>API Key</strong> and <strong>Secret</strong>{' '}
        </li>
      </ApiSteps>
    ),
    api_limits: (
      <Limits>
        Automatically pulling your trades is currently limited to the past 3 months. If you have prior Bibox trades, you will need to import
        them via CSV after creating this wallet.
      </Limits>
    ),
  },
  binance: {
    api: (
      <ApiSteps>
        <li>
          Open the Binance <ExtLink to="https://www.binance.com/en/usercenter/settings/api-management">API Settings</ExtLink> page
        </li>
        <li>
          Click on <strong>Create New Key</strong>, label it <strong>Koinly</strong>
        </li>
        <li>
          If applicable, enter your <strong>two-factor authentication code</strong>
        </li>
        <li>
          Copy the <strong>API Key</strong> and <strong>Secret</strong>{' '}
        </li>
        <li>
          Disable trading access for this API key:
          <ul>
            <li>
              Click the <strong>Edit</strong> button
            </li>
            <li>
              Disable the <strong>Enable Trading</strong> permission
            </li>
            <li>
              Click <strong>Save</strong>
            </li>
            <li>
              If applicable, enter your <strong>two-factor authentication code</strong>
            </li>
          </ul>
        </li>
      </ApiSteps>
    ),
    api_limits: (
      <Limits>
        Binance API has certain limitations:
        <ul>
          <li>
            Trades made with delisted coins can not be synced. If you have such trades we recommend disabling the{' '}
            <strong>Import historical data</strong> option and uploading your history using csv files instead.
          </li>
        </ul>
        Read more about api limitations and alternate ways to import missing data <ExtLink to={LINKS.api_limitations}>here</ExtLink>.
      </Limits>
    ),
    csv: (
      <CsvSteps multiple>
        <li>
          Open the Binance <b>Trade History</b> page
        </li>
        <li>
          Click on <strong>Export Complete Trade History</strong> at the top right corner and save it to your PC
        </li>
        <li>Also download your Deposits and Withdrawals files</li>
      </CsvSteps>
    ),
    csv_limits: (
      <Limits>
        Binance does not export transactions for airdrops. Follow this guide to import them:{' '}
        <ExtLink to={LINKS.binance_airdrops}>Importing Binance airdrops</ExtLink>.
      </Limits>
    ),
  },
  bitfinex: {
    api: (
      <ApiSteps>
        <li>
          Open the Bitfinex <ExtLink to="https://www.bitfinex.com/api">API</ExtLink> page
        </li>
        <li>
          Click <strong>Create New Key</strong>
        </li>
        <li>
          Keep the default permissions unchanged (all <strong>'Read'</strong> permissions enabled)
        </li>
        <li>
          Enter a <strong>label</strong> for the API key, such as <strong>Koinly</strong>
        </li>
        <li>
          Click <strong>Generate API key</strong>
        </li>
        <li>
          If applicable, enter your <strong>two-factor authentication code</strong>
        </li>
        <li>
          Confirm the new API key from the <strong>verification email</strong> you receive from Bitfinex
        </li>
        <li>
          Copy the <strong>API Key</strong> and <strong>API Key Secret</strong>{' '}
        </li>
      </ApiSteps>
    ),
    csv: (
      <CsvSteps>
        <li>
          Open the Bitfinex <ExtLink to="https://www.bitfinex.com/reports">Reports</ExtLink> page
        </li>
        <li>
          Click on <strong>Trading > Ledgers</strong>
        </li>
        <li>Click on the Calendar icon. Select a Custom date range that includes ALL your trades (for all years)</li>
        <li>
          Ensure <strong>DD-MM-YY</strong> is selected for the date format
        </li>
        <li>
          Click on <strong>View</strong> then <strong>Export</strong>
        </li>
        <li>The CSV file will be sent to your email</li>
      </CsvSteps>
    ),
    api_limits: (
      <Limits>
        Bitfinex Margin and Lending is not currently supported via API. In such cases, avoid using API and upload your ledgers.csv file
        instead.
      </Limits>
    ),
  },
  bitmex: {
    api: (
      <ApiSteps>
        <li>
          Open the BitMEX <ExtLink to="https://www.bitmex.com/app/apiKeys">API Keys</ExtLink> page
        </li>
        <li>
          Enter a name for the API key, such as <strong>Koinly</strong>
        </li>
        <li>
          <strong className="text-muted mr-2 small">RECOMMENDED</strong> Leave <strong>Key Permissions</strong> blank and{' '}
          <strong>Withdraw</strong> unchecked
        </li>
        <li>
          Click the <strong>Create API Key</strong> button
        </li>
        <li>
          Copy the <strong>API Key</strong> and <strong>Secret</strong>{' '}
        </li>
      </ApiSteps>
    ),
    csv: (
      <CsvSteps>
        <li>Sign into your BitMex Account</li>
        <li>
          Click on the <ExtLink to="https://www.bitmex.com/app/wallet">Balances</ExtLink> tab
        </li>
        <li>
          Click on <strong>Save as CSV</strong> in the top right corner
        </li>
        <li>
          <strong>NOTE: </strong>BitMEX exports csv files in your local timezone so you must set the correct timezone when importing into
          Koinly!
        </li>
      </CsvSteps>
    ),
  },
  bitsane: {
    api: (
      <ApiSteps>
        <li>
          Open the Bitsane <ExtLink to="https://bitsane.com/account/api">API</ExtLink> page
        </li>
        <li>
          Click <strong>Generate new API key</strong> button
        </li>
        <li>
          Type <strong>Key description</strong>
        </li>
        <li>
          Mark only <strong>Query Balances</strong>, <strong>Query Transactions History</strong> and <strong>Query Orders History</strong>{' '}
          checkboxes
        </li>
        <li>
          Click <strong>Generate key</strong> button
        </li>
        <li>Activate your Keys using link from confirmation email</li>
        <li>
          Click <strong>pen</strong> icon
        </li>
        <li>
          Click <strong>Show Private Key</strong> button
        </li>
        <li>
          Copy the <strong>API Key</strong> and <strong>Private Key</strong>{' '}
        </li>
      </ApiSteps>
    ),
  },
  bitstamp: {
    api: (
      <ApiSteps>
        <li>
          Open the Bitstamp <ExtLink to="https://www.bitstamp.net/account/security/api/">API Access</ExtLink> page
        </li>
        <li>
          If you already have existing API keys, click <strong>New API Key</strong>
        </li>
        <li>
          Enable the following <strong>permissions</strong>:
          <ul>
            <li>Account balance</li>
            <li>User transactions</li>
          </ul>
        </li>
        <li>
          If applicable, enter your <strong>Two-Factor Authentication Code</strong>
        </li>
        <li>
          Click <strong>Generate Key</strong>
        </li>
        <li>
          Click <strong>Activate</strong>
        </li>
        <li>
          Confirm the new API key from the <strong>verification email</strong> you receive from Bitstamp
        </li>
        <li>
          Copy the <strong>API Key</strong> and <strong>API Key Secret</strong>
        </li>
      </ApiSteps>
    ),
    csv: (
      <CsvSteps>
        <li>
          Open the Bitstamp <ExtLink to="https://www.bitstamp.net/account/transactions/">Account and Transactions</ExtLink> page
        </li>
        <li>
          Click on <strong>Export</strong>
        </li>
        <li>
          Click on the green <strong>EXPORT ALL</strong> button to save the file to your PC
        </li>
      </CsvSteps>
    ),
  },
  bittrex: {
    api: (
      <ApiSteps>
        <li>
          Open the Bittrex <ExtLink to="https://bittrex.com/Manage?view=api">API Keys</ExtLink> page
        </li>
        <li>
          Click the <strong>Add new key...</strong> button
        </li>
        <li>
          Enable the <strong>READ INFO</strong> permission for the new key
        </li>
        <li>
          Click <strong>Save</strong>
        </li>
        <li>
          If applicable, enter your <strong>two-factor authentication code</strong>
        </li>
        <li>
          Copy the <strong>Key</strong> and <strong>Secret</strong>{' '}
        </li>
      </ApiSteps>
    ),
    api_limits: (
      <Limits>Bittrex API only allows syncing the last 100 deposits. If you have more, you will need to import them via CSV.</Limits>
    ),
    csv: (
      <CsvSteps>
        <li>Sign into your Bittrex Account</li>
        <li>
          Click on the <ExtLink to="https://international.bittrex.com/history">Orders</ExtLink> page
        </li>
        <li>
          Click on the <strong>Download History</strong> button (next to Recent Orders)
        </li>
        <li>Select year - Koinly needs ALL of your trades so repeat this process for every year that you traded</li>
        <li>Also download your deposits and withdrawals</li>
      </CsvSteps>
    ),
  },
  btc_markets: {
    api: (
      <ApiSteps>
        <li>
          Open the BTC Markets <ExtLink to="https://www.btcmarkets.net/account/apikey">API Key</ExtLink> page
        </li>
        <li>
          Click the <strong>Generate API Key</strong> button
        </li>
        <li>
          If applicable, enter your <strong>two-factor authentication code</strong>
        </li>
        <li>
          Click <strong>Display</strong> to reveal the <strong>Secret Key</strong>
        </li>
        <li>
          Copy the <strong>Public Key</strong> and <strong>Secret Key</strong>{' '}
        </li>
      </ApiSteps>
    ),
  },
  cex_io: {
    api: (
      <ApiSteps>
        <li>
          Open the CEX.IO <ExtLink to="https://cex.io/trade/profile#/api">API Access</ExtLink> page
        </li>
        <li>
          Click the <strong>Generate API Key</strong> button
        </li>
        <li>
          Under <strong>permissions</strong>, enable only the <strong>account balance</strong> and <strong>open orders</strong> permissions.
        </li>
        <li>
          Click <strong>generate key</strong>
        </li>
        <li>
          Copy the <strong>User ID</strong>, <strong>API Key</strong> and <strong>API Secret</strong>{' '}
        </li>
        <li>
          Click <strong>activate</strong> beside the new API key
        </li>
        <li>
          Enter your <strong>two-factor authentication code</strong> and confirm activation of the new key by email
        </li>
      </ApiSteps>
    ),
  },
  cobinhood: {
    api: (
      <ApiSteps>
        <li>
          Open the Cobinhood <ExtLink to="https://cobinhood.com/api">API page</ExtLink>
        </li>
        <li>
          Select <strong>Read Permission</strong> for Trading, Ledger
        </li>
        <li>Accept terms</li>
        <li>Type Name of Key</li>
        <li>
          Click <strong>Create API Key</strong>
        </li>
        <li>
          Copy the <strong>Key</strong>{' '}
        </li>
      </ApiSteps>
    ),
  },
  deribit: {
    api: (
      <ApiSteps>
        <li>
          Open the Deribit <ExtLink to="https://www.deribit.com/main#/account?scrollTo=api">API Keys</ExtLink> page
        </li>
        <li>
          Click the <strong>Add a new key</strong> button
        </li>
        <li>
          Change the permissions for all fields to <strong>READ</strong>, set Name to Koinly and leave the IP fields blank
        </li>
        <li>
          Click <strong>Add a new key</strong>
        </li>
        <li>
          Copy the <strong>API Key</strong> and <strong>API Secret</strong> here
        </li>
        <li>
          <b>For subaccounts: </b> If you had subaccounts then you need to create separate deribit wallets for each of them on Koinly
        </li>
      </ApiSteps>
    ),
    csv: (
      <CsvSteps multiple>
        <li>Sign into your Deribit Account</li>
        <li>
          Click on the profile icon in the top right corner and select{' '}
          <ExtLink to="https://www.deribit.com/main#/accountlogs">Transaction Logs</ExtLink>
        </li>
        <li>Change the start and end period to include all your Deribit trades</li>
        <li>
          Click on the <b>Download logs</b> button
        </li>
        <li>
          Now click on <b>Ethereum</b> in the top-left corner and repeat the process to download your ETH logs
        </li>
        <li>
          <b>For subaccounts:</b> If you had subaccounts then you need to create separate deribit wallets for each of them on Koinly
        </li>
      </CsvSteps>
    ),
  },
  gdax: {
    api: (
      <ApiSteps>
        <li>
          Open the Coinbase Pro <ExtLink to="https://pro.coinbase.com/profile/api">API Settings</ExtLink> page
        </li>
        <li>
          Click the <strong>+ New API Key</strong> button
        </li>
        <li>
          Under <strong>Permissions</strong> select <strong>View</strong>
        </li>
        <li>
          Copy the <strong>Passphrase</strong> into the <strong>Api Pass</strong> field
        </li>
        <li>
          If applicable, enter your <strong>two-factor authentication code</strong>
        </li>
        <li>
          Click <strong>Create API Key</strong>
        </li>
        <li>
          Enter the <strong>API Key</strong> and <strong>API Secret</strong>
        </li>
      </ApiSteps>
    ),
  },
  coinjar: {
    api: (
      <ApiSteps>
        <li>Create a new Coinjar wallet on Koinly</li>
        <li>
          Select the <strong>Setup auto-sync</strong> option
        </li>
        <li>
          Click on <b>Continue</b> which wil ltake you to the Coinjar page for authentication.
        </li>
        <li>Login to Coinjar and grant Koinly access to your account</li>
        <li>That's it! Now Koinly will pull in your transaction history automatically.</li>
      </ApiSteps>
    ),
    csv: (
      <CsvSteps multiple>
        <li>
          Login to Coinjar and go to the <ExtLink to="https://app.coinjar.com/settings">Settings</ExtLink> page
        </li>
        <li>
          Scroll down to <strong>Tax Settings</strong>
        </li>
        <li>
          Download the <b>Purchase & sales</b> report - this contains your trades
        </li>
        <li>
          Download the <b>Deposits & Withdrawals</b> report
        </li>
      </CsvSteps>
    ),
  },
  coinspot: {
    api: (
      <ApiSteps>
        <li>
          Open the CoinSpot <ExtLink to="https://www.coinspot.com.au/my/api">API page</ExtLink>
        </li>
        <li>
          Click the <strong>Generate Api Key</strong> button
        </li>
        <li>
          Copy the <strong>Key</strong> and <strong>Secret</strong>{' '}
        </li>
      </ApiSteps>
    ),
    api_limits: <Limits>Coinspot API does not return airdrops, so you will need to import them manually.</Limits>,
  },
  coinsquare: {
    csv: (
      <CsvSteps omitFinalStep>
        <li>
          Download our <ExtLink to={LINKS.sample_csv_dl}>sample CSV file</ExtLink>
        </li>
        <li>
          Open the Coinsquare <ExtLink to="https://coinsquare.com/transactions">Transactions</ExtLink> page
        </li>
        <li>
          For each currency that you've deposited, traded, or withdrawn:
          <ol>
            <li>Select the currency on the left side</li>
            <li>
              Add the deposits and withdrawals shown in the <strong>Fund & Withdraw</strong> section into the CSV
            </li>
            <li>
              Add the trades as shown in the <strong>Quick Trade</strong> section into the CSV
            </li>
            <li>
              Add the trades as shown in the <strong>Advanced Trade</strong> section into the CSV
            </li>
            <li>
              <strong className="text-muted mr-2 small">NOTE</strong>Ensure you don't input the same trade multiple times. If you need help
              filling in the sample csv file, check out our guide:{' '}
              <ExtLink to={LINKS.custom_import_guide}>Importing from a custom CSV file</ExtLink>
            </li>
          </ol>
        </li>
        <li>Upload the CSV file </li>
      </CsvSteps>
    ),
  },
  coss: {
    api: (
      <ApiSteps>
        <li>
          Open the Coss <ExtLink to="https://www.coss.io/c/accounts/api">API Management</ExtLink> page
        </li>
        <li>Type Name of Key</li>
        <li>
          Click the <strong>Create New Key</strong> button
        </li>
        <li>Enter your 2FA code</li>
        <li>
          Click the <strong>Next</strong> button
        </li>
        <li>Please check your email</li>
        <li>
          Click <strong>Click Here To Create API Key</strong> link
        </li>
        <li>
          Copy the <strong>Public Key</strong> and <strong>Secret Key</strong>{' '}
        </li>
        <li>
          <strong>Turn off trading permission</strong> for this key on the same page clicking edit button
        </li>
      </ApiSteps>
    ),
  },
  crypto_com: {
    api: (
      <ApiSteps>
        <li>
          Login to your <ExtLink to="https://crypto.com/exchange/personal/settings">Crypto.com Exchange</ExtLink> account
        </li>
        <li>
          Go to <b>Settings > API Keys > Create new API key</b>
        </li>
        <li>
          Enter <strong>koinly</strong> in the label and your 2FA code
        </li>
        <li>
          Click on <b>Create API</b>, set IP restriction to <b>Unrestricted</b>.
        </li>
        <li>Copy your API Key and API Secret to Koinly</li>
      </ApiSteps>
    ),
    csv: (
      <CsvSteps>
        <li>
          Open your <b>Crypto.com app</b> and go to the <b>Accounts</b> tab
        </li>
        <li>
          Click on the <b>Transaction history</b> button in the top-right corner
        </li>
        <li>
          Click on the <strong>Export</strong> button in the top-right corner
        </li>
        <li>
          Select <b>Crypto wallet</b> under the Transaction drop down
        </li>
        <li>
          Select a <b>Start date</b> that includes all your transactions
        </li>
        <li>
          Select <b>End date</b> as today
        </li>
        <li>
          Click on <b>Export to CSV</b>
        </li>
        <li>Repeat this process for the other options under the Transaction dropdown (fiat wallet, mco visa card etc)</li>
      </CsvSteps>
    ),
    csv_limits: (
      <Limits>
        If you are also using the <b>Crypto.com Exchange</b> then you have to connect it via API to this wallet so Koinly can import your
        trades from it.
      </Limits>
    ),
  },
  gate_io: {
    api: (
      <ApiSteps>
        <li>
          Open the Gate.io <ExtLink to="https://www.gate.io/myaccount/apikeys">API Keys</ExtLink> page
        </li>
        <li>
          Enter your <strong>fund password</strong> and <strong>TOTP</strong> (if applicable)
        </li>
        <li>
          Click <strong>show API keys</strong>
        </li>
        <li>
          Copy the <strong>Key</strong> and <strong>Secret</strong>{' '}
        </li>
        <li>
          Enable <b>API Key Read-only</b>
        </li>
      </ApiSteps>
    ),
    csv: (
      <CsvSteps>
        <li>
          Open the Gate.io <ExtLink to="https://gate.io/myaccount/mypurselog">Wallets > My Billing Details</ExtLink> page
        </li>
        <li>Select the start date and end dates (should include all dates that you traded on)</li>
        <li>
          Click on the <strong>Download</strong> button to download the file
        </li>
      </CsvSteps>
    ),
  },
  gemini: {
    api: (
      <ApiSteps>
        <li>
          Open the Gemini <ExtLink to="https://exchange.gemini.com/settings/api">API Settings</ExtLink> page
        </li>
        <li>
          Click the <strong>Create a New API Key</strong> button
        </li>
        <li>
          If applicable, enter your <strong>two-factor authentication code</strong>
        </li>
        <li>
          Copy the complete <strong>API Key</strong> (including "account-") and <strong>API Secret</strong> .
        </li>
        <li>
          <strong className="text-muted mr-2 small">RECOMMENDED</strong>Under <strong>API Key Settings</strong>, disable{' '}
          <strong>Trading</strong> and enable <strong>Auditor</strong>
        </li>
        <li>
          Selecte the checkbox indicating that you've copied the API secret and click <strong>Confirm</strong>
        </li>
      </ApiSteps>
    ),
  },
  hitbtc: {
    api: (
      <ApiSteps>
        <li>
          Open the HitBTC <ExtLink to="https://hitbtc.com/settings/api-keys">API Keys</ExtLink> page
        </li>
        <li>
          Click the <strong>New API key</strong> button
        </li>
        <li>
          Enable the following two permissions:
          <ul>
            <li>Order book, History, Trading balance</li>
            <li>Payment information</li>
          </ul>
        </li>
        <li>
          If applicable, enter your <strong>two-factor authentication code</strong>
        </li>
        <li>
          Copy the <strong>API Key</strong> and <strong>Secret</strong>{' '}
        </li>
      </ApiSteps>
    ),
  },
  huobi: {
    api: (
      <ApiSteps>
        <li>
          Open the Huobi <ExtLink to="https://www.hbg.com/en-us/apikey/">API Management</ExtLink> page
        </li>
        <li>
          Enter a <strong>note</strong> of your choice and click the <strong>Create</strong> button
        </li>
        <li>
          Enter your <strong>two-factor authentication code</strong>
        </li>
        <li>
          Copy the <strong>Access Key</strong> and <strong>Private Key</strong>{' '}
        </li>
      </ApiSteps>
    ),
    api_limits: (
      <Limits>
        Huobi only provides trade history for the past 4 months through both their web interface and API. If you have older trades we
        recommend disabling the <strong>Import historical data</strong> option and uploading your transactions file instead. You will need
        to email their support to get your complete transactions file.
      </Limits>
    ),
    csv: (
      <CsvSteps>
        <li>
          Open the Huobi <ExtLink to="https://www.hbg.com/en-us/transac/?tab=2">Transaction History / Details</ExtLink> page
        </li>
        <li>
          Click on the blue <strong>Export order details</strong> button in the top-right corner of the table to download the file
        </li>
      </CsvSteps>
    ),
    csv_limits: (
      <Limits>
        Huobi only provides trade history for the past 4 months through both their web interface and API. You will need to contact their
        support to get your full trade history.
      </Limits>
    ),
  },
  idex: {
    api: (
      <ApiSteps>
        <li>
          Open <ExtLink to="https://idex.market">IDEX.market</ExtLink>
        </li>
        <li>
          On the top right, under your profile, copy your <strong>Wallet Address</strong>
        </li>
      </ApiSteps>
    ),
  },
  ind_reserve: {
    api: (
      <ApiSteps>
        <li>
          Open <ExtLink to="https://www.independentreserve.com/Settings#ApiKeys">Independent Reserve</ExtLink>
        </li>
        <li>
          Create a new key by clicking on the <strong>generate</strong> button; do not check <strong>allow this api to withdraw</strong>
        </li>
        <li>
          Copy the <strong>API Key</strong> and <strong>API Secret</strong>{' '}
        </li>
      </ApiSteps>
    ),
    csv: (
      <CsvSteps multiple>
        <li>
          Sign into your <ExtLink to="https://www.independentreserve.com/">Independent Reserve</ExtLink> Account
        </li>
        <li>Go to your order history and download the csv file</li>
        <li>Go to transactions history and download transaction history for all assets</li>
        <li className="small mt-3">
          <strong className="text-muted mr-2">NOTE</strong>Independent Reserve exports csv files in your local timezone so you must set the
          correct timezone when importing into Koinly! Usually the Pacific/Fiji timezone works best. Click on More Options to show the
          timezone selector.
        </li>
      </CsvSteps>
    ),
  },
  kraken: {
    api: (
      <ApiSteps>
        <li>
          Sign into <ExtLink to="https://www.kraken.com">Kraken</ExtLink>
        </li>
        <li>
          Navigate to <strong>Settings</strong> -&gt; <strong>API</strong>
        </li>
        <li>
          Click the <strong>Generate New Key</strong> button
        </li>
        <li>
          Enable the following <strong>permissions</strong>:
          <ul>
            <li>Query Funds</li>
            <li>Query Closed Orders &amp; Trades</li>
            <li>Query Ledger Entries</li>
          </ul>
        </li>
        <li>
          Click the <strong>Generate Key</strong> button
        </li>
        <li>
          Copy the <strong>API Key</strong> and <strong>Private Key</strong>{' '}
        </li>
      </ApiSteps>
    ),
    csv: (
      <CsvSteps>
        <li>
          Open the <ExtLink to="https://www.kraken.com/">Kraken</ExtLink> > History > Export page
        </li>
        <li>
          Select <strong>Ledgers</strong> from the drop down list and <strong>All</strong> in time period
        </li>
        <li>Set time period to include ALL years of trading</li>
        <li>
          Click on <strong>Select All</strong> and then on <strong>Submit</strong>
        </li>
        <li>
          Wait a few seconds until the <strong>Download</strong> button appears, then click on it
        </li>
      </CsvSteps>
    ),
  },
  kucoin: {
    api: (
      <ApiSteps>
        <li>
          Open the Kucoin <ExtLink to="https://www.kucoin.com/account/api">API Keys</ExtLink> page
        </li>
        <li>
          Click the <strong>Create API</strong> button
        </li>
        <li>
          Enter a <strong>name</strong> and <strong>passphrase</strong> of your choice
        </li>
        <li>
          Enter your <strong>trading password</strong>, <strong>email verification code</strong> and{' '}
          <strong>Google verification code</strong>
        </li>
        <li>
          Copy the <strong>Passphrase</strong>, <strong>Key</strong> and <strong>Secret</strong>{' '}
        </li>
        <li>
          <strong className="text-muted mr-2 small">RECOMMENDED</strong> For additional security, disable the <strong>Trade</strong> and{' '}
          <strong>Withdraw</strong> permissions for this API key.
        </li>
      </ApiSteps>
    ),
  },
  liquid: {
    api: (
      <ApiSteps>
        <li>
          Open the Liquid <ExtLink to="https://app.liquid.com/settings/api-tokens">API</ExtLink> page
        </li>
        <li>
          Click <strong>Create a New Token</strong> button
        </li>
        <li>
          Select <strong>Accounts: Read</strong>
        </li>
        <li>
          Select <strong>Executions: Read</strong>
        </li>
        <li>Type the 2FA code (if enabled)</li>
        <li>
          Click <strong>Create an API Token</strong>
        </li>
        <li>
          Copy the <strong>Token ID (API Key)</strong> and <strong>Token Secret (API Secret)</strong>
        </li>
      </ApiSteps>
    ),
  },
  livecoin: {
    api: (
      <ApiSteps>
        <li>
          Open the Livecoin <ExtLink to="https://www.livecoin.net/api">API</ExtLink> page
        </li>
        <li>
          Click <strong>Add key</strong> and enter your password
        </li>
        <li>
          Select <strong>Type: Read only</strong>
        </li>
        <li>
          Select <strong>Enable: Trade and payment requests</strong>
        </li>
        <li>
          Click <strong>Confirm</strong>
        </li>
        <li>Type the confirmation code</li>
        <li>
          Copy the <strong>API Key</strong> and <strong>Secret Key</strong>
        </li>
      </ApiSteps>
    ),
  },
  local_bitcoins: {
    api: (
      <ApiSteps>
        <li>
          Sign into <ExtLink to="https://localbitcoins.com">LocalBitcoins</ExtLink>
        </li>
        <li>
          Navigate to <strong>Settings</strong> -&gt; <strong>Advanced</strong>
        </li>
        <li>
          Click on <strong>Manage Apps</strong> under the Third Party Applications section
        </li>
        <li>
          Click on <strong>New HMAC Authentication</strong>
        </li>
        <li>
          Type <strong>Koinly</strong> in the Name field
        </li>
        <li>
          Enable the <strong>Read</strong> permission
        </li>
        <li>
          Click the <strong>Create</strong> button
        </li>
        <li>
          Now under <strong>HMAC authentications</strong> you should see a new key with the name <strong>Koinly</strong>. Click on it.
        </li>
        <li>
          Copy the <strong>Key</strong> and <strong>Secret</strong>
        </li>
      </ApiSteps>
    ),
    csv: (
      <CsvSteps omitFinalStep>
        <li>
          Go to the <ExtLink to="https://localbitcoins.com/accounts/profile-edit/personal-data/">Profiles Page</ExtLink> on LocalBitcoins
        </li>
        <li>
          Download your <strong>Transaction History</strong> and <strong>Trade history</strong>
        </li>
        <li>
          First import the <strong>Transaction History</strong> file into Koinly →
        </li>
        <li>
          Then import the <strong>Trade history</strong> file →
        </li>
      </CsvSteps>
    ),
    api_limits: (
      <Limits>
        Only deposits/withdrawals in the last 30 days can be synced via the API. If you have older transactions you will need to add them
        manually or upload via CSV.
      </Limits>
    ),
  },
  okex: {
    csv: (
      <CsvSteps multiple>
        <li>Sign into your Okex account</li>
        <li>
          Go to <ExtLink to="https://www.okex.com/balance/report-dashboard">My Assets > Report Center</ExtLink>
        </li>
        <li>
          Click on <strong>Account History > View and Download</strong>
        </li>
        <li>
          Click on the <b>Download</b> link on the Funding Account tab
        </li>
        <li>Customize the Date Range and change the starting date to before you opened your account</li>
        <li>Click on Export and wait for report to be generated, then click on Download</li>
        <li>Repeat this process for your Trading Accounts as well</li>
      </CsvSteps>
    ),
  },
  paxful: {
    csv: (
      <CsvSteps>
        <li>Sign into your Paxful account</li>
        <li>
          Go to <b>Wallet > Transactions</b>
        </li>
        <li>
          Click on <strong>All transactions</strong>
        </li>
        <li>Export to csv</li>
      </CsvSteps>
    ),
  },
  poloniex: {
    api: (
      <ApiSteps>
        <li>
          Open the Poloniex <ExtLink to="https://poloniex.com/apiKeys">API Keys</ExtLink> page
        </li>
        <li>
          Click the <strong>Create New Key</strong> button
        </li>
        <li>
          If applicable, enter your <strong>two-factor authentication code</strong>
        </li>
        <li>
          Confirm the new API key from the <strong>verification email</strong> you receive from Poloniex
        </li>
        <li>
          Deselect the <strong>Enable Trading</strong> checkbox of the new API key
        </li>
        <li>
          Copy the <strong>API Key</strong> and <strong>Secret</strong>
        </li>
      </ApiSteps>
    ),
    csv: (
      <CsvSteps multiple>
        <li>Sign into your Poloniex account</li>
        <li>
          Click on <ExtLink to="https://poloniex.com/depositHistory">Balances > History</ExtLink>
        </li>
        <li>
          Click on <strong>Export Complete Deposit History</strong> to download your deposits
        </li>
        <li>
          Click on <strong>Export Complete Withdrawal History</strong> to download your withdrawals
        </li>
        <li>
          Click on <strong>Export Adjustments</strong> to download your airdrops
        </li>
        <li>
          Now go to <ExtLink to="https://poloniex.com/depositHistory">Orders > My Trade History & Analysis</ExtLink>
        </li>
        <li>
          Select <strong>Trade</strong> and enter your date range (Koinly needs all your trades)
        </li>
        <li>
          Click on <strong>Download</strong>. Repeat the above step for <strong>Margin Borrowings</strong> and <strong>Lending</strong>.
        </li>
      </CsvSteps>
    ),
  },
  shakepay: {
    csv: (
      <CsvSteps>
        <li>
          Sign into <ExtLink to="https://shakepay.co">Shakepay</ExtLink>
        </li>
        <li>Go to the transactions page and download the CSV</li>
      </CsvSteps>
    ),
  },
  square_cash_app: {
    csv: (
      <CsvSteps>
        <li>
          Sign into <ExtLink to="https://cash.app">Cash App</ExtLink> from a desktop computer
        </li>
        <li>Click Statements</li>
        <li>Click Export CSV</li>
      </CsvSteps>
    ),
  },
  tidex: {
    csv: (
      <CsvSteps multiple>
        <li>
          Sign into <ExtLink to="https://tidex.com/">Tidex</ExtLink>
        </li>
        <li>
          Go to the <strong>Trade History</strong> page
        </li>
        <li>
          Make sure you have <strong>All</strong> selected in the trade history dropdown, then click on <strong>To CSV</strong>
        </li>
        <li>Also download your Deposits file and Withdrawals file</li>
      </CsvSteps>
    ),
  },
  uphold: {
    csv: (
      <CsvSteps>
        <li>
          Open the Uphold <ExtLink to="https://uphold.com/dashboard/activity">Activity</ExtLink> page
        </li>
        <li>
          Click on the dropdown icon in front of <strong>Transactions</strong>
        </li>
        <li>
          Click on <strong>Download as CSV</strong>
        </li>
      </CsvSteps>
    ),
  },
}
