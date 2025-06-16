import NextAuth from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { prisma } from '../../../prisma'
import { loginSchema } from './validation'

export default NextAuth({
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        firstName: { label: 'First Name', type: 'text', placeholder: 'Amélie' },
        lastName: { label: 'Last Name', type: 'text', placeholder: 'LaCroix' },
        password: { label: 'Password', type: 'password' },
      },
      authorize: async (credentials) => {
        console.log('🔐 Auth attempt:', credentials)
        const creds = await loginSchema.parseAsync(credentials)
        console.log('✅ Parsed credentials:', creds)
        
        // Convert to proper case (first letter uppercase, rest lowercase)
        const firstName = creds.firstName.charAt(0).toUpperCase() + creds.firstName.slice(1).toLowerCase()
        const lastName = creds.lastName.charAt(0).toUpperCase() + creds.lastName.slice(1).toLowerCase()
        
        const user = await prisma.user.findUnique({
          where: {
            fullName: {
              firstName: firstName,
              lastName: lastName,
            },
          },
        })
        console.log('👤 Found user:', user ? 'Yes' : 'No', `(searched for: ${firstName} ${lastName})`)
        
        if (!user) {
          console.log('❌ User not found')
          return null
        }

        console.log('🔑 Password check:', { 
          envPassword: process.env.PASSWORD, 
          providedPassword: creds.password,
          match: process.env.PASSWORD === creds.password 
        })
        
        if (process.env.PASSWORD !== creds.password) {
          console.log('❌ Password mismatch')
          return Promise.resolve(null)
        }
        
        console.log('✅ Authentication successful')
        return {
          firstName: user.firstName,
          lastName: user.lastName,
          dinner: user.dinner,
          bridalParty: user.bridalParty,
        }
      },
    }),
  ],
  session: {
    strategy: 'jwt',
  },
  jwt: {
    maxAge: 15 * 24 * 60 * 60, // 15 days
  },
  pages: {
    signIn: '/',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.firstName = user.firstName
        token.lastName = user.lastName
        token.dinner = user.dinner
        token.bridalParty = user.bridalParty
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.firstName = token.firstName as string
        session.user.lastName = token.lastName as string
        session.user.dinner = token.dinner as boolean
        session.user.bridalParty = token.bridalParty as boolean
      }
      return session
    },
  },
})
