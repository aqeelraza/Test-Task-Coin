import { Component, Fragment } from 'react'
import connect from 'react-redux/es/connect/connect'
import { notifyError, notifyInfo } from '../../redux/reducers/notifier'
import React from 'react'
import { checkSyncStatus } from '../../redux/reducers/syncStatus'
import AppLayout from '../../layouts/AppLayout'
import PageLoader from '../../components/PageLoader'
import { Button, MoreInfo } from '../../controls/index'
import EXCHANGE_DATA from './_helpers/ExchangeInfo'
import BigFormPage from '../../components/BigFormPage'
import Form from '../../components/Form'
import FileInput from '../../controls/FileInput'
import { HiddenInput, TextInput, TextAreaInput } from '../../controls/InputControls'
import { displayDate, poll } from '../../common/index'
import axios from 'axios'
import CollectionSelect from '../../controls/CollectionSelect'
import CenteredFormPage from '../../components/CenteredFormPage'
import { CsvImportStatus, DEPOSIT_LABELS, LINKS } from '../../Constants'
import PageHeader from '../../components/PageHeader'
import timezones from '../../common/timezones.json'
import ReactJson from 'react-json-view'
import { Link } from 'react-router-dom'
import _ from 'lodash'
import EdgeImportForm from './_helpers/EdgeImportForm'
import { usingEdgeApp } from '../../common/edgeapp'
import { Modal, ModalBody, ModalHeader } from 'reactstrap'
import ReactDOM from 'react-dom'
import { toastr } from 'react-redux-toastr'

const FAKE_CSV_IMPORT = {
  id: 0,
  potential_mappers: ['asdads', 'sadasdasd'],
  state: CsvImportStatus.EnterRequiredOptions,
  error: 'Some random error occured while importing this file',
  completed_at: '2020-05-05 14:20 UTC',
  initial_rows: [
    ['31 Mar 2020', null, 'maintenance fee #0008 (lcontract/0008) #0009', 'BTC', 'BTC', null, null],
    ['17:00', null, '(lcontract/0009)', '-0.00001647', '0.00276609', null, null],
    ['31 Mar 2020', null, 'maintenance fee #0005 (/contract/0005) #0006', 'BTC', 'BTC', null, null],
    ['17:00', null, '(/contract/0006) #0007 (/contract/0007)', '-0.00002635', '0.00278256', null, null],
    ['31 Mar 2020 17:00', null, 'maintenance fee #0004 (/contract/0004)', 'BTC -0.00000989', 'BTC 0.00280891', null, null],
    ['31 Mar 2020 17:00', null, 'maintenance fee #0003 (/contract/0003)', 'BTC -0.00001647', 'BTC 0.0028188', null, null],
    ['31 Mar 2020', null, 'maintenance fee #0001 (/contract/0001) #0002', 'BTC', 'BTC', null, null],
    ['17:00', null, '(/contract/0002)', '-0.00003294', '0.00283527', null, null],
    ['30 Mar 2020 17:00', null, 'maintenance fee #0009 (lcontract/0009)', 'BTC -0.00001498', 'BTC 0.00286821', null, null],
    ['30 Mar 2020 17:00', null, 'maintenance fee #0008 (/contract/0008)', 'BTC -0.00000376', 'BTC 0.00288319', null, null],
    ['30 Mar 2020 17:00', null, 'maintenance fee', 'BTC -0.00004122', 'BTC 0.00288695', null, null],
    ['30 Mar 2020 17:00', null, 'maintenance fee #0003 (lcontract/0003)', 'BTC -0.00001874', 'BTC 0.00292817', null, null],
    ['30 Mar 2020', null, 'maintenance fee #0001 (/contract/0001) #0002', 'BTC', 'BTC', null, null],
    ['17:00', null, '(/contract/0002)', '-0.00003748', '0.00294691', null, null],
    ['29 Mar 2020 17:00', null, 'maintenance fee #0009 (/contract/0009)', 'BTC -0.0000138', 'BTC 0.00298439', null, null],
    ['Date/Time', null, 'Action', 'Amount', 'Balance', null, null],
    ['29 Mar 2020', null, 'maintenance fee #0007 (/contract/0007) #0008', 'BTC', 'BTC', null, null],
    ['17:00', null, '(/contract/0008)', '-0.00001 726', '0.00299819', null, null],
    ['29 Mar 2020', null, 'maintenance fee #0004 (/contract/0004) #0005', 'BTC', 'BTC', null, null],
    ['17:00', null, '(/contract/0005) #0006 (/contract/0006)', '-0.00002417', '0.00301545', null, null],
  ],
  results: {
    total_count: 6,
    success_count: 2,
    skipped_count: 1,
    duplicate_count: 1,
    error_count: 4,
    errors: {
      'Currency with symbol = BSDTC not found for cex_io!': 1,
      'Currency with symbol = BRERRTC not found for cex_io!': 1,
    },
    skipped: {
      'amount is zero': 3,
      'dividend not needed': 2,
    },
    bad_rows: [
      {
        id: 2,
        row: { yo: 1, to: 2, hello: { omg: 1 } },
        message: 'random error',
      },
      {
        id: 2,
        row: { yo: 1, to: 2, hello: { omg: 1 } },
        message: 'random error',
      },
      {
        id: 2,
        row: { yo: 1, to: 2, hello: { omg: 1 } },
        message: 'random error',
      },
      {
        id: 2,
        row: { yo: 1, to: 2, hello: { omg: 1 } },
        message: 'random error',
      },
    ],
  },
}

