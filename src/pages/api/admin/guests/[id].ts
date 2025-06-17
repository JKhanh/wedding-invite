import { NextApiRequest, NextApiResponse } from 'next'
import { withAdminAuth } from '@/utils/adminAuth'
import { prisma } from '@/prisma'
import { z } from 'zod'

const updateGuestSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email().optional().or(z.literal('')),
  phone: z.string().optional(),
  bridalParty: z.boolean().default(false),
  tableNumber: z.number().optional(),
  notes: z.string().optional()
})

async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query
  const guestId = parseInt(id as string)

  if (isNaN(guestId)) {
    return res.status(400).json({ error: 'Invalid guest ID' })
  }

  if (req.method === 'GET') {
    // Get specific guest
    try {
      const guest = await prisma.user.findUnique({
        where: { id: guestId }
      })

      if (!guest) {
        return res.status(404).json({ error: 'Guest not found' })
      }

      const guestWithUrl = {
        ...guest,
        rsvpUrl: `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/rsvp/${guest.rsvpToken}`,
        RSVPDate: guest.RSVPDate?.toISOString() || null,
        invitedAt: guest.invitedAt?.toISOString() || null,
        rsvpViewedAt: guest.rsvpViewedAt?.toISOString() || null,
        createdAt: guest.createdAt.toISOString(),
        updatedAt: guest.updatedAt.toISOString()
      }

      res.status(200).json(guestWithUrl)
    } catch (error) {
      console.error('Error fetching guest:', error)
      res.status(500).json({ error: 'Failed to fetch guest' })
    }

  } else if (req.method === 'PUT') {
    // Update guest
    try {
      const validatedData = updateGuestSchema.parse(req.body)
      
      // Check if guest exists
      const existingGuest = await prisma.user.findUnique({
        where: { id: guestId }
      })

      if (!existingGuest) {
        return res.status(404).json({ error: 'Guest not found' })
      }

      // Check if another guest with the same name exists (excluding current guest)
      if (validatedData.firstName !== existingGuest.firstName || 
          validatedData.lastName !== existingGuest.lastName) {
        const duplicateGuest = await prisma.user.findUnique({
          where: {
            fullName: {
              firstName: validatedData.firstName,
              lastName: validatedData.lastName
            }
          }
        })

        if (duplicateGuest && duplicateGuest.id !== guestId) {
          return res.status(400).json({ error: 'Guest with this name already exists' })
        }
      }

      const updatedGuest = await prisma.user.update({
        where: { id: guestId },
        data: {
          firstName: validatedData.firstName,
          lastName: validatedData.lastName,
          email: validatedData.email || null,
          phone: validatedData.phone || null,
          bridalParty: validatedData.bridalParty,
          tableNumber: validatedData.tableNumber || null,
          notes: validatedData.notes || null
        }
      })

      const guestWithUrl = {
        ...updatedGuest,
        rsvpUrl: `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/rsvp/${updatedGuest.rsvpToken}`,
        RSVPDate: updatedGuest.RSVPDate?.toISOString() || null,
        invitedAt: updatedGuest.invitedAt?.toISOString() || null,
        rsvpViewedAt: updatedGuest.rsvpViewedAt?.toISOString() || null,
        createdAt: updatedGuest.createdAt.toISOString(),
        updatedAt: updatedGuest.updatedAt.toISOString()
      }

      res.status(200).json(guestWithUrl)
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: 'Validation error', details: error.errors })
      }
      console.error('Error updating guest:', error)
      res.status(500).json({ error: 'Failed to update guest' })
    }

  } else if (req.method === 'DELETE') {
    // Delete guest
    try {
      const guest = await prisma.user.findUnique({
        where: { id: guestId }
      })

      if (!guest) {
        return res.status(404).json({ error: 'Guest not found' })
      }

      await prisma.user.delete({
        where: { id: guestId }
      })

      res.status(200).json({ message: 'Guest deleted successfully' })
    } catch (error) {
      console.error('Error deleting guest:', error)
      res.status(500).json({ error: 'Failed to delete guest' })
    }

  } else {
    res.status(405).json({ error: 'Method not allowed' })
  }
}

export default withAdminAuth(handler)