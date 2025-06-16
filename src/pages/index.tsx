import type { NextPage } from 'next'
import Image from 'next/image'
import { useRouter } from 'next/router'
import { useCallback, useEffect, useState } from 'react'
import { signIn, useSession } from 'next-auth/react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { loginSchema, ILogin } from './api/auth/validation'
import { getCoupleNames } from '@/utils/weddingHelpers'
import { useLanguage } from '@/contexts/LanguageContext'
import LanguageSwitcher from '@/components/LanguageSwitcher'
import Penguins from '../../public/penguins.svg'
import { motion } from 'framer-motion'
import { loginText, letter } from '@/utils/motionText'

const Home: NextPage = () => {
  const { register, handleSubmit } = useForm<ILogin>({
    resolver: zodResolver(loginSchema),
  })
  const [wrong, setWrong] = useState(false)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const { data: session, status } = useSession()
  const [pushed, setPushed] = useState(false)
  const coupleNames = getCoupleNames()
  const { t } = useLanguage()

  useEffect(() => {
    if (status === 'authenticated') {
      if (pushed) return
      router.push('/dashboard')
      setPushed(true)
    }
  }, [router, session])

  const onSubmit = useCallback(async (data: ILogin) => {
    setLoading(true)
    
    try {
      const result = await signIn('credentials', { 
        ...data, 
        redirect: false, 
        callbackUrl: '/dashboard' 
      })
      
      if (result?.ok) {
        if (pushed) return
        router.push('/dashboard')
        setPushed(true)
      } else {
        if (result?.error === 'CredentialsSignin') setWrong(true)
      }
    } catch (error) {
      setWrong(true)
    } finally {
      setLoading(false)
    }
  }, [pushed, router])

  const handleChange = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (/[^a-zA-Z]+$/.test(e.key) && e.key !== '-' && e.key !== ' ') e.preventDefault()
  }

  if (status === 'unauthenticated') {
    return (
      <div data-theme='green'>
        <div className='absolute top-4 right-4 z-10'>
          <LanguageSwitcher />
        </div>
        <main className='flex items-center justify-center h-[calc(100dvh)] font-body tracking-wide min-w-[360px] min-h-[750px] px-8 my-8 lg:my-0'>
          <form onSubmit={handleSubmit(onSubmit)} autoComplete='false'>
            <div className='flex items-center justify-center flex-col w-full lg:space-x-10 lg:flex-row'>
              <motion.div initial={{ opacity: 0, scale: 0 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.2 }}>
                <Image priority style={{ display: 'flex', width: '13em' }} src={Penguins} alt='Penguins' />
              </motion.div>
              <motion.div
                variants={loginText}
                initial='hidden'
                animate='visible'
                className='flex flex-col justify-center mt-6 mb-9 lg:my-0 card-title font-heading font-medium tracking-wide text-7xl lg:text-8xl text-neutral whitespace-pre'
              >
                <h1>
                  {coupleNames.bride.split('').map((char, index) => {
                    return (
                      <motion.span key={char + '-' + index} variants={letter}>
                        {char}
                      </motion.span>
                    )
                  })}
                  <span className='font-light ml-3'>
                    {'&'.split('').map((char, index) => {
                      return (
                        <motion.span key={char + '-' + index} variants={letter}>
                          {char}
                        </motion.span>
                      )
                    })}
                  </span>
                </h1>
                <h1>
                  {(coupleNames.groom + ' ').split('').map((char, index) => {
                    return (
                      <motion.span key={char + '-' + index} variants={letter}>
                        {char}
                      </motion.span>
                    )
                  })}
                </h1>
              </motion.div>
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: '388px' }}
                transition={{ duration: 0.5, delay: 0.65 }}
                className='divider hidden lg:flex lg:divider-horizontal self-center'
              ></motion.div>
              <motion.div
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 1 }}
                className='grid max-w-96 card text-base-100 bg-neutral'
              >
                <div className='card-body'>
                  <h1 className='card-title justify-center font-display font-light text-5xl mb-6'>{t('homepage.welcome')}</h1>
                  <div className='form-control w-full max-w-xs'>
                    <div className='join'>
                      <div className='join-item'>
                        <label className='label'>
                          <span className='label-text text-base-100 font-light'>{t('homepage.firstName')}</span>
                        </label>
                        <input
                          type='text'
                          autoComplete='off'
                          aria-autocomplete='none'
                          placeholder={t('homepage.placeholders.firstName')}
                          className='input w-full max-w-xs text-neutral placeholder-accent'
                          onKeyDown={handleChange}
                          {...register('firstName')}
                        />
                      </div>
                      <div className='join-item'>
                        <label className='label ml-3'>
                          <span className='label-text text-base-100 font-light'>{t('homepage.lastName')}</span>
                        </label>
                        <input
                          type='text'
                          autoComplete='off'
                          aria-autocomplete='none'
                          placeholder={t('homepage.placeholders.lastName')}
                          className='input join-item w-full max-w-xs text-neutral placeholder-accent mr-3'
                          onKeyDown={handleChange}
                          {...register('lastName')}
                        />
                      </div>
                    </div>
                    <label className='label mt-1'>
                      <span className='label-text text-base-100 font-light'>{t('homepage.password')}</span>
                    </label>
                    <input
                      type='password'
                      placeholder={t('homepage.placeholders.password')}
                      className='input w-full max-w-xs mb-2 text-neutral placeholder-accent'
                      {...register('password')}
                    />
                  </div>
                  <button className='btn btn-secondary mt-2 font-display font-bold tracking-wider' type='submit' onClick={() => setWrong(false)}>
                    {(loading && <span className='loading loading-infinity loading-sm'></span>) || t('homepage.login')}
                  </button>
                  {wrong && (
                    <div className='flex justify-center mt-2'>
                      <div className='badge badge-error font-light'>{t('homepage.credentialsIncorrect')}</div>
                    </div>
                  )}
                </div>
              </motion.div>
            </div>
          </form>
        </main>
      </div>
    )
  } else {
    return (
      <div className='h-screen w-screen flex items-center justify-center'>
        <span className='loading loading-infinity loading-lg' />
      </div>
    )
  }
}

export default Home
