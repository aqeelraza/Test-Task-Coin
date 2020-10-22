import React from 'react'
import { LINKS } from '../../Constants'
import { Badge } from 'reactstrap'

const FooterLink = ({ title, link, newFeature, className }) => (
  <span className={className}>
    <a href={link} target="_blank">
      {title}
    </a>
    {newFeature && (
      <Badge className="ml-2" color={'danger'}>
        new
      </Badge>
    )}
  </span>
)

const Footer = () => (
  <div className="container">
    <div className="row">
      <div className="col d-flex justify-content-between align-items-center">
        <div className="d-flex align-items-center">
          <h5 className="brand d-inline-block mr-4 pr-2" style={{ opacity: '0.5' }}>
            TEST
          </h5>
          <FooterLink title="Support" link={LINKS.help} />
          <FooterLink title="Discuss" link={LINKS.community} className={'ml-4'} />
          <FooterLink title="Updates" link={LINKS.changelog} className={'ml-4'} />
          <FooterLink title="Tax Guides" link={LINKS.guides} className={'ml-4'} />
        </div>
        <span className="copyright">© {new Date().getFullYear()} Test</span>
      </div>
    </div>
  </div>
)

export default Footer
