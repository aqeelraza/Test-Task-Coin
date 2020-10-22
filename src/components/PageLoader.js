import React, { Component } from 'react'
import { withRouter } from 'react-router-dom'
import axios from 'axios'
import Loader from './Loader'
import ErrorPage from './ErrorPage'

class PageLoader extends Component {
  state = {
    loading: false,
    response: null,
    error: null,
  }

  componentDidMount() {
    this.loadPage()
  }

  componentDidUpdate(prevProps) {
    if (prevProps.url !== this.props.url) {
      this.loadPage()
    }
  }

  loadPage() {
    if (this.state.loading) {
      return
    }

    this.setState({ loading: true })
    axios
      .get(this.props.url)
      .then(res => {
        this.setState({
          loading: false,
          response: res.data,
          error: null,
        })
        if (this.props.onLoad) {
          this.props.onLoad(res.data)
        }
      })
      .catch(error => {
        console.log(error)
        this.setState({
          loading: false,
          response: null,
          error,
        })
      })
  }

  render() {
    if (this.state.loading) {
      if (this.props.children) {
        return this.props.children(null, this.state.loading)
      }
      return <Loader />
    }

    if (this.state.error) {
      return <ErrorPage error={this.state.error} onRetry={() => this.loadPage()} />
    }

    if (this.props.children) {
      return this.props.children(this.state.response, this.state.loading)
    }

    return null
  }
}

export default withRouter(PageLoader)
