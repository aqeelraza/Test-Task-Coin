import React, { Component, Fragment } from 'react'
import _ from 'lodash'
import { Badge, Input, FormFeedback, FormText, FormGroup } from 'reactstrap'
import Switch from 'react-switch'
import { Label } from './Controls'
import Info from '../components/Info'
import RsuiteDatePicker from 'rsuite/lib/DatePicker'
import moment from 'moment'
import { localToUTC, utcToLocal } from '../common'

// All input controls must inherit from this class!
export class BaseInput extends Component {
  IGNOREABLE_PROPS = [
    'onFormChange',
    'onChange',
    'initialValue',
    'error',
    'required',
    'minLength',
    'validators',
    'noGroup',
    'isDisabled',
    'formGroupStyle',
    'left',
  ]

  notifyChange = value => {
    this.notifyAttrChange(this.props.name, value)
  }

  notifyAttrChange = (name, value) => {
    this.props.onFormChange(name, value)
    if (this.props.onChange) {
      this.props.onChange(name, value)
    }
  }

  decorate(input) {
    let helpAtBottom = (!this.props.title && this.props.help) || this.props.helpBottom
    const html = (
      <Fragment>
        {this.props.title && (
          <Label for={this.props.id}>
            {this.props.title}
            {this.props.help && <Info text={this.props.help} />}
          </Label>
        )}
        {input}
        {this.props.error && (
          <FormFeedback style={{ display: 'block' }} tooltip={this.props.errorTooltip}>
            {this.props.error}
          </FormFeedback>
        )}
        {helpAtBottom && <FormText style={{ fontStyle: 'italic' }}>{helpAtBottom}</FormText>}
      </Fragment>
    )

    return this.props.noGroup ? (
      html
    ) : (
      <FormGroup disabled={this.props.isDisabled} style={this.props.formGroupStyle}>
        {html}
      </FormGroup>
    )
  }

  passThruProps() {
    return _.omit(this.props, this.IGNOREABLE_PROPS)
  }
}

export class TextInput extends BaseInput {
  handleTextChange = e => {
    e.preventDefault()
    this.notifyChange(e.target.value)
  }

  render() {
    const props = this.passThruProps()
    props.type = props.type || 'text'
    return this.decorate(
      <Input {...props} disabled={this.props.isDisabled} onChange={this.handleTextChange} invalid={!!this.props.error} />
    )
  }
}

export class SearchInput extends BaseInput {
  handleTextChange = e => {
    e.preventDefault()
    this.notifyChange(e.target.value)
  }

  render() {
    const props = this.passThruProps()
    props.type = props.type || 'text'
    return this.decorate(
      <div className="input-group">
        <Input {...props} disabled={this.props.isDisabled} onChange={this.handleTextChange} invalid={!!this.props.error} />
      </div>
    )
  }
}

export class NumberInput extends BaseInput {
  render() {
    return <TextInput type="number" {...this.props} />
  }
}

export class TextAreaInput extends BaseInput {
  render() {
    return <TextInput type="textarea" {...this.props} />
  }
}

export class EmailInput extends BaseInput {
  render() {
    return <TextInput type="email" {...this.props} />
  }
}

export class PasswordInput extends BaseInput {
  render() {
    return <TextInput type="password" {...this.props} />
  }
}

export class DateTimeInput extends BaseInput {
  onChange = value => {
    this.notifyChange(localToUTC(value).toISOString())
  }

  render() {
    let value = new Date(this.props.value)
    if (isNaN(value)) {
      value = moment(this.props.value, 'YYYY-MM-DD HH:mm:ss Z').toDate()
    }

    return this.decorate(
      <RsuiteDatePicker
        {...this.passThruProps()}
        className="txndate-picker"
        format="YYYY/MM/DD - HH:mm A"
        cleanable={false}
        onChange={this.onChange}
        value={utcToLocal(value)}
        preventOverflow
      />
    )
  }
}

export class HiddenInput extends BaseInput {
  render() {
    return <input type="hidden" {...this.passThruProps()} />
  }
}

export class PillsInput extends BaseInput {
  state = {
    selected: this.props.value,
  }

  handleClick = item => {
    if (item === this.state.selected) {
      if (!this.props.required) {
        this.setState({ selected: null }, () => this.notifyChange(this.state.selected))
      }
    } else {
      this.setState({ selected: item }, () => this.notifyChange(this.state.selected))
    }
  }

  render() {
    return this.decorate(
      <div>
        {this.props.items.map(item => (
          <Badge
            key={item}
            className="pill"
            color={item === this.state.selected ? 'primary' : 'light'}
            onClick={() => this.handleClick(item)}
          >
            {this.props.getLabel ? this.props.getLabel(item) : item}
          </Badge>
        ))}
      </div>
    )
  }
}

export class ToggleInput extends BaseInput {
  state = {
    checked: this.props.value,
  }

  handleToggle = checked => {
    this.setState({ checked }, () => this.notifyChange(checked))
  }

  render() {
    return this.decorate(
      <div style={{ float: this.props.left ? 'left' : 'right', paddingRight: this.props.left ? '10px' : undefined }}>
        <Switch {...this.passThruProps()} onChange={this.handleToggle} checked={this.state.checked} />
      </div>
    )
  }
}
