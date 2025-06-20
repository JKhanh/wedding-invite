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
    
    return {
      props: {
        slides: slides || [],
      },
    }
  } catch (error) {
    console.error('Error in getServerSideProps:', error)
    return {
      props: {
        slides: [],
      },
    }
  }
}

export default Home