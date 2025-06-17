import { useState, useEffect, useRef } from 'react'
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

  const downloadSampleCSV = () => {
    const csvContent = `firstName,lastName,email,phone,bridalParty,nzInvite,myInvite,tableNumber,notes
Nguyễn,Văn An,nguyen.van.an@email.com,0123456789,false,false,true,1,Bạn thân cô dâu
Trần,Thị Bình,tran.thi.binh@email.com,0987654321,true,false,true,2,Phù dâu
Lê,Văn Cường,le.van.cuong@email.com,,false,true,false,3,Anh em chú rể`

    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', 'sample_guest_list.csv')
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
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
              <div className="flex gap-2">
                <button 
                  onClick={refreshGuestList}
                  disabled={refreshing}
                  className="btn btn-outline"
                  title="Refresh guest list"
                >
                  {refreshing ? (
                    <>
                      <span className="loading loading-spinner loading-sm"></span>
                      Refreshing...
                    </>
                  ) : (
                    <>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                      Refresh
                    </>
                  )}
                </button>
                <div className="dropdown dropdown-end">
                  <label tabIndex={0} className="btn btn-secondary">
                    Import Guests
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </label>
                  <ul tabIndex={0} className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-52">
                    <li>
                      <button onClick={handleImportClick} disabled={importing}>
                        {importing ? (
                          <>
                            <span className="loading loading-spinner loading-xs"></span>
                            Importing...
                          </>
                        ) : (
                          <>
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                            </svg>
                            Upload CSV File
                          </>
                        )}
                      </button>
                    </li>
                    <li>
                      <button onClick={downloadSampleCSV}>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        Download Sample CSV
                      </button>
                    </li>
                  </ul>
                </div>
                <Link href="/admin/guests/new" className="btn btn-primary">
                  Add New Guest
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