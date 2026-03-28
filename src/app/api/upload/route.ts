import { NextRequest, NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { db } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth-helpers'
import { AnswerSheetStatus } from '@prisma/client'
import { v4 as uuidv4 } from 'uuid'

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user || user.role !== 'STUDENT') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const formData = await request.formData()
    const file = formData.get('file') as File
    const examId = formData.get('examId') as string

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      )
    }

    if (!examId) {
      return NextResponse.json(
        { error: 'Exam ID is required' },
        { status: 400 }
      )
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf']
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Only PDF, JPEG, and PNG files are allowed' },
        { status: 400 }
      )
    }

    // Validate file size (10MB max)
    const maxSize = 10 * 1024 * 1024 // 10MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'File size must be less than 10MB' },
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

    // Check if student is enrolled in the exam
    const enrollment = await db.examEnrollment.findUnique({
      where: {
        examId_studentId: {
          examId,
          studentId: student.id
        }
      }
    })

    if (!enrollment) {
      return NextResponse.json(
        { error: 'You are not enrolled in this exam' },
        { status: 403 }
      )
    }

    // Check if answer sheet already exists
    const existingSheet = await db.answerSheet.findFirst({
      where: {
        examId,
        studentId: student.id
      }
    })

    if (existingSheet) {
      return NextResponse.json(
        { error: 'Answer sheet already submitted for this exam' },
        { status: 400 }
      )
    }

    // Create uploads directory if it doesn't exist
    const uploadsDir = join(process.cwd(), 'uploads', 'answer-sheets')
    try {
      await mkdir(uploadsDir, { recursive: true })
    } catch (error) {
      // Directory might already exist
    }

    // Generate unique filename
    const fileExtension = file.name.split('.').pop()
    const uniqueFileName = `${examId}_${student.id}_${uuidv4()}.${fileExtension}`
    const filePath = join(uploadsDir, uniqueFileName)

    // Save file
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    await writeFile(filePath, buffer)

    // Generate QR code (simplified - in production, use a proper QR library)
    const qrCode = `${examId}-${student.id}-${Date.now()}`

    // Save to database
    const answerSheet = await db.answerSheet.create({
      data: {
        examId,
        studentId: student.id,
        fileUrl: `/uploads/answer-sheets/${uniqueFileName}`,
        fileName: file.name,
        fileSize: file.size,
        qrCode,
        status: AnswerSheetStatus.UPLOADED,
        evaluationStatus: 'PENDING'
      }
    })

    return NextResponse.json({
      message: 'Answer sheet uploaded successfully',
      answerSheet: {
        id: answerSheet.id,
        fileName: answerSheet.fileName,
        fileSize: answerSheet.fileSize,
        uploadedAt: answerSheet.uploadedAt,
        qrCode: answerSheet.qrCode
      }
    })

  } catch (error) {
    console.error('Error uploading answer sheet:', error)
    return NextResponse.json(
      { error: 'Failed to upload answer sheet' },
      { status: 500 }
    )
  }
}