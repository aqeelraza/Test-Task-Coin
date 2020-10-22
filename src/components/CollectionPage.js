import React, { Component } from 'react'
import axios from 'axios'
import _ from 'lodash'
import queryString from 'query-string'
import UltimatePagination from 'react-ultimate-pagination-bootstrap-4'
import { withRouter } from 'react-router-dom'
import connect from 'react-redux/es/connect/connect'
import PageLoader from './PageLoader'
import { notifyError, notifyInfo } from '../redux/reducers/notifier'
import ErrorPage from './ErrorPage'
import { debounce } from 'lodash'

class CollectionPage extends Component {
  state = {
    loaded: false,
    loading: false,
    error: null,
    items: null,
    totalPages: 1,
  }

  componentDidMount() {
    if (this.getFilters().message) {
      this.props.notifyInfo(this.getFilters().message)
      this.setFilters({ message: null }, true)
    }
  }

  componentDidUpdate(prevProps) {
    if (prevProps.location.search !== this.props.location.search) {
      // dont want to hammer the api when user is typing queries
      if (!this.delayedLoadPage) {
        this.delayedLoadPage = debounce(() => {
          this.loadPage(true)
        }, 500)
      }

      this.delayedLoadPage()
    }
  }

  onItemDeleted = item => {
    if (item) {
      const items = this.state.items.slice() // clone
      const index = items.findIndex(it => it.id === item.id)
      if (index !== -1) {
        items.splice(index, 1)
        this.setState({ items })
      } else {
        console.log('Deleted item not found!')
      }
    }

    this.loadPage(false)
  }

  onItemUpdated = (item, forceRefresh) => {
    if (item) {
      const items = this.state.items.slice() // clone
      const index = items.findIndex(it => it.id === item.id)
      if (index !== -1) {
        items[index] = { ...item }
        this.setState({ items })
      } else {
        console.log('Updated item not found!')
      }
    }

    if (forceRefresh) {
      this.loadPage(false)
    }
  }

  onPageChange = page => {
    this.setFilters({ page: page })
  }

  getFilters() {
    return queryString.parse(this.props.location.search)
  }

  getUrl() {
    const params = queryString.parse(this.props.location.search)
    let filters = [`page=${params.page || 1}`, `per_page=${params.per_page || this.props.perPage || 10}`]

    const parsedUrl = queryString.parseUrl(this.props.url)
    Object.keys(parsedUrl.query || {}).forEach(k => {
      filters.push(`${k}=${parsedUrl.query[k]}`)
    })

    if (this.props.applyFilters) {
      filters = filters.concat(this.props.applyFilters(params))
    }

    return `${parsedUrl.url}?${filters.join('&')}`
  }

  setFilters = (newFilters, replace = false) => {
    let filters = { ...this.getFilters() }

    if (newFilters === null) {
      filters = {}
    } else {
      Object.keys(newFilters).forEach(key => {
        if (!newFilters[key]) {
          delete filters[key]
        } else {
          filters[key] = newFilters[key]
        }
      })

      // go to first page on filter change
      if (!Object.keys(newFilters).includes('page')) {
        delete filters.page
      }
    }

    const search = `?${queryString.stringify(filters)}`
    if (replace) {
      this.props.history.replace({ search, state: this.props.location.state })
    } else {
      this.props.history.push({ search, state: this.props.location.state })
    }
  }

  onPageLoaded = res => {
    const withoutMeta = _.omit(res, 'meta')
    const items = withoutMeta[Object.keys(withoutMeta)[0]]
    const meta = res.meta

    this.setState({
      loaded: true,
      loading: false,
      items,
      meta,
      totalPages: meta.page.total_pages === 0 ? 1 : meta.page.total_pages,
    })
  }

  loadPage(showLoading) {
    this.setState({ error: null, loading: showLoading })

    if (this.cancel) {
      this.cancel()
    }

    axios
      .get(this.getUrl(), { cancelToken: new axios.CancelToken(c => (this.cancel = c)) })
      .then(res => this.onPageLoaded(res.data))
      .catch(error => !axios.isCancel(error) && this.setState({ error }))
  }

  renderContent() {
    const Item = this.props.item
    let currentPage = Number.parseInt(this.getFilters().page, 10) || 1

    // this happens when we are of ex. are on page 5 and click on Review history then try to go back
    if (this.state.totalPages && currentPage > this.state.totalPages) {
      currentPage = this.state.totalPages
    }

    let table = this.props.renderTable ? (
      this.props.renderTable(this.state.items)
    ) : (
      <>
        {this.state.items.map(item => (
          <Item
            key={item.id || (this.props.itemKey && this.props.itemKey(item))}
            onItemUpdated={(newItem, forceRefresh) => this.onItemUpdated(newItem, forceRefresh)}
            onItemDeleted={() => this.onItemDeleted(item)}
            item={item}
            history={this.props.history}
            {...this.props.itemProps}
          />
        ))}
      </>
    )

    return (
      <>
        <div className="row col-list-labels">{this.props.columns && this.props.columns()}</div>
        <div className={`mb-4 ${this.props.rowClass || ''}`} style={this.props.rowStyle}>
          {table}
          {this.props.footer}
        </div>
        {this.props.endOfResults && currentPage === this.state.totalPages && this.props.endOfResults(this.getFilters())}
        {this.state.totalPages > 1 && (
          <div className="row">
            <UltimatePagination currentPage={currentPage} totalPages={this.state.totalPages} onChange={this.onPageChange} />
          </div>
        )}
      </>
    )
  }

  render() {
    if (!this.state.loaded) {
      return <PageLoader url={this.getUrl()} onLoad={this.onPageLoaded} />
    }

    if (this.state.error) {
      return <ErrorPage error={this.state.error} onRetry={() => this.loadPage(true)} />
    }

    return (
      <div className="container">
        {this.props.title && (
          <div className="row page-header d-flex justify-content-between align-items-center">
            <div>
              {this.props.title && (
                <h2 className={'d-flex align-items-center'}>
                  {this.props.title}
                  {this.state.meta && this.props.showCount && this.state.meta.page.total_items > 0 && (
                    <div className="page-header-count d-inline-block text-muted">{this.state.meta.page.total_items}</div>
                  )}
                </h2>
              )}
              {this.props.subtitle && <h5 className="text-muted small mt-2">{this.props.subtitle}</h5>}
            </div>
            {this.props.actions && this.props.actions()}
          </div>
        )}
        {this.props.tabs && (
          <div className="row page-tabs" style={{ marginTop: this.props.title ? '-30px' : undefined }}>
            {this.props.tabs(this.getFilters(), this.setFilters, this.state.meta)}
          </div>
        )}
        <div className={`${this.props.className || ''} ${this.state.loading ? 'pulsate' : ''}`}>
          {this.props.bodyHeader && this.props.bodyHeader(this.state.items)}
          {this.props.filters && this.props.filters(this.getFilters(), this.setFilters, this.state.meta)}
          {this.state.items.length > 0 ? this.renderContent() : this.props.empty}
          {this.state.items.length === 0 && this.props.endOfResults && this.props.endOfResults(this.getFilters())}
        </div>
      </div>
    )
  }
}

export default connect(null, { notifyError, notifyInfo })(withRouter(CollectionPage))
