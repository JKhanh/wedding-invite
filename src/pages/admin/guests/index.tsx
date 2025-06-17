import { useState, useEffect } from 'react'
import { GetServerSideProps } from 'next'
import Link from 'next/link'
import Head from 'next/head'
import { motion } from 'framer-motion'
import { verifyAdminToken } from '@/utils/adminAuth'
import { useAdminAuth } from '@/utils/adminAuth'
import { useRouter } from 'next/router'

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
}

interface GuestsPageProps {
  initialGuests: Guest[]
}

export default function GuestsPage({ initialGuests }: GuestsPageProps) {
  const router = useRouter()
  const { logout } = useAdminAuth()
  const [guests, setGuests] = useState<Guest[]>(initialGuests)
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [filter, setFilter] = useState<'all' | 'confirmed' | 'declined' | 'pending'>('all')

  const handleLogout = async () => {
    await logout()
    router.push('/admin')
  }

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      // You could add a toast notification here
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  const deleteGuest = async (id: number) => {
    if (!confirm('Are you sure you want to delete this guest?')) return

    setLoading(true)
    try {
      const response = await fetch(`/api/admin/guests/${id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        setGuests(guests.filter(g => g.id !== id))
      } else {
        alert('Failed to delete guest')
      }
    } catch (error) {
      alert('Error deleting guest')
    } finally {
      setLoading(false)
    }
  }

  const filteredGuests = guests.filter(guest => {
    const matchesSearch = 
      guest.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      guest.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      guest.email?.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesFilter = 
      filter === 'all' ||
      (filter === 'confirmed' && guest.RSVP === true) ||
      (filter === 'declined' && guest.RSVP === false) ||
      (filter === 'pending' && guest.RSVP === null)

    return matchesSearch && matchesFilter
  })

  const getStatusBadge = (rsvp: boolean | null) => {
    if (rsvp === true) return <span className="badge badge-success">Confirmed</span>
    if (rsvp === false) return <span className="badge badge-error">Declined</span>
    return <span className="badge badge-warning">Pending</span>
  }

  return (
    <>
      <Head>
        <title>Manage Guests - Wedding Admin</title>
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
                <button onClick={handleLogout} className="btn btn-ghost">
                  Logout
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Main Content */}
        <div className="container mx-auto px-4 py-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Header */}
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold text-neutral">Manage Guests</h1>
                <p className="text-neutral/70">
                  {filteredGuests.length} of {guests.length} guests
                </p>
              </div>
              <Link href="/admin/guests/new" className="btn btn-primary">
                Add New Guest
              </Link>
            </div>

            {/* Filters */}
            <div className="card bg-base-100 shadow-xl">
              <div className="card-body">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="form-control flex-1">
                    <input
                      type="text"
                      placeholder="Search guests..."
                      className="input input-bordered"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  <div className="form-control">
                    <select
                      className="select select-bordered"
                      value={filter}
                      onChange={(e) => setFilter(e.target.value as any)}
                    >
                      <option value="all">All Status</option>
                      <option value="confirmed">Confirmed</option>
                      <option value="declined">Declined</option>
                      <option value="pending">Pending</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Guest List */}
            <div className="card bg-base-100 shadow-xl">
              <div className="card-body">
                {filteredGuests.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="table table-zebra">
                      <thead>
                        <tr>
                          <th>Name</th>
                          <th>Contact</th>
                          <th>Status</th>
                          <th>Additional Guests</th>
                          <th>RSVP URL</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredGuests.map((guest) => (
                          <tr key={guest.id}>
                            <td>
                              <div className="flex items-center space-x-3">
                                <div>
                                  <div className="font-bold">
                                    {guest.firstName} {guest.lastName}
                                    {guest.bridalParty && (
                                      <span className="badge badge-secondary badge-sm ml-2">
                                        Bridal Party
                                      </span>
                                    )}
                                  </div>
                                  {guest.tableNumber && (
                                    <div className="text-sm opacity-50">
                                      Table {guest.tableNumber}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </td>
                            <td>
                              <div className="text-sm">
                                {guest.email && (
                                  <div className="text-neutral">{guest.email}</div>
                                )}
                                {guest.phone && (
                                  <div className="text-neutral/70">{guest.phone}</div>
                                )}
                              </div>
                            </td>
                            <td>{getStatusBadge(guest.RSVP)}</td>
                            <td>
                              <div className="text-sm">
                                {guest.RSVPOthersYes && (
                                  <div className="text-success">✓ {guest.RSVPOthersYes}</div>
                                )}
                                {guest.RSVPOthersNo && (
                                  <div className="text-error">✗ {guest.RSVPOthersNo}</div>
                                )}
                                {!guest.RSVPOthersYes && !guest.RSVPOthersNo && (
                                  <span className="text-neutral/50">-</span>
                                )}
                              </div>
                            </td>
                            <td>
                              <button
                                className="btn btn-xs btn-outline"
                                onClick={() => copyToClipboard(guest.rsvpUrl)}
                                title="Copy RSVP URL"
                              >
                                Copy Link
                              </button>
                            </td>
                            <td>
                              <div className="flex gap-2">
                                <Link
                                  href={`/admin/guests/${guest.id}`}
                                  className="btn btn-xs btn-primary"
                                >
                                  Edit
                                </Link>
                                <button
                                  className="btn btn-xs btn-error"
                                  onClick={() => deleteGuest(guest.id)}
                                  disabled={loading}
                                >
                                  Delete
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-neutral/70">No guests found.</p>
                    <Link href="/admin/guests/new" className="btn btn-primary mt-4">
                      Add Your First Guest
                    </Link>
                  </div>
                )}
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

  try {
    // Fetch guests data on server side
    const response = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/admin/guests`, {
      headers: {
        cookie: req.headers.cookie || ''
      }
    })

    if (!response.ok) {
      throw new Error('Failed to fetch guests')
    }

    const guests = await response.json()

    return {
      props: {
        initialGuests: guests
      }
    }
  } catch (error) {
    console.error('Error fetching guests:', error)
    return {
      props: {
        initialGuests: []
      }
    }
  }
}