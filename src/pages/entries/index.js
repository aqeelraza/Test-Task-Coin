import React, { Component } from 'react'
import CollectionPage from '../../components/CollectionPage'
import EmptyItem from '../../components/EmptyItem'
import AppLayout from '../../layouts/AppLayout'
import { withRouter } from 'react-router-dom'
import { FormGroup, InputGroup } from 'reactstrap'
import moment from 'moment'
import { ToggleInput } from '../../controls/InputControls'
import { LINKS } from '../../Constants'
import EntryTable from './_helpers/EntryTable'

class EntriesPage extends Component {
  state = {
    perPage: 25,
  }

  applyFilters = params => {
    let filters = []

    if (params.negative_only) {
      filters.push('q[negative_true]=1')
    }

    if (params.from) {
      filters.push(`q[date_gteq]=${params.from}`)
    }

    if (params.to) {
      filters.push(`q[date_lt]=${params.to}`)
    }

    return filters
  }

  renderFilters = (filters, setFilters, meta) => (
    <FormGroup className="row">
      <InputGroup style={{ alignItems: 'center' }}>
        <div className="col">
          <div className="d-inline-block mr-4">
            <ToggleInput
              title={'Show only negative balances'}
              value={filters.negative_only === true || filters.negative_only === 'true'}
              onFormChange={(_, val) => setFilters({ negative_only: val }, true)}
              left
            />
          </div>
          {filters.to && (
            <div className="badge badge-secondary ml-4 d-inline-block pointer" onClick={() => setFilters({ to: null }, true)}>
              To: {moment(filters.to).format('lll')}
            </div>
          )}
        </div>
        <div className="col" />
        <div className="small text-muted float-right">
          {meta &&
            `Showing ${meta.page.total_items < this.state.perPage ? meta.page.total_items : this.state.perPage} of ${
              meta.page.total_items
            } entries`}
        </div>
      </InputGroup>
    </FormGroup>
  )

  renderContent() {
    return (
      <CollectionPage
        className="well-list"
        title={
          <>
            <i className="fa fa-chevron-left small pr-4 pointer" onClick={() => this.props.history.goBack()} />
            Ledger changes
          </>
        }
        subtitle={
          <>
            Koinly maintains a double entry ledger system for all your transactions. Every change in your asset balances is listed on this
            page. You can use this information to track down negative balances and other issues.{' '}
            <a href={LINKS.ledgers_page_info} target={'_BLANK'}>
              Learn more
            </a>
          </>
        }
        url={`/api/entries?q[account_id_eq]=${this.props.match.params.id}`}
        filters={this.renderFilters}
        applyFilters={this.applyFilters}
        renderTable={items => <EntryTable items={items} />}
        perPage={this.state.perPage}
        empty={<EmptyItem text="No entries found..." />}
        footer={<div className="row text-muted small mt-4">All date/times are in UTC</div>}
      />
    )
  }

  render() {
    return <AppLayout>{this.renderContent()}</AppLayout>
  }
}

export default withRouter(EntriesPage)
