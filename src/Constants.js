export const COST_BASIS_METHODS = [
  { id: 'fifo_ireland', name: 'FIFO / Ireland', subtext: 'Irish Cost Basis', country: 'IRL' },
  { id: 'shared_pool2', name: 'Shared Pool / Individuals', subtext: 'HMRC compliant cost basis method', country: 'GBR' },
  { id: 'shared_pool_company', name: 'Shared Pool / Companies', subtext: 'HMRC cost basis method for companies', country: 'GBR' },
  { id: 'shared_pool', name: 'Shared Pool [LEGACY]', subtext: 'Deprecated method', country: 'GBR', disabled: true },
  { id: 'acb_canada', name: 'Adjusted Cost Basis / Canada', subtext: 'ACB with Superficial Loss Rule', country: 'CAN' },
  { id: 'pfu_france', name: 'PFU / France', subtext: 'Prélèvement Forfaitaire Unique', country: 'FRA' },
  { id: 'fifo', name: 'FIFO', subtext: 'First In First Out' },
  { id: 'lifo', name: 'LIFO', subtext: 'Last In First Out' },
  { id: 'hifo', name: 'HIFO', subtext: 'Highest Cost Basis' },
  { id: 'average_cost', name: 'ACB', subtext: 'Average Cost Basis' },
]

export const AVERAGE_COST_METHODS = ['average_cost', 'shared_pool', 'acb_canada']

// user.account_based_cost_basis
export const COST_TRACKING_METHODS = [
  { id: false, name: 'Universal' },
  { id: true, name: 'Wallet Based' },
]

// user.realize_gains_on_exchange
export const GAIN_REALIZATION_MODES = [
  {
    id: true,
    name: 'Yes',
    subtext: 'Gains will be realized when you exchange crypto (ideal for tax reporting)',
  },
  {
    id: false,
    name: 'No',
    subtext: 'Gains will not be realized when you exchange crypto (ideal for tracking or when using like-kind exchange)',
  },
]

export const PRICING_STRATEGIES = [
  { id: '', name: 'Market price of purchased coins' },
  { id: 'prefer_trusted', name: 'Market price of trusted coins' },
  { id: 'prefer_top_50', name: 'BETA: Market price of Top 50 coins' },
]

// we dont show the realized gain label
export const DEPOSIT_LABELS = ['airdrop', 'fork', 'mining', 'staking', 'loan_interest', 'other_income']
export const WITHDRAW_LABELS = ['gift', 'lost', 'cost']
export const FIAT_WITHDRAW_LABELS = ['cost']
export const FIAT_DEPOSIT_LABELS = []

export const LabelIconsMap = {
  bank: 'fas fa-landmark',
  airdrop: 'fas fa-parachute-box',
  fork: 'fas fa-code-branch',
  mining: 'fas fa-hammer',
  staking: 'fas fa-handshake',
  loan_interest: 'fas fa-landmark',
  other_income: 'fas fa-money-bill-wave',
  gift: 'fas fa-hand-holding-usd',
  lost: 'fas fa-trash-alt',
  cost: 'fas fa-donate',
  realized_gain: 'fas fa-funnel-dollar',
  unknown: 'fas fa-globe',
}

export const TransactionTypes = {
  Buy: 'buy',
  Sell: 'sell',
  Exchange: 'exchange',
  Transfer: 'transfer',
  CryptoDeposit: 'crypto_deposit',
  CryptoWithdrawal: 'crypto_withdrawal',
  FiatDeposit: 'fiat_deposit',
  FiatWithdrawal: 'fiat_withdrawal',
}

export const BuilderTransactionTypes = {
  Deposit: 'deposit',
  Withdrawal: 'withdrawal',
  Trade: 'trade',
  Transfer: 'transfer',
}

export const CsvImportStatus = {
  Pending: 'pending',
  Ready: 'ready',
  Processing: 'processing',
  Importing: 'importing',
  Completed: 'completed',
  ProcessingFailed: 'processing_failed',
  Failed: 'failed',
  UnknownCsv: 'unknown_csv',
  EnterRequiredOptions: 'enter_required_options',
  EnterMapperId: 'enter_mapping_id',
  Pollable: ['pending', 'ready', 'processing', 'importing'],
}

export const DAYS_OF_MONTH = [
  1,
  2,
  3,
  4,
  5,
  6,
  7,
  8,
  9,
  10,
  11,
  12,
  13,
  14,
  15,
  16,
  17,
  18,
  19,
  20,
  21,
  22,
  23,
  24,
  25,
  26,
  27,
  28,
  29,
  30,
  31,
]

export const MONTHS_OF_YEAR = [
  { id: 1, name: 'January' },
  { id: 2, name: 'February' },
  { id: 3, name: 'March' },
  { id: 4, name: 'April' },
  { id: 5, name: 'May' },
  { id: 6, name: 'June' },
  { id: 7, name: 'July' },
  { id: 8, name: 'August' },
  { id: 9, name: 'September' },
  { id: 10, name: 'October' },
  { id: 11, name: 'November' },
  { id: 12, name: 'December' },
]

export const LINKS = {
  facebook: 'https://www.facebook.com/koinlyio',
  twitter: 'https://twitter.com/Koinly1',
  instagram: 'https://www.instagram.com/koinly_io/',
  changelog: 'https://discuss.koinly.io/c/announcements/13',
  community: 'https://discuss.koinly.io/',

  security: 'https://koinly.io/security/',
  features: 'https://koinly.io/features/',
  pricing: 'https://koinly.io/pricing/',
  about: 'https://koinly.io/about/',
  terms: 'https://koinly.io/terms/',
  affiliate_terms: 'https://koinly.io/affiliate-terms/',
  blog: 'https://koinly.io/blog/',
  guides: 'https://koinly.io/guides/',
  ledgers_page_info: 'https://koinly.io/blog/new-ledgers-page/',

  help: 'https://help.koinly.io/en/',
  faq: 'https://help.koinly.io/en/collections/2124463-faq',
  custom_import_guide: 'https://help.koinly.io/en/articles/3662999-how-can-i-import-my-own-custom-csv-filee',
  file_processing_error_guide: 'http://help.koinly.io/en/articles/4224258-how-to-fix-invalid-csv-excel-files',
  missing_txns: 'https://help.koinly.io/en/articles/3663415-missing-purchase-history-for-xyz',
  missing_market_prices: 'https://help.koinly.io/en/articles/3663432-market-prices-for-xyz-are-missing',
  getting_started: 'https://help.koinly.io/en/articles/3660679-getting-started-with-koinly',
  reviewing_transactions: 'https://help.koinly.io/en/articles/3662842-how-to-ensure-your-tax-report-is-accurate',
  missing_cost_basis: 'https://help.koinly.io/en/articles/3663440-we-were-unable-to-determine-the-cost-of-some-of-your-disposals',
  api_limitations: 'https://help.koinly.io/en/articles/3663333-exchange-api-limitations',
  binance_airdrops: 'https://help.koinly.io/en/articles/3663318-how-to-import-airdrops-from-binance',
  sample_csv_dl: 'https://www.dropbox.com/s/dk3iwj4jin5gukb/sample_csv_koinly.csv?dl=1',
  negative_balance: 'https://help.koinly.io/en/articles/3663415-this-transaction-results-in-a-negative-xyz-balance',
  adding_manual_txns: 'https://help.koinly.io/en/articles/3664156-how-can-i-add-transactions-manually',
}

export const COINBASE_LOGIN_REDIRECT_URL = window.location.origin + '/callbacks/coinbase'
