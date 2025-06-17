import { useState, useRef } from 'react'
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
  const [importing, setImporting] = useState(false)
  const [importResults, setImportResults] = useState<any>(null)
  const [refreshing, setRefreshing] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

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
        // Optionally refresh the entire list to ensure data consistency
        // await refreshGuestList()
      } else {
        alert('Failed to delete guest')
      }
    } catch (error) {
      alert('Error deleting guest')
    } finally {
      setLoading(false)
    }
  }

  const handleImportClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (!file.name.endsWith('.csv')) {
      alert('Please select a CSV file')
      return
    }

    setImporting(true)
    setImportResults(null)

    try {
      const formData = new FormData()
      formData.append('csvFile', file)

      const response = await fetch('/api/importGuests', {
        method: 'POST',
        body: formData
      })

      const results = await response.json()

      if (response.ok) {
        setImportResults(results)
        // Refresh the guest list
        if (results.imported > 0) {
          await refreshGuestList()
        }
      } else {
        alert(`Import failed: ${results.error || 'Unknown error'}`)
      }
    } catch (error) {
      alert('Error during import')
      console.error(error)
    } finally {
      setImporting(false)
      // Clear the file input
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }


  const refreshGuestList = async () => {
    setRefreshing(true)
    try {
      const response = await fetch('/api/admin/guests')
      if (response.ok) {
        const updatedGuests = await response.json()
        setGuests(updatedGuests)
      } else {
        alert('Failed to refresh guest list')
      }
    } catch (error) {
      alert('Error refreshing guest list')
      console.error(error)
    } finally {
      setRefreshing(false)
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
            <Link href="/admin/dashboard" className="btn btn-ghost normal-case text-lg sm:text-xl">
              <span className="hidden sm:inline">Wedding Admin</span>
              <span className="sm:hidden">Admin</span>
            </Link>
          </div>
          <div className="flex-none">
            <ul className="menu menu-horizontal px-1">
              <li>
                <Link href="/admin/dashboard" className="btn btn-ghost btn-sm sm:btn-md">
                  <span className="hidden sm:inline">Dashboard</span>
                  <span className="sm:hidden">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </span>
                </Link>
              </li>
              <li>
                <button onClick={handleLogout} className="btn btn-ghost btn-sm sm:btn-md">
                  <span className="hidden sm:inline">Logout</span>
                  <span className="sm:hidden">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                  </span>
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Main Content */}
        <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4 sm:space-y-6"
          >
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-neutral">Manage Guests</h1>
                <p className="text-neutral/70">
                  {filteredGuests.length} of {guests.length} guests
                </p>
              </div>
              <div className="flex flex-row gap-2 items-center">
                <button 
                  onClick={refreshGuestList}
                  disabled={refreshing}
                  className="btn btn-outline h-12 px-4"
                  title="Refresh guest list"
                >
                  {refreshing ? (
                    <>
                      <span className="loading loading-spinner loading-sm"></span>
                      Refreshing...
                    </>
                  ) : (
                    'Refresh'
                  )}
                </button>
                <button 
                  onClick={handleImportClick}
                  disabled={importing}
                  className="btn btn-secondary h-12 px-4"
                  title="Import guests from CSV file"
                >
                  {importing ? (
                    <>
                      <span className="loading loading-spinner loading-sm"></span>
                      Importing...
                    </>
                  ) : (
                    'Import'
                  )}
                </button>
                <Link href="/admin/guests/new" className="btn btn-primary h-12 px-4">
                  Add Guest
                </Link>
              </div>
            </div>

            {/* Hidden file input */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".csv"
              className="hidden"
            />

            {/* Import Results */}
            {importResults && (
              <div className="card bg-base-100 shadow-xl">
                <div className="card-body">
                  <h3 className="text-lg font-semibold mb-4">Import Results</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div className="stat">
                      <div className="stat-title">Imported</div>
                      <div className="stat-value text-success">{importResults.imported}</div>
                    </div>
                    <div className="stat">
                      <div className="stat-title">Skipped</div>
                      <div className="stat-value text-warning">{importResults.skipped}</div>
                    </div>
                    <div className="stat">
                      <div className="stat-title">Errors</div>
                      <div className="stat-value text-error">{importResults.errors.length}</div>
                    </div>
                  </div>
                  
                  {importResults.errors.length > 0 && (
                    <div className="collapse collapse-arrow border border-error">
                      <input type="checkbox" />
                      <div className="collapse-title text-error font-medium">
                        View Import Errors ({importResults.errors.length})
                      </div>
                      <div className="collapse-content">
                        <div className="space-y-2 max-h-48 overflow-y-auto">
                          {importResults.errors.map((error: any, index: number) => (
                            <div key={index} className="bg-error/10 p-2 rounded text-sm">
                              <div className="font-medium">Row {error.row}:</div>
                              <div className="text-error">{error.error}</div>
                              <div className="text-xs text-neutral/70 mt-1">
                                Data: {JSON.stringify(error.data)}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <div className="flex justify-end mt-4">
                    <button 
                      className="btn btn-ghost btn-sm"
                      onClick={() => setImportResults(null)}
                    >
                      Dismiss
                    </button>
                  </div>
                </div>
              </div>
            )}

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
              <div className="card-body p-2 sm:p-6">
                {filteredGuests.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="table table-zebra table-compact sm:table-normal">
                      <thead>
                        <tr>
                          <th className="text-xs sm:text-sm">Name</th>
                          <th className="hidden sm:table-cell text-xs sm:text-sm">Contact</th>
                          <th className="text-xs sm:text-sm">Status</th>
                          <th className="hidden lg:table-cell text-xs sm:text-sm">Additional Guests</th>
                          <th className="hidden md:table-cell text-xs sm:text-sm">RSVP URL</th>
                          <th className="text-xs sm:text-sm">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredGuests.map((guest) => (
                          <tr key={guest.id}>
                            <td>
                              <div className="flex flex-col space-y-1">
                                <div className="font-bold text-sm sm:text-base">
                                  {guest.firstName} {guest.lastName}
                                  {guest.bridalParty && (
                                    <span className="badge badge-secondary badge-xs sm:badge-sm ml-1 sm:ml-2">
                                      <span className="hidden sm:inline">Bridal Party</span>
                                      <span className="sm:hidden">BP</span>
                                    </span>
                                  )}
                                </div>
                                {guest.tableNumber && (
                                  <div className="text-xs sm:text-sm opacity-50">
                                    Table {guest.tableNumber}
                                  </div>
                                )}
                                {/* Show contact info on mobile when contact column is hidden */}
                                <div className="sm:hidden text-xs text-neutral/70">
                                  {guest.email && <div>{guest.email}</div>}
                                  {guest.phone && <div>{guest.phone}</div>}
                                </div>
                              </div>
                            </td>
                            <td className="hidden sm:table-cell">
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
                            <td className="hidden lg:table-cell">
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
                            <td className="hidden md:table-cell">
                              <button
                                className="btn btn-xs btn-outline"
                                onClick={() => copyToClipboard(guest.rsvpUrl)}
                                title="Copy RSVP URL"
                              >
                                Copy Link
                              </button>
                            </td>
                            <td>
                              <div className="flex flex-col sm:flex-row gap-1 sm:gap-2">
                                <Link
                                  href={`/admin/guests/${guest.id}`}
                                  className="btn btn-xs btn-primary"
                                >
                                  <span className="hidden sm:inline">Edit</span>
                                  <span className="sm:hidden">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                    </svg>
                                  </span>
                                </Link>
                                <button
                                  className="btn btn-xs btn-error"
                                  onClick={() => deleteGuest(guest.id)}
                                  disabled={loading}
                                >
                                  <span className="hidden sm:inline">Delete</span>
                                  <span className="sm:hidden">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                  </span>
                                </button>
                                {/* Mobile-only RSVP URL button */}
                                <button
                                  className="btn btn-xs btn-outline md:hidden"
                                  onClick={() => copyToClipboard(guest.rsvpUrl)}
                                  title="Copy RSVP URL"
                                >
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                                  </svg>
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