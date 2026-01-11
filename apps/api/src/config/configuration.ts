export default () => ({
  port: parseInt(process.env.PORT || '3000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',

  database: {
    url: process.env.DATABASE_URL,
  },

  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379', 10),
  },

  jwt: {
    secret: process.env.JWT_SECRET || 'change-me-in-production',
    accessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '15m',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  },

  telegram: {
    botToken: process.env.TELEGRAM_BOT_TOKEN,
  },

  blockchain: {
    btc: {
      host: process.env.BTC_RPC_HOST || 'localhost',
      port: parseInt(process.env.BTC_RPC_PORT || '18332', 10),
      username: process.env.BTC_RPC_USER || 'easyx_btc',
      password: process.env.BTC_RPC_PASSWORD || 'btc_rpc_password_change_me',
      network: process.env.BTC_NETWORK || 'testnet',
      watcherEnabled: process.env.BTC_WATCHER_ENABLED === 'true',
      confirmations: parseInt(process.env.BTC_CONFIRMATIONS || '3', 10),
    },
    ltc: {
      host: process.env.LTC_RPC_HOST || 'localhost',
      port: parseInt(process.env.LTC_RPC_PORT || '19332', 10),
      username: process.env.LTC_RPC_USER || 'easyx_ltc',
      password: process.env.LTC_RPC_PASSWORD || 'ltc_rpc_password_change_me',
      network: process.env.LTC_NETWORK || 'testnet',
      watcherEnabled: process.env.LTC_WATCHER_ENABLED === 'true',
      confirmations: parseInt(process.env.LTC_CONFIRMATIONS || '6', 10),
    },
    tron: {
      fullNodeUrl: process.env.TRON_FULL_NODE_URL || 'http://localhost:8090',
      apiKey: process.env.TRON_API_KEY || '',
      usdtContract: process.env.TRON_USDT_CONTRACT || 'TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t',
      watcherEnabled: process.env.TRON_WATCHER_ENABLED === 'true',
      confirmations: parseInt(process.env.TRON_CONFIRMATIONS || '20', 10),
    },
    eth: {
      rpcUrl: process.env.ETH_RPC_URL || 'http://localhost:8545',
      mnemonic: process.env.ETH_MNEMONIC || '',
      usdtContract: process.env.ETH_USDT_CONTRACT || '0xdAC17F958D2ee523a2206206994597C13D831ec7',
      watcherEnabled: process.env.ETH_WATCHER_ENABLED === 'true',
      confirmations: parseInt(process.env.ETH_CONFIRMATIONS || '12', 10),
    },
  },

  exchange: {
    marginPercent: parseFloat(process.env.EXCHANGE_MARGIN_PERCENT || '1.5'),
    binanceApiKey: process.env.BINANCE_API_KEY,
  },

  limits: {
    dailyWithdrawNoKyc: parseFloat(process.env.DAILY_WITHDRAW_NO_KYC || '1000'),
    dailyWithdrawKyc: parseFloat(process.env.DAILY_WITHDRAW_KYC || '50000'),
    monthlyWithdrawNoKyc: parseFloat(process.env.MONTHLY_WITHDRAW_NO_KYC || '5000'),
    monthlyWithdrawKyc: parseFloat(process.env.MONTHLY_WITHDRAW_KYC || '500000'),
  },
});
