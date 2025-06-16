import fs from 'fs'
import path from 'path'

// Function to get all image files from public/images directory (server-side only)
export function getImageFiles() {
  try {
    const imagesDirectory = path.join(process.cwd(), 'public', 'images')
    const filenames = fs.readdirSync(imagesDirectory)
    
    // Filter for image files (jpg, jpeg, png, webp, gif)
    const imageFiles = filenames.filter(name => {
      const ext = path.extname(name).toLowerCase()
      return ['.jpg', '.jpeg', '.png', '.webp', '.gif'].includes(ext)
    })
    
    // Sort files naturally (1.jpg, 2.jpg, 10.jpg, etc.)
    imageFiles.sort((a, b) => {
      const numA = parseInt(a.match(/\d+/)?.[0] || '999')
      const numB = parseInt(b.match(/\d+/)?.[0] || '999')
      return numA - numB || a.localeCompare(b)
    })
    
    return imageFiles.map(filename => `/images/${filename}`)
  } catch (error) {
    console.warn('Could not read images directory:', error)
    // Fallback to numbered files if directory read fails
    return [1,2,3,4,5,6,7,8,9].map(n => `/images/${n}.jpg`)
  }
}

// Default export for client-side (will be overridden by getServerSideProps)
const slides: string[] = []

export default slides

