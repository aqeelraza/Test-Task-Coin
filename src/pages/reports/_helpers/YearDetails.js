import React, { Component, Fragment } from 'react'
import { Link } from 'react-router-dom'
import { Badge, ListGroup, ListGroupItem, UncontrolledCollapse, Button } from 'reactstrap'
import { Button as AtlasBtn } from '../../../controls'
import { formatMoney, poll, math } from '../../../common'
import { LINKS } from '../../../Constants'
import { GAIN_REALIZATION_MODES, COST_TRACKING_METHODS } from '../../../Constants'
import RoundFaIcon from '../../../components/RoundFaIcon'
import { connect } from 'react-redux'
import axios from 'axios'
import SectionMessage from '@atlaskit/section-message'
import Info from '../../../components/Info'
import Form from '../../../components/Form'
import { HiddenInput } from '../../../controls'
import CollectionSelect from '../../../controls/CollectionSelect'
import { notifyInfo } from '../../../redux/reducers/notifier'
import { getDeltaColor } from '../../../common'
import moment from 'moment'
import Tooltip from '../../../components/Tooltip'
import { canShowGains, getCostBasisMethodName } from '../../../common'
import { validServerToken } from '../../../common/csrf-token'

function MainItem({ title, subtitle, action, help, whiteBg }) {
  return (
    <ListGroupItem
      className={'border-top-0 border-left-0 border-right-0 border-bottom-0'}
      style={{ backgroundColor: whiteBg ? 'white' : '#f8f9fa' }}
    >
      <div className="d-flex">
        <div className="my-auto mr-auto">
          <h5 className="mb-0">
            {title}
            {help && <Info text={help} size="1rem" />}
          </h5>
          {subtitle && <small className="text-muted">{subtitle}</small>}
        </div>
        <div className="my-auto ml-3">
          <h5 className="mb-0">{action}</h5>
        </div>
      </div>
    </ListGroupItem>
  )
}

function SubItem({ title, subtitle, action, help, bold }) {
  return (
    <ListGroupItem className="border-0" action>
      <div className="d-flex">
        <div className="my-auto mr-auto">
          <h5 style={{ fontSize: '1rem' }} className="mb-0">
            {title}
            {help && <Info text={help} />}
          </h5>
        </div>
        <div className="my-auto ml-3 text-right" style={{ fontSize: '1rem' }}>
          {bold ? <span style={{ fontSize: '1.1rem' }}>{action}</span> : action}
        </div>
      </div>
    </ListGroupItem>
  )
}

const FaqItem = ({ title, description, action, link }) => (
  <ListGroupItem className="border-left-0 border-right-0 border-bottom-0 py-0" style={{ borderColor: '#eeeeee' }} action>
    <div id={title.replace(/[^A-Za-z]/g, '')} className="py-2">
      <a href="#">{title}</a>
    </div>
    <UncontrolledCollapse toggler={title.replace(/[^A-Za-z]/g, '')}>
      <div className="pt-2 border-top-1 text-muted">
        {description}
        <div className="text-right py-2">
          <Button
            color="link"
            to={link.startsWith('http') ? undefined : link}
            href={link.startsWith('http') ? link : undefined}
            tag={link.startsWith('http') ? 'a' : Link}
            target={link.startsWith('http') ? '__BLANK' : undefined}
          >
            {action}
            <i className={`fa fa-chevron-right px-2 ml-auto`} />
          </Button>
        </div>
      </div>
    </UncontrolledCollapse>
  </ListGroupItem>
)

