import React, { Component } from 'react'
import { Link, NavLink } from 'react-router-dom'
import {
  Navbar,
  NavbarBrand,
  NavbarToggler,
  Collapse,
  Nav,
  NavItem,
  UncontrolledDropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem,
  Badge,
} from 'reactstrap'
import { Colors, planColor } from '../../common'
import connect from 'react-redux/es/connect/connect'
import { LINKS } from '../../Constants'

const navItems = [
  { name: 'Dashboard', path: '/', exact: true },
  { name: 'Wallets', path: '/wallets' },
  { name: 'Transactions', path: '/transactions' },
  { name: 'Tax Reports', path: '/reports' },
  { name: 'Markets', path: '/markets' },
]

const styles = {
  logo: {
    fontSize: '20px',
    fontWeight: '600',
    lineHeight: '22px',
    fontFamily: 'Quicksand',
    fontStyle: 'normal',
    marginRight: '1rem',
  },
}

class MyNavbar extends Component {
  state = {
    isOpen: false,
  }

  toggle = () => {
    this.setState({
      isOpen: !this.state.isOpen,
    })
  }

  hide = () => {
    this.setState({
      isOpen: false,
    })
  }

  render() {
    let sub = this.props.session.active_subscription
    let coupon = this.props.session.my_coupon
    const plan = (
      <Link
        to="/plans"
        className="badge ml-2 small"
        style={{
          backgroundColor: sub ? planColor(sub.plan) : Colors.muted,
          color: 'white',
        }}
      >
        {(sub ? sub.plan.name : 'Free') + ' Plan'}
      </Link>
    )

    return (
      <div className="container">
        <Navbar light expand="md" style={{ backgroundColor: 'white' }}>
          <NavbarBrand tag={Link} to="/">
            <span style={styles.logo}>Testr</span>
          </NavbarBrand>
          <NavbarToggler onClick={this.toggle} />
          <Collapse isOpen={this.state.isOpen} navbar>
            <Nav className="mr-auto" navbar>
              {navItems.map(item => (
                <NavItem key={item.name} className="pr-3" onClick={this.hide}>
                  <NavLink activeClassName="active" className="nav-link h-100" to={item.path} exact={item.exact}>
                    {item.name}
                  </NavLink>
                </NavItem>
              ))}
            </Nav>
            {plan}
          </Collapse>
          <UncontrolledDropdown>
            <DropdownToggle nav caret>
              <img className="header-avatar rounded" src={this.props.session.avatar.medium} alt={this.props.session.name} />
            </DropdownToggle>
            <DropdownMenu>
              <div className="small text-muted px-4 pb-2">{this.props.session.email}</div>
              <DropdownItem tag={Link} to="/plans">
                Plans
              </DropdownItem>
              {coupon &&
                (coupon.affiliate ? (
                  <DropdownItem tag={Link} to="/affiliate">
                    Affiliate Panel
                  </DropdownItem>
                ) : (
                  <DropdownItem tag={Link} to="/refer">
                    Refer friends
                    <Badge color="info" className="ml-2">
                      {coupon.commission}
                    </Badge>
                  </DropdownItem>
                ))}
              <DropdownItem tag={'a'} href={LINKS.community}>
                Discuss{' '}
                <Badge color="danger" className="ml-2">
                  NEW
                </Badge>
              </DropdownItem>
              <DropdownItem tag={Link} to="/settings">
                Settings
              </DropdownItem>
              <DropdownItem tag={Link} to="/logout">
                Log out
              </DropdownItem>
            </DropdownMenu>
          </UncontrolledDropdown>
        </Navbar>
      </div>
    )
  }
}

const mapStateToProps = ({ session }) => ({ session })
export default connect(mapStateToProps)(MyNavbar)
