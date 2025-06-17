import { useState, useEffect } from 'react'
import { GetServerSideProps } from 'next'
import Head from 'next/head'
import Image from 'next/image'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { motion } from 'framer-motion'
import { prisma } from '@/prisma'
import { useLanguage } from '@/contexts/LanguageContext'
import LanguageSwitcher from '@/components/LanguageSwitcher'
import Penguins from '../../../public/penguins.svg'
import { 
  getCoupleNames,
  getFormattedDate,
  getWeddingEvents
} from '@/utils/weddingHelpers'

const rsvpSchema = z.object({
  RSVP: z.boolean(),
  RSVPOthersYes: z.string().optional(),
  RSVPOthersNo: z.string().optional(),
  notes: z.string().optional()
})

type RSVPForm = z.infer<typeof rsvpSchema>

interface Guest {
  id: number
  firstName: string
  lastName: string
  email: string | null
  bridalParty: boolean
  RSVP: boolean | null
  RSVPOthersYes: string | null
  RSVPOthersNo: string | null
  RSVPDate: string | null
}

interface RSVPPageProps {
  guest: Guest
  token: string
}

export default function RSVPPage({ guest, token }: RSVPPageProps) {
  const { t, language } = useLanguage()
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')
  const [showOthers, setShowOthers] = useState(false)
  const [currentGuest, setCurrentGuest] = useState(guest)

  const coupleNames = getCoupleNames()
  const dateInfo = getFormattedDate(language)
  const weddingEvents = getWeddingEvents()

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<RSVPForm>({
    resolver: zodResolver(rsvpSchema),
    defaultValues: {
      RSVP: currentGuest.RSVP ?? undefined,
      RSVPOthersYes: currentGuest.RSVPOthersYes || '',
      RSVPOthersNo: currentGuest.RSVPOthersNo || '',
      notes: ''
    }
  })

  const watchRSVP = watch('RSVP')

  useEffect(() => {
    if (currentGuest.RSVP !== null) {
      setSubmitted(true)
    }
  }, [currentGuest.RSVP])

  const onSubmit = async (data: RSVPForm) => {
    setLoading(true)
    setError('')

    try {
      const response = await fetch(`/api/rsvp/${token}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      })

      if (response.ok) {
        const updatedGuest = await response.json()
        setCurrentGuest(updatedGuest)
        setSubmitted(true)
      } else {
        const errorData = await response.json()
        setError(errorData.error || 'Failed to submit RSVP')
      }
    } catch (error) {
      setError('Network error occurred')
    } finally {
      setLoading(false)
    }
  }

  if (submitted) {
    return (
      <>
        <Head>
          <title>{t('rsvpPage.thankYou')} - {coupleNames.bride} & {coupleNames.groom}</title>
        </Head>
        
        <div data-theme="green" className="min-h-screen flex items-center justify-center bg-base-200 py-12 px-4">
          <div className="absolute top-4 right-4 z-10">
            <LanguageSwitcher />
          </div>
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-md w-full text-center"
          >
            <div className="card bg-base-100 shadow-2xl">
              <div className="card-body">
                <div className="mb-6">
                  <Image 
                    src={Penguins} 
                    alt="Wedding Logo" 
                    width={120} 
                    height={120} 
                    className="mx-auto"
                  />
                </div>
                
                <h1 className="text-3xl font-bold text-neutral mb-4">
                  {t('rsvpPage.thankYou')}
                </h1>
                
                <div className="space-y-4">
                  <p className="text-lg">
                    {t('rsvpPage.thankYouMessage')}, {currentGuest.firstName}!
                  </p>
                  
                  {currentGuest.RSVP === true ? (
                    <div className="alert alert-success">
                      <span>{t('rsvpPage.excited')}</span>
                    </div>
                  ) : (
                    <div className="alert alert-info">
                      <span>{t('rsvpPage.missYou')}</span>
                    </div>
                  )}
                  
                  <div className="text-sm text-neutral/70">
                    <p>{dateInfo.weekday}, {dateInfo.dayNumber} {dateInfo.monthYear}</p>
                    <p>{weddingEvents.venue.name}</p>
                    <p>{weddingEvents.venue.location}</p>
                  </div>
                  
                  {currentGuest.RSVP === true && (
                    <div className="mt-6 p-4 bg-base-200 rounded-lg">
                      <p className="text-sm font-medium">{t('rsvpPage.whatToExpected')}</p>
                      <p className="text-sm text-neutral/70 mt-1">
                        {weddingEvents.ceremony.description} {t('rsvpPage.followedBy')} {weddingEvents.ceremony.refreshmentsNote}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </>
    )
  }

  return (
    <>
      <Head>
        <title>{t('rsvpPage.title')} - {coupleNames.bride} & {coupleNames.groom}</title>
      </Head>
      
      <div data-theme="green" className="min-h-screen bg-base-200 py-12 px-4">
        <div className="absolute top-4 right-4 z-10">
          <LanguageSwitcher />
        </div>
        
        <div className="max-w-2xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            {/* Header */}
            <div className="text-center">
              <div className="mb-6">
                <Image 
                  src={Penguins} 
                  alt="Wedding Logo" 
                  width={150} 
                  height={150} 
                  className="mx-auto"
                />
              </div>
              
              <h1 className="text-4xl md:text-5xl font-bold text-neutral mb-4">
                {coupleNames.bride} & {coupleNames.groom}
              </h1>
              
              <div className="text-xl text-neutral/80 mb-2">
                {dateInfo.weekday}, {dateInfo.dayNumber} {dateInfo.monthYear}
              </div>
              
              <div className="text-lg text-neutral/70">
                {weddingEvents.venue.name}, {weddingEvents.venue.location}
              </div>
            </div>

            {/* Personal Welcome */}
            <div className="card bg-base-100 shadow-xl">
              <div className="card-body text-center">
                <h2 className="text-2xl font-bold text-neutral mb-4">
                  Hi {currentGuest.firstName}!
                  {currentGuest.bridalParty && (
                    <span className="badge badge-secondary badge-lg ml-3">{t('rsvpPage.bridalParty')}</span>
                  )}
                </h2>
                <p className="text-lg text-neutral/80">
                  {t('rsvpPage.welcomeMessage')}
                </p>
              </div>
            </div>

            {/* RSVP Form */}
            <div className="card bg-base-100 shadow-xl">
              <div className="card-body">
                <h3 className="card-title text-center mb-6">{t('rsvpPage.pleaseRespond')}</h3>
                
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                  {/* Attendance Question */}
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text text-lg font-medium">{t('rsvpPage.willYouAttend')}</span>
                    </label>
                    <div className="flex gap-4">
                      <label className="cursor-pointer flex-1">
                        <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-base-200 transition-colors">
                          <input 
                            type="radio" 
                            className={`radio ${watchRSVP === true ? 'radio-success' : ''}`}
                            value="true"
                            {...register('RSVP', { 
                              setValueAs: (value) => value === 'true' 
                            })}
                            onChange={() => setValue('RSVP', true)}
                            checked={watchRSVP === true}
                          />
                          <div className="flex-1">
                            <span className="text-lg font-medium">{t('rsvpPage.yesAttending')}</span>
                            <div className="text-2xl">🎉</div>
                          </div>
                        </div>
                        {watchRSVP === true && (
                          <div className="mt-2 ml-8 text-sm text-success">
                            ✓ {t('rsvpPage.excited')}
                          </div>
                        )}
                      </label>
                      
                      <label className="cursor-pointer flex-1">
                        <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-base-200 transition-colors">
                          <input 
                            type="radio" 
                            className={`radio ${watchRSVP === false ? 'radio-error' : ''}`}
                            value="false"
                            {...register('RSVP', { 
                              setValueAs: (value) => value === 'true' 
                            })}
                            onChange={() => setValue('RSVP', false)}
                            checked={watchRSVP === false}
                          />
                          <div className="flex-1">
                            <span className="text-lg font-medium">{t('rsvpPage.noAttending')}</span>
                            <div className="text-2xl">😔</div>
                          </div>
                        </div>
                        {watchRSVP === false && (
                          <div className="mt-2 ml-8 text-sm text-error">
                            {t('rsvpPage.missYou')}
                          </div>
                        )}
                      </label>
                    </div>
                  </div>

                  {/* Additional Guests Section */}
                  {watchRSVP !== undefined && (
                    <div className="space-y-4">
                      <div className="form-control">
                        <label className="cursor-pointer label justify-start gap-3">
                          <input 
                            type="checkbox" 
                            className="checkbox checkbox-primary"
                            checked={showOthers}
                            onChange={(e) => setShowOthers(e.target.checked)}
                          />
                          <span className="label-text">I'm responding for additional guests</span>
                        </label>
                      </div>

                      {showOthers && (
                        <div className="grid gap-4">
                          <div className="form-control">
                            <label className="label">
                              <span className="label-text">Who else is attending?</span>
                            </label>
                            <textarea
                              className="textarea textarea-bordered"
                              placeholder="Names of additional guests who will attend..."
                              rows={2}
                              {...register('RSVPOthersYes')}
                            />
                          </div>

                          <div className="form-control">
                            <label className="label">
                              <span className="label-text">Who else can't make it?</span>
                            </label>
                            <textarea
                              className="textarea textarea-bordered"
                              placeholder="Names of additional guests who can't attend..."
                              rows={2}
                              {...register('RSVPOthersNo')}
                            />
                          </div>
                        </div>
                      )}

                      {/* Notes */}
                      <div className="form-control">
                        <label className="label">
                          <span className="label-text">
                            {watchRSVP ? 'Dietary requirements or special notes:' : 'Any message for us:'}
                          </span>
                        </label>
                        <textarea
                          className="textarea textarea-bordered"
                          placeholder={
                            watchRSVP 
                              ? "Let us know about any dietary restrictions, allergies, or special requests..."
                              : "We'd love to hear from you..."
                          }
                          rows={3}
                          {...register('notes')}
                        />
                      </div>
                    </div>
                  )}

                  {/* Error Display */}
                  {error && (
                    <div className="alert alert-error">
                      <span>{error}</span>
                    </div>
                  )}

                  {/* Submit Button */}
                  <div className="text-center">
                    <button
                      type="submit"
                      disabled={loading || watchRSVP === undefined}
                      className="btn btn-primary btn-lg"
                    >
                      {loading ? (
                        <>
                          <span className="loading loading-spinner loading-sm"></span>
                          Submitting...
                        </>
                      ) : (
                        'Submit RSVP'
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>

            {/* Wedding Info */}
            <div className="card bg-base-100 shadow-xl">
              <div className="card-body">
                <h3 className="card-title">Wedding Details</h3>
                <div className="space-y-3 text-sm">
                  <div>
                    <span className="font-medium">When:</span> {dateInfo.weekday}, {dateInfo.dayNumber} {dateInfo.monthYear} at {dateInfo.time}
                  </div>
                  <div>
                    <span className="font-medium">Where:</span> {weddingEvents.venue.name}, {weddingEvents.venue.location}
                  </div>
                  <div>
                    <span className="font-medium">Event:</span> {weddingEvents.ceremony.description}
                  </div>
                  <div>
                    <span className="font-medium">Dress Code:</span> Semi-formal/Cocktail 🍸
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </>
  )
}

export const getServerSideProps: GetServerSideProps = async ({ params }) => {
  const token = params?.token as string

  if (!token) {
    return {
      notFound: true
    }
  }

  try {
    const guest = await prisma.user.findUnique({
      where: { rsvpToken: token },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        bridalParty: true,
        RSVP: true,
        RSVPOthersYes: true,
        RSVPOthersNo: true,
        RSVPDate: true
      }
    })

    if (!guest) {
      return {
        notFound: true
      }
    }

    // Update rsvpViewedAt if this is the first time viewing
    await prisma.user.update({
      where: { rsvpToken: token },
      data: { 
        rsvpViewedAt: new Date() 
      }
    })

    return {
      props: {
        guest: {
          ...guest,
          RSVPDate: guest.RSVPDate?.toISOString() || null
        },
        token
      }
    }
  } catch (error) {
    console.error('Error fetching guest for RSVP:', error)
    return {
      notFound: true
    }
  }
}