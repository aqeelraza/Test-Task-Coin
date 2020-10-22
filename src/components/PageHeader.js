import React from 'react'
import { withRouter } from 'react-router-dom'
import classNames from 'classnames'

const PageHeader = ({ title, subtitle, noCenter, showBack, backTo, className, history, left }) => (
  <div className={className || 'pb-3 mb-3'}>
    <h2 className={`pb-1 ${left ? '' : 'text-center'}`}>
      {showBack && (
        <i className="fa fa-chevron-left small pr-4 pointer" onClick={() => (backTo ? history.replace(backTo) : history.goBack())} />
      )}
      {title}
    </h2>
    {subtitle && (
      <h5
        className={classNames({
          'text-muted small': true,
          'col-10 col-md-6 mx-auto text-center px-4': !noCenter && !left,
        })}
        style={{ lineHeight: '1.5em' }}
      >
        {subtitle}
      </h5>
    )}
  </div>
)

export default withRouter(PageHeader)
