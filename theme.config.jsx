import { useConfig } from 'nextra-theme-docs'

export default {
  logo: <span>XELIS Blockchain</span>,
  project: {
    link: 'https://github.com/xelis-project'
  },
  docsRepositoryBase: 'https://github.com/xelis-project/xelis-docs/blob/master',
  useNextSeoProps() {
    return {
      titleTemplate: '%s – XELIS Docs'
    }
  },
  head: () => {
    const { frontMatter } = useConfig()
    return <>
      <meta property="og:title" content={frontMatter.title || 'XELIS Docs'} />
      <meta property="og:description" content={frontMatter.description || 'Detailed information on the core features and functionality of the XELIS Blockchain'} />
      {frontMatter.image && <meta name="og:image" content={frontMatter.image} />}
      <link rel="icon" href="/favicon.ico" sizes="any" />
    </>
  },
  footer: {
    text: <span>
      {new Date().getFullYear()} © <a href="https://xelis.io" target="_blank">XELIS Blockchain</a>
    </span>
  }
}