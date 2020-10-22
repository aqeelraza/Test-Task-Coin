import React from 'react'
import { Switch } from 'react-router-dom'
import PrivateRoute from './components/PrivateRoute'
import ChooseTransactionType from './pages/transactions/ChooseTransactionType'
import EditTransaction from './pages/transactions/EditTransaction'
import AddTransaction from './pages/transactions/AddTransaction'
import Transactions from './pages/transactions'
import ChooseWalletType from './pages/wallets/ChooseWalletType'
import ShowWallet from './pages/wallets/ShowWallet'
import AddMultiassetWallet from './pages/wallets/AddMultiassetWallet'
import EditWalletCsv from './pages/wallets/EditWalletCsv'
import EditWalletApi from './pages/wallets/EditWalletApi'
import AddWallet from './pages/wallets/AddWallet'
import EditWallet from './pages/wallets/EditWallet'
import DebugWallet from './pages/wallets/DebugWallet'
import Wallets from './pages/wallets'
import Reports from './pages/reports'
import ShowMarket from './pages/markets/ShowMarket'
import Markets from './pages/markets'
import Plans from './pages/plans'
import ApplyCoupon from './pages/plans/ApplyCoupon'
import FindAndApplyDiscount from './pages/plans/FindAndApplyDiscount'
import CoinbaseWalletCb from './pages/callbacks/CoinbaseWalletCb'
import UpholdWalletCb from './pages/callbacks/UpholdWalletCb'
import ReferFriends from './pages/affiliate/ReferFriends'
import AffiliatePanel from './pages/affiliate/AffiliatePanel'
import Settings from './pages/settings'
import EntriesPage from './pages/entries'
import Home from './pages/home'
import Logout from './pages/auth/Logout'
import CoinjarWalletCb from './pages/callbacks/CoinjarWalletCb'
import TestTask from "./pages/home/_helpers/testTask";

export default () => (
  <Switch>
    <PrivateRoute path="/logout" component={Logout} title="Logging out..." />
    <PrivateRoute path="/transactions/new/:type" component={AddTransaction} title="Add transaction" />
    <PrivateRoute path="/transactions/new" component={ChooseTransactionType} title="Choose transaction" />
    <PrivateRoute path="/transactions/:id/edit" component={EditTransaction} title="Edit transaction" />
    <PrivateRoute path="/transactions" component={Transactions} title="Transactions" />
    <PrivateRoute path="/entries/:id" component={EntriesPage} title="Entries" />
    <PrivateRoute path="/wallets/multiasset" component={AddMultiassetWallet} title="Add multiasset wallet" />
    <PrivateRoute path="/wallets/new/:id" component={AddWallet} title="Create wallet" />
    <PrivateRoute path="/wallets/new" component={AddWallet} title="Add wallet" />
    <PrivateRoute path="/wallets/select" component={ChooseWalletType} title="Select integration" />
    <PrivateRoute path="/wallets/:id/api" component={EditWalletApi} title="Connect to API" />
    <PrivateRoute path="/wallets/:id/upload" component={EditWalletCsv} title="Import file" />
    <PrivateRoute path="/wallets/:id/edit" component={EditWallet} title="Edit wallet" />
    <PrivateRoute path="/wallets/:id/troubleshoot" component={DebugWallet} title="Troubleshoot wallet" />
    <PrivateRoute path="/wallets/:id" component={ShowWallet} title="Wallet" />
    <PrivateRoute path="/wallets" component={Wallets} title="Wallets" />
    <PrivateRoute path="/reports/:year" component={Reports} title="Reports" />
    <PrivateRoute path="/reports" component={Reports} title="Reports" />
    <PrivateRoute path="/markets/:id" component={ShowMarket} title="Market details" />
    <PrivateRoute path="/markets" component={Markets} title="Markets" />
    <PrivateRoute path="/plans" component={Plans} title="Plans" />
    <PrivateRoute path="/apply-coupon" component={ApplyCoupon} title="Coupon code" />
    <PrivateRoute path="/email-promo" component={FindAndApplyDiscount} title="Applying discount..." /> /*url is hardcoded in intercom*/
    <PrivateRoute path="/settings" component={Settings} title="Settings" />
    <PrivateRoute path="/refer" component={ReferFriends} title="Refer a friend" />
    <PrivateRoute path="/affiliate" component={AffiliatePanel} title="Affiliate panel" />
    <PrivateRoute path="/callbacks/coinbase_wallet" component={CoinbaseWalletCb} title="Coinbase wallet" />
    <PrivateRoute path="/callbacks/uphold_wallet" component={UpholdWalletCb} title="Uphold wallet" />
    <PrivateRoute path="/callbacks/coinjar" component={CoinjarWalletCb} title="Coinjar wallet" />
    <PrivateRoute path="/testTask" component={TestTask} title="Test Task" />
    <PrivateRoute component={Home} title="Dashboard" />
  </Switch>
)
