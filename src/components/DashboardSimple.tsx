import React from 'react'
import { motion } from 'framer-motion'
import { dashboardText, letter } from '@/utils/motionText'
import Image from 'next/image'
// SVG will be referenced as a URL string instead of import
import { useCallback, useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import 'leaflet/dist/leaflet.css'
import { 
  getFormattedDate, 
  getCoupleNames, 
  getMapCoordinates,
  getWeddingEvents,
  getSocialMediaLinks,
  getContactInfo
} from '@/utils/weddingHelpers'
import { useLanguage } from '@/contexts/LanguageContext'
import LanguageSwitcher from '@/components/LanguageSwitcher'
import useEmblaCarousel from 'embla-carousel-react'

// Dynamically import map to avoid SSR issues
const DynamicMap = dynamic(() => import('./Map'), { 
  ssr: false,
  loading: () => <div className="flex items-center justify-center h-96 bg-base-300 rounded-t-2xl">
    <span className="loading loading-spinner loading-lg"></span>
  </div>
})

declare global {
  interface Window {
    modal: any
  }
}

interface DashboardProps {
  rsvps: any[]
  slides: string[]
}

const Dashboard: React.FC<DashboardProps> = ({ rsvps, slides }) => {
  const { t, language } = useLanguage()
  const [openTab, setOpenTab] = useState(1)
  const [zoomed, setZoomed] = useState(false)
  const handleZoomToggle = () => {
    setZoomed(!zoomed)
  }

  const [countdown, setCountdown] = useState('Countdown')
  const [smallCountdown, setSmallCountdown] = useState('Countdown')

  const dateInfo = getFormattedDate(language)
  const coupleNames = getCoupleNames()
  const mapCoords = getMapCoordinates()
  const weddingEvents = getWeddingEvents()
  const socialMedia = getSocialMediaLinks()
  const contactInfo = getContactInfo()

  const [index, setIndex] = useState(0)
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, skipSnaps: true, startIndex: index })
  const [emblaModalRef, emblaModalApi] = useEmblaCarousel({ loop: true, skipSnaps: true, startIndex: index })

  // Gallery navigation functions
  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev()
  }, [emblaApi])

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext()
  }, [emblaApi])

  const scrollPrevModal = useCallback(() => {
    if (emblaModalApi) emblaModalApi.scrollPrev()
  }, [emblaModalApi])

  const scrollNextModal = useCallback(() => {
    if (emblaModalApi) emblaModalApi.scrollNext()
  }, [emblaModalApi])

  const onSettle = useCallback((emblaApi: any) => {
    if (emblaApi) setIndex(emblaApi.selectedScrollSnap())
  }, [])

  const onSettleModal = useCallback((emblaModalApi: any) => {
    if (emblaModalApi) setIndex(emblaModalApi.selectedScrollSnap())
  }, [])

  const onInit = useCallback((emblaApi: any) => {
    emblaApi.scrollTo(index)
  }, [index])

  const onModalInit = useCallback((emblaModalApi: any) => {
    emblaModalApi.scrollTo(index)
  }, [index])

  useEffect(() => {
    if (emblaApi) emblaApi.on('init', onInit)
  }, [emblaApi, onInit])

  useEffect(() => {
    if (emblaModalApi) emblaModalApi.on('init', onModalInit)
  }, [emblaModalApi, onModalInit])

  useEffect(() => {
    if (emblaApi) emblaApi.on('settle', onSettle)
  }, [emblaApi, onSettle])

  useEffect(() => {
    if (emblaModalApi) emblaModalApi.on('settle', onSettleModal)
  }, [emblaModalApi, onSettleModal])

  useEffect(() => {
    const targetDate = dateInfo.timestamp

    const interval = setInterval(() => {
      const now = new Date().getTime()
      const difference = targetDate - now

      if (difference <= 0) {
        clearInterval(interval)
        setCountdown("It's here!")
        setSmallCountdown("It's here!")
      } else {
        const days = Math.floor(difference / (1000 * 60 * 60 * 24))
        const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60))
        const seconds = Math.floor((difference % (1000 * 60)) / 1000)
        setCountdown(`${days}d ${hours}h ${minutes}m ${seconds}s`)
        setSmallCountdown(`${days}d ${hours}h`)
      }
    }, 1000)

    return () => clearInterval(interval)
  }, [dateInfo.timestamp])

  return (
      <div data-theme='green' className='flex min-w-[360px] overflow-x-hidden font-body font-light text-neutral text-lg tracking-wide'>
        <div className='absolute top-20 right-4 z-50'>
          <LanguageSwitcher />
        </div>
        <main className='flex flex-col items-center min-w-[360px] h-[calc(100dvh)] w-screen px-8 lg:my-0'>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 1 }}
            className='mt-9 mb-10 font-display font-bold text-base hidden sm:block'
          >
            {countdown}
          </motion.div>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 1 }}
            className='mt-7 mb-10 font-display font-bold text-base block sm:hidden'
          >
            {smallCountdown}
          </motion.div>
          <div className='relative flex items-center justify-center w-full h-fit'>
            <motion.div
              className='absolute flex items-center justify-center w-[30%] mt-4 sm:mt-8 md:mt-9'
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <Image className='w-full max-w-[13em]' priority src="/penguins.svg" alt='Penguins' width={208} height={208} />
            </motion.div>
            <motion.svg className='max-h-[20em] w-full' viewBox='0 0 2778 1400' xmlns='http://www.w3.org/2000/svg'>
              <motion.path
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{
                  duration: 1,
                  ease: 'easeInOut',
                }}
                strokeWidth={12}
                strokeLinecap='round'
                strokeDasharray='0 1'
                fill='none'
                stroke='#fff'
                d='M424.691,1383.09c-0,0 -409.529,0 -409.541,0c58.584,-330.212 192.999,-625.431 379.467,-856.224c254.593,-315.113 606.221,-510.125 994.358,-510.125c672.415,-0 1235.26,585.283 1373.83,1366.35c0,0 -407.892,0 -407.892,0'
              />
            </motion.svg>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.7 }}
            className='flex flex-wrap justify-center font-display font-medium text-xl text-center tracking-wider mb-10 mt-[-0.9em] mx-8 px-4 space-x-2 bg-base-100'
          >
            <div className='flex flex-row whitespace-nowrap space-x-2'>
              <span>{coupleNames.brideWithSubtitle.first}</span>
              <span className='hidden sm:block'>{coupleNames.brideWithSubtitle.subtitle}</span>
              <span className='hidden md:block'>{coupleNames.brideWithSubtitle.surname}</span>
            </div>
            <div>•</div>
            <div className='flex flex-row whitespace-nowrap space-x-2'>
              <span>{coupleNames.groomWithSubtitle.first}</span> <span className='hidden md:block'>{coupleNames.groomWithSubtitle.subtitle}</span>
              <span className='hidden sm:block'>{coupleNames.groomWithSubtitle.surname}</span>
            </div>
          </motion.div>
          <motion.h1
            variants={dashboardText}
            initial='hidden'
            animate='visible'
            className='justify-center text-center max-w-[85vw] min-w-[296px] font-heading font-light tracking-wide text-5xl sm:text-6xl md:text-7xl lg:text-8xl mb-4'
          >
            {'Welcome to our '.split('').map((char, index) => {
              return (
                <motion.span key={char + '-' + index} variants={letter}>
                  {char}
                </motion.span>
              )
            })}
            <span className='font-medium'>
              {'Wedding'.split('').map((char, index) => {
                return (
                  <motion.span key={char + '-' + index} variants={letter}>
                    {char}
                  </motion.span>
                )
              })}
            </span>
            <motion.span key={'!'} variants={letter}>
              !
            </motion.span>
          </motion.h1>
          <motion.div
            exit={{ opacity: 0, y: 20 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 1.2 }}
            className='max-w-[900px] mb-10'
          >
            <ul className='menu menu-horizontal bg-base-200 text-accent rounded-box mt-6'>
              <li>
                <a
                  data-tip='Map'
                  className={'sm:tooltip tooltip-primary' + (openTab === 1 && ' active hover:bg-neutral')}
                  onClick={(e) => {
                    e.preventDefault()
                    setOpenTab(1)
                  }}
                >
                  <svg xmlns='http://www.w3.org/2000/svg' className='h-6 w-6' fill='currentColor' viewBox='0 -960 960 960'>
                    <path
                      xmlns='http://www.w3.org/2000/svg'
                      d='m598.5-130-237-83-180 70q-19 8-35.5-3.75t-16.5-32.184V-723.85q0-12.65 7.25-22.65 7.25-10 19.75-14.5l205-70 237 83 180-70q19-8 35.5 3.75t16.5 32.22v545.858q0 12.672-7.25 22.672T803.5-200l-205 70Zm-38-92v-461l-161-56v461l161 56Zm75 0 120-40v-467l-120 46v461Zm-431-10 120-46v-461l-120 40v467Zm431-451v461-461Zm-311-56v461-461Z'
                    />
                  </svg>
                </a>
              </li>
              <li>
                <a
                  data-tip='Info'
                  className={'sm:tooltip tooltip-primary' + (openTab === 2 && ' active hover:bg-neutral')}
                  onClick={(e) => {
                    e.preventDefault()
                    setOpenTab(2)
                  }}
                >
                  <svg xmlns='http://www.w3.org/2000/svg' className='h-6 w-6' fill='currentColor' viewBox='0 -960 960 960'>
                    <path
                      xmlns='http://www.w3.org/2000/svg'
                      d='M443-285h75v-234h-75v234Zm36.895-311Q496-596 507-606.895q11-10.894 11-27Q518-650 507.105-661q-10.894-11-27-11Q464-672 453-661.105q-11 10.894-11 27Q442-618 452.895-607q10.894 11 27 11ZM480-90q-80.907 0-152.065-30.763-71.159-30.763-123.797-83.5Q151.5-257 120.75-328.087 90-399.175 90-480q0-80.907 30.763-152.065 30.763-71.159 83.5-123.797Q257-808.5 328.087-839.25 399.175-870 480-870q80.907 0 152.065 30.763 71.159 30.763 123.797 83.5Q808.5-703 839.25-631.913 870-560.825 870-480q0 80.907-30.763 152.065-30.763 71.159-83.5 123.797Q703-151.5 631.913-120.75 560.825-90 480-90Zm0-75q131.5 0 223.25-91.75T795-480q0-131.5-91.75-223.25T480-795q-131.5 0-223.25 91.75T165-480q0 131.5 91.75 223.25T480-165Zm0-315Z'
                    />
                  </svg>
                </a>
              </li>
              <li>
                <a
                  data-tip='Photos'
                  className={'sm:tooltip tooltip-primary' + (openTab === 3 && ' active hover:bg-neutral')}
                  onClick={(e) => {
                    e.preventDefault()
                    setOpenTab(3)
                  }}
                >
                  <svg xmlns='http://www.w3.org/2000/svg' className='h-6 w-6' fill='currentColor' viewBox='0 -960 960 960'>
                    <path
                      xmlns='http://www.w3.org/2000/svg'
                      d='M117.5-202.5q-30.938 0-52.969-22.031Q42.5-246.562 42.5-277.5v-405q0-30.938 22.031-52.969Q86.562-757.5 117.5-757.5h405q30.938 0 52.969 22.031Q597.5-713.438 597.5-682.5v405q0 30.938-22.031 52.969Q553.438-202.5 522.5-202.5h-405Zm602.5-320q-15.5 0-26.5-11t-11-26.5v-160q0-15.5 11-26.5t26.5-11h160q15.5 0 26.5 11t11 26.5v160q0 15.5-11 26.5t-26.5 11H720Zm37.5-75h85v-85h-85v85Zm-640 320h405v-405h-405v405Zm47.5-85h310L375-496l-75 100-55-73-80 106.5Zm555 160q-15.5 0-26.5-11t-11-26.5v-160q0-15.5 11-26.5t26.5-11h160q15.5 0 26.5 11t11 26.5v160q0 15.5-11 26.5t-26.5 11H720Zm37.5-75h85v-85h-85v85Zm-640 0v-405 405Zm640-320v-85 85Zm0 320v-85 85Z'
                    />
                  </svg>
                </a>
              </li>
            </ul>
          </motion.div>

          <div className='pb-9'>
            {openTab === 1 && (
              <motion.div
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className='flex flex-col max-w-[700px] w-[85vw] min-w-[296px] min-h-[25em] bg-base-200 text-accent rounded-2xl xl-shadow'
              >
                <DynamicMap
                  venueCoords={[mapCoords.venue[1], mapCoords.venue[0]]}
                  venueName={weddingEvents.venue.name}
                  venueLocation={weddingEvents.venue.location}
                  googleMapsUrl="https://maps.app.goo.gl/NdZBAiFP9M4Y7azRA"
                  onZoomToggle={handleZoomToggle}
                  zoomed={zoomed}
                  t={t}
                />
                <div>
                  <h2 className='mx-5 pt-5 justify-center font-medium text-xl text-center tracking-wide'>
                    <a 
                      href="https://maps.app.goo.gl/NdZBAiFP9M4Y7azRA"
                      target='_blank'
                      rel='noopener noreferrer'
                      className='text-neutral hover:text-secondary transition-colors duration-200 hover:underline'
                    >
                      {weddingEvents.venue.name.toLowerCase()}
                    </a>
                    <span className='hidden sm:inline'> • </span>
                    <br className='sm:hidden'></br>
                    {weddingEvents.venue.location.toLowerCase()}
                  </h2>
                  <p className='mx-5 mb-5 justify-center font-medium text-xl text-center tracking-wide'>
                    {dateInfo.dayNumber}
                    <sup>Þ </sup>
                    {dateInfo.monthYear}
                    <span className='hidden sm:inline'> • </span>
                    <br className='sm:hidden' />
                    {dateInfo.weekday + ' ' + dateInfo.time}
                  </p>
                </div>
              </motion.div>
            )}

            {openTab === 2 && (
              <motion.div
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className='flex flex-col max-w-[700px] w-[85vw] min-w-[296px] bg-base-200 text-accent rounded-2xl xl-shadow'
              >
                <div className='join join-vertical w-full'>
                  <div className='collapse collapse-arrow join-item border border-base-100'>
                    <input type='radio' name='info' defaultChecked />
                    <div className='collapse-title text-xl font-medium'>Format</div>
                    <div className='collapse-content'>
                      <p className='text-center text-sm sm:text-base text-neutral'>
                        {weddingEvents.ceremony.description}{' '}
                        <span className='whitespace-nowrap'>
                          Cake & Coffee → Photos <span className='text-secondary'> → Dinner</span>
                        </span>{' '}
                      </p>
                    </div>
                  </div>
                  <div className='collapse collapse-arrow join-item border border-base-100'>
                    <input type='radio' name='info' />
                    <div className='collapse-title text-xl font-medium'>Alcohol</div>
                    <div className='collapse-content'>
                      <p className='text-sm sm:text-base text-neutral'>
                        {weddingEvents.ceremony.refreshmentsNote}
                      </p>
                    </div>
                  </div>
                  <div className='collapse collapse-arrow join-item border border-base-100'>
                    <input type='radio' name='info' />
                    <div className='collapse-title text-xl font-medium'>Children</div>
                    <div className='collapse-content'>
                      <p className='text-sm sm:text-base text-neutral'>
                        Unfortunately, due to guest number restrictions, we are only able to extend this invite to the children of close family.
                      </p>
                    </div>
                  </div>
                  <div className='collapse collapse-arrow join-item border border-base-100'>
                    <input type='radio' name='info' />
                    <div className='collapse-title text-xl font-medium'>Dress Code</div>
                    <div className='collapse-content'>
                      <p className='text-sm sm:text-base text-neutral'>Semi-formal/Cocktail 🍸</p>
                    </div>
                  </div>
                  <div className='collapse collapse-arrow join-item border border-base-100'>
                    <input type='radio' name='info' />
                    <div className='collapse-title text-xl font-medium text-secondary'>Dinner</div>
                    <div className='collapse-content'>
                      <p className='text-center md:text-left text-sm sm:text-base text-neutral'>
                        You're invited to our {weddingEvents.reception.description}!
                        <br />
                        <b>{weddingEvents.ceremony.time} in {weddingEvents.reception.venue} @ {weddingEvents.venue.name}</b>
                        <br />
                        Please let us know if you have any dietary requirements.
                      </p>
                    </div>
                  </div>
                  <div className='collapse collapse-arrow join-item border border-base-100'>
                    <input type='radio' name='info' />
                    <div className='collapse-title text-xl font-medium'>Contact</div>
                    <div className='collapse-content'>
                      <div className='text-sm sm:text-base text-neutral'>
                        Just DM one of us (
                        <div className='tooltip' data-tip={contactInfo.tooltips.brideFacebook}>
                          <a
                            className='link link-primary'
                            href={socialMedia.facebook.bride}
                            target='_blank'
                            rel='noopener noreferrer'
                          >
                            face
                          </a>
                        </div>
                        •
                        <div className='tooltip' data-tip={contactInfo.tooltips.groomFacebook}>
                          <a
                            className='link link-primary'
                            href={socialMedia.facebook.groom}
                            target='_blank'
                            rel='noopener noreferrer'
                          >
                            book
                          </a>
                        </div>{' '}
                        or{' '}
                        <div className='tooltip' data-tip={contactInfo.tooltips.brideInstagram}>
                          <a
                            className='link link-primary'
                            href={socialMedia.instagram.bride}
                            target='_blank'
                            rel='noopener noreferrer'
                          >
                            insta
                          </a>
                        </div>
                        •
                        <div className='tooltip' data-tip={contactInfo.tooltips.groomInstagram}>
                          <a
                            className='link link-primary'
                            href={socialMedia.instagram.groom}
                            target='_blank'
                            rel='noopener noreferrer'
                          >
                            gram
                          </a>
                        </div>
                        ), or{' '}
                        <div className='tooltip' data-tip={contactInfo.emailTooltip}>
                          <a className='link link-primary' href={'mailto:' + contactInfo.email} target='_blank' rel='noopener noreferrer'>
                            email
                          </a>
                        </div>{' '}
                        here.
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {openTab === 3 && (
              <motion.div
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className='flex flex-col max-w-[700px] w-[85vw] min-w-[296px] min-h-[28.6em] max-h-[450px] bg-base-200 text-accent rounded-2xl xl-shadow'
              >
                <div className='flex overflow-hidden bg-neutral center-items rounded-2xl' ref={emblaRef}>
                  <div className='flex'>
                    {slides.map((image, index) => (
                      <div className='flex-[0_0_100%]' key={index}>
                        <Image src={image} className='object-contain w-full h-full' alt={`Photo ${index + 1}`} sizes='85vw' width={800} height={600} />
                      </div>
                    ))}
                  </div>
                </div>
                <dialog id='modal' className='modal bg-black'>
                  <form method='dialog' className='flex flex-col items-center justify-center h-screen w-screen'>
                    <div className={'flex overflow-hidden bg-black center-items'} ref={emblaModalRef}>
                      <div className='flex'>
                        {slides.map((image, index) => (
                          <div className='flex-[0_0_100%]' key={index}>
                            <Image src={image} className='object-contain w-full h-full' alt={`Photo ${index + 1}`} sizes='85vw' width={800} height={600} />
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className='fixed bottom-10 flex'>
                      <div className='btn btn-square btn-sm bg-base-100 mx-1' onClick={scrollPrevModal}>
                        <svg xmlns='http://www.w3.org/2000/svg' className='h-6 w-6' fill='currentColor' viewBox='0 -960 960 960'>
                          <path xmlns='http://www.w3.org/2000/svg' d='M560-240 320-480l240-240 56 56-184 184 184 184-56 56Z' />
                        </svg>
                      </div>
                      <button className='btn btn-square btn-sm bg-base-100 mx-1'>
                        <svg xmlns='http://www.w3.org/2000/svg' className='h-4 w-4' fill='currentColor' viewBox='0 -960 960 960'>
                          <path d='M147.333-100 100-147.333l139.334-139.334H120v-66.666h233.333V-120h-66.666v-119.334L147.333-100Zm665.334 0L673.333-239.334V-120h-66.666v-233.333H840v66.666H720.666L860-147.333 812.667-100ZM120-606.667v-66.666h119.334L100-812.667 147.333-860l139.334 139.334V-840h66.666v233.333H120Zm486.667 0V-840h66.666v119.334l140.001-140.001 47.333 47.333-140.001 140.001H840v66.666H606.667Z' />
                        </svg>
                      </button>
                      <div className='btn btn-square btn-sm bg-base-100 mx-1' onClick={scrollNextModal}>
                        <svg xmlns='http://www.w3.org/2000/svg' className='h-6 w-6' fill='currentColor' viewBox='0 -960 960 960'>
                          <path xmlns='http://www.w3.org/2000/svg' d='m376-240-56-56 184-184-184-184 56-56 240 240-240 240Z' />
                        </svg>
                      </div>
                    </div>
                  </form>
                </dialog>
                <div className='flex justify-center items-center p-2'>
                  <button className='btn btn-square btn-sm bg-base-100 mx-1' onClick={scrollPrev}>
                    <svg xmlns='http://www.w3.org/2000/svg' className='h-6 w-6' fill='currentColor' viewBox='0 -960 960 960'>
                      <path xmlns='http://www.w3.org/2000/svg' d='M560-240 320-480l240-240 56 56-184 184 184 184-56 56Z' />
                    </svg>
                  </button>
                  <button className='btn btn-square btn-sm bg-base-100 mx-1' onClick={() => window?.modal && window.modal.showModal()}>
                    <svg xmlns='http://www.w3.org/2000/svg' className='h-4 w-4' fill='currentColor' viewBox='0 -960 960 960'>
                      <path d='M120-120v-233.333h66.666v119.334L326.667-374 374-326.667 233.999-186.666h119.334V-120H120Zm486.667 0v-66.666h119.334L586.667-326 634-373.333l139.334 139.334v-119.334H840V-120H606.667ZM326-586.667 186.666-726.001v119.334H120V-840h233.333v66.666H233.999L373.333-634 326-586.667Zm308 0L586.667-634l139.334-139.334H606.667V-840H840v233.333h-66.666v-119.334L634-586.667Z' />
                    </svg>
                  </button>
                  <button className='btn btn-square btn-sm bg-base-100 mx-1' onClick={scrollNext}>
                    <svg xmlns='http://www.w3.org/2000/svg' className='h-6 w-6' fill='currentColor' viewBox='0 -960 960 960'>
                      <path xmlns='http://www.w3.org/2000/svg' d='m376-240-56-56 184-184-184-184 56-56 240 240-240 240Z' />
                    </svg>
                  </button>
                </div>
              </motion.div>
            )}
          </div>
        </main>
      </div>
    )
}

export default Dashboard