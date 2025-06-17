# Wedding Configuration Guide

This file explains how to customize your wedding website by editing the configuration files.

## Configuration Files Structure

The wedding data is now organized into separate, focused files:

### 1. **Core Wedding Data** - `/src/data/wedding.ts`
Contains the fundamental wedding information (names, dates, locations, etc.)

### 2. **UI Configuration** - `/src/data/ui.ts`  
Contains all display settings, text, and styling options

### 3. **Utility Functions** - `/src/utils/weddingHelpers.ts`
Contains helper functions for formatting dates, names, coordinates, etc.

---

## Core Wedding Data (`/src/data/wedding.ts`)

### Couple Information
```typescript
bride: {
  firstName: "Hanh",           // ← Bride's first name
  lastName: "Nguyen",          // ← Bride's maiden name
  fullName: "Nguyen Hong Hanh", // ← Bride's full formal name
  middleName: "Hong",          // ← Bride's middle name
},

groom: {
  firstName: "Khanh",            // ← Groom's first name
  lastName: "Nguyen",            // ← Groom's last name
  fullName: "Nguyen Quoc Khanh", // ← Groom's full formal name
  middleName: "Quoc",            // ← Groom's middle name
},
```

### Wedding Details
```typescript
wedding: {
  date: "2025-11-01T11:00:00",   // ← Wedding date and time (ISO format)
  venue: "ForeverMark Tay Ho",   // ← Venue name
  location: "Hanoi, Vietnam",    // ← City, country
  
  ceremony: {
    time: "11:00am",             // ← Ceremony time (display format)
    description: "Ceremony → Refreshments → Reception", // ← Event flow
    isAlcoholFree: false,        // ← Alcohol policy
    refreshmentsNote: "Light refreshments...", // ← Custom message
  },
  
  reception: {
    venue: "Grand Hall",         // ← Reception venue name
    description: "wedding reception dinner", // ← Reception description
    hasReceptionDinner: true,    // ← Whether there's a dinner
  },
},
```

### Contact & Social Media
```typescript
contact: {
  email: "hanh.khanh@example.com",        // ← Main contact email
  weddingEmail: "us@hanhandkhanh.wedding", // ← Wedding-specific email
},

socialMedia: {
  facebook: {
    bride: "https://facebook.com/hanh",   // ← Bride's Facebook
    groom: "https://facebook.com/khanh",  // ← Groom's Facebook
  },
  instagram: {
    bride: "https://instagram.com/hanh",  // ← Bride's Instagram
    groom: "https://instagram.com/khanh", // ← Groom's Instagram
  },
},
```

### Banking Information
```typescript
banking: {
  accountName: "Nguyen Quoc Khanh", // ← Account holder name
  bsb: "970-422",                   // ← Bank code (TPBank Vietnam)
  accountNumberSuffix: "001",       // ← Last 3 digits of account 1
  accountNumberSuffix2: "002",      // ← Last 3 digits of account 2
  hasWishingWell: true,             // ← Show wishing well section
  giftMessage: "Your presence at our wedding is more than enough!", // ← Gift message
},
```

### Map Coordinates
```typescript
coordinates: {
  venue: {                // ← Main wedding location
    latitude: 21.0285,
    longitude: 105.8542,
  },
  country: {              // ← Country/region view for map
    latitude: 14.0583,
    longitude: 108.2772,
  },
  mapCenter: {            // ← Default map center
    latitude: 21.0285,
    longitude: 105.8542,
  },
},
```

---

## UI Configuration (`/src/data/ui.ts`)

### Homepage Display
```typescript
homepage: {
  welcomeText: "Welcome",    // ← Welcome message on login
  
  placeholders: {
    firstName: "Amelié",     // ← First name input placeholder
    lastName: "Lacroix",     // ← Last name input placeholder
    password: "•••••••",     // ← Password input placeholder
  },
},
```

**Note:** Display names are now automatically derived from the core wedding data in `wedding.ts`. This ensures consistency - you only need to update names in one place!

### Dashboard Content
```typescript
dashboard: {
  dateFormat: {
    locale: 'en-GB',         // ← Date formatting locale
    timeFormat: "o'clock",   // ← How time is displayed
  },

  tabs: {
    photos: "Photos",        // ← Photo tab name
    info: "Info",           // ← Info tab name
    rsvp: "RSVP",           // ← RSVP tab name
    gifts: "Gifts",         // ← Gifts tab name
  },

  gifts: {
    funds: [
      {
        name: "home & living",     // ← First fund name
        accountSuffix: "001",      // ← Account suffix to use
      },
      {
        name: "honeymoon",         // ← Second fund name
        accountSuffix: "002",      // ← Account suffix to use
      },
    ],
  },
},
```

### Theme & Styling
```typescript
theme: {
  primaryTheme: "green",     // ← DaisyUI theme name
  accentColor: "secondary",  // ← Accent color
},

map: {
  markerColor: '#31553d',    // ← Map marker color
  zoomLevels: {
    country: 3.5,           // ← Country view zoom level
    venue: 9,               // ← Venue view zoom level
  },
},
```

---

## How to Customize

### Quick Setup for Your Wedding:

1. **Edit `/src/data/wedding.ts` (Primary Configuration):**
   - Update couple names and details ← **Names are defined here only**
   - Change wedding date, venue, and location
   - Update contact information
   - Update social media links
   - Update banking information
   - Update map coordinates

2. **Edit `/src/data/ui.ts` (UI Customization):**
   - Customize welcome messages and text
   - Change form placeholders
   - Adjust theme colors
   - Modify fund names and labels
   - **Note:** No need to duplicate names here - they're automatically derived!

3. **Restart the server** to see changes:
   ```bash
   pnpm dev
   ```

### Getting Coordinates:
1. Go to [Google Maps](https://maps.google.com)
2. Right-click on your venue
3. Copy the coordinates (latitude, longitude)
4. Update `coordinates` in `wedding.ts`

### Date Format:
Use ISO format: `YYYY-MM-DDTHH:mm:ss`
Example: `"2025-11-01T11:00:00"` = November 1, 2025 at 11:00 AM

---

## Environment Variables

Some technical settings remain in environment variables:
- `NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN` - Map API token
- `DATABASE_URL` - Database connection
- `NEXTAUTH_SECRET` - Security key
- `NEXTAUTH_URL` - Site URL

---

## Benefits of This Structure

✅ **Single Source of Truth**: Names and core data defined in one place only  
✅ **Separation of Concerns**: Core data vs UI presentation vs logic  
✅ **Easy Customization**: Change text without touching logic  
✅ **Automatic Consistency**: Display names derived from core data  
✅ **Reusable Functions**: Consistent formatting throughout  
✅ **Maintainable**: Clear organization and documentation  
✅ **Flexible**: Easy to extend with new features

---

## Need Help?

If you encounter issues:
1. Check browser console for errors
2. Ensure all required fields are filled
3. Verify date format is correct
4. Make sure coordinates are valid decimal numbers
5. Restart development server after changes