const MissingTransactionWarning = ({ stats, user }) => {
  if (stats.capital_gains.failed === 0) {
    return (
      <>
        We detected some issues with the following wallets, click on each wallet to review the issues before continuing with your tax
        report.
      </>
    )
  }

  if (!stats.zero_cost_gains_total || math.decimal(stats.zero_cost_gains_total) < 1) {
    return null
  }

  let taxEstimate = math.mul(math.div(stats.zero_cost_gains_total, 2), 0.25)
  taxEstimate = math.min(taxEstimate, stats.capital_gains.net)

  let taxEstimateTax = null
  if (math.pos(taxEstimate)) {
    taxEstimateTax = (
      <>
        You can reduce your taxes by approx. <b>{formatMoney(taxEstimate, user.base_currency)}</b>{' '}
        <Info text={'Assuming a tax rate of 25% and original cost of 50%'} /> by fixing some issues in your wallets. You may also ignore
        this warning and submit your tax reports with the zero cost basis (this is allowed by tax authorities).
      </>
    )
  } else {
    taxEstimateTax = (
      <>
        You can review your wallets to fix this (optional) or ignore this warning and submit your tax reports with the zero cost basis (this
        is allowed by tax authorities).
      </>
    )
  }

  return (
    <>
      We have assumed a cost of zero for some assets that were sold for{' '}
      <b>{formatMoney(stats.zero_cost_gains_total, user.base_currency)}</b>. {taxEstimateTax}{' '}
      <a href={LINKS.missing_cost_basis} target="_BLANK">
        Learn more
      </a>
      <br />
      <br />
      These wallets contain unresolved issues:
    </>
  )
}

class YearDetails extends Component {
  REPORT_TYPES = [
    {
      title: 'IRS Report (Form 8949 & Schedule D)',
      type: 'IrsReport',
      formats: ['pdf'],
      countries: ['USA'],
    },
    {
      title: 'Blankett K4 (pdf)',
      type: 'SkatteverketK4Report',
      formats: ['pdf'],
      countries: ['SWE'],
    },
    {
      title: 'Blankett K4 (digital)',
      type: 'K4DigitalReport',
      formats: ['zip'],
      countries: ['SWE'],
    },
    {
      title: 'HMRC Capital Gains Summary',
      type: 'HmrcReport',
      formats: ['pdf'],
      countries: ['GBR'],
    },
    {
      title: 'Fortjeneste og tab',
      type: 'DanishReport',
      formats: ['pdf'],
      countries: ['DNK'],
    },
    {
      title: 'Skatteetaten Rf1159b',
      type: 'Rf1159Report',
      formats: ['pdf', 'csv'],
      countries: ['NOR'],
    },
    {
      title: 'Swiss Valuation Report',
      type: 'SwissValuationReport',
      formats: ['xls'],
      countries: ['CHE'],
    },
    {
      title: 'Formulaire 2086',
      type: 'FranceReport',
      formats: ['xls'],
      countries: ['FRA'],
    },
    {
      title: 'Turbotax Online',
      type: 'TurbotaxReport',
      formats: ['csv'],
      countries: ['USA', 'CAN'],
    },
    {
      title: 'Turbotax CD/DVD',
      type: 'TurbotaxCdReport',
      formats: ['txf'],
      countries: ['USA', 'CAN'],
    },
    {
      title: 'TaxAct Export',
      type: 'TaxactReport',
      formats: ['csv'],
      countries: ['USA', 'CAN'],
    },
    {
      title: 'Lomake 9A',
      type: 'FinnishReport',
      formats: ['pdf'],
      countries: ['FIN'],
    },
    {
      title: 'Complete Tax Report',
      type: 'FullTaxReport',
      formats: ['pdf'],
    },
    {
      title: 'Capital Gains Report',
      type: 'CapitalGainsReport',
      formats: ['csv'],
    },
    {
      title: 'Income Report',
      type: 'IncomeReport',
      formats: ['csv'],
    },
    {
      title: 'Margin Trading Report',
      type: 'MarginReport',
      formats: ['csv'],
    },
    {
      title: 'Gifts, Donations & Lost Assets',
      type: 'SpecialTxnsReport',
      formats: ['csv'],
    },
    {
      title: 'Expenses Report',
      type: 'ExpenseReport',
      formats: ['csv'],
    },
    {
      title: 'End of Year Holdings Report',
      type: 'EndOfYearHoldingsReport',
      formats: ['xls', 'csv'],
    },
    {
      title: 'Highest Balance Report / FBAR',
      type: 'HighestBalanceReport',
      formats: ['csv'],
    },
    {
      title: 'Buy/Sell Report',
      type: 'BuySellReport',
      formats: ['csv'],
    },
    {
      title: 'Transaction History',
      type: 'TransactionsReport',
      formats: ['csv'],
    },
  ]

