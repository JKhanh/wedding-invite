// Wedding Utility Functions
// This file contains helper functions for formatting and processing wedding data

import { weddingData } from '@/data/wedding'
import uiConfig from '@/data/ui'

// Date formatting utilities with localization support
export const getFormattedDate = (language: 'vi' | 'en' = 'vi') => {
  const date = new Date(weddingData.wedding.date)
  // Map language codes to locale identifiers
  const localeMap = {
    vi: 'vi-VN', // Vietnamese (Vietnam)
    en: 'en-GB'  // English (UK)
  }
  const locale = localeMap[language]
  
  return {
    // Full formatted date
    full: date.toLocaleDateString(locale, { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    }),
    
    // Month and year (lowercase)
    monthYear: date.toLocaleDateString(locale, { 
      month: 'long', 
      year: 'numeric' 
    }).toLowerCase(),
    
    // Day number only
    dayNumber: date.toLocaleDateString(locale, { day: 'numeric' }),
    
    // Weekday (lowercase)
    weekday: date.toLocaleDateString(locale, { weekday: 'long' }).toLowerCase(),
    
    // Formatted time with localization
    time: (parseInt(date.toLocaleTimeString(locale, { hour: 'numeric' })) % 12 || 12) + " " + (language === 'vi' ? 'giờ' : "o'clock"),
    
    // Timestamp for countdown
    timestamp: date.getTime(),
    
    // Raw date object
    date: date,
  }
}

// Coordinate utilities
export const getCoordinateString = (coord: { latitude: number; longitude: number }) => {
  return `${coord.latitude},${coord.longitude}`
}

export const getMapCoordinates = () => {
  return {
    venue: [weddingData.coordinates.venue.longitude, weddingData.coordinates.venue.latitude],
    country: [weddingData.coordinates.country.longitude, weddingData.coordinates.country.latitude], 
    mapCenter: [weddingData.coordinates.mapCenter.longitude, weddingData.coordinates.mapCenter.latitude],
  }
}

// Name formatting utilities
export const getCoupleNames = () => {
  return {
    // Display names for UI (derived from core wedding data)
    bride: weddingData.bride.firstName,
    groom: weddingData.groom.firstName,
    brideFirst: weddingData.bride.firstName,
    groomFirst: weddingData.groom.firstName,
    
    // Full names for formal use
    brideFormal: weddingData.bride.fullName,
    groomFormal: weddingData.groom.fullName,
    
    // Names with middle names
    brideWithMiddle: `${weddingData.bride.firstName}${weddingData.bride.middleName ? ` ${weddingData.bride.middleName}` : ''}`,
    groomWithMiddle: `${weddingData.groom.firstName}${weddingData.groom.middleName ? ` ${weddingData.groom.middleName}` : ''}`,
    
    // Formatted display names with subtitles (lowercase for UI)
    brideWithSubtitle: {
      first: weddingData.bride.firstName.toLowerCase(),
      subtitle: weddingData.bride.middleName?.toLowerCase() || '',
      surname: weddingData.bride.lastName.toLowerCase(),
    },
    
    groomWithSubtitle: {
      first: weddingData.groom.firstName.toLowerCase(),
      subtitle: weddingData.groom.middleName?.toLowerCase() || '',
      surname: weddingData.groom.lastName.toLowerCase(),
    },
  }
}

// Social media utilities
export const getSocialMediaLinks = () => {
  return {
    facebook: {
      bride: weddingData.socialMedia.facebook.bride,
      groom: weddingData.socialMedia.facebook.groom,
    },
    instagram: {
      bride: weddingData.socialMedia.instagram.bride,
      groom: weddingData.socialMedia.instagram.groom,
    },
    
    // Display names
    labels: uiConfig.socialMedia,
  }
}

// Contact utilities
export const getContactInfo = () => {
  return {
    email: weddingData.contact.email,
    weddingEmail: weddingData.contact.weddingEmail,
    emailTooltip: weddingData.contact.weddingEmail,
    
    // Social media tooltips derived from names
    tooltips: {
      brideFacebook: weddingData.bride.firstName.toLowerCase(),
      groomFacebook: weddingData.groom.firstName.toLowerCase(),
      brideInstagram: weddingData.bride.firstName.toLowerCase(),
      groomInstagram: weddingData.groom.firstName.toLowerCase(),
    },
  }
}

// Wedding event utilities
export const getWeddingEvents = () => {
  return {
    ceremony: {
      time: weddingData.wedding.ceremony.time,
      description: weddingData.wedding.ceremony.description,
      refreshmentsNote: weddingData.wedding.ceremony.refreshmentsNote,
      isAlcoholFree: weddingData.wedding.ceremony.isAlcoholFree,
    },
    
    reception: {
      venue: weddingData.wedding.reception.venue,
      description: weddingData.wedding.reception.description,
      hasReceptionDinner: weddingData.wedding.reception.hasReceptionDinner,
    },
    
    venue: {
      name: weddingData.wedding.venue,
      location: weddingData.wedding.location,
    },
  }
}

// Banking/Gift utilities
export const getBankingInfo = () => {
  return {
    accountName: weddingData.banking.accountName,
    bsb: weddingData.banking.bsb,
    funds: uiConfig.dashboard.gifts.funds.map(fund => ({
      ...fund,
      accountNumber: `${weddingData.banking.bsb}-${fund.accountSuffix}`,
    })),
    giftMessage: weddingData.banking.giftMessage,
    hasWishingWell: weddingData.banking.hasWishingWell,
    wishingWellText: uiConfig.dashboard.gifts.wishingWell.text,
  }
}

// Countdown utilities  
export const formatCountdown = (distance: number) => {
  const labels = uiConfig.dashboard.countdown.labels
  const separator = uiConfig.dashboard.countdown.separator
  
  const days = Math.floor(distance / (1000 * 60 * 60 * 24))
  const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
  const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60))
  const seconds = Math.floor((distance % (1000 * 60)) / 1000)

  return {
    days,
    hours,
    minutes,
    seconds,
    formatted: `${days} ${labels.days}${separator}${hours} ${labels.hours}${separator}${minutes} ${labels.minutes}${separator}${seconds} ${labels.seconds}`,
    shortFormatted: `${days}${separator}${hours.toString().padStart(2, '0')}${separator}${minutes.toString().padStart(2, '0')}${separator}${seconds.toString().padStart(2, '0')}`,
  }
}

// Authentication utilities
export const getAuthConfig = () => {
  return {
    globalPassword: weddingData.authentication.globalPassword,
    placeholders: uiConfig.homepage.placeholders,
  }
}

// Map configuration utilities
export const getMapConfig = () => {
  return {
    accessToken: process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN,
    style: uiConfig.map.mapStyle,
    markerColor: uiConfig.map.markerColor,
    zoomLevels: uiConfig.map.zoomLevels,
    coordinates: getMapCoordinates(),
  }
}