import React, { Fragment } from 'react'
import { FacebookShareButton, TwitterShareButton, TelegramShareButton, WhatsappShareButton, EmailShareButton } from 'react-share'

import { FacebookIcon, TwitterIcon, TelegramIcon, WhatsappIcon, EmailIcon } from 'react-share'

const ShareAffiliateLink = ({ code }) => {
  let url = 'http://localhost:3000/?via=' + code
  let title = 'Filing cryptocurrency taxes? Check out this cool app!'
  return (
    <Fragment>
      <input
        value={url}
        style={{ height: '50px', fontSize: '20px', width: '100%' }}
        className="my-2 text-center d-block"
        onFocus={e => e.target.select()}
      />

      <div className="d-inline-block">
        <EmailShareButton
          url={url}
          subject={'Thought you might find this useful'}
          body={'Hey, check this out if you need help figuring out taxes on your crypto trades'}
          className="d-inline-block pointer px-2"
        >
          <EmailIcon size={50} round />
        </EmailShareButton>
        <TwitterShareButton
          url={url}
          title={title}
          hashtags={['cryptocurrency', 'bitcoin', 'tax']}
          className="d-inline-block pointer px-2"
        >
          <TwitterIcon size={50} round />
        </TwitterShareButton>
        <FacebookShareButton url={url} quote={title} hashtag="#test" className="d-inline-block pointer px-2">
          <FacebookIcon size={50} round />
        </FacebookShareButton>
        <TelegramShareButton url={url} title={title} className="d-inline-block pointer px-2">
          <TelegramIcon size={50} round />
        </TelegramShareButton>
        <WhatsappShareButton url={url} title={title} className="d-inline-block pointer px-2">
          <WhatsappIcon size={50} round />
        </WhatsappShareButton>
      </div>
    </Fragment>
  )
}

export default ShareAffiliateLink
