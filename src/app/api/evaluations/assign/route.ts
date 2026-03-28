import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireRole } from '@/lib/auth-helpers'
import { EvaluationStatus, AnswerSheetStatus } from '@prisma/client'

export async function POST(request: NextRequest) {
  try {
    // Ensure user is admin or super admin
    await requireRole(['ADMIN', 'SUPER_ADMIN'])

    const body = await request.json()
    const { answerSheetId, evaluatorId } = body

    if (!answerSheetId || !evaluatorId) {
      return NextResponse.json(
        { error: 'Answer sheet ID and evaluator ID are required' },
        { status: 400 }
      )
    }

    // Check if answer sheet exists and is ready for evaluation
    const answerSheet = await db.answerSheet.findUnique({
      where: { id: answerSheetId },
      include: {
        exam: true,
        student: true
      }
    })

    if (!answerSheet) {
      return NextResponse.json(
        { error: 'Answer sheet not found' },
        { status: 404 }
      )
    }

    if (answerSheet.status !== AnswerSheetStatus.UPLOADED) {
      return NextResponse.json(
        { error: 'Answer sheet is not ready for evaluation' },
        { status: 400 }
      )
    }

    // Check if evaluator exists and is active
    const evaluator = await db.evaluator.findUnique({
      where: { id: evaluatorId }
    })

    if (!evaluator || !evaluator.isActive) {
      return NextResponse.json(
        { error: 'Evaluator not found or inactive' },
        { status: 404 }
      )
    }

    // Check if evaluation already exists
    const existingEvaluation = await db.evaluation.findUnique({
      where: { answerSheetId }
    })

    if (existingEvaluation) {
      return NextResponse.json(
        { error: 'Evaluation already assigned for this answer sheet' },
        { status: 400 }
      )
    }

    // Calculate max marks from exam
    const examWithQuestions = await db.exam.findUnique({
      where: { id: answerSheet.examId },
      include: {
        examSections: {
          include: {
            questions: true
          }
        }
      }
    })

    if (!examWithQuestions) {
      return NextResponse.json(
        { error: 'Exam not found' },
        { status: 404 }
      )
    }

    const maxMarks = examWithQuestions.examSections.reduce((total, section) => {
      return total + section.questions.reduce((sectionTotal, question) => {
        return sectionTotal + question.marks
      }, 0)
    }, 0)

    // Create evaluation assignment
    const evaluation = await db.evaluation.create({
      data: {
        answerSheetId,
        evaluatorId,
        status: EvaluationStatus.ASSIGNED,
        maxMarks,
        assignedAt: new Date()
      },
      include: {
        answerSheet: {
          include: {
            student: {
              include: {
                user: true
              }
            },
            exam: true
          }
        },
        evaluator: {
          include: {
            user: true
          }
        }
      }
    })

    // Update answer sheet status
    await db.answerSheet.update({
      where: { id: answerSheetId },
      data: {
        status: AnswerSheetStatus.ASSIGNED,
        evaluationStatus: EvaluationStatus.ASSIGNED
      }
    })

    return NextResponse.json({
      message: 'Evaluation assigned successfully',
      evaluation
    })
  } catch (error) {
    console.error('Error assigning evaluation:', error)
    return NextResponse.json(
      { error: 'Failed to assign evaluation' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    await requireRole(['ADMIN', 'SUPER_ADMIN'])

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status') || 'PENDING'
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')

    // Get answer sheets ready for evaluation
    const where = {
      status: 'UPLOADED',
      evaluationStatus: status === 'PENDING' ? 'PENDING' : undefined
    }

    const [answerSheets, total] = await Promise.all([
      db.answerSheet.findMany({
        where,
        include: {
          student: {
            include: {
              user: true
            }
          },
          exam: {
            include: {
              examSections: {
                include: {
                  questions: true
                }
              }
            }
          },
          evaluation: {
            include: {
              evaluator: {
                include: {
                  user: true
                }
              }
            }
          }
        },
        orderBy: { uploadedAt: 'asc' },
        skip: (page - 1) * limit,
        take: limit
      }),
      db.answerSheet.count({ where })
    ])

    // Get available evaluators
    const evaluators = await db.evaluator.findMany({
      where: { isActive: true },
      include: {
        user: true,
        _count: {
          select: {
            evaluations: {
              where: {
                status: {
                  in: ['ASSIGNED', 'IN_PROGRESS']
                }
              }
            }
          }
        }
      },
      orderBy: { rating: 'desc' }
    })

    return NextResponse.json({
      answerSheets,
      evaluators,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Error fetching evaluation assignments:', error)
    return NextResponse.json(
      { error: 'Failed to fetch evaluation assignments' },
      { status: 500 }
    )
  }
}