import React from 'react'
import { Route as RouterRoute, Redirect } from 'react-router-dom'
import connect from 'react-redux/es/connect/connect'

export class MyRoute extends React.Component {
  componentDidMount() {
    document.title = this.props.title ? `${this.props.title} | Test App` : 'Koinly App'
  }

  componentDidUpdate() {
    // this is called twice, the first call has title the second one doesnt
    if (this.props.title) {
      document.title = this.props.title ? `${this.props.title} | Test App` : 'Koinly App'
    }
  }

  render() {
    const { title, ...rest } = this.props
    return <RouterRoute {...rest} />
  }
}

const PrivateRoute = ({ component: Component, session, ...rest }) => (
  <MyRoute
    {...rest}
    render={props =>
      session ? (
        <Component {...props} />
      ) : (
        <Redirect
          to={{
            pathname: '/login',
            state: { from: props.location },
          }}
        />
      )
    }
  />
)

const mapStateToProps = ({ session }) => ({ session })
export default connect(mapStateToProps)(PrivateRoute)
