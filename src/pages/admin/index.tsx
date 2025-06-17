import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useAdminAuth } from '@/utils/adminAuth'
import { motion } from 'framer-motion'
import Head from 'next/head'

const loginSchema = z.object({
  password: z.string().min(1, 'Password is required')
})

type LoginForm = z.infer<typeof loginSchema>

export default function AdminLogin() {
  const router = useRouter()
  const { login, checkAuth } = useAdminAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  
  const { register, handleSubmit, formState: { errors } } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema)
  })

  useEffect(() => {
    // Check if already authenticated
    checkAuth().then(isAuthenticated => {
      if (isAuthenticated) {
        router.push('/admin/dashboard')
      }
    })
  }, [router, checkAuth])

  const onSubmit = async (data: LoginForm) => {
    setLoading(true)
    setError('')
    
    const success = await login(data.password)
    
    if (success) {
      router.push('/admin/dashboard')
    } else {
      setError('Invalid password')
    }
    
    setLoading(false)
  }

  return (
    <>
      <Head>
        <title>Admin Login - Wedding Management</title>
      </Head>
      
      <div data-theme="green" className="min-h-screen flex items-center justify-center bg-base-200 py-12 px-4 sm:px-6 lg:px-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full space-y-8"
        >
          <div>
            <h2 className="mt-6 text-center text-3xl font-bold text-neutral">
              Admin Login
            </h2>
            <p className="mt-2 text-center text-sm text-neutral/70">
              Wedding Guest Management System
            </p>
          </div>
          
          <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
            <div className="form-control w-full">
              <label className="label">
                <span className="label-text">Admin Password</span>
              </label>
              <input
                type="password"
                className={`input input-bordered w-full ${errors.password ? 'input-error' : ''}`}
                placeholder="Enter admin password"
                {...register('password')}
              />
              {errors.password && (
                <label className="label">
                  <span className="label-text-alt text-error">{errors.password.message}</span>
                </label>
              )}
            </div>

            {error && (
              <div className="alert alert-error">
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary w-full"
            >
              {loading ? (
                <span className="loading loading-spinner loading-sm"></span>
              ) : (
                'Sign In'
              )}
            </button>
          </form>
        </motion.div>
      </div>
    </>
  )
}