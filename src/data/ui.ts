// UI Configuration Data
// Edit this file to customize the appearance and display text of the website

export const uiConfig = {
  // Theme Settings
  theme: {
    primaryTheme: "green", // DaisyUI theme name
    accentColor: "secondary",
  },

  // Homepage Display
  homepage: {
    // Welcome message
    welcomeText: "Welcome",
    
    // Form placeholders
    placeholders: {
      firstName: "Amelié",
      lastName: "Lacroix",
      password: "•••••••",
    },
  },

  // Dashboard Content
  dashboard: {
    // Date format settings
    dateFormat: {
      locale: 'en-GB', // Date formatting locale
      showTime: true,
      timeFormat: "o'clock", // How time is displayed
    },

    // Tab names and content
    tabs: {
      photos: "Photos",
      info: "Info", 
      rsvp: "RSVP",
      gifts: "Gifts",
    },

    // Information sections
    infoSections: {
      format: {
        title: "Format",
        content: {
          flow: "Ceremony → Refreshments → Reception",
          details: "Cake & Coffee → Photos",
          dinnerSuffix: "→ Dinner", // Text shown for dinner guests
        },
      },
      
      alcohol: {
        title: "Alcohol",
        note: "We're having an alcohol-free wedding! Non-alcoholic refreshments will be available after the ceremony.",
      },
      
      dinner: {
        title: "Dinner",
        invitation: "You're invited to our exclusive family-&-friends reception dinner!",
        dietaryNote: "Please let us know if you have any dietary requirements.",
      },

      contact: {
        title: "Questions?",
        instructions: "Just DM one of us (",
        socialConnector: "•", // Character between social links
        orText: "), or",
        contactSuffix: "here.",
        tooltips: {
          email: "us@hanhandkhanh.wedding",
        },
      },
    },

    // RSVP Section
    rsvp: {
      title: "RSVP",
      subtitle: "Please let us know if you're coming!",
      options: {
        attending: "I'll be there! 🎉",
        notAttending: "Sorry, can't make it 😔",
      },
      guestFields: {
        attendingLabel: "Who else is coming with you?",
        notAttendingLabel: "Who else can't make it?",
        placeholder: "Name(s) of additional guests...",
      },
      submitButton: "Update RSVP",
      loadingText: "Updating...",
    },

    // Gifts Section
    gifts: {
      title: "Gifts",
      subtitle: "Your presence at our wedding is more than enough!",
      description: "If you'd like to help us celebrate with a gift, we've set up a few funds to help us get started in our new life together:",
      
      funds: [
        {
          name: "home & living",
          accountSuffix: "003",
        },
        {
          name: "honeymoon",
          accountSuffix: "004", 
        },
      ],
      
      wishingWell: {
        show: true,
        text: "We'll also have a wishing well and table set up at the wedding if you'd like to give us a card or gift in person.",
      },
    },

    // Countdown display
    countdown: {
      labels: {
        days: "days",
        hours: "hours", 
        minutes: "minutes",
        seconds: "seconds",
      },
      separator: " : ",
    },
  },

  // Map Settings
  map: {
    markerColor: '#31553d', // Green marker color
    zoomLevels: {
      country: 3.5,
      venue: 9,
    },
    mapStyle: 'mapbox://styles/spren/clikciyg5000001q447fchmm7',
  },

  // Social Media Display Names
  socialMedia: {
    facebook: {
      displayName: "facebook",
      shortName: "face",
      secondShortName: "book",
    },
    instagram: {
      displayName: "instagram", 
      shortName: "insta",
      secondShortName: "gram",
    },
    email: {
      displayName: "email",
    },
  },

  // Error and Loading States
  messages: {
    loading: "Loading...",
    error: "Something went wrong. Please try again.",
    loginError: "Invalid credentials. Please check your name and password.",
    success: "Success!",
  },

  // Animation Settings
  animations: {
    enableMotion: true,
    staggerDelay: 0.1,
    fadeInDuration: 0.3,
  },
}

export default uiConfig