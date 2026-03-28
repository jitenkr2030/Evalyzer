import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth-helpers'
import { EnrollmentStatus } from '@prisma/client'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser()
    if (!user || user.role !== 'STUDENT') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const examId = params.id

    // Check if exam exists and is enrollable
    const exam = await db.exam.findUnique({
      where: { id: examId }
    })

    if (!exam) {
      return NextResponse.json(
        { error: 'Exam not found' },
        { status: 404 }
      )
    }

    if (exam.status !== 'SCHEDULED' && exam.status !== 'ACTIVE') {
      return NextResponse.json(
        { error: 'Exam is not available for enrollment' },
        { status: 400 }
      )
    }

    // Get student profile
    const student = await db.student.findUnique({
      where: { userId: user.id }
    })

    if (!student) {
      return NextResponse.json(
        { error: 'Student profile not found' },
        { status: 404 }
      )
    }

    // Check if already enrolled
    const existingEnrollment = await db.examEnrollment.findUnique({
      where: {
        examId_studentId: {
          examId,
          studentId: student.id
        }
      }
    })

    if (existingEnrollment) {
      return NextResponse.json(
        { error: 'Already enrolled in this exam' },
        { status: 400 }
      )
    }

    // Create enrollment
    const enrollment = await db.examEnrollment.create({
      data: {
        examId,
        studentId: student.id,
        status: EnrollmentStatus.ENROLLED
      },
      include: {
        exam: true,
        student: {
          include: {
            user: true
          }
        }
      }
    })

    return NextResponse.json({
      message: 'Enrolled successfully',
      enrollment
    })
  } catch (error) {
    console.error('Error enrolling in exam:', error)
    return NextResponse.json(
      { error: 'Failed to enroll in exam' },
      { status: 500 }
    )
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const examId = params.id

    const enrollments = await db.examEnrollment.findMany({
      where: { examId },
      include: {
        student: {
          include: {
            user: true
          }
        }
      },
      orderBy: { enrolledAt: 'desc' }
    })

    return NextResponse.json({ enrollments })
  } catch (error) {
    console.error('Error fetching enrollments:', error)
    return NextResponse.json(
      { error: 'Failed to fetch enrollments' },
      { status: 500 }
    )
  }
}