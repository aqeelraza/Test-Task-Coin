import { Component } from 'react'
import { DropdownItem, DropdownMenu, DropdownToggle, UncontrolledDropdown } from 'reactstrap'
import React from 'react'
import _ from 'lodash'

// pass string or numner arrays like: ['a', 'b'] or [1, 2, 3]
// you can also pass an object: { 'Name': 'name' } - the key is the display
// name and value is the id (to allow null ids)
function toIdNameArray(options) {
  if (options.length > 0 && (typeof options[0] === 'string' || typeof options[0] === 'number')) {
    return options.map(item => ({ id: item, name: _.capitalize(item.replace(/_/g, ' ')) }))
  } else if (typeof options === 'object') {
    let keys = Object.keys(options)
    if (keys.length > 0 && (typeof options[keys[0]] === 'string' || options[keys[0]] === null)) {
      return Object.keys(options).map(key => ({ id: options[key], name: key }))
    }
  }
  return options
}

export class FilterSelect extends Component {
  onClick = (item, e) => {
    if (e) e.stopPropagation()
    this.props.onSelect(item ? item.id : null)
  }

  render() {
    let title = this.props.title
    let items = toIdNameArray(this.props.items)
    let selected = items.find(item => item.id === this.props.value)

    let singleItem = items.length === 1

    let selectedTitle =
      selected &&
      (this.props.selectTitle ? (
        this.props.selectTitle(selected)
      ) : (
        <>
          <span className="small text-muted pr-2">{this.props.selectPrefix || title}:</span>
          <span>{selected.name}</span>
          {!this.props.noClear && <i className={`fas fa-times p-1 small`} onClick={e => selected && this.onClick(null, e)} />}
        </>
      ))

    return (
      <UncontrolledDropdown className={'d-inline-block ' + (this.props.className ? this.props.className : '')}>
        <DropdownToggle
          nav
          caret={!singleItem && (!selected || this.props.noClear)}
          className={`btn btn-sm filter-select-btn btn-outline-secondary ${
            this.props.danger && !selected ? 'filter-select-btn-danger' : ''
          } ${selected ? 'filter-select-btn-active' : ''}`}
          onClick={e => singleItem && (selected ? this.onClick(null, e) : this.onClick(items[0], e))}
        >
          {selected ? selectedTitle : singleItem ? items[0].name : title}
        </DropdownToggle>
        {!singleItem && (
          <DropdownMenu>
            {items.map(item => (
              <DropdownItem key={item.name} onClick={() => this.onClick(item)}>
                {item.icon && <i className={`${item.icon}`} style={{ color: item.color, width: '30px' }} />} {item.name}
              </DropdownItem>
            ))}
          </DropdownMenu>
        )}
      </UncontrolledDropdown>
    )
  }
}