class RequestAssistanceBtn extends React.Component {
  state = {
    open: false,
  }

  constructor(props) {
    super(props)
    this.portalRoot = document.getElementById('portal')
    this.el = document.createElement('div')
  }

  componentDidMount() {
    this.portalRoot.appendChild(this.el)
  }

  componentWillUnmount() {
    this.portalRoot.removeChild(this.el)
  }

  onSuccess = () => {
    toastr.info('Request has been submitted. Current processing times are between 5-10 working days')
    this.setState({ open: false, requestComplete: true })
  }

  renderUnknownCsvForm(url) {
    return (
      <Form post={{ url }} onSuccess={this.onSuccess} submitText={'Submit request'}>
        <TextInput title={'Where did you download this file from? Please provide page url.'} name={'file_source'} required />
        <TextAreaInput title={'Any other info about this file...'} name={'info'} placeholder={'Ex. I copy/pasted this from the website'} />
      </Form>
    )
  }

  renderErrorsForm(url) {
    return (
      <Form post={{ url }} onSuccess={this.onSuccess} submitText={'Submit request'}>
        <TextAreaInput title={'Describe your issue...'} name={'info'} required />
      </Form>
    )
  }

  render() {
    if (this.state.requestComplete) {
      return null
    }

    let csvImport = this.props.csvImport
    let url = `/api/csv_imports/${csvImport.id}/help`
    let modal = (
      <Modal isOpen={this.state.open} toggle={() => this.setState({ open: false })}>
        <ModalHeader toggle={() => this.setState({ open: false })}>Requesting assistance</ModalHeader>
        <ModalBody>
          {this.props.unknownCsv ? this.renderUnknownCsvForm(url) : this.renderErrorsForm(url)}
          <div className="pt-3 small text-muted font-italic">
            * Import assistance for new files is only available for users on the paid plans and is based on a priority system, we aim to
            respond to all such requests within 5-10 business days.
          </div>
        </ModalBody>
      </Modal>
    )

    return (
      <>
        <div className="d-flex align-items-center pt-4">
          <Button color={'primary'} onClick={() => this.setState({ open: true })}>
            <i className={'fas fa-question-circle pr-2 small'} />
            Request assistance
          </Button>
          <div className="small text-muted pl-2 font-italic">{this.props.info}</div>
        </div>
        {ReactDOM.createPortal(modal, this.el)}
      </>
    )
  }
}

const SummaryRowItem = ({ className, text, count }) => (
  <li className={'list-item text-white px-3 py-1 my-1 d-flex align-items-center border rounded ' + className}>
    <span style={{ fontSize: '2rem' }}>{count}</span>
    <span className={'px-2 font-weight-bold'}>x</span> {text}
  </li>
)

