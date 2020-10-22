import React from 'react'
import Form from './Form'
import PageHeader from './PageHeader'

export default function CenteredFormPage(props) {
  return (
    <div className="page-body container">
      <div className="row">
        <div className="col" />
        <div className="col-xl-5 col-lg-6 col-md-8 col-10">
          <PageHeader title={props.title} subtitle={props.subtitle} showBack={props.showBack} noCenter />
          <div style={{ marginTop: '-1.25rem' }} />
          {props.readOnlyText && (
            <div className="small text-danger text-center pb-4" style={{ marginTop: '-1rem' }}>
              {props.readOnlyText || 'This page is read-only'}
            </div>
          )}
          <Form {...props}>{props.children}</Form>
        </div>
        <div className="col" />
      </div>
    </div>
  )
}
