import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { db } from '@/lib/db'
import { requireRole } from '@/lib/auth-helpers'
import { ExamStatus, Subject, CALevel, QuestionType } from '@prisma/client'

const createExamSchema = z.object({
  title: z.string().min(3),
  description: z.string().optional(),
  examCode: z.string().min(3),
  subject: z.nativeEnum(Subject),
  caLevel: z.nativeEnum(CALevel),
  duration: z.number().min(30).max(240), // 30 minutes to 4 hours
  totalMarks: z.number().min(1),
  passingMarks: z.number().min(1),
  scheduledAt: z.string().datetime(),
  deadline: z.string().datetime(),
  instructions: z.string().optional(),
  questionPaperUrl: z.string().optional(),
  answerKeyUrl: z.string().optional(),
  sections: z.array(z.object({
    title: z.string().min(1),
    description: z.string().optional(),
    marks: z.number().min(1),
    order: z.number().min(0),
    questions: z.array(z.object({
      questionText: z.string().min(1),
      questionType: z.nativeEnum(QuestionType),
      marks: z.number().min(1),
      order: z.number().min(0),
      answerKey: z.string().optional(),
      rubric: z.string().optional(),
    }))
  })).min(1)
})

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status') as ExamStatus | null
    const subject = searchParams.get('subject') as Subject | null
    const caLevel = searchParams.get('caLevel') as CALevel | null
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')

    const where: any = {}
    
    if (status) where.status = status
    if (subject) where.subject = subject
    if (caLevel) where.caLevel = caLevel

    const [exams, total] = await Promise.all([
      db.exam.findMany({
        where,
        include: {
          examSections: {
            include: {
              questions: true
            },
            orderBy: { order: 'asc' }
          },
          _count: {
            select: {
              examEnrollments: true,
              answerSheets: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit
      }),
      db.exam.count({ where })
    ])

    return NextResponse.json({
      exams,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Error fetching exams:', error)
    return NextResponse.json(
      { error: 'Failed to fetch exams' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = createExamSchema.parse(body)

    // Check if exam code already exists
    const existingExam = await db.exam.findUnique({
      where: { examCode: validatedData.examCode }
    })

    if (existingExam) {
      return NextResponse.json(
        { error: 'Exam with this code already exists' },
        { status: 400 }
      )
    }

    // Create exam with sections and questions
    const exam = await db.exam.create({
      data: {
        title: validatedData.title,
        description: validatedData.description,
        examCode: validatedData.examCode,
        subject: validatedData.subject,
        caLevel: validatedData.caLevel,
        duration: validatedData.duration,
        totalMarks: validatedData.totalMarks,
        passingMarks: validatedData.passingMarks,
        scheduledAt: new Date(validatedData.scheduledAt),
        deadline: new Date(validatedData.deadline),
        instructions: validatedData.instructions,
        questionPaperUrl: validatedData.questionPaperUrl,
        answerKeyUrl: validatedData.answerKeyUrl,
        createdBy: 'admin', // This should come from session
        examSections: {
          create: validatedData.sections.map((section, sectionIndex) => ({
            title: section.title,
            description: section.description,
            marks: section.marks,
            order: sectionIndex,
            questions: {
              create: section.questions.map((question, questionIndex) => ({
                questionText: question.questionText,
                questionType: question.questionType,
                marks: question.marks,
                order: questionIndex,
                answerKey: question.answerKey,
                rubric: question.rubric,
              }))
            }
          }))
        }
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
      message: 'Exam created successfully',
      exam
    })
  } catch (error) {
    console.error('Error creating exam:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to create exam' },
      { status: 500 }
    )
  }
}