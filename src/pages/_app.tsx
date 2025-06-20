import '@/styles/globals.css'
import localFont from 'next/font/local'
import type { AppProps } from 'next/app'
import { LanguageProvider } from '@/contexts/LanguageContext'
import Head from 'next/head'
import { Router } from 'next/router'
import { useEffect, useState } from 'react'

const ogg = localFont({
  src: [
    {
      path: '../../public/fonts/Ogg Medium.ttf',
      weight: '500',
      style: 'normal',
    },
    {
      path: '../../public/fonts/Ogg Light.ttf',
      weight: '300',
      style: 'normal',
    },
  ],
  variable: '--font-ogg',
})

const styreneA = localFont({
  src: [
    {
      path: '../../public/fonts/StyreneALC-Bold.otf',
      weight: '700',
      style: 'normal',
    },
    {
      path: '../../public/fonts/StyreneALC-BoldItalic.otf',
      weight: '700',
      style: 'italic',
    },
    {
      path: '../../public/fonts/StyreneALC-Medium.otf',
      weight: '500',
      style: 'normal',
    },
    {
      path: '../../public/fonts/StyreneALC-MediumItalic.otf',
      weight: '500',
      style: 'italic',
    },
    {
      path: '../../public/fonts/StyreneALC-Thin.otf',
      weight: '100',
      style: 'normal',
    },
    {
      path: '../../public/fonts/StyreneALC-ThinItalic.otf',
      weight: '100',
      style: 'italic',
    },
  ],
  variable: '--font-styrene-a',
})

const styreneB = localFont({
  src: [
    {
      path: '../../public/fonts/StyreneBLC-Bold.otf',
      weight: '700',
      style: 'normal',
    },
    {
      path: '../../public/fonts/StyreneBLC-BoldItalic.otf',
      weight: '700',
      style: 'italic',
    },
    {
      path: '../../public/fonts/StyreneBLC-Regular.otf',
      weight: '400',
      style: 'normal',
    },
    {
      path: '../../public/fonts/StyreneBLC-RegularItalic.otf',
      weight: '400',
      style: 'italic',
    },
    {
      path: '../../public/fonts/StyreneBLC-Light.otf',
      weight: '300',
      style: 'normal',
    },
    {
      path: '../../public/fonts/StyreneBLC-LightItalic.otf',
      weight: '300',
      style: 'italic',
    },
  ],
  variable: '--font-styrene-b',
})

export default function App({ Component, pageProps }: AppProps) {
  const [loading, setLoading] = useState(false)
  useEffect(() => {
    const start = () => {
      setLoading(true)
    }
    const end = () => {
      setLoading(false)
    }
    Router.events.on('routeChangeStart', start)
    Router.events.on('routeChangeComplete', end)
    Router.events.on('routeChangeError', end)
    return () => {
      Router.events.off('routeChangeStart', start)
      Router.events.off('routeChangeComplete', end)
      Router.events.off('routeChangeError', end)
    }
  }, [])
  return (
    <LanguageProvider>
      <main className={`${ogg.variable} ${styreneA.variable} ${styreneB.variable}`}>
        <Head>
          <title>Hanh & Khanh</title>
          <meta name='description' content='Our Wedding' />
          <meta name='viewport' content='width=device-width, initial-scale=1' />
          <link rel='apple-touch-icon' sizes='180x180' href='/apple-touch-icon.png' />
          <link rel='icon' type='image/png' sizes='32x32' href='/favicon-32x32.png' />
          <link rel='icon' type='image/png' sizes='16x16' href='/favicon-16x16.png' />
          <link rel='manifest' href='/site.webmanifest' />
          <link rel='mask-icon' href='/safari-pinned-tab.svg' color='#31553d' />
          <meta name='msapplication-TileColor' content='#603cba' />
          <meta name='theme-color' content='#31553d' />
        </Head>
        {loading ? (
          <div className='h-screen w-screen flex items-center justify-center'>
            <span className='loading loading-infinity loading-lg' />
          </div>
        ) : (
          <Component {...pageProps} />
        )}
      </main>
    </LanguageProvider>
  )
}
