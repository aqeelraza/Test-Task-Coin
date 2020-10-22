import React, { Component, Fragment } from 'react'
import { Link } from 'react-router-dom'
import CollectionPage from '../../components/CollectionPage'
import Wallet from './_helpers/Wallet'
import EmptyItem from '../../components/EmptyItem'
import AppLayout from '../../layouts/AppLayout'
import { FilterSelect } from '../../controls/FilterSelect'
import { SearchInput } from '../../controls/InputControls'

class WalletsPage extends Component {
  applyFilters = params => {
    let filters = []
    switch (params.order) {
      case 'name_asc':
        filters.push(`q[sorts]=name asc`)
        break
      case 'name_desc':
        filters.push(`q[sorts]=name desc`)
        break
      default:
        filters.push(`q[sorts]=created_at desc`)
    }

    if (params.search) {
      filters.push(`q[name_cont]=${params.search}`)
    }

    return filters
  }

  renderButtons = () => (
    <Fragment>
      <Link to={{ pathname: '/wallets/select', state: { referrer: '/wallets' } }} className="btn btn-primary">
        <i className={'fas fa-plus pr-2 small'} />
        Add wallet / exchange
      </Link>
    </Fragment>
  )

  renderFilters = (filters, setFilters, meta) => (
    <div className={'row d-flex justify-content-between align-items-center'}>
      <SearchInput
        placeholder="Find wallet..."
        value={filters.search}
        onFormChange={(name, val) => setFilters({ search: val }, true)}
        className={'wallet-search search-input'}
      />
      <FilterSelect
        value={filters.order || 'created_at'}
        selectTitle={selected => `Sort by ${selected.name}`}
        onSelect={val => setFilters({ order: val })}
        items={{ 'Date Added': 'created_at', 'Name A-Z': 'name_asc', 'Name Z-A': 'name_desc' }}
        noClear
      />
    </div>
  )

  render() {
    return (
      <AppLayout>
        <CollectionPage
          className="wallets-table well-list"
          title="WALLETS"
          url="/api/wallets?with_accounts=1"
          actions={this.renderButtons}
          filters={this.renderFilters}
          applyFilters={this.applyFilters}
          item={Wallet}
          paginate
          perPage={10}
          empty={<EmptyItem text={"You don't have any wallets!"} />}
          showCount
        />
      </AppLayout>
    )
  }
}

export default WalletsPage
