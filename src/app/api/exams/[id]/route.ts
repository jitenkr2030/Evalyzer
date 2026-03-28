import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { ExamStatus } from '@prisma/client'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const exam = await db.exam.findUnique({
      where: { id: params.id },
      include: {
        examSections: {
          include: {
            questions: {
              orderBy: { order: 'asc' }
            }
          },
          orderBy: { order: 'asc' }
        },
        examEnrollments: {
          include: {
            student: {
              include: {
                user: true
              }
            }
          }
        },
        answerSheets: {
          include: {
            student: {
              include: {
                user: true
              }
            }
          }
        },
        _count: {
          select: {
            examEnrollments: true,
            answerSheets: true
          }
        }
      }
    })

    if (!exam) {
      return NextResponse.json(
        { error: 'Exam not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ exam })
  } catch (error) {
    console.error('Error fetching exam:', error)
    return NextResponse.json(
      { error: 'Failed to fetch exam' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const { status, scheduledAt, deadline, ...otherData } = body

    const exam = await db.exam.update({
      where: { id: params.id },
      data: {
        ...otherData,
        ...(status && { status }),
        ...(scheduledAt && { scheduledAt: new Date(scheduledAt) }),
        ...(deadline && { deadline: new Date(deadline) }),
      },
      include: {
        examSections: {
          include: {
            questions: true
          },
          orderBy: { order: 'asc' }
        }
      }
    })

    return NextResponse.json({
      message: 'Exam updated successfully',
      exam
    })
  } catch (error) {
    console.error('Error updating exam:', error)
    return NextResponse.json(
      { error: 'Failed to update exam' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await db.exam.delete({
      where: { id: params.id }
    })

    return NextResponse.json({
      message: 'Exam deleted successfully'
    })
  } catch (error) {
    console.error('Error deleting exam:', error)
    return NextResponse.json(
      { error: 'Failed to delete exam' },
      { status: 500 }
    )
  }
}