  state = {}

  renderCapitalGainsNumber(gains) {
    if (canShowGains(this.props.session) && !this.hideCapitalGains()) {
      return formatMoney(gains, this.props.session.base_currency)
    } else {
      if (this.hideCapitalGains()) {
        return (
          <Tooltip content={'You need to review your wallets before you can see your capital gains'}>
            <span>••••.••</span>
          </Tooltip>
        )
      } else {
        return (
          <Tooltip
            content={'Purchase a tax plan to see your gains for this year or go to the Dashboard to see a preview of your overall gains'}
          >
            <span>••••.••</span>
          </Tooltip>
        )
      }
    }
  }

  hideCapitalGains() {
    return false
    // return this.props.reviewable && this.props.reviewable.bad_wallets.length > 0;
  }

  renderReviewableWallets(reviewable, stats, user) {
    if (!reviewable || !stats) {
      return (
        <p className="small mb-3 text-muted">
          <div className={'spinner-border spinner-border-xs text-secondary'} /> Verifying your data...
        </p>
      )
    }

    if (reviewable.total_wallets === 0) {
      return (
        <p className="small mb-3 text-muted">
          <i className="fas fa-info-circle text-primary" /> Add some wallets or exchange accounts to see your taxes
        </p>
      )
    }

    if (!reviewable.bad_wallets || reviewable.bad_wallets.length === 0) {
      return (
        <p className="small mb-3 text-muted">
          <i className="fas fa-check text-success" /> Everything looks good!
        </p>
      )
    }

    return (
      <div className="border mb-4">
        <SectionMessage appearance="warning">
          <p>
            <h3>Review needed</h3>
            <p className="small text-muted">
              <MissingTransactionWarning stats={stats} user={user} />
            </p>
            <ol>
              {reviewable.bad_wallets.map(wallet => (
                <li>
                  <Link to={`/wallets/${wallet.id}/troubleshoot`}>{wallet.name}</Link>{' '}
                  <span className="small text-muted">added {moment(wallet.created_at).fromNow()}</span>
                </li>
              ))}
            </ol>
          </p>
        </SectionMessage>
      </div>
    )
  }

  renderCapitalGains(stats, user) {
    let capitalGains = stats.capital_gains
    let margin = stats.margin
    let transactions = stats.transactions
    let baseUrl = `/transactions?from=${moment(stats.from).toISOString()}&to=${moment(stats.to).toISOString()}`
    return (
      <ListGroup className={`border rounded mb-4 whitebg`}>
        <MainItem title="Summary" />
        <ListGroupItem className="border-left-0 border-right-0 border-top-0 border-bottom-1 mb-1">
          <p className="small">
            Koinly needs your full transaction history (fiat → crypto → crypto → fiat) in order to calculate your tax reports correctly. The
            transactions used in this report are summarized below.
          </p>

          <Badge color="info" className="px-2 mr-1" tag={Link} to={baseUrl}>
            {transactions.total} transactions
          </Badge>
          <Badge color="secondary" className="px-2 mx-1" tag={Link} to={`${baseUrl}&type=crypto_deposit`}>
            {transactions.deposits} deposits
          </Badge>
          <Badge color="secondary" className="px-2 mx-1" tag={Link} to={`${baseUrl}&type=crypto_withdrawal`}>
            {transactions.withdrawals} withdrawals
          </Badge>
          <Badge color="secondary" className="px-2 mx-1" tag={Link} to={`${baseUrl}&type=trade`}>
            {transactions.trades} trades
          </Badge>
          <Badge color="secondary" className="px-2 mx-1" tag={Link} to={`${baseUrl}&type=transfer`}>
            {transactions.transfers} transfers
          </Badge>

          {/*{transactions.errors > 0 && <Badge*/}
          {/*color="warning"*/}
          {/*className="px-2 mx-1"*/}
          {/*tag={Link}*/}
          {/*to={`${baseUrl}&negative_balances=1`}*/}
          {/*>*/}
          {/*{transactions.errors} warnings*/}
          {/*</Badge>}*/}
          {/*{stats.capital_gains.failed > 0 && <MissingTransactionWarning user={user} stats={stats} baseUrl={baseUrl}/>}*/}
        </ListGroupItem>
        <SubItem
          title="Capital gains / P&L"
          help="This is the total profit or loss that you made from all your crypto trades"
          action={<span style={{ color: getDeltaColor(capitalGains.net) }}>{this.renderCapitalGainsNumber(capitalGains.net)}</span>}
          bold
        />
        <SubItem
          title="Gains from Futures"
          help={
            user.treat_margin_gains_as_capital_gains
              ? 'Margin gains are already included in your capital gains'
              : 'Margin gains are not included in your capital gains so you may want to take them up elsewhere on your tax return'
          }
          action={<span style={{ color: getDeltaColor(margin.net) }}>{formatMoney(margin.net, user.base_currency)}</span>}
          bold
        />
        <SubItem
          title="Income"
          help="This is your income from airdrops, forks, loan interests etc"
          action={formatMoney(stats.income.total, user.base_currency)}
          bold
        />
        <SubItem
          title="Costs & expenses"
          help="These are extra costs that were not included in your capital gains calculations. You may be able to deduct them in your tax return"
          action={formatMoney(stats.expenses.total, user.base_currency)}
          bold
        />
        <SubItem
          title="Gifts, donations & lost coins"
          help={'This is the value of all your gifted, donated and lost coins. No gains were realized for these transactions.'}
          action={formatMoney(stats.special.total, user.base_currency)}
          bold
        />
        <ListGroupItem className="border-left-0 border-right-0 border-bottom-0 small text-muted">
          Note: This is just an indication of your taxable gains. Download a Tax Report to see your short/long-term proceeds, cost-basis,
          disposals and detailed calculations that you can use in your official tax returns.
        </ListGroupItem>
      </ListGroup>
    )
  }

