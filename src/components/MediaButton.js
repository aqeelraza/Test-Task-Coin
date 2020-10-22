import React from 'react'
import classNames from 'classnames'
import { Colors } from '../common'

const MediaButton = ({
  title,
  subtitle,
  icon,
  faIcon,
  faColor,
  faType, // fab - for brands
  disabled,
  onClick,
}) => (
  <div className="col-6 col-md-4 col-lg-3 p-0">
    <div className={classNames(['well', { disabled, clickable: !!onClick }])} onClick={onClick}>
      <div className="media align-items-center">
        {icon && <img src={icon} className="media-button-icon mx-2" alt={title} />}
        {faIcon && (
          <span
            className="ml-2 mr-3"
            style={{
              fontSize: '1.5em',
              color: faColor || Colors.mutedIcon,
            }}
          >
            <i className={`${faType || 'fas'} fa-${faIcon}`} />
          </span>
        )}
        <div className="media-body">
          <h5
            style={{
              color: disabled ? Colors.mutedIcon : undefined,
              fontSize: '18px',
              marginBottom: '0',
            }}
          >
            {title}
          </h5>
          {subtitle && (
            <div className="mt-1" style={{ lineHeight: '1.2', opacity: disabled ? '0.5' : '1' }}>
              <small className="text-muted">{subtitle}</small>
            </div>
          )}
        </div>
      </div>
    </div>
  </div>
)

export default MediaButton
