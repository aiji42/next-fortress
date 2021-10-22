module.exports = {
  env: {
    AUTH0_BASE_URL:
      process.env.AUTH0_BASE_URL ||
      (process.env.VERCEL_URL
        ? `https://${process.env.VERCEL_URL}`
        : 'http://localhost:3000'),
    FORTRESS_FIREBASE_COOKIE_KEY: 'session',
    FORTRESS_FIREBASE_MODE: 'session'
  }
}