  renderTroubleshooting(stats, user) {
    let baseUrl = `/transactions?from=${moment(stats.from).toISOString()}&to=${moment(stats.to).toISOString()}`
    return (
      <ListGroup className="border rounded mb-4 whitebg">
        <MainItem title="Help" />
        <FaqItem
          title="My capital gains are too high/wrong!"
          description="This can happen for several reasons, the most common is that transfers between your own wallets have not matched correctly or you forgot to add some of your wallets. Make sure you have read our Getting started guide first, then review the transactions with the highest gains to locate the problem."
          action="Show me transactions with high gains"
          link={`${baseUrl}&order=gain`}
        />
        <FaqItem
          title="Some of my income seems to be missing!"
          description="Koinly can usually auto-tag your income but in some cases that may not happen (for ex. if you are importing a custom csv file), in such cases you should review your deposits to ensure any income transactions are tagged appropriately."
          action="Review crypto deposits"
          link={`${baseUrl}&type=crypto_deposits`}
        />
        <FaqItem
          title="How do I ensure my tax report is accurate?"
          description={
            <p>
              <b>1. Import everything</b>
              <br />
              First of all you need to make sure you have imported ALL your data. This is the key to a correct tax report. You need to
              import data even for exchanges that you no longer use and for years that you have already filed taxes for. Why? Well, let's
              say you bought 1 BTC for $1000 a few years ago on Cryptopia and later transferred it to Coinbase. If you don't add your
              Cryptopia transactions then Koinly has no way of knowing how much you paid for them initially.
              <br />
              <br />
              <b>2. Ensure it's correct</b>
              <br /> The next thing you want to do is ensure all your transactions have been imported correctly - many exchanges won't give
              you full data so it's important to know when that's the case. Luckily, you don't need to sift through all your transactions
              manually. Simply compare the balances for each of your wallets on Koinly with the actual balances on your wallet/exchange
              account. Koinly calculates your balances from the imported transaction history so if the balances match, it means all your
              data was imported correctly otherwise some transactions are probably missing.{' '}
              <a href={LINKS.reviewing_transactions}>Learn more</a>
            </p>
          }
          action="Review wallet balances"
          link="/wallets"
        />
        <FaqItem
          title="How do I use Koinly?"
          description="We have written up a short guide on how to use Koinly and ensure your tax report is accurate. It only takes about 10-20 minutes to go through it so we highly recommend you check it out!"
          action="Take me to the guide"
          link={LINKS.getting_started}
        />
      </ListGroup>
    )
  }

