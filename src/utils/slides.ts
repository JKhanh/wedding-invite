// Hardcoded list of images for production compatibility
// This avoids file system access which doesn't work reliably on serverless platforms
const imageList = [
  'DSC00278.JPG',
  'DSC00279.JPG',
  'DSC00280.JPG',
  'DSC00281.JPG',
  'DSC00282.JPG',
  'DSC00283.JPG',
  'DSC00284.JPG',
  'DSC00285.JPG',
  'DSC00286.JPG',
  'DSC00287.JPG',
  'DSC00288.JPG',
  'DSC00289.JPG',
  'DSC00290.JPG',
  'DSC00291.JPG',
  'DSC00292.JPG',
  'DSC00293.JPG',
  'DSC00294.JPG',
  'DSC00295.JPG',
  'DSC00296.JPG',
  'DSC00297.JPG',
  'DSC00298.JPG',
  'DSC00299.JPG',
  'DSC00300.JPG',
  'DSC00301.JPG',
  'DSC00302.JPG',
  'DSC00303.JPG'
]

// Function to get all image files (works in both dev and production)
export function getImageFiles() {
  const result = imageList.map(filename => `/images/${filename}`)
  
  // Debug logging
  console.log('=== getImageFiles DEBUG ===')
  console.log('imageList length:', imageList.length)
  console.log('result length:', result.length)
  console.log('First 3 results:', result.slice(0, 3))
  console.log('==========================')
  
  return result
}

// Default export for client-side (will be overridden by getServerSideProps)
const slides: string[] = []

export default slides

