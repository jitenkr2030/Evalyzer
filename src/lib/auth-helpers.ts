import { getServerSession } from 'next-auth'
import { authOptions } from './auth'
import { UserRole } from '@prisma/client'

export async function getCurrentUser() {
  const session = await getServerSession(authOptions)
  return session?.user
}

export async function requireAuth() {
  const user = await getCurrentUser()
  if (!user) {
    throw new Error('Authentication required')
  }
  return user
}

export async function requireRole(role: UserRole | UserRole[]) {
  const user = await requireAuth()
  const roles = Array.isArray(role) ? role : [role]
  
  if (!roles.includes(user.role)) {
    throw new Error(`Access denied. Required role: ${roles.join(' or ')}`)
  }
  
  return user
}

export function hasRole(userRole: UserRole, requiredRole: UserRole | UserRole[]): boolean {
  const roles = Array.isArray(requiredRole) ? requiredRole : [requiredRole]
  return roles.includes(userRole)
}

export function canAccessStudentDashboard(role: UserRole): boolean {
  return role === UserRole.STUDENT
}

export function canAccessEvaluatorDashboard(role: UserRole): boolean {
  return role === UserRole.EVALUATOR
}

export function canAccessAdminDashboard(role: UserRole): boolean {
  return role === UserRole.ADMIN || role === UserRole.SUPER_ADMIN
}