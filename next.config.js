const nextra = require('nextra').default

const withNextra = nextra({

})

module.exports = withNextra({
  output: "export",
  images: {
    unoptimized: true
  }
})
