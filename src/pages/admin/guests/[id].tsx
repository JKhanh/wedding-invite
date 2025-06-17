import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { GetServerSideProps } from 'next'
import Link from 'next/link'
import Head from 'next/head'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { motion } from 'framer-motion'
import { verifyAdminToken } from '@/utils/adminAuth'
import { useAdminAuth } from '@/utils/adminAuth'

const guestSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email').optional().or(z.literal('')),
  phone: z.string().optional(),
  bridalParty: z.boolean().default(false),
  tableNumber: z.number().min(1).optional().or(z.literal('')),
  notes: z.string().optional()
})

type GuestForm = z.infer<typeof guestSchema>

interface Guest {
  id: number
  firstName: string
  lastName: string
  email: string | null
  phone: string | null
  bridalParty: boolean
  rsvpToken: string
  rsvpUrl: string
  RSVP: boolean | null
  RSVPOthersYes: string | null
  RSVPOthersNo: string | null
  RSVPDate: string | null
  invitedAt: string | null
  rsvpViewedAt: string | null
  tableNumber: number | null
  notes: string | null
  createdAt: string
  updatedAt: string
}

interface EditGuestPageProps {
  guest: Guest
}

export default function EditGuestPage({ guest }: EditGuestPageProps) {
  const router = useRouter()
  const { logout } = useAdminAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showRSVPUrl, setShowRSVPUrl] = useState(false)

  const { register, handleSubmit, formState: { errors }, reset } = useForm<GuestForm>({
    resolver: zodResolver(guestSchema),
    defaultValues: {
      firstName: guest.firstName,
      lastName: guest.lastName,
      email: guest.email || '',
      phone: guest.phone || '',
      bridalParty: guest.bridalParty,
      tableNumber: guest.tableNumber || '',
      notes: guest.notes || ''
    }
  })

  const handleLogout = async () => {
    await logout()
    router.push('/admin')
  }

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      alert('RSVP URL copied to clipboard!')
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  const onSubmit = async (data: GuestForm) => {
    setLoading(true)
    setError('')

    try {
      const payload = {
        ...data,
        email: data.email || undefined,
        phone: data.phone || undefined,
        tableNumber: data.tableNumber ? Number(data.tableNumber) : undefined,
        notes: data.notes || undefined
      }

      const response = await fetch(`/api/admin/guests/${guest.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      })

      if (response.ok) {
        router.push('/admin/guests')
      } else {
        const errorData = await response.json()
        setError(errorData.error || 'Failed to update guest')
      }
    } catch (error) {
      setError('Network error occurred')
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (rsvp: boolean | null) => {
    if (rsvp === true) return <span className="badge badge-success">Confirmed</span>
    if (rsvp === false) return <span className="badge badge-error">Declined</span>
    return <span className="badge badge-warning">Pending</span>
  }

  return (
    <>
      <Head>
        <title>Edit Guest - {guest.firstName} {guest.lastName}</title>
      </Head>
      
      <div data-theme="green" className="min-h-screen bg-base-200">
        {/* Navigation */}
        <div className="navbar bg-base-100 shadow-lg">
          <div className="flex-1">
            <Link href="/admin/dashboard" className="btn btn-ghost normal-case text-xl">
              Wedding Admin
            </Link>
          </div>
          <div className="flex-none">
            <ul className="menu menu-horizontal px-1">
              <li>
                <Link href="/admin/dashboard" className="btn btn-ghost">
                  Dashboard
                </Link>
              </li>
              <li>
                <Link href="/admin/guests" className="btn btn-ghost">
                  Guests
                </Link>
              </li>
              <li>
                <button onClick={handleLogout} className="btn btn-ghost">
                  Logout
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Main Content */}
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Header */}
            <div>
              <h1 className="text-3xl font-bold text-neutral mb-2">
                Edit Guest: {guest.firstName} {guest.lastName}
              </h1>
              <p className="text-neutral/70">Update guest information and RSVP details</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Guest Form */}
              <div className="lg:col-span-2">
                <div className="card bg-base-100 shadow-xl">
                  <div className="card-body">
                    <h2 className="card-title">Guest Information</h2>
                    
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                      {/* Basic Information */}
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="form-control">
                            <label className="label">
                              <span className="label-text">First Name *</span>
                            </label>
                            <input
                              type="text"
                              className={`input input-bordered ${errors.firstName ? 'input-error' : ''}`}
                              {...register('firstName')}
                            />
                            {errors.firstName && (
                              <label className="label">
                                <span className="label-text-alt text-error">{errors.firstName.message}</span>
                              </label>
                            )}
                          </div>

                          <div className="form-control">
                            <label className="label">
                              <span className="label-text">Last Name *</span>
                            </label>
                            <input
                              type="text"
                              className={`input input-bordered ${errors.lastName ? 'input-error' : ''}`}
                              {...register('lastName')}
                            />
                            {errors.lastName && (
                              <label className="label">
                                <span className="label-text-alt text-error">{errors.lastName.message}</span>
                              </label>
                            )}
                          </div>
                        </div>

                        <div className="form-control">
                          <label className="label">
                            <span className="label-text">Email</span>
                          </label>
                          <input
                            type="email"
                            className={`input input-bordered ${errors.email ? 'input-error' : ''}`}
                            {...register('email')}
                          />
                          {errors.email && (
                            <label className="label">
                              <span className="label-text-alt text-error">{errors.email.message}</span>
                            </label>
                          )}
                        </div>

                        <div className="form-control">
                          <label className="label">
                            <span className="label-text">Phone</span>
                          </label>
                          <input
                            type="tel"
                            className="input input-bordered"
                            {...register('phone')}
                          />
                        </div>

                        <div className="form-control">
                          <label className="cursor-pointer label justify-start gap-3">
                            <input 
                              type="checkbox" 
                              className="checkbox checkbox-primary"
                              {...register('bridalParty')}
                            />
                            <span className="label-text">Bridal Party Member</span>
                          </label>
                        </div>

                        <div className="form-control">
                          <label className="label">
                            <span className="label-text">Table Number</span>
                          </label>
                          <input
                            type="number"
                            className="input input-bordered"
                            min="1"
                            {...register('tableNumber', { valueAsNumber: true })}
                          />
                        </div>

                        <div className="form-control">
                          <label className="label">
                            <span className="label-text">Notes</span>
                          </label>
                          <textarea
                            className="textarea textarea-bordered"
                            rows={3}
                            {...register('notes')}
                          />
                        </div>
                      </div>

                      {/* Error Display */}
                      {error && (
                        <div className="alert alert-error">
                          <span>{error}</span>
                        </div>
                      )}

                      {/* Actions */}
                      <div className="flex gap-4 justify-end">
                        <Link href="/admin/guests" className="btn btn-outline">
                          Cancel
                        </Link>
                        <button
                          type="submit"
                          disabled={loading}
                          className="btn btn-primary"
                        >
                          {loading ? (
                            <>
                              <span className="loading loading-spinner loading-sm"></span>
                              Updating...
                            </>
                          ) : (
                            'Update Guest'
                          )}
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              </div>

              {/* RSVP Information */}
              <div className="space-y-6">
                {/* RSVP Status */}
                <div className="card bg-base-100 shadow-xl">
                  <div className="card-body">
                    <h2 className="card-title">RSVP Status</h2>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">Status:</span>
                        {getStatusBadge(guest.RSVP)}
                      </div>
                      
                      {guest.RSVPDate && (
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium">RSVP Date:</span>
                          <span className="text-sm">
                            {new Date(guest.RSVPDate).toLocaleDateString()}
                          </span>
                        </div>
                      )}

                      {guest.RSVPOthersYes && (
                        <div>
                          <div className="text-sm font-medium text-success">Attending:</div>
                          <div className="text-sm">{guest.RSVPOthersYes}</div>
                        </div>
                      )}

                      {guest.RSVPOthersNo && (
                        <div>
                          <div className="text-sm font-medium text-error">Not Attending:</div>
                          <div className="text-sm">{guest.RSVPOthersNo}</div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* RSVP URL */}
                <div className="card bg-base-100 shadow-xl">
                  <div className="card-body">
                    <h2 className="card-title">RSVP Link</h2>
                    <div className="space-y-3">
                      <button
                        className="btn btn-outline btn-sm w-full"
                        onClick={() => copyToClipboard(guest.rsvpUrl)}
                      >
                        Copy RSVP URL
                      </button>
                      
                      <button
                        className="btn btn-ghost btn-sm w-full"
                        onClick={() => setShowRSVPUrl(!showRSVPUrl)}
                      >
                        {showRSVPUrl ? 'Hide' : 'Show'} URL
                      </button>
                      
                      {showRSVPUrl && (
                        <div className="text-xs break-all bg-base-200 p-2 rounded">
                          {guest.rsvpUrl}
                        </div>
                      )}

                      <a
                        href={guest.rsvpUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-primary btn-sm w-full"
                      >
                        Test RSVP Page
                      </a>
                    </div>
                  </div>
                </div>

                {/* Guest Info */}
                <div className="card bg-base-100 shadow-xl">
                  <div className="card-body">
                    <h2 className="card-title">Details</h2>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="font-medium">Created:</span>
                        <span>{new Date(guest.createdAt).toLocaleDateString()}</span>
                      </div>
                      
                      {guest.invitedAt && (
                        <div className="flex justify-between">
                          <span className="font-medium">Invited:</span>
                          <span>{new Date(guest.invitedAt).toLocaleDateString()}</span>
                        </div>
                      )}

                      {guest.rsvpViewedAt && (
                        <div className="flex justify-between">
                          <span className="font-medium">Viewed RSVP:</span>
                          <span>{new Date(guest.rsvpViewedAt).toLocaleDateString()}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </>
  )
}

export const getServerSideProps: GetServerSideProps = async ({ req, params }) => {
  // Check admin authentication
  if (!verifyAdminToken(req as any)) {
    return {
      redirect: {
        destination: '/admin',
        permanent: false,
      },
    }
  }

  const guestId = params?.id as string

  try {
    const response = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/admin/guests/${guestId}`, {
      headers: {
        cookie: req.headers.cookie || ''
      }
    })

    if (!response.ok) {
      return {
        notFound: true
      }
    }

    const guest = await response.json()

    return {
      props: {
        guest
      }
    }
  } catch (error) {
    console.error('Error fetching guest:', error)
    return {
      notFound: true
    }
  }
}