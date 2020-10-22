import React from 'react'
import ReactDOM from 'react-dom'
import axios from 'axios'
import queryString from 'query-string'
import _ from 'lodash'
import { default as Select, AsyncSelect, components } from '@atlaskit/select'
import { BaseInput } from './InputControls'
import classNames from 'classnames'

// custom option renderer
const labelCSS = () => ({
  alignItems: 'center',
  display: 'flex',
  lineHeight: 1.2,
})

const flagCSS = icon => ({
  fontSize: '18px',
  marginRight: '8px',
  float: 'left',
  backgroundImage: icon ? `url("${icon}")` : undefined,
  backgroundSize: 'cover',
  width: '28px',
  height: '28px',
})

const MetadataContext = React.createContext(null)

const MenuList = props => {
  return (
    <MetadataContext.Consumer>
      {metadata => (
        <components.MenuList {...props}>
          {props.children}
          {metadata && metadata.total_items > metadata.per_page && (
            <div className="small text-muted pt-1 pl-2">
              Showing {metadata.per_page} of {metadata.total_items} results. Type for more...
            </div>
          )}
        </components.MenuList>
      )}
    </MetadataContext.Consumer>
  )
}

const Opt = ({ label, subtext, icon, showIcon, selected }) => {
  let iconHtml = typeof icon === 'string' ? <div style={flagCSS(icon)} /> : <div style={flagCSS(null)}>{icon}</div>

  return (
    <div style={labelCSS()}>
      {showIcon && iconHtml}
      <div>
        <div>{label}</div>
        {subtext && (
          <div>
            <small className={classNames({ 'text-muted': !selected })}>{subtext}</small>
          </div>
        )}
      </div>
    </div>
  )
}

// this adds support for arrays by converting them to supported objects
function normalizeOptionsArray(options) {
  if (options.length > 0 && (typeof options[0] === 'string' || typeof options[0] === 'number')) {
    if (typeof options[0] === 'string') {
      options = options.map(item => ({ id: item, name: _.capitalize(item.replace('_', ' ')) }))
    } else if (typeof options[0] === 'number') {
      options = options.map(item => ({ id: item, name: item }))
    }
  } else if (typeof options === 'object' && Object.keys(options).length > 0 && typeof options[Object.keys(options)[0]] === 'string') {
    options = Object.keys(options).map(key => ({ id: options[key], name: key }))
  }
  return options
}

export default class CollectionSelect extends BaseInput {
  state = {}

  componentDidMount() {
    if (this.props.options) {
      let options = this.processSelectOptions(normalizeOptionsArray(this.props.options))
      this.setState({ options })
    }
  }

  componentDidUpdate(prevProps) {
    if (prevProps.options !== this.props.options) {
      let options = this.processSelectOptions(normalizeOptionsArray(this.props.options))
      this.setState({ options })
    }

    if (prevProps.selectedOption !== this.props.selectedOption) {
      this.setState({ selectedOption: this.props.selectedOption })
    } else if (prevProps.value !== this.props.value && (!this.state.selectedOption || this.state.selectedOption.id !== this.props.value)) {
      this.setState(state => ({
        selectedOption:
          (state.options && this.findOption(state.options, this.props.value)) ||
          (this.props.selectedOption && this.findOption([this.props.selectedOption], this.props.value)),
      }))
    }
  }

  processSelectOptions = options => {
    let selectedOption = this.state.selectedOption
    if (options.length > 0 && (!selectedOption || selectedOption.system)) {
      if (this.props.value) {
        selectedOption = this.findOption(options, this.props.value) || this.props.selectedOption
        if (!selectedOption) {
          // this can happen if the selected option is not returned in the first call to loadOptions for ex. if
          // we previously searched for an option which is no longer in the results. we just show the value
          // in such cases instead of showing nothing
          selectedOption = { id: this.props.value, name: this.props.value, system: true }
        }
      } else if (this.props.autoselect) {
        if (this.props.autoselect instanceof Function) {
          selectedOption = options.find(opt => this.props.autoselect(opt))
        } else {
          selectedOption = options[0]
        }

        if (selectedOption) {
          this.notifyChange(selectedOption)
        }
      }

      this.setState({ selectedOption })
    }

    return this.props.groupOptions ? this.props.groupOptions(options) : options
  }

