import type { NextPage } from 'next'
import Dashboard from '@/components/Dashboard'
import { getImageFiles } from '@/utils/slides'

interface HomeProps {
  slides: string[]
}

const Home: NextPage<HomeProps> = ({ slides }) => {
  return <Dashboard slides={slides} />
}

export async function getServerSideProps() {
  try {
    const slides = getImageFiles()
    
    // Debug logging for production
    console.log('=== SERVER SIDE DEBUG ===')
    console.log('getImageFiles() returned:', slides)
    console.log('Number of slides:', slides?.length || 0)
    console.log('First 3 slides:', slides.slice(0, 3))
    console.log('========================')
    
    return {
      props: {
        slides: slides || [],
      },
    }
  } catch (error) {
    console.error('Error in getServerSideProps:', error)
    console.error('Error details:', error)
    return {
      props: {
        slides: [],
      },
    }
  }
}

export default Home