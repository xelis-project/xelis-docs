import { useConfig } from 'nextra-theme-docs'

export default {
  logo: <div className="nx-flex nx-items-center">
    <img alt="XELIS Logo" src="/green_background_black_logo.webp" style={{ borderRadius: `2em`, width: `6em` }} />
  </div>,
  project: {
    link: 'https://github.com/xelis-project'
  },
  docsRepositoryBase: 'https://github.com/xelis-project/xelis-docs/blob/master',
  useNextSeoProps() {
    return {
      titleTemplate: '%s – XELIS Documentation'
    }
  },
  head: () => {
    const { frontMatter } = useConfig()
    return <>
      <meta property="og:title" content={frontMatter.title || 'XELIS Documentation'} />
      <meta property="og:description" content={frontMatter.description || 'Detailed information on the core features and functionality of XELIS'} />
      <meta name="theme-color" content="#7afad3" />
      {frontMatter.image && <meta name="og:image" content={frontMatter.image} />}
      <link rel="icon" href="/favicon.ico" sizes="any" />
    </>
  },
  footer: {
    text: <span>
      {new Date().getFullYear()} © <a href="https://xelis.io" target="_blank">XELIS</a>
    </span>
  },
  primaryHue: 162,
  primarySaturation: 92,
}