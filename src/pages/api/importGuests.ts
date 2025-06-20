import type { NextApiRequest, NextApiResponse } from 'next'
import { z } from 'zod'
import { prisma } from '@/prisma'
import { withAdminAuth } from '@/utils/adminAuth'
import formidable from 'formidable'
import fs from 'fs'
import csv from 'csv-parser'

// Disable the default body parser to handle file uploads
export const config = {
  api: {
    bodyParser: false,
  },
}

const importGuestSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email().optional().or(z.literal('')),
  phone: z.string().optional(),
  bridalParty: z.boolean().default(false),
  nzInvite: z.boolean().default(false),
  myInvite: z.boolean().default(false),
  tableNumber: z.number().optional(),
  notes: z.string().optional(),
})

type ImportGuestData = z.infer<typeof importGuestSchema>

interface ImportResult {
  success: boolean
  imported: number
  skipped: number
  errors: Array<{
    row: number
    data: any
    error: string
  }>
}

async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const form = formidable({
      maxFileSize: 5 * 1024 * 1024, // 5MB
      keepExtensions: true,
    })

    const [fields, files] = await form.parse(req)
    
    const uploadedFile = Array.isArray(files.csvFile) ? files.csvFile[0] : files.csvFile
    
    if (!uploadedFile) {
      return res.status(400).json({ error: 'No file uploaded' })
    }

    // Validate file type
    if (!uploadedFile.originalFilename?.endsWith('.csv')) {
      return res.status(400).json({ error: 'Please upload a CSV file' })
    }

    const filePath = uploadedFile.filepath
    const results: ImportResult = {
      success: true,
      imported: 0,
      skipped: 0,
      errors: []
    }

    const guestsToImport: ImportGuestData[] = []
    let rowNumber = 0

    // Read and parse CSV with proper encoding for Vietnamese text
    await new Promise<void>((resolve, reject) => {
      fs.createReadStream(filePath, { encoding: 'utf8' })
        .pipe(csv({
          // Handle BOM for UTF-8 files and process headers
          mapHeaders: ({ header }) => {
            // Remove BOM if present and clean header
            let cleanHeader = header.replace(/^\uFEFF/, '').trim().toLowerCase()
            
            // Map common Vietnamese headers to English
            const headerMap: { [key: string]: string } = {
              'tên': 'firstName',
              'ten': 'firstName',
              'họ': 'lastName', 
              'ho': 'lastName',
              'họ tên': 'fullName',
              'ho ten': 'fullName',
              'tên đầy đủ': 'fullName',
              'ten day du': 'fullName',
              'firstname': 'firstName',
              'lastname': 'lastName',
              'fullname': 'fullName',
              'first_name': 'firstName',
              'last_name': 'lastName',
              'full_name': 'fullName',
              'email': 'email',
              'điện thoại': 'phone',
              'dien thoai': 'phone',
              'số điện thoại': 'phone',
              'so dien thoai': 'phone',
              'phone': 'phone',
              'đội ngũ cô dâu': 'bridalParty',
              'doi ngu co dau': 'bridalParty',
              'bridal party': 'bridalParty',
              'bridalparty': 'bridalParty',
              'bridal_party': 'bridalParty',
              'bàn số': 'tableNumber',
              'ban so': 'tableNumber',
              'table number': 'tableNumber',
              'tablenumber': 'tableNumber',
              'table_number': 'tableNumber',
              'ghi chú': 'notes',
              'ghi chu': 'notes',
              'notes': 'notes',
              'note': 'notes',
              'nz invite': 'nzInvite',
              'nzinvite': 'nzInvite',
              'nz_invite': 'nzInvite',
              'my invite': 'myInvite',
              'myinvite': 'myInvite',
              'my_invite': 'myInvite'
            }

            return headerMap[cleanHeader] || cleanHeader
          }
        }))
        .on('data', (data: any) => {
          rowNumber++
          try {
            let processedData = { ...data }

            // Handle fullName field by splitting it
            if (processedData.fullName && !processedData.firstName && !processedData.lastName) {
              const nameParts = processedData.fullName.trim().split(/\s+/)
              if (nameParts.length >= 2) {
                processedData.firstName = nameParts[0]
                processedData.lastName = nameParts.slice(1).join(' ')
              } else {
                processedData.firstName = nameParts[0] || ''
                processedData.lastName = ''
              }
            }

            // Clean and normalize data
            processedData = {
              firstName: (processedData.firstName || '').toString().trim(),
              lastName: (processedData.lastName || '').toString().trim(),
              email: (processedData.email || '').toString().trim() || undefined,
              phone: (processedData.phone || '').toString().trim() || undefined,
              bridalParty: ['true', '1', 'yes', 'có', 'co'].includes((processedData.bridalParty || '').toString().toLowerCase()),
              nzInvite: ['true', '1', 'yes', 'có', 'co'].includes((processedData.nzInvite || '').toString().toLowerCase()),
              myInvite: ['true', '1', 'yes', 'có', 'co'].includes((processedData.myInvite || '').toString().toLowerCase()),
              tableNumber: processedData.tableNumber ? parseInt(processedData.tableNumber.toString()) : undefined,
              notes: (processedData.notes || '').toString().trim() || undefined,
            }

            // Validate required fields
            if (!processedData.firstName || !processedData.lastName) {
              results.errors.push({
                row: rowNumber,
                data: processedData,
                error: 'firstName and lastName are required'
              })
              return
            }

            // Validate with Zod
            const validatedData = importGuestSchema.parse(processedData)
            guestsToImport.push(validatedData)

          } catch (error) {
            results.errors.push({
              row: rowNumber,
              data,
              error: error instanceof Error ? error.message : 'Invalid data format'
            })
          }
        })
        .on('end', () => {
          resolve()
        })
        .on('error', (error) => {
          reject(error)
        })
    })

    // Import guests to database
    for (const guestData of guestsToImport) {
      try {
        // Check if guest already exists
        const existingGuest = await prisma.user.findUnique({
          where: {
            fullName: {
              firstName: guestData.firstName,
              lastName: guestData.lastName
            }
          }
        })

        if (existingGuest) {
          results.skipped++
          continue
        }

        // Create new guest
        await prisma.user.create({
          data: {
            firstName: guestData.firstName,
            lastName: guestData.lastName,
            email: guestData.email || null,
            phone: guestData.phone || null,
            bridalParty: guestData.bridalParty,
            nzInvite: guestData.nzInvite,
            myInvite: guestData.myInvite,
            tableNumber: guestData.tableNumber || null,
            notes: guestData.notes || null,
            invitedAt: new Date()
          }
        })

        results.imported++
      } catch (error) {
        results.errors.push({
          row: 0, // We don't track row numbers in this phase
          data: guestData,
          error: error instanceof Error ? error.message : 'Database error'
        })
      }
    }

    // Clean up uploaded file
    try {
      fs.unlinkSync(filePath)
    } catch (error) {
      console.warn('Failed to delete uploaded file:', error)
    }

    return res.status(200).json(results)

  } catch (error) {
    console.error('Import error:', error)
    return res.status(500).json({ 
      error: 'Failed to import guests',
      details: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}

export default withAdminAuth(handler)