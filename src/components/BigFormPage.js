import React from 'react'
import PageHeader from './PageHeader'

export default function BigFormPage({ title, subtitle, left, children, backTo }) {
  return (
    <div className="page-body container">
      <div className="row">
        <div className="col-10 offset-1 col-md-6 offset-md-3">
          <PageHeader title={title} subtitle={subtitle} backTo={backTo} showBack noCenter />
        </div>
      </div>
      <div className="row">
        {left && <div className="col-10 offset-1 col-md-6 offset-md-0">{left}</div>}
        <div className={`col-10 offset-1 col-md-6 offset-md-${left ? '0' : '3'}`}>{children}</div>
      </div>
    </div>
  )
}
