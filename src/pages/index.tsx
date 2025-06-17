import type { NextPage } from 'next'
import Dashboard from '@/components/Dashboard'
import { getImageFiles } from '@/utils/slides'
import { prisma } from '../prisma'

interface HomeProps {
  rsvps: any[]
  gifts: any[]
  slides: string[]
}

const Home: NextPage<HomeProps> = ({ rsvps, gifts, slides }) => {
  return <Dashboard rsvps={rsvps} gifts={gifts} slides={slides} />
}

export async function getServerSideProps() {
  try {
    const rsvps = await prisma.user.findMany({
      select: {
        firstName: true,
        lastName: true,
        RSVP: true,
        RSVPOthersYes: true,
        RSVPOthersNo: true,
      },
    })
    // Note: Gift table was removed in schema, keeping empty array for compatibility
    const gifts: any[] = []
    const slides = getImageFiles()
    
    return {
      props: {
        rsvps: rsvps || [],
        gifts: gifts || [],
        slides: slides || [],
      },
    }
  } catch (error) {
    console.error('Error in getServerSideProps:', error)
    return {
      props: {
        rsvps: [],
        gifts: [],
        slides: [],
      },
    }
  }
}

export default Home