  onReportCreated = report => {
    if (report.send_email) {
      this.props.notifyInfo('Your report is being generated, you will receive a download link via email when its ready!')
      return
    }
    this.setState({ generatingReport: true, lastReportLink: null })
    let year = this.props.year
    poll(
      (resolve, reject) =>
        axios.get(`/api/reports/${report.id}`).then(res => {
          if (res.data.generated_at) {
            if (res.data.url) {
              window.Intercom('trackEvent', 'report-generated', { name: res.data.name, year: year, file: res.data.url })
              window.open(res.data.url, '_blank')
            }
            this.setState({ generatingReport: false, lastReportLink: res.data.url })
            resolve(true)
          } else {
            resolve(false)
          }
        }),
      {
        delay: 1000,
        interval: 2000,
        timeout: 300000,
      }
    )
  }

  renderReports(stats, user) {
    const submitBtn = submitting => (
      <div>
        {!this.props.session.active_subscription && (
          <div className="small mb-4 mx-auto">
            <SectionMessage appearance="error">
              You must have an active tax plan to download reports. Click <Link to="/plans">here</Link> to view available plans.
            </SectionMessage>
          </div>
        )}
        {this.props.syncStatus && (
          <div className="small mb-4 mx-auto">
            <SectionMessage appearance="warning">
              Your portfolio is being updated. You should wait for this to finish to avoid generating inaccurate reports.
            </SectionMessage>
          </div>
        )}
        <AtlasBtn color="primary" type="submit" isLoading={submitting || this.state.generatingReport} shouldFitContainer>
          Download Report
        </AtlasBtn>
        {this.state.generatingReport && <h5 className="small text-muted p-2">Generating report, please wait...</h5>}
        {!this.state.generatingReport && this.state.lastReportLink && (
          <h5 className="small text-muted p-2">
            Your report is ready. If download doesn't start, right click on this link and select Save link As:{' '}
            <a href={this.state.lastReportLink} target={'_blank'}>
              View report
            </a>
          </h5>
        )}
      </div>
    )

    return (
      <ListGroup className="border rounded mb-3 p-4 whitebg">
        <Form post={{ url: '/api/reports', root: 'report' }} onSuccess={this.onReportCreated} submitButton={submitBtn}>
          <HiddenInput name="year" value={this.props.year} />
          <CollectionSelect
            title="Pick a report type"
            name="type"
            options={this.REPORT_TYPES.filter(opt => !opt.countries || opt.countries.includes(user.country.code))}
            optionLabel={o => o.title}
            optionId={o => o.type}
            onChange={item => this.setState({ selectedReport: item })}
            required
          />
          {/*this is not working right, value change is not reflected on ui*/}
          {/*{this.state.selectedReport && this.state.selectedReport.formats.length > 1 &&*/}
          {/*<PillsInput title="Report Type" name="format" items={this.state.selectedReport.formats} value={this.state.selectedReport.formats[0]}/>*/}
          {/*}*/}
          {this.state.selectedReport && <HiddenInput name="format" value={this.state.selectedReport.formats[0]} />}
          {this.state.selectedReport && this.state.selectedReport.type === 'K4DigitalReport' && (
            <div className="small mb-4 mx-auto">
              <SectionMessage appearance="info">
                Please ensure you have entered your Personnummer (12 siffror), Postkod and Postort on the Settings page before downloading
                this report.
              </SectionMessage>
            </div>
          )}
          {this.state.selectedReport && this.state.selectedReport.type === 'FinnishReport' && (
            <div className="small mb-4 mx-auto">
              <SectionMessage appearance="info">
                Please ensure you have entered your Personal Identity Code on the Settings page before downloading this report.{' '}
                {stats.transactions.total > 500 &&
                  'Note that since only 4 transactions can be entered per page, we will aggregate your transactions to reduce the total number of pages. You can download your Capital Gains Report to see all transactions separately.'}
              </SectionMessage>
            </div>
          )}
          <HiddenInput name="send_email" value={stats.transactions.total > 500} />
        </Form>
      </ListGroup>
    )
  }

