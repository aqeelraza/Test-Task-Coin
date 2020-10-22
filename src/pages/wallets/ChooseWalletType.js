import React, { Component } from 'react'
import { Link, withRouter } from 'react-router-dom'
import AppLayout from '../../layouts/AppLayout'
import { SearchInput } from '../../controls/InputControls'
import classNames from 'classnames'
import CollectionPage from '../../components/CollectionPage'
import connect from 'react-redux/es/connect/connect'
import _ from 'lodash'
import { setSession } from '../../redux/reducers/session'
import { notifyInfo } from '../../redux/reducers/notifier'
import { Button } from '../../controls'

const WalletItem = ({ item, history }) => (
  <div className="col-6 col-md-4 col-lg-3 p-0 pointer" style={{ marginLeft: '-1px', marginTop: '-1px' }}>
    <div className="well" onClick={() => history.push(`/wallets/new/${item.id}`, item)}>
      <div className="media align-items-center">
        {item.icon.medium && <img src={item.icon.medium} className="media-button-icon mx-2" alt={item.name} />}
        <div className="media-body ml-1">
          <h5 style={{ fontSize: '1rem', marginBottom: '0' }}>{item.name}</h5>
        </div>
        {item.existing_count > 0 && (
          <div style={{ position: 'absolute', bottom: '6px', right: '12px', color: '#01d28e' }}>
            <i className={`fa fa-check-circle`} />
          </div>
        )}
      </div>
    </div>
  </div>
)

const NoIntegrationsFound = ({ search }) => (
  <div className="row mb-4 mt-4">
    {search ? (
      <Link to={`/wallets/new?name=${search}`}>Create custom wallet with name '{search}'?</Link>
    ) : (
      <Link to="/wallets/new" className="small">
        Can't find what you are looking for? Create a custom wallet instead.
      </Link>
    )}
  </div>
)

class ChooseWalletType extends Component {
  state = {
    walletServices: null,
  }

  applyFilters = params => {
    let filters = []
    switch (params.type) {
      case 'exchange':
        filters.push('q[integration_type_in][]=exchange')
        break
      case 'blockchain':
        filters.push('q[integration_type_in][]=blockchain')
        break
      case 'wallet':
        filters.push('q[integration_type_in][]=wallet')
        break
      case 'service':
        filters.push('q[integration_type_in][]=other')
        break
    }

    if (params.search) {
      filters.push(`q[name_cont]=${params.search}`)
    }

    return filters
  }

  renderButtons = () => {
    let backTo = _.get(this.props, 'location.state.referrer') || '/'
    return (
      <Button onClick={() => this.props.history.push(backTo)} color={'primary'}>
        Done <i className="fa fa-arrow-right small pl-2" />
      </Button>
    )
  }

  renderTabs = (filters, setFilters) => {
    const tabs = [
      { name: 'All', filter: null },
      { name: 'Exchanges', filter: 'exchange' },
      { name: 'Blockchains', filter: 'blockchain' },
      { name: 'Wallets', filter: 'wallet' },
      { name: 'Services', filter: 'service' },
    ]

    const filter = filters.type || tabs[0].filter
    return (
      <>
        <ul className="list-inline mt-3 ml-2 mr-auto mb-1">
          {tabs.map(tab => (
            <li
              key={tab.name}
              className={classNames({
                active: tab.filter == filter, // this should be == and not ===
                'list-inline-item mr-2 px-2': true,
              })}
              onClick={() => setFilters({ type: tab.filter }, true)}
            >
              {tab.name}
            </li>
          ))}
        </ul>
        <div className="wallet-filter-form mt-3 pt-2 mr-2">
          <SearchInput
            placeholder="Search..."
            value={filters.search}
            onFormChange={(name, val) => setFilters({ search: val }, true)}
            className={'search-input'}
          />
        </div>
      </>
    )
  }

  render() {
    return (
      <AppLayout>
        <CollectionPage
          className="well-list"
          title="Add your wallets"
          subtitle={'Import data from the exchanges, wallets and services that you traded on.'}
          url="/api/wallet_services?with_existing_count=1"
          rowClass={'row'}
          actions={this.renderButtons}
          columns={this.renderColumnNames}
          tabs={this.renderTabs}
          applyFilters={this.applyFilters}
          item={WalletItem}
          perPage={4 * 12}
          endOfResults={filters => <NoIntegrationsFound search={filters.search} />}
        />
      </AppLayout>
    )
  }
}

const mapStateToProps = ({ session }) => ({ session })
const mapDispatchToProps = { setSession, notifyInfo }
export default connect(mapStateToProps, mapDispatchToProps)(withRouter(ChooseWalletType))
