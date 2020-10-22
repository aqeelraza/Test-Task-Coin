import React, { Fragment } from 'react'
import axios from 'axios'
import _ from 'lodash'
import { Button, ButtonGroup } from '../controls'
import { BaseInput } from '../controls/InputControls'
import * as Validators from '../common/validators'
import assignToPath from '../common/assignToPath'
import queryString from 'querystring'
import { apiCloudflareUrl } from '../pages/_helpers/CloudflareErrorBox'

class Form extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      form: {},
      initialValues: {},
      validators: {},
      errors: {},
      rootErrors: [],
      loading: false,
    }
    this.gatherValues(props.children, this.state)
  }

  restoreCfState() {
    let query = queryString.parse(window.location.search.replace('?', ''))
    if (query.cf) {
      this.setState({ form: queryString.parse(window.atob(query.cf)), restoredCfState: true }, () => this.handleSubmit())
    }
  }

  redirectToCf() {
    if (this.state.restoredCfState) {
      window.Rollbar.error('cf error even after redirect')
    } else {
      let cf = window.btoa(queryString.stringify(this.state.form))
      window.location = apiCloudflareUrl(queryString.stringify({ cf }))
    }
  }

  componentDidMount() {
    if (this.props.protectedByCf) {
      this.restoreCfState()
    }
  }

  componentDidUpdate() {
    const newState = {
      form: {},
      initialValues: {},
      validators: {},
    }

    this.gatherValues(this.props.children, newState, this.state)

    if (Object.keys(newState.form).length !== Object.keys(this.state.form).length) {
      // this can happen if the Input components set multiple values
      // ex. FileInput sets the 'name' value as well as the optional
      // 'file_name' value which wont be caught by gatherValues because
      // it only gathers the values from the 'name' attribute
      _.difference(Object.keys(this.state.form), Object.keys(newState.form)).forEach(key => {
        newState.form[key] = this.state.form[key]
      })
    }

    if (_.isEqual(newState.form, this.state.form)) {
      delete newState.form
    }

    if (_.isEqual(newState.initialValues, this.state.initialValues)) {
      delete newState.initialValues
    }

    if (_.isEqual(Object.keys(newState.validators), Object.keys(this.state.validators))) {
      delete newState.validators
    }

    if (Object.keys(newState).length > 0) {
      this.setState(newState)
    }
  }

  getValidationErrors = () => {
    const errors = {}
    Object.keys(this.state.validators).forEach(name => {
      const error = this.validateInput(name, this.state.form[name])
      if (error) {
        errors[name] = error
      }
    })
    return errors
  }

  gatherValues = (children, newState, oldState) => {
    React.Children.forEach(children, child => {
      if (child && child.props) {
        if (child.props.name) {
          const name = child.props.name
          if (
            !oldState ||
            oldState.form[name] === undefined ||
            (child.props.value !== undefined && oldState.initialValues[name] !== child.props.value)
          ) {
            newState.form[name] = newState.initialValues[name] = child.props.value === undefined ? '' : child.props.value
          } else {
            newState.form[name] = oldState.form[name]
            newState.initialValues[name] = oldState.initialValues[name]
          }

          newState.validators[name] = []
          if (child.props.required) {
            newState.validators[name].push(Validators.required)
          }

          if (child.props.minLength) {
            newState.validators[name].push(Validators.minLength(child.props.minLength))
          }

          if (child.props.validators) {
            child.props.validators.forEach(val => newState.validators[name].push(val))
          }
        } else if (child.props.children) {
          this.gatherValues(child.props.children, newState, oldState)
        }
      }
    })
  }

  handleChange = (name, val) => {
    this.setState(prevState => {
      const newState = {}
      newState.form = { ...prevState.form }
      newState.form[name] = val

      if (prevState.errors[name]) {
        newState.errors = { ...prevState.errors }
        newState.errors[name] = this.validateInput(name, val)
      }

      return newState
    })
  }

  handleSubmit = e => {
    if (e) e.preventDefault()
    if (this.props.isReadOnly) return
    const errors = this.getValidationErrors()
    if (Object.keys(errors).length === 0) {
      let defParams = this.props.defaultParams || {}
      this.makeApiCall(this.expandNestedKeys({ ...defParams, ...this.state.form }))
    } else {
      this.setState({ errors })
    }
  }

  validateInput = (name, val) => {
    const fn = this.state.validators[name].find(func => func(val))
    return fn && fn(val)
  }

  // https://medium.com/@svitekpavel/how-to-traverse-through-all-grand-children-in-react-2e634067f93d
  wrapChildren = children =>
    React.Children.map(children, child => {
      if (child) {
        if (BaseInput.isPrototypeOf(child.type)) {
          return React.cloneElement(child, {
            onFormChange: (name, val) => this.handleChange(name, val),
            value: this.state.form[child.props.name],
            error: this.state.errors[child.props.name],
            initialValue: this.state.initialValues[child.props.name],
          })
        }
        if (child.props && child.props.children && typeof child.props.children !== 'function') {
          return React.cloneElement(child, {
            children: this.wrapChildren(child.props.children),
          })
        }
      }

      return child
    })

  // converts the following keys:
  //    "user_metadata.api_key" into user_metadata: { api_key: X }
  //    "balances.0.amount" into balances: [{amount: X}]
  expandNestedKeys = obj => {
    const newObj = {}
    Object.keys(obj).forEach(key => {
      assignToPath(newObj, key, obj[key])
    })
    return newObj
  }

  convertToFormData(params) {
    return Object.entries(params).reduce((acc, [key, value]) => {
      if (Array.isArray(value)) {
        value.forEach((k, idx) => acc.append(`${key}[${k}]`, value[idx]))
      } else if (typeof value === 'object' && !(value instanceof File) && !(value instanceof Date)) {
        Object.entries(value).forEach(([k, v]) => acc.append(`${key}[${k}]`, v))
      } else {
        acc.append(key, value)
      }

      return acc
    }, new FormData())
  }

  makeApiCall(formFields) {
    const method = this.props.update ? 'put' : 'post'
    const actionInfo = this.props.update ? this.props.update : this.props.post
    let url = actionInfo.url

    console.log('action', actionInfo)

    if (this.props.protectedByCf) {
      url += '?' + queryString.stringify({ cftoken: window.csrfToken })
    }

    let data = {}
    if (actionInfo.root) {
      data[actionInfo.root] = formFields
    } else {
      data = formFields
    }

    if (this.props.multipart) {
      data = this.convertToFormData(data)
    }

    this.setState({ loading: true })
    axios({ method, url, data })
      .then(response => {
        if (this.props.onSuccess) {
          this.props.onSuccess(response.data)
        }

        this.setState({
          loading: false,
          errors: {},
          rootErrors: [],
        })
      })
      .catch(error => {
        const rootErrors = []
        const errors = {}
        if (error.response) {
          const res = error.response.data
          // set errors on the input controls or root
          if (res.errors) {
            res.errors.forEach(e => {
              if (e.source in this.state.form) {
                errors[e.source] = e.detail
              } else {
                rootErrors.push((e.source && e.source !== 'base' ? `${e.source} ` : '') + e.detail)
              }
            })
          } else {
            rootErrors.push(error.message)
          }
        } else {
          rootErrors.push(error.message)
        }

        if (
          this.props.protectedByCf &&
          error &&
          !error.response &&
          !axios.isCancel(error) &&
          error.message &&
          error.message.toLowerCase() === 'network error'
        ) {
          this.redirectToCf()
        }

        if (this.props.onError) {
          this.props.onError(rootErrors, error.response)
        }

        this.setState({
          loading: false,
          errors,
          rootErrors,
        })
      })
  }

  render() {
    const Wrapper = this.props.actionWrapper || (this.props.showCancel ? ButtonGroup : Fragment)

    return (
      <Fragment>
        <form
          className={this.state.loading ? 'pulsate' : ''}
          style={{ position: 'relative' }}
          onSubmit={this.handleSubmit}
          ref={this.props.formRef}
          noValidate
        >
          {this.state.loading && <div className="overlay" style={{ opacity: '0' }} />}
          {this.state.rootErrors.length > 0 && (
            <ul className="alert alert-danger" role="alert" style={{ listStyleType: 'disc', paddingLeft: '30px' }}>
              {this.state.rootErrors.map(error => (
                <li>{error}</li>
              ))}
            </ul>
          )}
          <div style={{ position: 'relative' }}>
            {this.props.isReadOnly && <div className="overlay" style={{ opacity: '0.50' }} />}
            {this.wrapChildren(this.props.children)}
          </div>
          <Wrapper>
            {this.props.showCancel && (
              <Button color="secondary" onClick={this.props.onCancel}>
                {this.props.cancelText || 'Cancel'}
              </Button>
            )}
            {this.props.submitButton ? (
              this.props.submitButton(this.state.loading)
            ) : (
              <Button
                color="primary"
                type="submit"
                isLoading={this.state.loading}
                isDisabled={this.props.isReadOnly}
                shouldFitContainer={this.props.fullSizeSubmit}
              >
                {this.props.submitText || 'Save'}
              </Button>
            )}
            {this.props.otherActions}
          </Wrapper>
        </form>
      </Fragment>
    )
  }
}

export default Form
