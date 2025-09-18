import { generateStaticParamsFor, importPage } from 'nextra/pages'
import { useMDXComponents as getMDXComponents } from '../../mdx-components'
 
export const generateStaticParams = generateStaticParamsFor('mdxPath')
 
export async function generateMetadata(props) {
  const params = await props.params
  const { metadata } = await importPage(params.mdxPath)

  return {
    title: metadata.title || 'XELIS Documentation',
    description: metadata.description || 'Detailed information on the core features and functionality of XELIS'
  }
}
 
const Wrapper = getMDXComponents().wrapper
 
export default async function Page(props) {
  const params = await props.params
  const {
    default: MDXContent,
    toc,
    metadata,
    sourceCode
  } = await importPage(params.mdxPath)
  return (
    <Wrapper toc={toc} metadata={metadata} sourceCode={sourceCode}>
      <MDXContent {...props} params={params} />
    </Wrapper>
  )
}