const nextra = require('nextra')

const withNextra = nextra({
  theme: 'nextra-theme-docs',
  themeConfig: './theme.config.jsx',
})

module.exports = withNextra({
  reactStrictMode: true,
  experimental: {
    runtime: 'edge',
  }
})
