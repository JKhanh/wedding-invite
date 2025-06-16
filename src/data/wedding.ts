// Wedding Core Data Configuration
// Edit this file to update the fundamental wedding information

export const weddingData = {
  // Couple Information
  bride: {
    firstName: "Hanh",
    lastName: "Nguyen", // Maiden name
    fullName: "Nguyen Hong Hanh",
    middleName: "Hong",
  },
  
  groom: {
    firstName: "Khanh",
    lastName: "Nguyen",
    fullName: "Nguyen Quoc Khanh",
    middleName: "Quoc",
  },
  
  // Wedding Details
  wedding: {
    date: "2025-11-01T11:00:00", // ISO format: YYYY-MM-DDTHH:mm:ss
    venue: "ForeverMark Tay Ho",
    location: "Hanoi, Vietnam",
    
    // Ceremony Details
    ceremony: {
      time: "11:00am",
      description: "Ceremony → Refreshments → Reception",
      isAlcoholFree: false,
      refreshmentsNote: "Light refreshments and beverages will be available after the ceremony.",
    },
    
    // Reception Details  
    reception: {
      venue: "Grand Hall",
      description: "wedding reception dinner",
      hasReceptionDinner: true,
    },
  },
  
  // Contact Information
  contact: {
    email: "hanh.khanh@example.com",
    weddingEmail: "us@hanhandkhanh.wedding",
  },
  
  // Social Media
  socialMedia: {
    facebook: {
      bride: "https://facebook.com/hanh",
      groom: "https://facebook.com/khanh",
    },
    instagram: {
      bride: "https://instagram.com/hanh", 
      groom: "https://instagram.com/khanh",
    },
  },
  
  // Banking/Gift Information
  banking: {
    accountName: "Nguyen Quoc Khanh",
    bsb: "970-422", // TPBank Vietnam
    accountNumberSuffix: "001", // Last 3 digits shown
    accountNumberSuffix2: "002", // Alternative account
    hasWishingWell: true,
    giftMessage: "Your presence at our wedding is more than enough!",
  },
  
  // Location Coordinates (for maps)
  coordinates: {
    // Main wedding location (Hanoi coordinates)
    venue: {
      latitude: 21.0285,
      longitude: 105.8542,
    },
    
    // Country/region view (Vietnam center)
    country: {
      latitude: 14.0583,
      longitude: 108.2772,
    },
    
    // Map center (Hanoi)
    mapCenter: {
      latitude: 21.0285,
      longitude: 105.8542,
    },
  },
  
  // Authentication
  authentication: {
    globalPassword: "123456", // Change this for security
  },
}

export default weddingData