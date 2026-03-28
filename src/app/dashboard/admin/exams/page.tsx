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
import { 
  Plus, 
  Search, 
  Filter, 
  Eye, 
  Edit, 
  Trash2, 
  Users, 
  FileText,
  Calendar,
  Clock
} from 'lucide-react'
import { Exam, ExamStatus, Subject, CALevel } from '@prisma/client'

interface ExamWithStats extends Exam {
  _count: {
    examEnrollments: number
    answerSheets: number
  }
}

export default function ExamsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [exams, setExams] = useState<ExamWithStats[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<ExamStatus | 'ALL'>('ALL')
  const [subjectFilter, setSubjectFilter] = useState<Subject | 'ALL'>('ALL')
  const [caLevelFilter, setCaLevelFilter] = useState<CALevel | 'ALL'>('ALL')

  useEffect(() => {
    if (status === 'loading') return

    if (!session || (session.user.role !== 'ADMIN' && session.user.role !== 'SUPER_ADMIN')) {
      router.push('/auth/signin')
      return
    }

    fetchExams()
  }, [session, status, router, statusFilter, subjectFilter, caLevelFilter])

  const fetchExams = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      
      if (statusFilter !== 'ALL') params.append('status', statusFilter)
      if (subjectFilter !== 'ALL') params.append('subject', subjectFilter)
      if (caLevelFilter !== 'ALL') params.append('caLevel', caLevelFilter)

      const response = await fetch(`/api/exams?${params.toString()}`)
      if (!response.ok) throw new Error('Failed to fetch exams')
      
      const data = await response.json()
      setExams(data.exams)
    } catch (error) {
      console.error('Error fetching exams:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: ExamStatus) => {
    switch (status) {
      case 'DRAFT': return 'secondary'
      case 'SCHEDULED': return 'default'
      case 'ACTIVE': return 'destructive'
      case 'COMPLETED': return 'outline'
      case 'CANCELLED': return 'secondary'
      default: return 'secondary'
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

  const filteredExams = exams.filter(exam =>
    exam.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    exam.examCode.toLowerCase().includes(searchTerm.toLowerCase())
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
              <h1 className="text-2xl font-bold text-gray-900">Exam Management</h1>
              <p className="text-gray-600">Create and manage CA examinations</p>
            </div>
            <Button asChild>
              <Link href="/dashboard/admin/exams/new">
                <Plus className="w-4 h-4 mr-2" />
                Create Exam
              </Link>
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search exams..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as ExamStatus | 'ALL')}>
                <SelectTrigger className="w-full lg:w-48">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Status</SelectItem>
                  <SelectItem value="DRAFT">Draft</SelectItem>
                  <SelectItem value="SCHEDULED">Scheduled</SelectItem>
                  <SelectItem value="ACTIVE">Active</SelectItem>
                  <SelectItem value="COMPLETED">Completed</SelectItem>
                  <SelectItem value="CANCELLED">Cancelled</SelectItem>
                </SelectContent>
              </Select>

              <Select value={subjectFilter} onValueChange={(value) => setSubjectFilter(value as Subject | 'ALL')}>
                <SelectTrigger className="w-full lg:w-48">
                  <SelectValue placeholder="Filter by subject" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Subjects</SelectItem>
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

              <Select value={caLevelFilter} onValueChange={(value) => setCaLevelFilter(value as CALevel | 'ALL')}>
                <SelectTrigger className="w-full lg:w-48">
                  <SelectValue placeholder="Filter by level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Levels</SelectItem>
                  <SelectItem value="FOUNDATION">Foundation</SelectItem>
                  <SelectItem value="INTERMEDIATE">Intermediate</SelectItem>
                  <SelectItem value="FINAL">Final</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Exams Grid */}
        <div className="grid gap-6">
          {filteredExams.map((exam) => (
            <Card key={exam.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <CardTitle className="text-xl">{exam.title}</CardTitle>
                      <Badge variant={getStatusColor(exam.status)}>
                        {exam.status}
                      </Badge>
                    </div>
                    <CardDescription className="text-base">
                      {exam.description}
                    </CardDescription>
                    <div className="flex items-center gap-4 mt-3 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <span className="font-medium">Code:</span>
                        <span className="font-mono bg-gray-100 px-2 py-1 rounded">
                          {exam.examCode}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {new Date(exam.scheduledAt).toLocaleDateString()}
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {exam.duration} minutes
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Badge className={getSubjectColor(exam.subject)}>
                      {exam.subject}
                    </Badge>
                    <Badge variant="outline">
                      {exam.caLevel}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-6 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      <span>{exam._count.examEnrollments} enrolled</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <FileText className="w-4 h-4" />
                      <span>{exam._count.answerSheets} submissions</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="font-medium">Marks:</span>
                      <span>{exam.passingMarks}/{exam.totalMarks}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/dashboard/admin/exams/${exam.id}`}>
                        <Eye className="w-4 h-4 mr-1" />
                        View
                      </Link>
                    </Button>
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/dashboard/admin/exams/${exam.id}/edit`}>
                        <Edit className="w-4 h-4 mr-1" />
                        Edit
                      </Link>
                    </Button>
                    <Button variant="outline" size="sm">
                      <Trash2 className="w-4 h-4 mr-1" />
                      Delete
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredExams.length === 0 && (
          <Card>
            <CardContent className="p-12 text-center">
              <div className="text-gray-400 mb-4">
                <FileText className="w-12 h-12 mx-auto" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No exams found
              </h3>
              <p className="text-gray-600 mb-4">
                {searchTerm || statusFilter !== 'ALL' || subjectFilter !== 'ALL' || caLevelFilter !== 'ALL'
                  ? 'Try adjusting your filters or search terms'
                  : 'Get started by creating your first exam'
                }
              </p>
              <Button asChild>
                <Link href="/dashboard/admin/exams/new">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Exam
                </Link>
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}