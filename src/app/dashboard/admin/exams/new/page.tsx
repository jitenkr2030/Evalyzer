'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  ArrowLeft, 
  Plus, 
  Trash2, 
  Save, 
  Eye,
  Clock,
  FileText,
  Target
} from 'lucide-react'
import { Subject, CALevel, QuestionType } from '@prisma/client'

interface Question {
  id: string
  questionText: string
  questionType: QuestionType
  marks: number
  order: number
  answerKey?: string
  rubric?: string
}

interface Section {
  id: string
  title: string
  description?: string
  marks: number
  order: number
  questions: Question[]
}

export default function CreateExamPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  // Exam basic info
  const [examData, setExamData] = useState({
    title: '',
    description: '',
    examCode: '',
    subject: '' as Subject | '',
    caLevel: '' as CALevel | '',
    duration: 180,
    totalMarks: 100,
    passingMarks: 40,
    scheduledAt: '',
    deadline: '',
    instructions: '',
    questionPaperUrl: '',
    answerKeyUrl: ''
  })

  // Sections and questions
  const [sections, setSections] = useState<Section[]>([
    {
      id: '1',
      title: '',
      description: '',
      marks: 0,
      order: 0,
      questions: []
    }
  ])

  useEffect(() => {
    if (status === 'loading') return

    if (!session || (session.user.role !== 'ADMIN' && session.user.role !== 'SUPER_ADMIN')) {
      router.push('/auth/signin')
      return
    }
  }, [session, status, router])

  const addSection = () => {
    const newSection: Section = {
      id: Date.now().toString(),
      title: '',
      description: '',
      marks: 0,
      order: sections.length,
      questions: []
    }
    setSections([...sections, newSection])
  }

  const removeSection = (sectionId: string) => {
    if (sections.length > 1) {
      setSections(sections.filter(s => s.id !== sectionId))
    }
  }

  const updateSection = (sectionId: string, field: keyof Section, value: any) => {
    setSections(sections.map(section => 
      section.id === sectionId ? { ...section, [field]: value } : section
    ))
  }

  const addQuestion = (sectionId: string) => {
    const newQuestion: Question = {
      id: Date.now().toString(),
      questionText: '',
      questionType: QuestionType.SHORT_ANSWER,
      marks: 1,
      order: 0,
      answerKey: '',
      rubric: ''
    }

    setSections(sections.map(section => {
      if (section.id === sectionId) {
        return {
          ...section,
          questions: [...section.questions, newQuestion]
        }
      }
      return section
    }))
  }

  const removeQuestion = (sectionId: string, questionId: string) => {
    setSections(sections.map(section => {
      if (section.id === sectionId) {
        return {
          ...section,
          questions: section.questions.filter(q => q.id !== questionId)
        }
      }
      return section
    }))
  }

  const updateQuestion = (sectionId: string, questionId: string, field: keyof Question, value: any) => {
    setSections(sections.map(section => {
      if (section.id === sectionId) {
        return {
          ...section,
          questions: section.questions.map(question =>
            question.id === questionId ? { ...question, [field]: value } : question
          )
        }
      }
      return section
    }))
  }

  const calculateTotalMarks = () => {
    return sections.reduce((total, section) => {
      const sectionMarks = section.questions.reduce((sectionTotal, question) => {
        return sectionTotal + question.marks
      }, 0)
      return total + sectionMarks
    }, 0)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      // Validate
      if (!examData.title || !examData.examCode || !examData.subject || !examData.caLevel) {
        throw new Error('Please fill in all required fields')
      }

      if (!examData.scheduledAt || !examData.deadline) {
        throw new Error('Please schedule the exam')
      }

      const hasValidSections = sections.some(section => 
        section.title && section.questions.length > 0
      )

      if (!hasValidSections) {
        throw new Error('Please add at least one section with questions')
      }

      const totalQuestionsMarks = calculateTotalMarks()
      if (totalQuestionsMarks === 0) {
        throw new Error('Total marks cannot be zero')
      }

      // Update total marks
      const updatedExamData = {
        ...examData,
        totalMarks: totalQuestionsMarks
      }

      const response = await fetch('/api/exams', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...updatedExamData,
          sections: sections.filter(section => section.title && section.questions.length > 0)
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create exam')
      }

      setSuccess(true)
      setTimeout(() => {
        router.push('/dashboard/admin/exams')
      }, 2000)

    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to create exam')
    } finally {
      setLoading(false)
    }
  }

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-96">
          <CardContent className="p-6 text-center">
            <div className="text-green-600 mb-4">
              <FileText className="w-12 h-12 mx-auto" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Exam Created Successfully!</h3>
            <p className="text-gray-600">Redirecting to exam list...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" asChild>
                <Link href="/dashboard/admin/exams">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Exams
                </Link>
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Create New Exam</h1>
                <p className="text-gray-600">Set up a new CA examination</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline">
                <Eye className="w-4 h-4 mr-2" />
                Preview
              </Button>
              <Button onClick={handleSubmit} disabled={loading}>
                {loading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                ) : (
                  <Save className="w-4 h-4 mr-2" />
                )}
                Create Exam
              </Button>
            </div>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Basic Information */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>
                Set up the basic details for your exam
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="title">Exam Title *</Label>
                  <Input
                    id="title"
                    placeholder="e.g., CA Final - Financial Reporting"
                    value={examData.title}
                    onChange={(e) => setExamData({ ...examData, title: e.target.value })}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="examCode">Exam Code *</Label>
                  <Input
                    id="examCode"
                    placeholder="e.g., CA-FR-2024-01"
                    value={examData.examCode}
                    onChange={(e) => setExamData({ ...examData, examCode: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Provide a detailed description of the exam..."
                  value={examData.description}
                  onChange={(e) => setExamData({ ...examData, description: e.target.value })}
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="subject">Subject *</Label>
                  <Select value={examData.subject} onValueChange={(value) => setExamData({ ...examData, subject: value as Subject })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select subject" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ACCOUNTING">Accounting</SelectItem>
                      <SelectItem value="LAW">Law</SelectItem>
                      <SelectItem value="TAXATION">Taxation</SelectItem>
                      <SelectItem value="COSTING">Costing</SelectItem>
                      <SelectItem value="AUDIT">Audit</SelectItem>
                      <SelectItem value="FINANCIAL_MANAGEMENT">Financial Management</SelectItem>
                      <SelectItem value="ECONOMICS">Economics</SelectItem>
                      <SelectItem value="ETHICS">Ethics</SelectItem>
                      <SelectItem value="IT_SM">IT & SM</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="caLevel">CA Level *</Label>
                  <Select value={examData.caLevel} onValueChange={(value) => setExamData({ ...examData, caLevel: value as CALevel })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select CA level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="FOUNDATION">Foundation</SelectItem>
                      <SelectItem value="INTERMEDIATE">Intermediate</SelectItem>
                      <SelectItem value="FINAL">Final</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="duration">Duration (minutes) *</Label>
                  <Input
                    id="duration"
                    type="number"
                    min="30"
                    max="240"
                    value={examData.duration}
                    onChange={(e) => setExamData({ ...examData, duration: parseInt(e.target.value) })}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="passingMarks">Passing Marks *</Label>
                  <Input
                    id="passingMarks"
                    type="number"
                    min="1"
                    value={examData.passingMarks}
                    onChange={(e) => setExamData({ ...examData, passingMarks: parseInt(e.target.value) })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label>Total Marks (Auto-calculated)</Label>
                  <div className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                    <Target className="w-4 h-4 text-gray-500" />
                    <span className="font-semibold">{calculateTotalMarks()}</span>
              </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Schedule */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Exam Schedule</CardTitle>
              <CardDescription>
                Set the exam timing and availability
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="scheduledAt">Scheduled Date & Time *</Label>
                  <Input
                    id="scheduledAt"
                    type="datetime-local"
                    value={examData.scheduledAt}
                    onChange={(e) => setExamData({ ...examData, scheduledAt: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="deadline">Submission Deadline *</Label>
                  <Input
                    id="deadline"
                    type="datetime-local"
                    value={examData.deadline}
                    onChange={(e) => setExamData({ ...examData, deadline: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="instructions">Exam Instructions</Label>
                <Textarea
                  id="instructions"
                  placeholder="Provide instructions for students taking the exam..."
                  value={examData.instructions}
                  onChange={(e) => setExamData({ ...examData, instructions: e.target.value })}
                  rows={4}
                />
              </div>
            </CardContent>
          </Card>

          {/* Sections and Questions */}
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-xl font-semibold">Exam Sections & Questions</h2>
                <p className="text-gray-600">Create sections and add questions for each section</p>
              </div>
              <Button onClick={addSection} variant="outline">
                <Plus className="w-4 h-4 mr-2" />
                Add Section
              </Button>
            </div>

            {sections.map((section, sectionIndex) => (
              <Card key={section.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-sm font-medium text-gray-500">
                          Section {sectionIndex + 1}
                        </span>
                        <Badge variant="outline">
                          {section.questions.length} questions
                        </Badge>
                        <Badge variant="outline">
                          {section.questions.reduce((total, q) => total + q.marks, 0)} marks
                        </Badge>
                      </div>
                      <Input
                        placeholder="Section Title"
                        value={section.title}
                        onChange={(e) => updateSection(section.id, 'title', e.target.value)}
                        className="mb-2"
                      />
                      <Input
                        placeholder="Section Description (optional)"
                        value={section.description || ''}
                        onChange={(e) => updateSection(section.id, 'description', e.target.value)}
                      />
                    </div>
                    {sections.length > 1 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeSection(section.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h4 className="font-medium">Questions</h4>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => addQuestion(section.id)}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add Question
                    </Button>
                  </div>

                  {section.questions.map((question, questionIndex) => (
                    <div key={question.id} className="border rounded-lg p-4 space-y-4">
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-gray-500">
                            Q{questionIndex + 1}
                          </span>
                          <Select
                            value={question.questionType}
                            onValueChange={(value) => updateQuestion(section.id, question.id, 'questionType', value as QuestionType)}
                          >
                            <SelectTrigger className="w-40">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="SHORT_ANSWER">Short Answer</SelectItem>
                              <SelectItem value="LONG_ANSWER">Long Answer</SelectItem>
                              <SelectItem value="PRACTICAL">Practical</SelectItem>
                              <SelectItem value="CASE_STUDY">Case Study</SelectItem>
                              <SelectItem value="MCQ">Multiple Choice</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeQuestion(section.id, question.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="md:col-span-3">
                          <Label>Question Text</Label>
                          <Textarea
                            placeholder="Enter the question text..."
                            value={question.questionText}
                            onChange={(e) => updateQuestion(section.id, question.id, 'questionText', e.target.value)}
                            rows={3}
                          />
                        </div>
                        <div>
                          <Label>Marks</Label>
                          <Input
                            type="number"
                            min="1"
                            value={question.marks}
                            onChange={(e) => updateQuestion(section.id, question.id, 'marks', parseInt(e.target.value) || 1)}
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label>Answer Key (for evaluators)</Label>
                          <Textarea
                            placeholder="Expected answer or key points..."
                            value={question.answerKey || ''}
                            onChange={(e) => updateQuestion(section.id, question.id, 'answerKey', e.target.value)}
                            rows={2}
                          />
                        </div>
                        <div>
                          <Label>Evaluation Rubric</Label>
                          <Textarea
                            placeholder="Marking scheme and evaluation criteria..."
                            value={question.rubric || ''}
                            onChange={(e) => updateQuestion(section.id, question.id, 'rubric', e.target.value)}
                            rows={2}
                          />
                        </div>
                      </div>
                    </div>
                  ))}

                  {section.questions.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      <FileText className="w-8 h-8 mx-auto mb-2" />
                      <p>No questions added yet</p>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => addQuestion(section.id)}
                        className="mt-2"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Add First Question
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-4 pt-6">
            <Button variant="outline" asChild>
              <Link href="/dashboard/admin/exams">Cancel</Link>
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
              Create Exam
            </Button>
          </div>
        </div>
      </form>
    </div>
  )
}