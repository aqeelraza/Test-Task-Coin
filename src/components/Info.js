import React from 'react'
import Tooltip from '../components/Tooltip'

const Info = ({ text, size, link, className }) => {
  let info = (
    <i
      className={'fa fa-info-circle ml-2 text-muted ' + (className ? className : '')}
      style={{ opacity: '0.5', fontSize: size ? size : undefined }}
    />
  )

  return (
    <Tooltip
      content={
        link ? (
          <div>
            {text}
            <p className="small pt-2 pb-1 mb-0">
              <b>Click to learn more</b>
            </p>
          </div>
        ) : (
          text
        )
      }
      tag={'span'}
    >
      {link ? (
        <a href={link} target={'_BLANK'}>
          {info}
        </a>
      ) : (
        info
      )}
    </Tooltip>
  )
}

export default Info
