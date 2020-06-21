import { useEffect } from 'react'
import Router from 'next/router'
import * as gtag from '../lib/gtag'
import Layout from '../components/Layout';

export default function App({ Component, pageProps }) {
  useEffect(() => {
    const handleRouteChange = (url) => {
      gtag.pageview(url)
    }
    Router.events.on('routeChangeComplete', handleRouteChange)
    return () => {
      Router.events.off('routeChangeComplete', handleRouteChange)
    }
  }, [])

  return (
    <Layout>
      <Component {...pageProps} />
    </Layout>
  )
}