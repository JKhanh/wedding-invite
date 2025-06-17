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

  const handleLogout = async () => {
    setLoading(true)
    await logout()
    router.push('/admin')
  }

  return (
    <>
      <Head>
        <title>Admin Dashboard - Wedding Management</title>
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
                <Link href="/admin/guests" className="btn btn-ghost">
                  Manage Guests
                </Link>
              </li>
              <li>
                <button 
                  onClick={handleLogout}
                  className="btn btn-ghost"
                  disabled={loading}
                >
                  {loading ? (
                    <span className="loading loading-spinner loading-sm"></span>
                  ) : (
                    'Logout'
                  )}
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
            className="space-y-8"
          >
            {/* Page Header */}
            <div>
              <h1 className="text-3xl font-bold text-neutral mb-2">Dashboard</h1>
              <p className="text-neutral/70">Wedding guest management overview</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
              <div className="stat bg-base-100 rounded-lg shadow">
                <div className="stat-title">Total Guests</div>
                <div className="stat-value text-primary">{stats.totalGuests}</div>
              </div>
              
              <div className="stat bg-base-100 rounded-lg shadow">
                <div className="stat-title">Confirmed</div>
                <div className="stat-value text-success">{stats.confirmed}</div>
              </div>
              
              <div className="stat bg-base-100 rounded-lg shadow">
                <div className="stat-title">Declined</div>
                <div className="stat-value text-error">{stats.declined}</div>
              </div>
              
              <div className="stat bg-base-100 rounded-lg shadow">
                <div className="stat-title">Pending</div>
                <div className="stat-value text-warning">{stats.pending}</div>
              </div>
              
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
                <h2 className="card-title">Recent RSVPs</h2>
                {recentRSVPs.length > 0 ? (
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
                        {recentRSVPs.map((rsvp) => (
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
                                new Date(rsvp.RSVPDate).toLocaleDateString() : 
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

    // Get recent RSVPs
    const recentRSVPs = await prisma.user.findMany({
      where: { RSVP: { not: null } },
      orderBy: { RSVPDate: 'desc' },
      take: 5,
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