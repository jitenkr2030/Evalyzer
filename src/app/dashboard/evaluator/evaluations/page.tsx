'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { AIEvaluationAssist } from '@/components/evaluation/AIEvaluationAssist'
import { 
  Search, 
  Filter, 
  Clock, 
  CheckCircle, 
  Play, 
  Pause,
  FileText,
  User,
  Calendar,
  Target,
  AlertCircle,
  Brain
} from 'lucide-react'
import { EvaluationStatus, AnswerSheetStatus } from '@prisma/client'

interface Evaluation {
  id: string
  status: EvaluationStatus
  totalMarks?: number
  maxMarks: number
  comments?: string
  assignedAt: string
  startedAt?: string
  completedAt?: string
  timeSpent?: number
  answerSheet: {
    id: string
    fileName: string
    uploadedAt: string
    status: AnswerSheetStatus
    student: {
      user: {
        name: string
        email: string
      }
    }
    exam: {
      title: string
      subject: string
      caLevel: string
      duration: number
      examSections: Array<{
        id: string
        title: string
        questions: Array<{
          id: string
          questionText: string
          questionType: string
          marks: number
          order: number
        }>
      }>
    }
  }
}

export default function EvaluatorEvaluationsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [evaluations, setEvaluations] = useState<Evaluation[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<EvaluationStatus | 'ALL'>('ALL')
  const [selectedEvaluation, setSelectedEvaluation] = useState<Evaluation | null>(null)
  const [evaluationData, setEvaluationData] = useState({
    comments: '',
    questionMarks: {} as Record<string, number>,
    questionFeedback: {} as Record<string, string>
  })
  const [submitting, setSubmitting] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (status === 'loading') return

    if (!session || session.user.role !== 'EVALUATOR') {
      router.push('/auth/signin')
      return
    }

    fetchEvaluations()
  }, [session, status, router, statusFilter])

  const fetchEvaluations = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      
      if (statusFilter !== 'ALL') params.append('status', statusFilter)

      const response = await fetch(`/api/evaluations?${params.toString()}`)
      if (!response.ok) throw new Error('Failed to fetch evaluations')
      
      const data = await response.json()
      setEvaluations(data.evaluations)
    } catch (error) {
      console.error('Error fetching evaluations:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleStartEvaluation = async (evaluationId: string) => {
    try {
      const response = await fetch(`/api/evaluations/${evaluationId}/start`, {
        method: 'POST'
      })

      if (!response.ok) throw new Error('Failed to start evaluation')

      fetchEvaluations()
    } catch (error) {
      console.error('Error starting evaluation:', error)
    }
  }

  const handleSelectEvaluation = (evaluation: Evaluation) => {
    setSelectedEvaluation(evaluation)
    setEvaluationData({
      comments: evaluation.comments || '',
      questionMarks: {},
      questionFeedback: {}
    })

    // Initialize question marks and feedback
    evaluation.answerSheet.exam.examSections.forEach(section => {
      section.questions.forEach(question => {
        setEvaluationData(prev => ({
          ...prev,
          questionMarks: {
            ...prev.questionMarks,
            [question.id]: 0
          },
          questionFeedback: {
            ...prev.questionFeedback,
            [question.id]: ''
          }
        }))
      })
    })
  }

  const handleSubmitEvaluation = async () => {
    if (!selectedEvaluation) return

    try {
      setSubmitting(true)
      setMessage('')

      // Calculate total marks
      const totalMarks = Object.values(evaluationData.questionMarks).reduce((sum, marks) => sum + marks, 0)

      // Prepare evaluation details
      const evaluationDetails = Object.entries(evaluationData.questionMarks).map(([questionId, marks]) => ({
        questionId,
        marksAwarded: marks,
        maxMarks: selectedEvaluation.answerSheet.exam.examSections
          .flatMap(section => section.questions)
          .find(q => q.id === questionId)?.marks || 0,
        feedback: evaluationData.questionFeedback[questionId] || ''
      }))

      const response = await fetch('/api/evaluations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          answerSheetId: selectedEvaluation.answerSheet.id,
          marksAwarded: totalMarks,
          maxMarks: selectedEvaluation.maxMarks,
          comments: evaluationData.comments,
          evaluationDetails
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit evaluation')
      }

      setMessage('Evaluation submitted successfully!')
      setSelectedEvaluation(null)
      fetchEvaluations()

      setTimeout(() => setMessage(''), 3000)
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Failed to submit evaluation')
      setTimeout(() => setMessage(''), 3000)
    } finally {
      setSubmitting(false)
    }
  }

  const getStatusColor = (status: EvaluationStatus) => {
    switch (status) {
      case 'PENDING': return 'secondary'
      case 'ASSIGNED': return 'default'
      case 'IN_PROGRESS': return 'destructive'
      case 'COMPLETED': return 'outline'
      default: return 'secondary'
    }
  }

  const getSubjectColor = (subject: string) => {
    const colors: Record<string, string> = {
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

  const filteredEvaluations = evaluations.filter(evaluation =>
    evaluation.answerSheet.student.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    evaluation.answerSheet.exam.title.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Evaluations</h1>
              <p className="text-gray-600">Review and evaluate student answer sheets</p>
            </div>
            <Button variant="outline" asChild>
              <Link href="/dashboard/evaluator">
                Back to Dashboard
              </Link>
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {message && (
          <Alert className={`mb-6 ${message.includes('successfully') ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
            <AlertDescription className={message.includes('successfully') ? 'text-green-800' : 'text-red-800'}>
              {message}
            </AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Evaluations List */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Assigned Evaluations</CardTitle>
                <CardDescription>
                  Select an answer sheet to evaluate
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                {/* Filters */}
                <div className="p-4 border-b space-y-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      placeholder="Search students..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  
                  <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as EvaluationStatus | 'ALL')}>
                    <SelectTrigger>
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ALL">All Status</SelectItem>
                      <SelectItem value="PENDING">Pending</SelectItem>
                      <SelectItem value="ASSIGNED">Assigned</SelectItem>
                      <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                      <SelectItem value="COMPLETED">Completed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Evaluations List */}
                <div className="max-h-96 overflow-y-auto">
                  {filteredEvaluations.map((evaluation) => (
                    <div
                      key={evaluation.id}
                      className={`p-4 border-b cursor-pointer hover:bg-gray-50 ${
                        selectedEvaluation?.id === evaluation.id ? 'bg-blue-50' : ''
                      }`}
                      onClick={() => handleSelectEvaluation(evaluation)}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <p className="font-medium text-sm">
                            {evaluation.answerSheet.student.user.name}
                          </p>
                          <p className="text-xs text-gray-500">
                            {evaluation.answerSheet.exam.title}
                          </p>
                        </div>
                        <Badge variant={getStatusColor(evaluation.status)} className="text-xs">
                          {evaluation.status}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <Calendar className="w-3 h-3" />
                        {new Date(evaluation.assignedAt).toLocaleDateString()}
                      </div>
                    </div>
                  ))}

                  {filteredEvaluations.length === 0 && (
                    <div className="p-8 text-center text-gray-500">
                      <FileText className="w-8 h-8 mx-auto mb-2" />
                      <p>No evaluations found</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Evaluation Interface */}
          <div className="lg:col-span-2">
            {selectedEvaluation ? (
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <User className="w-5 h-5" />
                        {selectedEvaluation.answerSheet.student.user.name}
                      </CardTitle>
                      <CardDescription>
                        {selectedEvaluation.answerSheet.exam.title} • {selectedEvaluation.answerSheet.exam.subject}
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={getSubjectColor(selectedEvaluation.answerSheet.exam.subject)}>
                        {selectedEvaluation.answerSheet.exam.subject}
                      </Badge>
                      <Badge variant="outline">
                        {selectedEvaluation.answerSheet.exam.caLevel}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>

                <CardContent>
                  <Tabs defaultValue="answer-sheet" className="space-y-6">
                    <TabsList className="grid w-full grid-cols-4">
                      <TabsTrigger value="answer-sheet">Answer Sheet</TabsTrigger>
                      <TabsTrigger value="questions">Questions</TabsTrigger>
                      <TabsTrigger value="ai-assist">AI Assist</TabsTrigger>
                      <TabsTrigger value="summary">Summary</TabsTrigger>
                    </TabsList>

                    <TabsContent value="answer-sheet">
                      <div className="space-y-4">
                        <div className="border rounded-lg p-4">
                          <h4 className="font-semibold mb-2">Answer Sheet Details</h4>
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <p className="text-gray-600">File Name:</p>
                              <p className="font-medium">{selectedEvaluation.answerSheet.fileName}</p>
                            </div>
                            <div>
                              <p className="text-gray-600">Uploaded:</p>
                              <p className="font-medium">
                                {new Date(selectedEvaluation.answerSheet.uploadedAt).toLocaleString()}
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="border rounded-lg p-4">
                          <h4 className="font-semibold mb-2">Answer Sheet Preview</h4>
                          <div className="bg-gray-100 rounded-lg p-8 text-center">
                            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                            <p className="text-gray-600">Answer sheet viewer would be implemented here</p>
                            <p className="text-sm text-gray-500 mt-1">
                              Integration with PDF.js or similar viewer
                            </p>
                          </div>
                        </div>

                        {selectedEvaluation.status === 'ASSIGNED' && (
                          <Button onClick={() => handleStartEvaluation(selectedEvaluation.id)} className="w-full">
                            <Play className="w-4 h-4 mr-2" />
                            Start Evaluation
                          </Button>
                        )}
                      </div>
                    </TabsContent>

                    <TabsContent value="questions">
                      <div className="space-y-6">
                        {selectedEvaluation.answerSheet.exam.examSections.map((section, sectionIndex) => (
                          <div key={section.id} className="border rounded-lg p-4">
                            <h4 className="font-semibold mb-4">
                              Section {sectionIndex + 1}: {section.title}
                            </h4>
                            <div className="space-y-4">
                              {section.questions.map((question, questionIndex) => (
                                <div key={question.id} className="border-l-4 border-blue-200 pl-4">
                                  <div className="flex items-start justify-between mb-2">
                                    <div className="flex-1">
                                      <p className="font-medium text-blue-600 mb-1">
                                        Q{sectionIndex + 1}.{questionIndex + 1} ({question.marks} marks)
                                      </p>
                                      <p className="text-sm text-gray-900 whitespace-pre-wrap">
                                        {question.questionText}
                                      </p>
                                    </div>
                                  </div>
                                  
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
                                    <div>
                                      <label className="text-sm font-medium">Marks Awarded</label>
                                      <Input
                                        type="number"
                                        min="0"
                                        max={question.marks}
                                        value={evaluationData.questionMarks[question.id] || 0}
                                        onChange={(e) => setEvaluationData(prev => ({
                                          ...prev,
                                          questionMarks: {
                                            ...prev.questionMarks,
                                            [question.id]: parseInt(e.target.value) || 0
                                          }
                                        }))}
                                        className="mt-1"
                                      />
                                    </div>
                                    <div>
                                      <label className="text-sm font-medium">Feedback</label>
                                      <Textarea
                                        placeholder="Provide feedback for this answer..."
                                        value={evaluationData.questionFeedback[question.id] || ''}
                                        onChange={(e) => setEvaluationData(prev => ({
                                          ...prev,
                                          questionFeedback: {
                                            ...prev.questionFeedback,
                                            [question.id]: e.target.value
                                          }
                                        }))}
                                        className="mt-1"
                                        rows={2}
                                      />
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </TabsContent>

                    <TabsContent value="ai-assist">
                      <div className="space-y-6">
                        <div className="border rounded-lg p-4 bg-blue-50">
                          <div className="flex items-center gap-2 mb-2">
                            <Brain className="w-5 h-5 text-blue-600" />
                            <h4 className="font-semibold text-blue-900">AI Evaluation Assistant</h4>
                          </div>
                          <p className="text-sm text-blue-800">
                            Get AI-powered insights and suggestions for more consistent evaluation
                          </p>
                        </div>

                        {selectedEvaluation && selectedEvaluation.answerSheet.exam.examSections.length > 0 ? (
                          <div className="space-y-6">
                            {selectedEvaluation.answerSheet.exam.examSections.map((section, sectionIndex) => (
                              <div key={section.id} className="border rounded-lg p-4">
                                <h5 className="font-semibold mb-4">
                                  Section {sectionIndex + 1}: {section.title}
                                </h5>
                                <div className="space-y-4">
                                  {section.questions.map((question, questionIndex) => (
                                    <div key={question.id} className="border-l-4 border-blue-200 pl-4">
                                      <div className="flex items-start justify-between mb-2">
                                        <div className="flex-1">
                                          <p className="font-medium text-blue-600 mb-1">
                                            Q{sectionIndex + 1}.{questionIndex + 1} ({question.marks} marks)
                                          </p>
                                          <p className="text-sm text-gray-900 whitespace-pre-wrap bg-gray-50 p-2 rounded">
                                            {question.questionText}
                                          </p>
                                        </div>
                                      </div>
                                      
                                      <AIEvaluationAssist
                                        questionText={question.questionText}
                                        answerText="Student's answer would be displayed here with the answer sheet viewer integration"
                                        answerKey={question.answerKey}
                                        maxMarks={question.marks}
                                        questionType={question.questionType}
                                        subject={selectedEvaluation.answerSheet.exam.subject}
                                        onEvaluationComplete={(result) => {
                                          // Auto-fill AI suggested marks
                                          setEvaluationData(prev => ({
                                            ...prev,
                                            questionMarks: {
                                              ...prev.questionMarks,
                                              [question.id]: result.marksAwarded
                                            }
                                          }))
                                        }}
                                      />
                                    </div>
                                  ))}
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center py-8">
                            <Brain className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                            <h4 className="text-lg font-semibold text-gray-900 mb-2">
                              AI Assistant Ready
                            </h4>
                            <p className="text-gray-600">
                              Select an evaluation to use AI-powered assistance
                            </p>
                          </div>
                        )}
                      </div>
                    </TabsContent>

                    <TabsContent value="summary">
                      <div className="space-y-6">
                        <div className="border rounded-lg p-4">
                          <h4 className="font-semibold mb-4">Overall Comments</h4>
                          <Textarea
                            placeholder="Provide overall feedback for the student..."
                            value={evaluationData.comments}
                            onChange={(e) => setEvaluationData(prev => ({
                              ...prev,
                              comments: e.target.value
                            }))}
                            rows={4}
                          />
                        </div>

                        <div className="border rounded-lg p-4">
                          <h4 className="font-semibold mb-4">Marks Summary</h4>
                          <div className="space-y-2">
                            <div className="flex justify-between">
                              <span>Total Marks Awarded:</span>
                              <span className="font-semibold">
                                {Object.values(evaluationData.questionMarks).reduce((sum, marks) => sum + marks, 0)}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span>Total Marks:</span>
                              <span className="font-semibold">{selectedEvaluation.maxMarks}</span>
                            </div>
                            <div className="flex justify-between pt-2 border-t">
                              <span className="font-semibold">Percentage:</span>
                              <span className="font-semibold">
                                {selectedEvaluation.maxMarks > 0 
                                  ? ((Object.values(evaluationData.questionMarks).reduce((sum, marks) => sum + marks, 0) / selectedEvaluation.maxMarks) * 100).toFixed(1)
                                  : 0}%
                              </span>
                            </div>
                          </div>
                        </div>

                        <Button 
                          onClick={handleSubmitEvaluation}
                          disabled={submitting}
                          className="w-full"
                        >
                          {submitting ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                              Submitting...
                            </>
                          ) : (
                            <>
                              <CheckCircle className="w-4 h-4 mr-2" />
                              Submit Evaluation
                            </>
                          )}
                        </Button>
                      </div>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="p-12 text-center">
                  <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Select an Evaluation
                  </h3>
                  <p className="text-gray-600">
                    Choose an answer sheet from the list to start evaluating
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}