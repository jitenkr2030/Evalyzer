import { DefaultSession, DefaultUser } from 'next-auth'
import { UserRole, Student, Evaluator } from '@prisma/client'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      email: string
      name: string | null
      role: UserRole
      studentProfile?: Student | null
      evaluatorProfile?: Evaluator | null
    } & DefaultSession['user']
  }

  interface User extends DefaultUser {
    role: UserRole
    studentProfile?: Student | null
    evaluatorProfile?: Evaluator | null
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    role: UserRole
    studentProfile?: Student | null
    evaluatorProfile?: Evaluator | null
  }
}