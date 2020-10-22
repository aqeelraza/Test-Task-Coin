import React from 'react'
import connect from 'react-redux/es/connect/connect'
import { setSession } from '../../../redux/reducers/session'
import axios from 'axios'
import _ from 'lodash'
import { Button } from 'reactstrap'
import { Link } from 'react-router-dom'
import { LINKS } from '../../../Constants'

const StepBox = ({ text, subtext, action, count }) => (
  <div className={'onboarding-next-steps p-3'}>
    <div className="d-flex justify-content-between">
      <div className="d-flex justify-content-center">
        <div className={'pr-2'}>
          {/*<i className="fas fa-angle-right pr-2" />*/}
          {count}.
        </div>
        <div>
          <div className="pb-1">{text}</div>
          <div className="small text-muted">{subtext}</div>
        </div>
      </div>
      <div>{action}</div>
    </div>
  </div>
)

class NextStepsBox extends React.Component {
  onDismiss() {
    axios.patch(`/api/users/${this.props.session.id}`, { user: { onboarding_reviewed: true } }).then(res => this.props.setSession(res.data))
  }

  render() {
    if (this.props.session.onboarding_reviewed) {
      return null
    }

    let name = this.props.session.name
    name = _.split(name, ' ')[0] || name
    name = _.capitalize(name)

    return (
      <div className="border mb-3">
        <div className="whitebg p-3">
          <div className="float-right pointer text-muted" onClick={() => this.onDismiss()}>
            <i className="fas fa-times" />
          </div>
          <h5>Welcome, {name} — you're almost ready to go.</h5>
          <div className="small text-muted">Follow these steps to get started.</div>
        </div>
        <StepBox
          count={1}
          text={'Add your exchange accounts and wallets'}
          subtext={
            <span>
              Also, check out our{' '}
              <a href={LINKS.getting_started} target={'_BLANK'}>
                Getting started guide
              </a>{' '}
              for a quick tutorial on using Koinly.
            </span>
          }
          action={
            <Button size={'sm'} color="primary" tag={Link} to={'/wallets/select'}>
              Start
            </Button>
          }
        />
        <StepBox
          count={2}
          text={'Review your transactions'}
          subtext={
            <span>
              It is always worth taking a look at your imported transactions to ensure nothing has been missed.{' '}
              <a href={LINKS.reviewing_transactions} target={'_BLANK'}>
                Learn more
              </a>
            </span>
          }
        />
        <StepBox
          count={3}
          text={'Download your Tax Report'}
          subtext={<span>Head over to the Tax Reports page to download your first tax report!</span>}
          lastRow
        />
      </div>
    )
  }
}

const mapStateToProps = ({ session }) => ({ session })
const mapDispatchToProps = {
  setSession,
}

export default connect(mapStateToProps, mapDispatchToProps)(NextStepsBox)
