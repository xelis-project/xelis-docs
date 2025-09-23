import { Footer, Layout, Navbar } from 'nextra-theme-docs'
import { Head } from 'nextra/components'
import { getPageMap } from 'nextra/page-map'
import 'nextra-theme-docs/style.css'

export const metadata = {
  // Define your metadata here
  // For more information on metadata API, see: https://nextjs.org/docs/app/building-your-application/optimizing/metadata
}
 
const navbar = (
  <Navbar
    projectLink="https://github.com/xelis-project"
    logo={<div className="nx-flex nx-items-center">
        <img alt="XELIS Logo" src="/green_background_black_logo.webp" style={{ borderRadius: `2em`, width: `6em` }} />
    </div>}
  />
)

const footer = <Footer>
    {new Date().getFullYear()} © <a href="https://xelis.io" target="_blank">XELIS</a>
</Footer>
 
export default async function RootLayout({ children }) {
  return (
    <html lang="en" dir="ltr" suppressHydrationWarning>
      <Head color={{ hue: 162, saturation: 92 }}>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta name="theme-color" content="#7afad3" />
        <link rel="icon" href="/favicon.ico" sizes="any" />
      </Head>
      <body>
        <Layout
          navbar={navbar}
          pageMap={await getPageMap()}
          docsRepositoryBase="https://github.com/xelis-project/xelis-docs/blob/master"
          footer={footer}
        >
          {children}
        </Layout>
      </body>
    </html>
  )
}