  renderProgress(stats) {
    return (
      <div className="mb-4 text-center px-3">
        <span className="spinner-border text-primary mb-3" role="status" style={{ verticalAlign: 'middle', width: '5rem', height: '5rem' }}>
          <span className="sr-only">Calculating...</span>
        </span>

        <h5 className="mb-2" style={{ fontSize: '14px' }}>
          Your gains are being calculated
        </h5>
        <h5 className="mb-2">
          <Tooltip content={'Your gains are being calculated, reload this page in a few minutes'} tag="span">
            <div>{stats.gains_progress}%...</div>
          </Tooltip>
        </h5>
      </div>
    )
  }

  renderTaxInfo(stats, user) {
    let gotGains = !math.zero(stats.capital_gains.net)

    let withTxns = (
      <div>
        <h5 className="mb-2" style={{ fontSize: '14px' }}>
          Your gains for this period
        </h5>
        <h5 className="mb-2">{this.renderCapitalGainsNumber(stats.capital_gains.net)}</h5>
      </div>
    )

    let noTxns = <h5 className="mb-2">No gains or losses!</h5>

    return (
      <div className="mb-4 text-center px-3">
        <RoundFaIcon icon="check" size="3em" className="d-block mx-auto mb-3 text-success" />
        {gotGains ? withTxns : noTxns}
      </div>
    )
  }

  renderTaxInfoLink(user) {
    let link = `crypto taxes in ${user.country.name}`.split(' ').join('+')
    let url = user.country.tax_info_url || `https://www.google.com/search?q=${link}`
    return (
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="mb-3 border rounded btn btn-light py-2 px-3"
        style={{
          display: 'block',
          textAlign: 'left',
          whiteSpace: 'normal',
        }}
      >
        <div className="d-flex">
          <div className="my-auto mr-auto">
            <div className="text-muted small">Do I need to file taxes?</div>
          </div>
          <div className="my-auto ml-3">
            <i className={`fas fa-chevron-right text-muted`} />
          </div>
        </div>
      </a>
    )
  }

  renderUserOptions = user => {
    let costTrackingMethod = COST_TRACKING_METHODS.find(item => item.id === user.account_based_cost_basis)
    let gainRealizationMode = GAIN_REALIZATION_MODES.find(item => item.id === user.realize_gains_on_exchange)

    return (
      <ListGroup className="border rounded mb-3">
        <MainItem
          whiteBg
          title="Settings"
          subtitle={
            <div>
              These settings are used to calculate your gains. To change any of these click <Link to="/settings">here</Link>
            </div>
          }
        />
        <SubItem title="Home Country" action={user.country.name} />
        <SubItem title="Base Currency" action={user.base_currency.symbol} />
        <SubItem title="Cost basis method" action={getCostBasisMethodName(user)} />
        <SubItem title="Cost tracking method" action={costTrackingMethod.name} />
        <SubItem title="Gains on crypto → crypto trades?" action={gainRealizationMode.name} />
      </ListGroup>
    )
  }

  render() {
    let { stats, session, reviewable } = this.props
    let hideCapGains = this.hideCapitalGains()
    return (
      <Fragment>
        <div className="row">
          <div className="col-md-8">
            {validServerToken() && this.renderReviewableWallets(reviewable, stats, session)}
            {!hideCapGains && this.renderCapitalGains(stats, session)}
            {!hideCapGains && this.renderTroubleshooting(stats, session)}
            {!hideCapGains && this.renderReports(stats, session)}
          </div>
          <div className="col-md-4">
            {Number.parseInt(stats.gains_progress) !== 100 ? this.renderProgress(stats) : this.renderTaxInfo(stats, session)}
            {this.renderTaxInfoLink(session)}
            {this.renderUserOptions(session)}
          </div>
        </div>
      </Fragment>
    )
  }
}

function mapStateToProps({ session, syncStatus }) {
  return {
    session,
    syncStatus,
  }
}

export default connect(mapStateToProps, { notifyInfo })(YearDetails)