const ImportComplete = ({ csvImport, onBack, onRestart }) => (
  <div className="page-body container">
    <div className="row">
      <div className={'col d-flex justify-content-between align-items-center'}>
        <div className={'d-flex'}>
          <i className="fas fa-check-circle text-success pr-2 mt-2" style={{ fontSize: '3em' }} />
          <PageHeader title="Import completed" subtitle={displayDate(csvImport.completed_at)} noCenter />
        </div>
        <div>
          <Button color={'secondary'} onClick={onRestart}>
            Import more...
          </Button>
          <Button color={'primary'} className={'ml-3'} onClick={onBack}>
            Back to wallets
          </Button>
        </div>
      </div>
    </div>

    <div className="row">
      <ul className="col">
        <SummaryRowItem count={csvImport.results.success_count} text={'transactions added'} className={'bg-success'} />
        {csvImport.results.duplicate_count > 0 && (
          <SummaryRowItem count={csvImport.results.duplicate_count} text={'duplicates skipped'} className={'bg-info'} />
        )}
        {csvImport.results.skipped &&
          Object.keys(csvImport.results.skipped).map(key => (
            <SummaryRowItem count={csvImport.results.skipped[key]} text={'rows skipped because: ' + key} className={'bg-info'} />
          ))}
        {csvImport.results.errors &&
          Object.keys(csvImport.results.errors).map(key => (
            <SummaryRowItem count={csvImport.results.errors[key]} text={key} className={'bg-danger'} />
          ))}
      </ul>
    </div>

    {csvImport.results.bad_rows && csvImport.results.bad_rows.length > 0 && (
      <div className="row">
        <div className="col">
          <h3 className="pt-4">{csvImport.results.error_count} rows were not imported</h3>
          <p className={'small text-muted'}>
            Usually errors occur when the 'amount' field contains zero value (ignore these) or the currency is not found in our database.
            For currency-related issues you will need to find the correct ticker name for the coin on <Link to="/markets">this page</Link>{' '}
            (or on coinmarketcap) and change it in the csv file then re-upload it. For other errors, you can request assistance.
          </p>

          <table className="table table-striped">
            <tbody>
              {csvImport.results.bad_rows.map(row => (
                <tr>
                  <td>
                    <ReactJson src={row.row} enableClipboard={false} name={`Row #${row.id}`} displayDataTypes={false} collapsed={true} />
                  </td>
                  <td className="text-danger">{row.message}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    )}

    {(csvImport.results.error_count > 0 || csvImport.results.skipped_count > 0) && (
      <RequestAssistanceBtn
        info={'Notice any issues with this import? Request assistance and our support team will help you out.'}
        csvImport={csvImport}
      />
    )}
  </div>
)

const UnknownCsv = ({ csvImport, user }) => (
  <div className="page-body container">
    <PageHeader title={'Unable to import file'} className={'pb-2'} showBack left />
    <p className="text-muted pb-3">
      This file could not be imported automatically, follow the tips below to resolve this or request assistance if you need help.
    </p>

    {csvImport.initial_rows && csvImport.initial_rows.length > 0 && (
      <>
        <table className="table table-striped table-bordered bg-white mb-4 shadow-sm">
          <thead>
            <tr>
              <th scope="col" className={'border-right'}>
                #
              </th>
              {csvImport.initial_rows[0].map((col, i) => (
                <th scope="col" className="border-right text-uppercase font-weight-bold">
                  {(i + 10).toString(36)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {csvImport.initial_rows.slice(0, 5).map((row, idx) => (
              <tr className={'small'}>
                <th scope="row" className={'font-weight-bold border-right'}>
                  {idx + 1}
                </th>
                {row.map(col => (
                  <td className="border-right">{col}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </>
    )}

    <p>
      <b>If this file was downloaded from an exchange/wallet:</b>
      <ul>
        <li className={'pt-3 small'}>
          Redownload a fresh file and upload it to Koinly - your file might have become corrupted after being opened in excel, redownloading
          usually fixes this.
        </li>
        <li className={'pt-3 small'}>
          Try to find a different file from the exchange - look for the ledger or transaction history export. Also try the Trade History
          file instead of Order History and vice versa.
        </li>
        <li className={'pt-3 small'}>
          Make sure to download the <b>English version</b> of the file.
        </li>
      </ul>
    </p>

    <p className={'pt-3'}>
      <b>If you created this file yourself or copy/pasted from the web:</b>
      <ul>
        <li className={'pt-3 small'}>
          Make sure the file is a valid CSV or Excel file - open it in a text editor and inspect the contents - does it look readable?
        </li>
        <li className={'pt-3 small'}>
          Convert your file to Koinly's{' '}
          <a href={LINKS.custom_import_guide} target="_BLANK">
            Custom File Import Format
          </a>
          .
        </li>
        <li className={'pt-3 small'}>Check that the file headers match the Koinly custom file headers and look for typos</li>
      </ul>
    </p>

    <RequestAssistanceBtn
      info={'Not sure how to import this file? Request import assistance and our support team will help you out.'}
      csvImport={csvImport}
      unknownCsv
    />
  </div>
)

const ImportFailed = ({ csvImport }) => (
  <BigFormPage title="Failed to import file">
    <p className="alert alert-danger">{csvImport.error}</p>
    <p className="mt-3 small text-muted">Contact us via Live Chat or Email if you need help with this.</p>
  </BigFormPage>
)

const ProcessingFailed = ({ csvImport }) => (
  <BigFormPage title="Unable to read file">
    <p className="alert alert-danger mb-4">{csvImport.error}</p>

    <h4>Why am I seeing this error?</h4>
    <p className="text-muted pb-2">
      The file you uploaded is not a valid CSV or Excel file. This can happen when you copy/paste from the web or modify a downloaded file
      using Excel. Some exchanges are also known to generate faulty files.
    </p>

    <h4>How do I fix this?</h4>
    <p className="text-muted">
      Luckily, this error can be fixed quite easily and does not require any technical knowledge.{' '}
      <a href={LINKS.file_processing_error_guide} target="_BLANK">
        How To Fix Invalid Spreadsheets
      </a>
    </p>
  </BigFormPage>
)

const EnterMapperId = ({ csvImport, onSuccess, submitButton }) => (
  <CenteredFormPage
    title="Need more info"
    update={{ url: `/api/csv_imports/${csvImport.id}`, root: 'csv_import' }}
    onSuccess={onSuccess}
    submitButton={submitButton}
  >
    <CollectionSelect
      title="What kind of file is this?"
      name="mapping_id"
      value={csvImport.potential_mappers[0]}
      options={csvImport.potential_mappers}
      autoselect
      required
    />
  </CenteredFormPage>
)

const EnterRequiredOptions = ({ csvImport, onSuccess, submitButton }) => (
  <CenteredFormPage
    title="Need more info"
    update={{ url: `/api/csv_imports/${csvImport.id}`, root: 'csv_import' }}
    onSuccess={onSuccess}
    submitButton={submitButton}
  >
    <CollectionSelect
      title={'Which currency/token are these transactions for?'}
      placeholder="Select currency"
      name={'currency_id'}
      url={`/api/currencies?q[fiat_true]=0`}
      search={query => ({ 'q[symbol_or_name_start]': query })}
      optionLabel={o => o.symbol}
      optionSubtext={o => o.name}
      optionIcon={o => o.icon}
      required
    />
  </CenteredFormPage>
)

const ImportForm = ({ wallet, info, onSuccess, submitButton }) => (
  <div className="page-body container">
    <PageHeader title={'Import from file'} className={'pb-2'} showBack left />
    <div className="row">
      <div className={`col-10 col-md-6`}>
        <p className="text-muted">
          Download your transaction files for <b>all years</b> of trading from {wallet.name} and upload them here. Koinly needs your
          deposits, withdrawals & trades.
        </p>
        <Form post={{ url: '/api/csv_imports', root: 'csv_import' }} onSuccess={onSuccess} submitButton={submitButton} multipart>
          <HiddenInput name="wallet_id" value={wallet.id} />
          <FileInput
            name="file"
            fileNameField="file_name"
            // this fails for some xls files and on binance trade.xlsx on windows because they are compressed:
            // acceptedFileTypes={[
            //   '',
            //   'text/csv',
            //   'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            //   'application/vnd.ms-excel'
            // ]}
            // fileValidateTypeLabelExpectedTypes="Expects a spreadsheet"
            maxFileSize="10MB"
            required
          />

          <MoreInfo title={'More options'}>
            <CollectionSelect
              title="Timezone"
              name="timezone"
              help="You should only set a timezone here if your CSV file contains dates that are not in UTC."
              options={timezones}
              placeholder={'Default'}
              isClearable
            />
            <CollectionSelect title="Mark deposits as" name="deposit_label" options={DEPOSIT_LABELS} isClearable />
          </MoreInfo>
        </Form>
      </div>
      <div className="col-10 offset-1 col-md-6 offset-md-0">
        {info && (info.csv || info.csv_limits) && (
          <Fragment>
            <div className="alert alert-info small">{info.csv}</div>
            {info.csv_limits}
          </Fragment>
        )}
      </div>
    </div>
  </div>
)

class ImportPage extends Component {
  state = {
    // csvImport: FAKE_CSV_IMPORT,
    // importing: CsvImportStatus.Pollable.includes(FAKE_CSV_IMPORT.state),
  }

  onSuccess = csvImport => {
    this.setState({ csvImport, importing: false })
    if (csvImport.state === CsvImportStatus.Completed) {
      window.Intercom('trackEvent', csvImport.results.errorCount > 0 ? 'file-imported-with-errors' : 'file-imported', {
        wallet: _.get(csvImport, 'wallet.name'),
        file: csvImport.url,
        successCount: csvImport.results.successCount,
        errorCount: csvImport.results.errorCount,
        csv_import_id: csvImport.id,
      })
      this.props.checkSyncStatus()
    } else if (csvImport.state === CsvImportStatus.UnknownCsv) {
      window.Intercom('trackEvent', 'file-import-failed', {
        wallet: _.get(csvImport, 'wallet.name'),
        file: csvImport.url,
        reason: 'no mappers found',
      })
    } else if (CsvImportStatus.Pollable.includes(csvImport.state)) {
      this.setState({ importing: true })
      poll(
        (resolve, reject) =>
          axios.get(`/api/csv_imports/${csvImport.id}`).then(res => {
            if (CsvImportStatus.Pollable.includes(res.data.state)) {
              resolve(false)
            } else {
              this.onSuccess(res.data)
              resolve(true)
            }
          }),
        {
          delay: 1000,
          interval: 2000,
          timeout: 600000,
        }
      )
    }
  }

  importButton = submitting => (
    <div>
      <Button color="primary" type="submit" isLoading={submitting || this.state.importing}>
        {this.state.csvImport && [CsvImportStatus.EnterMapperId, CsvImportStatus.EnterRequiredOptions].includes(this.state.csvImport.state)
          ? 'Continue'
          : 'Import'}
      </Button>
      {this.state.importing && <h5 className="small text-muted p-2">Importing, please wait...</h5>}
    </div>
  )

  renderContent() {
    const wallet = this.state.wallet || this.props.location.state
    if (!wallet) {
      return <PageLoader url={`/api/wallets/${this.props.match.params.id}`} onLoad={wallet => this.setState({ wallet })} />
    }

    let csvImport = this.state.csvImport
    if (csvImport) {
      switch (csvImport.state) {
        case CsvImportStatus.EnterRequiredOptions:
          return <EnterRequiredOptions csvImport={csvImport} onSuccess={this.onSuccess} submitButton={this.importButton} />
        case CsvImportStatus.EnterMapperId:
          return <EnterMapperId csvImport={csvImport} onSuccess={this.onSuccess} submitButton={this.importButton} />
        case CsvImportStatus.UnknownCsv:
          return <UnknownCsv csvImport={csvImport} user={this.props.session} />
        case CsvImportStatus.Failed:
          return <ImportFailed csvImport={csvImport} user={this.props.session} />
        case CsvImportStatus.ProcessingFailed:
          return <ProcessingFailed csvImport={csvImport} user={this.props.session} />
        case CsvImportStatus.Completed:
          return (
            <ImportComplete
              csvImport={csvImport}
              onBack={() => this.props.history.goBack()}
              onRestart={() => this.setState({ csvImport: null })}
            />
          )
        default:
      }
    }

    if (wallet.wallet_service && wallet.wallet_service.tag === 'edge_app' && usingEdgeApp()) {
      return <EdgeImportForm onSuccess={this.onSuccess} wallet={wallet} />
    } else {
      return (
        <ImportForm
          onSuccess={this.onSuccess}
          submitButton={this.importButton}
          info={wallet.wallet_service && EXCHANGE_DATA[wallet.wallet_service.tag]}
          wallet={wallet}
        />
      )
    }
  }

  render() {
    return <AppLayout>{this.renderContent()}</AppLayout>
  }
}

function mapStateToProps({ session }) {
  return { session }
}

export default connect(mapStateToProps, { notifyError, notifyInfo, checkSyncStatus })(ImportPage)
