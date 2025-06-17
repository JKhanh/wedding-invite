import { NextApiRequest, NextApiResponse } from 'next'
import { withAdminAuth } from '@/utils/adminAuth'
import { prisma } from '@/prisma'
import { z } from 'zod'

const createGuestSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email().optional().or(z.literal('')),
  phone: z.string().optional(),
  bridalParty: z.boolean().default(false),
  tableNumber: z.number().optional(),
  notes: z.string().optional()
})

async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    // Get all guests
    try {
      const guests = await prisma.user.findMany({
        orderBy: [
          { lastName: 'asc' },
          { firstName: 'asc' }
        ],
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          phone: true,
          bridalParty: true,
          rsvpToken: true,
          RSVP: true,
          RSVPOthersYes: true,
          RSVPOthersNo: true,
          RSVPDate: true,
          invitedAt: true,
          rsvpViewedAt: true,
          tableNumber: true,
          notes: true,
          createdAt: true
        }
      })

      // Add RSVP URL to each guest
      const guestsWithUrls = guests.map(guest => ({
        ...guest,
        rsvpUrl: `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/rsvp/${guest.rsvpToken}`,
        RSVPDate: guest.RSVPDate?.toISOString() || null,
        invitedAt: guest.invitedAt?.toISOString() || null,
        rsvpViewedAt: guest.rsvpViewedAt?.toISOString() || null,
        createdAt: guest.createdAt.toISOString()
      }))

      res.status(200).json(guestsWithUrls)
    } catch (error) {
      console.error('Error fetching guests:', error)
      res.status(500).json({ error: 'Failed to fetch guests' })
    }

  } else if (req.method === 'POST') {
    // Create new guest
    try {
      const validatedData = createGuestSchema.parse(req.body)
      
      // Check if guest already exists
      const existingGuest = await prisma.user.findUnique({
        where: {
          fullName: {
            firstName: validatedData.firstName,
            lastName: validatedData.lastName
          }
        }
      })

      if (existingGuest) {
        return res.status(400).json({ error: 'Guest with this name already exists' })
      }

      const guest = await prisma.user.create({
        data: {
          firstName: validatedData.firstName,
          lastName: validatedData.lastName,
          email: validatedData.email || null,
          phone: validatedData.phone || null,
          bridalParty: validatedData.bridalParty,
          tableNumber: validatedData.tableNumber || null,
          notes: validatedData.notes || null,
          invitedAt: new Date()
        }
      })

      const guestWithUrl = {
        ...guest,
        rsvpUrl: `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/rsvp/${guest.rsvpToken}`,
        RSVPDate: guest.RSVPDate?.toISOString() || null,
        invitedAt: guest.invitedAt?.toISOString() || null,
        rsvpViewedAt: guest.rsvpViewedAt?.toISOString() || null,
        createdAt: guest.createdAt.toISOString(),
        updatedAt: guest.updatedAt.toISOString()
      }

      res.status(201).json(guestWithUrl)
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: 'Validation error', details: error.errors })
      }
      console.error('Error creating guest:', error)
      res.status(500).json({ error: 'Failed to create guest' })
    }

  } else {
    res.status(405).json({ error: 'Method not allowed' })
  }
}

export default withAdminAuth(handler)