import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { GetServerSideProps } from 'next'
import { useAdminAuth } from '@/utils/adminAuth'
import { verifyAdminToken } from '@/utils/adminAuth'
import { prisma } from '@/prisma'
import Head from 'next/head'
import Link from 'next/link'
import { motion } from 'framer-motion'

interface DashboardStats {
  totalGuests: number
  confirmed: number
  declined: number
  pending: number
  totalAttending: number
}

interface DashboardProps {
  stats: DashboardStats
  recentRSVPs: Array<{
    id: number
    firstName: string
    lastName: string
    RSVP: boolean | null
    RSVPDate: string | null
    RSVPOthersYes: string | null
  }>
}

export default function AdminDashboard({ stats, recentRSVPs }: DashboardProps) {
  const router = useRouter()
  const { logout } = useAdminAuth()
  const [loading, setLoading] = useState(false)
  const [statusFilter, setStatusFilter] = useState<'all' | 'confirmed' | 'declined' | 'pending'>('all')

  const handleLogout = async () => {
    setLoading(true)
    await logout()
    router.push('/admin')
  }

  const filteredRSVPs = recentRSVPs.filter(rsvp => {
    if (statusFilter === 'all') return true
    if (statusFilter === 'confirmed') return rsvp.RSVP === true
    if (statusFilter === 'declined') return rsvp.RSVP === false
    if (statusFilter === 'pending') return rsvp.RSVP === null
    return true
  })

  return (
    <>
      <Head>
        <title>Admin Dashboard - Wedding Management</title>
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
                <Link href="/admin/guests" className="btn btn-ghost btn-sm sm:btn-md">
                  <span className="hidden sm:inline">Manage Guests</span>
                  <span className="sm:hidden">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                    </svg>
                  </span>
                </Link>
              </li>
              <li>
                <button 
                  onClick={handleLogout}
                  className="btn btn-ghost btn-sm sm:btn-md"
                  disabled={loading}
                >
                  {loading ? (
                    <span className="loading loading-spinner loading-sm"></span>
                  ) : (
                    <>
                      <span className="hidden sm:inline">Logout</span>
                      <span className="sm:hidden">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                      </span>
                    </>
                  )}
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
            className="space-y-8"
          >
            {/* Page Header */}
            <div>
              <h1 className="text-3xl font-bold text-neutral mb-2">Dashboard</h1>
              <p className="text-neutral/70">Wedding guest management overview</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
              <button 
                onClick={() => setStatusFilter('all')}
                className={`stat bg-base-100 rounded-lg shadow transition-all duration-200 hover:shadow-lg ${
                  statusFilter === 'all' ? 'ring-2 ring-primary bg-primary/5' : 'hover:bg-base-200'
                }`}
              >
                <div className="stat-title">Total Guests</div>
                <div className="stat-value text-primary">{stats.totalGuests}</div>
              </button>
              
              <button 
                onClick={() => setStatusFilter(statusFilter === 'confirmed' ? 'all' : 'confirmed')}
                className={`stat bg-base-100 rounded-lg shadow transition-all duration-200 hover:shadow-lg ${
                  statusFilter === 'confirmed' ? 'ring-2 ring-success bg-success/5' : 'hover:bg-base-200'
                }`}
              >
                <div className="stat-title">Confirmed</div>
                <div className="stat-value text-success">{stats.confirmed}</div>
              </button>
              
              <button 
                onClick={() => setStatusFilter(statusFilter === 'declined' ? 'all' : 'declined')}
                className={`stat bg-base-100 rounded-lg shadow transition-all duration-200 hover:shadow-lg ${
                  statusFilter === 'declined' ? 'ring-2 ring-error bg-error/5' : 'hover:bg-base-200'
                }`}
              >
                <div className="stat-title">Declined</div>
                <div className="stat-value text-error">{stats.declined}</div>
              </button>
              
              <button 
                onClick={() => setStatusFilter(statusFilter === 'pending' ? 'all' : 'pending')}
                className={`stat bg-base-100 rounded-lg shadow transition-all duration-200 hover:shadow-lg ${
                  statusFilter === 'pending' ? 'ring-2 ring-warning bg-warning/5' : 'hover:bg-base-200'
                }`}
              >
                <div className="stat-title">Pending</div>
                <div className="stat-value text-warning">{stats.pending}</div>
              </button>
              
              <div className="stat bg-base-100 rounded-lg shadow">
                <div className="stat-title">Total Attending</div>
                <div className="stat-value text-info">{stats.totalAttending}</div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="card bg-base-100 shadow-xl">
              <div className="card-body">
                <h2 className="card-title">Quick Actions</h2>
                <div className="flex flex-wrap gap-4">
                  <Link href="/admin/guests/new" className="btn btn-primary">
                    Add New Guest
                  </Link>
                  <Link href="/admin/guests" className="btn btn-outline">
                    View All Guests
                  </Link>
                  <Link href="/" className="btn btn-outline">
                    View Wedding Site
                  </Link>
                </div>
              </div>
            </div>

            {/* Recent RSVPs */}
            <div className="card bg-base-100 shadow-xl">
              <div className="card-body">
                <h2 className="card-title">
                  Recent RSVPs
                  {statusFilter !== 'all' && (
                    <span className="text-sm font-normal text-neutral/70 ml-2">
                      - {statusFilter === 'confirmed' ? 'Confirmed Only' : 
                         statusFilter === 'declined' ? 'Declined Only' : 
                         'Pending Only'}
                    </span>
                  )}
                </h2>
                {filteredRSVPs.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="table table-zebra">
                      <thead>
                        <tr>
                          <th>Guest</th>
                          <th>Response</th>
                          <th>Additional Guests</th>
                          <th>Date</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredRSVPs.map((rsvp) => (
                          <tr key={rsvp.id}>
                            <td className="font-medium">
                              {rsvp.firstName} {rsvp.lastName}
                            </td>
                            <td>
                              {rsvp.RSVP === true && (
                                <span className="badge badge-success">Attending</span>
                              )}
                              {rsvp.RSVP === false && (
                                <span className="badge badge-error">Not Attending</span>
                              )}
                              {rsvp.RSVP === null && (
                                <span className="badge badge-warning">Pending</span>
                              )}
                            </td>
                            <td>{rsvp.RSVPOthersYes || '-'}</td>
                            <td>
                              {rsvp.RSVPDate ? 
                                new Date(rsvp.RSVPDate).toLocaleString('en-US', {
                                  year: 'numeric',
                                  month: 'short',
                                  day: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit',
                                  second: '2-digit',
                                  hour12: true
                                }) : 
                                '-'
                              }
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-neutral/70">No RSVPs yet.</p>
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
    // Get statistics
    const totalGuests = await prisma.user.count()
    const confirmed = await prisma.user.count({ where: { RSVP: true } })
    const declined = await prisma.user.count({ where: { RSVP: false } })
    const pending = await prisma.user.count({ where: { RSVP: null } })

    // Calculate total attending (including additional guests)
    const confirmedGuests = await prisma.user.findMany({
      where: { RSVP: true },
      select: { RSVPOthersYes: true }
    })
    
    const totalAttending = confirmedGuests.reduce((total, guest) => {
      const additionalGuests = guest.RSVPOthersYes ? 
        guest.RSVPOthersYes.split(',').filter(name => name.trim()).length : 0
      return total + 1 + additionalGuests
    }, 0)

    // Get recent guests (including pending RSVPs)
    const recentRSVPs = await prisma.user.findMany({
      orderBy: { updatedAt: 'desc' },
      take: 10,
      select: {
        id: true,
        firstName: true,
        lastName: true,
        RSVP: true,
        RSVPDate: true,
        RSVPOthersYes: true
      }
    })

    return {
      props: {
        stats: {
          totalGuests,
          confirmed,
          declined,
          pending,
          totalAttending
        },
        recentRSVPs: recentRSVPs.map(rsvp => ({
          ...rsvp,
          RSVPDate: rsvp.RSVPDate?.toISOString() || null
        }))
      }
    }
  } catch (error) {
    console.error('Dashboard data fetch error:', error)
    return {
      props: {
        stats: {
          totalGuests: 0,
          confirmed: 0,
          declined: 0,
          pending: 0,
          totalAttending: 0
        },
        recentRSVPs: []
      }
    }
  }
}