import { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/prisma'
import { z } from 'zod'

const updateRSVPSchema = z.object({
  RSVP: z.boolean(),
  RSVPOthersYes: z.string().optional(),
  RSVPOthersNo: z.string().optional(),
  notes: z.string().optional()
})

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { token } = req.query

  if (typeof token !== 'string') {
    return res.status(400).json({ error: 'Invalid token' })
  }

  if (req.method === 'GET') {
    // Get guest info by token
    try {
      const guest = await prisma.user.findUnique({
        where: { rsvpToken: token },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          bridalParty: true,
          RSVP: true,
          RSVPOthersYes: true,
          RSVPOthersNo: true,
          RSVPDate: true,
          rsvpViewedAt: true
        }
      })

      if (!guest) {
        return res.status(404).json({ error: 'Guest not found' })
      }

      // Update rsvpViewedAt if this is the first time viewing
      if (!guest.rsvpViewedAt) {
        await prisma.user.update({
          where: { rsvpToken: token },
          data: { rsvpViewedAt: new Date() }
        })
      }

      res.status(200).json({
        ...guest,
        RSVPDate: guest.RSVPDate?.toISOString() || null,
        rsvpViewedAt: guest.rsvpViewedAt?.toISOString() || null
      })
    } catch (error) {
      console.error('Error fetching guest:', error)
      res.status(500).json({ error: 'Failed to fetch guest information' })
    }

  } else if (req.method === 'PUT') {
    // Update RSVP
    try {
      console.log('RSVP API - Received body:', req.body)
      const validatedData = updateRSVPSchema.parse(req.body)
      console.log('RSVP API - Validated data:', validatedData)
      
      // Check if guest exists
      const guest = await prisma.user.findUnique({
        where: { rsvpToken: token }
      })

      if (!guest) {
        return res.status(404).json({ error: 'Guest not found' })
      }

      // Update RSVP
      console.log('RSVP API - Updating guest with token:', token)
      const updatedGuest = await prisma.user.update({
        where: { rsvpToken: token },
        data: {
          RSVP: validatedData.RSVP,
          RSVPOthersYes: validatedData.RSVPOthersYes || null,
          RSVPOthersNo: validatedData.RSVPOthersNo || null,
          RSVPDate: new Date(),
          rsvpViewedAt: guest.rsvpViewedAt || new Date() // Set if not already set
        }
      })
      console.log('RSVP API - Updated successfully, new RSVP value:', updatedGuest.RSVP)

      res.status(200).json({
        ...updatedGuest,
        RSVPDate: updatedGuest.RSVPDate?.toISOString() || null,
        rsvpViewedAt: updatedGuest.rsvpViewedAt?.toISOString() || null,
        invitedAt: updatedGuest.invitedAt?.toISOString() || null,
        createdAt: updatedGuest.createdAt.toISOString(),
        updatedAt: updatedGuest.updatedAt.toISOString()
      })
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: 'Validation error', details: error.errors })
      }
      console.error('Error updating RSVP:', error)
      res.status(500).json({ error: 'Failed to update RSVP' })
    }

  } else {
    res.status(405).json({ error: 'Method not allowed' })
  }
}