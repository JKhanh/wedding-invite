import { useState } from 'react'
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

export default function NewGuestPage() {
  const router = useRouter()
  const { logout } = useAdminAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const { register, handleSubmit, formState: { errors } } = useForm<GuestForm>({
    resolver: zodResolver(guestSchema),
    defaultValues: {
      bridalParty: false
    }
  })

  const handleLogout = async () => {
    await logout()
    router.push('/admin')
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

      const response = await fetch('/api/admin/guests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      })

      if (response.ok) {
        router.push('/admin/guests')
      } else {
        const errorData = await response.json()
        setError(errorData.error || 'Failed to create guest')
      }
    } catch (error) {
      setError('Network error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Head>
        <title>Add New Guest - Wedding Admin</title>
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
        <div className="container mx-auto px-4 py-8 max-w-2xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Header */}
            <div>
              <h1 className="text-3xl font-bold text-neutral mb-2">Add New Guest</h1>
              <p className="text-neutral/70">Create a new guest invitation</p>
            </div>

            {/* Form */}
            <div className="card bg-base-100 shadow-xl">
              <div className="card-body">
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                  {/* Basic Information */}
                  <div className="space-y-4">
                    <h2 className="text-xl font-semibold">Basic Information</h2>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="form-control">
                        <label className="label">
                          <span className="label-text">First Name *</span>
                        </label>
                        <input
                          type="text"
                          className={`input input-bordered ${errors.firstName ? 'input-error' : ''}`}
                          placeholder="John"
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
                          placeholder="Smith"
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
                        <span className="label-text">Email (Optional)</span>
                      </label>
                      <input
                        type="email"
                        className={`input input-bordered ${errors.email ? 'input-error' : ''}`}
                        placeholder="john.smith@example.com"
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
                        <span className="label-text">Phone (Optional)</span>
                      </label>
                      <input
                        type="tel"
                        className="input input-bordered"
                        placeholder="+1 (555) 123-4567"
                        {...register('phone')}
                      />
                    </div>
                  </div>

                  {/* Wedding Details */}
                  <div className="space-y-4">
                    <h2 className="text-xl font-semibold">Wedding Details</h2>
                    
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
                        <span className="label-text">Table Number (Optional)</span>
                      </label>
                      <input
                        type="number"
                        className={`input input-bordered ${errors.tableNumber ? 'input-error' : ''}`}
                        placeholder="1"
                        min="1"
                        {...register('tableNumber', { valueAsNumber: true })}
                      />
                      {errors.tableNumber && (
                        <label className="label">
                          <span className="label-text-alt text-error">{errors.tableNumber.message}</span>
                        </label>
                      )}
                    </div>

                    <div className="form-control">
                      <label className="label">
                        <span className="label-text">Notes (Optional)</span>
                      </label>
                      <textarea
                        className="textarea textarea-bordered"
                        placeholder="Any special notes about this guest..."
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
                          Creating...
                        </>
                      ) : (
                        'Create Guest'
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </>
  )
}

export const getServerSideProps: GetServerSideProps = async ({ req }) => {
  // Check admin authentication
  if (!verifyAdminToken(req as any)) {
    return {
      redirect: {
        destination: '/admin',
        permanent: false,
      },
    }
  }

  return {
    props: {}
  }
}