  loadOptions = searchQuery => {
    const parsedUrl = queryString.parseUrl(this.props.url)
    const searchParams = this.props.search && searchQuery && searchQuery.length > 0 ? this.props.search(searchQuery) : {}
    const qs = queryString.stringify({ ...parsedUrl.query, ...searchParams })

    this.setState({ loading: true })
    return axios.get(`${parsedUrl.url}${qs.length > 0 ? '?' + qs : ''}`).then(res => {
      let options = null
      let metadata = null
      if (res.data instanceof Object) {
        const withoutMeta = _.omit(res.data, 'meta')
        options = withoutMeta[Object.keys(withoutMeta)[0]]
        metadata = res.data.meta && res.data.meta.page
      } else {
        options = res.data
      }

      this.setState({ options, metadata, loading: false })
      return this.processSelectOptions(options)
    })
  }

  notifyChange = item => {
    if (this.props.onChange) {
      this.props.onChange(item)
    }
    this.props.onFormChange(this.props.name, item ? this.getOptionValue(item) : '')
  }

  onSelectionChanged = selectedOption => {
    this.notifyChange(selectedOption)
    this.setState({ selectedOption })
  }

  // blank string can also be a value
  findOption = (options, value) =>
    value !== '' && !value ? null : options.find(opt => this.getOptionValue(opt).toString() === value.toString())

  getOptionLabel = opt => (this.props.optionLabel && !opt.system && this.props.optionLabel(opt)) || opt.name

  getOptionValue = opt => (this.props.optionId && !opt.system && this.props.optionId(opt)) || opt.id

  getOptionIcon = opt => this.props.optionIcon && !opt.system && this.props.optionIcon(opt)

  getOptionSubtext = opt => (this.props.optionSubtext && !opt.system && this.props.optionSubtext(opt)) || opt.subtext

  isOptionDisabled = opt => this.props.isOptionDisabled && !opt.system && this.props.isOptionDisabled(opt)

  // switch formatters based on render context (menu | value), display subtext only in menu
  formatOptionLabel = (opt, { context }) => (
    <Opt
      label={this.getOptionLabel(opt)}
      subtext={context === 'menu' && this.getOptionSubtext(opt)}
      icon={this.getOptionIcon(opt)}
      showIcon={this.props.optionIcon}
      selected={this.state.selectedOption && this.getOptionValue(this.state.selectedOption) === this.getOptionValue(opt)}
    />
  )

  // a hack to make the dropdown same size as parent input-group size
  copyDropdownWidthFromParent = styles => {
    /* eslint-disable no-undef */
    const node = ReactDOM.findDOMNode(this.selectRef)
    const width = jQuery(node)
      .parents('.input-group')
      .width()
    if (width) {
      return { ...styles, width: `${width}px` }
    }
    return styles
  }

  menuStyles = defStyles => {
    defStyles.zIndex = 10
    if (this.props.fullSizeDropdown) {
      return this.copyDropdownWidthFromParent(defStyles)
    }
    return defStyles
  }

  render() {
    let components = { MenuList }
    if (this.props.isDisabled) {
      components['DropdownIndicator'] = null // removes dropdown arrow when disabled
    }

    let async = !!this.props.url
    const Klass = async ? AsyncSelect : Select
    let selectParams = {}
    if (async) {
      selectParams.loadOptions = this.loadOptions
      selectParams.defaultOptions = true // this will call loadOptions("") if true

      // we set defaultoptions if input is disabled so we dont call loadOptions
      // AsyncSelect only loads options on initial mount so if the isDisabled option can be toggled
      // then we must also pass shallowDisable to ensure the loading continues to happen otherwise
      // we end up with empty box after isDisable is toggled
      if (this.props.isDisabled === true && !this.props.shallowDisable && this.props.selectedOption) {
        selectParams.defaultOptions = [this.props.selectedOption]
      }
    } else {
      selectParams.options = this.state.options
    }

    return this.decorate(
      <MetadataContext.Provider value={this.state.metadata}>
        <Klass
          ref={c => (this.selectRef = c)}
          className="collection-select"
          styles={{ menu: styles => this.menuStyles(styles) }}
          components={components}
          placeholder={this.props.placeholder}
          value={this.state.selectedOption || this.props.selectedOption}
          onChange={item => this.onSelectionChanged(item)}
          formatOptionLabel={this.formatOptionLabel}
          getOptionLabel={this.getOptionLabel}
          getOptionValue={this.getOptionValue}
          isOptionDisabled={this.isOptionDisabled}
          isDisabled={this.props.isDisabled}
          isClearable={this.props.isClearable || this.props.clearable}
          isSearchable
          {...selectParams}
        />
      </MetadataContext.Provider>
    )
  }
}
