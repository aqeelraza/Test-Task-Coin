import React, { Component, Fragment } from 'react'
import CollectionPage from '../../components/CollectionPage'
import EmptyItem from '../../components/EmptyItem'
import Market from './_helpers/Market'
import moment from 'moment'
import AppLayout from '../../layouts/AppLayout'
import { SearchInput } from '../../controls/InputControls'

class MarketsPage extends Component {
  applyFilters = params => {
    let filters = []
    if (params.search) {
      filters.push(`q[symbol_or_name_start]=${params.search}`)
    }

    return filters
  }

  renderFilters = (filters, setFilters, meta) => (
    <div className={'row d-flex flex-row-reverse'}>
      <SearchInput
        placeholder="Search..."
        value={filters.search}
        onFormChange={(name, val) => setFilters({ search: val }, true)}
        className={'wallet-search search-input'}
      />
    </div>
  )

  renderColumnNames = () => (
    <Fragment>
      <div className="col-1 text-center">Rank</div>
      <div className="col-3 col-md-2">Coin</div>
      <div className="col d-none d-md-block text-center">Market cap</div>
      <div className="col text-center">Price</div>
      <div className="col text-center">Volume</div>
      <div className="col text-center">24h</div>
      <div className="col-2 text-right" />
    </Fragment>
  )

  renderHeader = items => (
    <div className="row page-header">
      <div className="col text-center mb-2">
        <h2>Market Prices</h2>
        {items.length > 0 && items[0].market.synced_at && (
          <h5 className="text-muted small">Updated {moment(items[0].market.synced_at).fromNow()}</h5>
        )}
      </div>
    </div>
  )

  render() {
    return (
      <AppLayout>
        <CollectionPage
          className="markets-table well-list"
          bodyHeader={this.renderHeader}
          url="/api/currencies?with_market=1&q[fiat_false]=1"
          columns={this.renderColumnNames}
          filters={this.renderFilters}
          applyFilters={this.applyFilters}
          item={Market}
          itemKey={item => item.currency.id}
          paginate
          perPage={50}
          empty={<EmptyItem text={'Hmmm, looks like there are no markets :S'} />}
        />
      </AppLayout>
    )
  }
}

export default MarketsPage
