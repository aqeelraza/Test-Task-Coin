import { Badge } from 'reactstrap'
import React from 'react'

export default ({ icon, title, subtitle, hideTopBorder, badgeText, badgeColor, onClick, className }) => (
  <button
    className={`well pointer ${className ? className : ''}`}
    style={{ marginTop: hideTopBorder ? '-1px' : undefined, textAlign: 'left', width: '100%' }}
    onClick={onClick}
    type={'submit'}
  >
    <i className={`fa ${icon} pl-2 text-muted`} style={{ fontSize: '1.25rem', width: '45px' }} />
    <div className="d-inline-block">
      {title}
      {badgeText && (
        <Badge color={badgeColor || 'success'} className="px-1 mx-2 text-uppercase">
          {badgeText}
        </Badge>
      )}
      <div className="text-muted small pt-1">{subtitle}</div>
    </div>
    <i className={`fa fa-chevron-right px-2 ml-auto`} />
  </button>
)
