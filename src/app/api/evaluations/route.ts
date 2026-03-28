import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { db } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth-helpers'
import { EvaluationStatus } from '@prisma/client'

const createEvaluationSchema = z.object({
  answerSheetId: z.string(),
  marksAwarded: z.number().min(0),
  maxMarks: z.number().min(1),
  comments: z.string().optional(),
  evaluationDetails: z.array(z.object({
    questionId: z.string(),
    marksAwarded: z.number().min(0),
    maxMarks: z.number().min(1),
    feedback: z.string().optional(),
    highlightedAreas: z.string().optional(),
  }))
})

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status') as EvaluationStatus | null
    const evaluatorId = searchParams.get('evaluatorId')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')

    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const where: any = {}
    
    if (status) where.status = status
    
    // If evaluator, only show their evaluations
    if (user.role === 'EVALUATOR') {
      const evaluator = await db.evaluator.findUnique({
        where: { userId: user.id }
      })
      if (evaluator) {
        where.evaluatorId = evaluator.id
      }
    } else if (evaluatorId) {
      where.evaluatorId = evaluatorId
    }

    const [evaluations, total] = await Promise.all([
      db.evaluation.findMany({
        where,
        include: {
          answerSheet: {
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
              }
            }
          },
          evaluator: {
            include: {
              user: true
            }
          },
          evaluationDetails: {
            include: {
              question: true
            }
          }
        },
        orderBy: { assignedAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit
      }),
      db.evaluation.count({ where })
    ])

    return NextResponse.json({
      evaluations,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Error fetching evaluations:', error)
    return NextResponse.json(
      { error: 'Failed to fetch evaluations' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user || user.role !== 'EVALUATOR') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const validatedData = createEvaluationSchema.parse(body)

    // Get evaluator profile
    const evaluator = await db.evaluator.findUnique({
      where: { userId: user.id }
    })

    if (!evaluator) {
      return NextResponse.json(
        { error: 'Evaluator profile not found' },
        { status: 404 }
      )
    }

    // Check if answer sheet exists and is assigned to this evaluator
    const answerSheet = await db.answerSheet.findUnique({
      where: { id: validatedData.answerSheetId },
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

    // Create or update evaluation
    const evaluation = await db.evaluation.upsert({
      where: {
        answerSheetId: validatedData.answerSheetId
      },
      update: {
        status: EvaluationStatus.COMPLETED,
        totalMarks: validatedData.marksAwarded,
        maxMarks: validatedData.maxMarks,
        comments: validatedData.comments,
        completedAt: new Date(),
        evaluationDetails: {
          deleteMany: {},
          create: validatedData.evaluationDetails
        }
      },
      create: {
        answerSheetId: validatedData.answerSheetId,
        evaluatorId: evaluator.id,
        status: EvaluationStatus.COMPLETED,
        totalMarks: validatedData.marksAwarded,
        maxMarks: validatedData.maxMarks,
        comments: validatedData.comments,
        completedAt: new Date(),
        evaluationDetails: {
          create: validatedData.evaluationDetails
        }
      },
      include: {
        evaluationDetails: {
          include: {
            question: true
          }
        }
      }
    })

    // Update answer sheet status
    await db.answerSheet.update({
      where: { id: validatedData.answerSheetId },
      data: {
        evaluationStatus: EvaluationStatus.COMPLETED
      }
    })

    // Update evaluator stats
    await db.evaluator.update({
      where: { id: evaluator.id },
      data: {
        totalEvaluations: {
          increment: 1
        }
      }
    })

    return NextResponse.json({
      message: 'Evaluation completed successfully',
      evaluation
    })
  } catch (error) {
    console.error('Error creating evaluation:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to create evaluation' },
      { status: 500 }
    )
  }
}