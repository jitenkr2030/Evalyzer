import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { db } from '@/lib/db'
import { hashPassword } from '@/lib/auth'
import { UserRole, CALevel } from '@prisma/client'

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().min(2),
  role: z.nativeEnum(UserRole),
  phone: z.string().optional(),
  // Student specific fields
  rollNumber: z.string().optional(),
  caLevel: z.nativeEnum(CALevel).optional(),
  institute: z.string().optional(),
  targetExam: z.string().optional(),
  preparationStage: z.string().optional(),
  // Evaluator specific fields
  employeeId: z.string().optional(),
  expertise: z.string().optional(),
  experience: z.number().optional(),
  qualification: z.string().optional(),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = registerSchema.parse(body)

    // Check if user already exists
    const existingUser = await db.user.findUnique({
      where: { email: validatedData.email }
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 400 }
      )
    }

    // Hash password
    const hashedPassword = await hashPassword(validatedData.password)

    // Create user
    const user = await db.user.create({
      data: {
        email: validatedData.email,
        password: hashedPassword,
        name: validatedData.name,
        role: validatedData.role,
        phone: validatedData.phone,
      }
    })

    // Create role-specific profile
    if (validatedData.role === UserRole.STUDENT && validatedData.rollNumber) {
      await db.student.create({
        data: {
          userId: user.id,
          rollNumber: validatedData.rollNumber,
          caLevel: validatedData.caLevel || CALevel.FOUNDATION,
          institute: validatedData.institute,
          targetExam: validatedData.targetExam,
          preparationStage: validatedData.preparationStage,
        }
      })
    } else if (validatedData.role === UserRole.EVALUATOR && validatedData.employeeId) {
      await db.evaluator.create({
        data: {
          userId: user.id,
          employeeId: validatedData.employeeId,
          expertise: validatedData.expertise,
          experience: validatedData.experience || 0,
          qualification: validatedData.qualification,
        }
      })
    }

    return NextResponse.json({
      message: 'User created successfully',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      }
    })

  } catch (error) {
    console.error('Registration error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}