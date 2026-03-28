'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { FileUpload } from '@/components/FileUpload'
import { 
  ArrowLeft, 
  Clock, 
  Calendar, 
  Target, 
  FileText,
  Upload,
  CheckCircle,
  AlertTriangle,
  Download,
  Eye
} from 'lucide-react'
import { Exam, ExamStatus, Subject } from '@prisma/client'

interface ExamWithDetails extends Exam {
  examSections: Array<{
    id: string
    title: string
    description?: string
    marks: number
    order: number
    questions: Array<{
      id: string
      questionText: string
      questionType: string
      marks: number
      order: number
    }>
  }>
  userEnrollment?: {
    id: string
    status: string
    enrolledAt: string
  }
  answerSheet?: {
    id: string
    fileName: string
    uploadedAt: string
    status: string
    qrCode: string
  }
}

export default function ExamDetailPage({
  params
}: {
  params: { id: string }
}) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [exam, setExam] = useState<ExamWithDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [timeLeft, setTimeLeft] = useState<string>('')
  const [examStarted, setExamStarted] = useState(false)

  useEffect(() => {
    if (status === 'loading') return

    if (!session || session.user.role !== 'STUDENT') {
      router.push('/auth/signin')
      return
    }

    fetchExam()
  }, [session, status, router, params.id])

  useEffect(() => {
    if (!exam || !examStarted) return

    const interval = setInterval(() => {
      const now = new Date().getTime()
      const deadline = new Date(exam.deadline).getTime()
      const distance = deadline - now

      if (distance < 0) {
        setTimeLeft('EXPIRED')
        clearInterval(interval)
        return
      }

      const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60))
      const seconds = Math.floor((distance % (1000 * 60)) / 1000)

      setTimeLeft(`${hours}h ${minutes}m ${seconds}s`)
    }, 1000)

    return () => clearInterval(interval)
  }, [exam, examStarted])

  const fetchExam = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/exams/${params.id}`)
      
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Exam not found')
        }
        throw new Error('Failed to fetch exam')
      }
      
      const data = await response.json()
      setExam(data.exam)
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to fetch exam')
    } finally {
      setLoading(false)
    }
  }

  const handleStartExam = () => {
    setExamStarted(true)
  }

  const handleUploadSuccess = (data: any) => {
    // Refresh exam data to show uploaded answer sheet
    fetchExam()
  }

  const handleUploadError = (error: string) => {
    setError(error)
  }

  const getStatusColor = (status: ExamStatus) => {
    switch (status) {
      case 'SCHEDULED': return 'default'
      case 'ACTIVE': return 'destructive'
      case 'COMPLETED': return 'secondary'
      default: return 'outline'
    }
  }

  const getSubjectColor = (subject: Subject) => {
    const colors = {
      ACCOUNTING: 'bg-blue-100 text-blue-800',
      LAW: 'bg-green-100 text-green-800',
      TAXATION: 'bg-purple-100 text-purple-800',
      COSTING: 'bg-orange-100 text-orange-800',
      AUDIT: 'bg-red-100 text-red-800',
      FINANCIAL_MANAGEMENT: 'bg-indigo-100 text-indigo-800',
      ECONOMICS: 'bg-yellow-100 text-yellow-800',
      ETHICS: 'bg-pink-100 text-pink-800',
      IT_SM: 'bg-gray-100 text-gray-800',
    }
    return colors[subject] || 'bg-gray-100 text-gray-800'
  }

  const isExamAvailable = () => {
    if (!exam) return false
    const now = new Date()
    const scheduledTime = new Date(exam.scheduledAt)
    const deadline = new Date(exam.deadline)
    return now >= scheduledTime && now <= deadline && exam.status === 'ACTIVE'
  }

  const isExamUpcoming = () => {
    if (!exam) return false
    const now = new Date()
    const scheduledTime = new Date(exam.scheduledAt)
    return now < scheduledTime && exam.status === 'SCHEDULED'
  }

  const isExamExpired = () => {
    if (!exam) return false
    const now = new Date()
    const deadline = new Date(exam.deadline)
    return now > deadline
  }

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!session || !exam) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" asChild>
                <Link href="/dashboard/student/exams">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Exams
                </Link>
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{exam.title}</h1>
                <p className="text-gray-600">{exam.examCode}</p>
              </div>
            </div>
            {examStarted && timeLeft && (
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-red-500" />
                <span className="text-lg font-semibold text-red-500">
                  {timeLeft}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Exam Status Card */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant={getStatusColor(exam.status)}>
                    {exam.status}
                  </Badge>
                  <Badge className={getSubjectColor(exam.subject)}>
                    {exam.subject}
                  </Badge>
                  <Badge variant="outline">
                    {exam.caLevel}
                  </Badge>
                  {exam.userEnrollment && (
                    <Badge variant="secondary" className="bg-green-100 text-green-800">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Enrolled
                    </Badge>
                  )}
                </div>
                <CardDescription className="text-base">
                  {exam.description}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-sm">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-gray-500" />
                <div>
                  <p className="font-medium">Scheduled</p>
                  <p className="text-gray-600">
                    {new Date(exam.scheduledAt).toLocaleString()}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-gray-500" />
                <div>
                  <p className="font-medium">Duration</p>
                  <p className="text-gray-600">{exam.duration} minutes</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Target className="w-4 h-4 text-gray-500" />
                <div>
                  <p className="font-medium">Total Marks</p>
                  <p className="text-gray-600">{exam.totalMarks} marks</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-gray-500" />
                <div>
                  <p className="font-medium">Passing Marks</p>
                  <p className="text-gray-600">{exam.passingMarks} marks</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Exam Content */}
        <Tabs defaultValue="instructions" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="instructions">Instructions</TabsTrigger>
            <TabsTrigger value="questions">Questions</TabsTrigger>
            <TabsTrigger value="submit">Submit Answer</TabsTrigger>
          </TabsList>

          <TabsContent value="instructions">
            <Card>
              <CardHeader>
                <CardTitle>Exam Instructions</CardTitle>
                <CardDescription>
                  Please read the instructions carefully before starting the exam
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="prose max-w-none">
                  {exam.instructions ? (
                    <div className="whitespace-pre-wrap">{exam.instructions}</div>
                  ) : (
                    <div className="space-y-4 text-gray-600">
                      <h4 className="font-semibold text-gray-900">General Instructions:</h4>
                      <ul className="list-disc list-inside space-y-2">
                        <li>You have {exam.duration} minutes to complete this exam</li>
                        <li>The exam must be completed before the deadline</li>
                        <li>Write your answers on plain paper and scan/upload them</li>
                        <li>Ensure your handwriting is clear and legible</li>
                        <li>Write your roll number and exam code on each page</li>
                        <li>Submit only one PDF file or clear images</li>
                        <li>Mobile photography is allowed if images are clear</li>
                      </ul>
                      
                      <h4 className="font-semibold text-gray-900 mt-6">Technical Requirements:</h4>
                      <ul className="list-disc list-inside space-y-2">
                        <li>Supported formats: PDF, JPEG, PNG</li>
                        <li>Maximum file size: 10MB</li>
                        <li>Ensure good lighting and clear focus</li>
                        <li>All pages should be properly oriented</li>
                      </ul>
                    </div>
                  )}
                </div>

                {!examStarted && isExamAvailable() && (
                  <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <AlertTriangle className="w-5 h-5 text-blue-600" />
                      <h4 className="font-semibold text-blue-900">Ready to Start?</h4>
                    </div>
                    <p className="text-blue-800 mb-4">
                      Once you start the exam, the timer will begin. Make sure you have everything ready.
                    </p>
                    <Button onClick={handleStartExam} className="w-full sm:w-auto">
                      Start Exam
                    </Button>
                  </div>
                )}

                {isExamUpcoming() && (
                  <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Clock className="w-5 h-5 text-yellow-600" />
                      <h4 className="font-semibold text-yellow-900">Exam Not Started Yet</h4>
                    </div>
                    <p className="text-yellow-800">
                      This exam will be available on {new Date(exam.scheduledAt).toLocaleString()}
                    </p>
                  </div>
                )}

                {isExamExpired() && (
                  <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <AlertTriangle className="w-5 h-5 text-red-600" />
                      <h4 className="font-semibold text-red-900">Exam Expired</h4>
                    </div>
                    <p className="text-red-800">
                      The deadline for this exam was {new Date(exam.deadline).toLocaleString()}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="questions">
            <Card>
              <CardHeader>
                <CardTitle>Exam Questions</CardTitle>
                <CardDescription>
                  Review the questions before submitting your answers
                </CardDescription>
              </CardHeader>
              <CardContent>
                {!examStarted ? (
                  <div className="text-center py-8">
                    <Eye className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Start Exam to View Questions
                    </h3>
                    <p className="text-gray-600 mb-4">
                      You need to start the exam first to view the questions
                    </p>
                    {isExamAvailable() && (
                      <Button onClick={handleStartExam}>
                        Start Exam
                      </Button>
                    )}
                  </div>
                ) : (
                  <div className="space-y-6">
                    {exam.examSections.map((section, sectionIndex) => (
                      <div key={section.id} className="border rounded-lg p-6">
                        <h3 className="text-lg font-semibold mb-2">
                          Section {sectionIndex + 1}: {section.title}
                        </h3>
                        {section.description && (
                          <p className="text-gray-600 mb-4">{section.description}</p>
                        )}
                        <div className="space-y-4">
                          {section.questions.map((question, questionIndex) => (
                            <div key={question.id} className="border-l-4 border-blue-200 pl-4">
                              <div className="flex items-start gap-2 mb-2">
                                <span className="font-medium text-blue-600">
                                  Q{sectionIndex + 1}.{questionIndex + 1}
                                </span>
                                <span className="text-sm text-gray-500">
                                  ({question.marks} marks)
                                </span>
                              </div>
                              <p className="text-gray-900 whitespace-pre-wrap">
                                {question.questionText}
                              </p>
                              <Badge variant="outline" className="mt-2">
                                {question.questionType.replace('_', ' ')}
                              </Badge>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="submit">
            <Card>
              <CardHeader>
                <CardTitle>Submit Answer Sheet</CardTitle>
                <CardDescription>
                  Upload your completed answer sheet for evaluation
                </CardDescription>
              </CardHeader>
              <CardContent>
                {exam.answerSheet ? (
                  <div className="space-y-4">
                    <Alert className="border-green-200 bg-green-50">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <AlertDescription className="text-green-800">
                        Answer sheet submitted successfully!
                      </AlertDescription>
                    </Alert>
                    
                    <div className="border rounded-lg p-4">
                      <h4 className="font-semibold mb-2">Submission Details</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-gray-600">File Name:</p>
                          <p className="font-medium">{exam.answerSheet.fileName}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Submitted At:</p>
                          <p className="font-medium">
                            {new Date(exam.answerSheet.uploadedAt).toLocaleString()}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-600">Status:</p>
                          <Badge variant="secondary">{exam.answerSheet.status}</Badge>
                        </div>
                        <div>
                          <p className="text-gray-600">QR Code:</p>
                          <p className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">
                            {exam.answerSheet.qrCode}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-4">
                      <Button variant="outline" asChild>
                        <Link href="/dashboard/student">
                          Back to Dashboard
                        </Link>
                      </Button>
                      <Button variant="outline">
                        <Download className="w-4 h-4 mr-2" />
                        Download Copy
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {!examStarted ? (
                      <div className="text-center py-8">
                        <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                          Start Exam First
                        </h3>
                        <p className="text-gray-600 mb-4">
                          You need to start the exam before submitting your answer sheet
                        </p>
                        {isExamAvailable() && (
                          <Button onClick={handleStartExam}>
                            Start Exam
                          </Button>
                        )}
                      </div>
                    ) : (
                      <FileUpload
                        examId={exam.id}
                        onUploadSuccess={handleUploadSuccess}
                        onUploadError={handleUploadError}
                      />
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}