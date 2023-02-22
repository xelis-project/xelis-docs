import { useConfig } from 'nextra-theme-docs'

export default {
  logo: <span>Xelis Blockchain</span>,
  project: {
    link: 'https://github.com/xelis-project'
  },
  docsRepositoryBase: 'https://github.com/xelis-project/xelis-docs/blob/master',
  useNextSeoProps() {
    return {
      titleTemplate: '%s – Xelis Docs'
    }
  },
  head: () => {
    const { frontMatter } = useConfig()
    return <>
      <meta property="og:title" content={frontMatter.title || 'Xelis Docs'} />
      <meta property="og:description" content={frontMatter.description || 'Detailed information on the core features and functionality of the Xelis Blockchain'} />
      {frontMatter.image && <meta name="og:image" content={frontMatter.image} />}
    </>
  },
  footer: {
    text: <span>
      {new Date().getFullYear()} © <a href="https://xelis.io" target="_blank">Xelis Blockchain</a>
    </span>
  }
}