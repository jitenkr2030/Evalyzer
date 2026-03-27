'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  BookOpen, 
  FileText, 
  TrendingUp, 
  Clock, 
  Award, 
  Calendar,
  Upload,
  Eye,
  Target
} from 'lucide-react'
import Link from 'next/link'

interface DashboardStats {
  totalExams: number
  completedExams: number
  pendingEvaluations: number
  averageScore: number
  currentRank: number
  totalStudents: number
}

interface RecentExam {
  id: string
  title: string
  subject: string
  date: string
  status: 'UPCOMING' | 'COMPLETED' | 'IN_PROGRESS'
  score?: number
  totalMarks: number
}

export default function StudentDashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [stats, setStats] = useState<DashboardStats>({
    totalExams: 0,
    completedExams: 0,
    pendingEvaluations: 0,
    averageScore: 0,
    currentRank: 0,
    totalStudents: 0,
  })
  const [recentExams, setRecentExams] = useState<RecentExam[]>([])

  const fetchDashboardData = async () => {
    try {
      // Mock data for now - replace with actual API calls
      setStats({
        totalExams: 12,
        completedExams: 8,
        pendingEvaluations: 2,
        averageScore: 72.5,
        currentRank: 15,
        totalStudents: 150,
      })

      setRecentExams([
        {
          id: '1',
          title: 'CA Final - Financial Reporting',
          subject: 'Accounting',
          date: '2024-01-15',
          status: 'COMPLETED',
          score: 78,
          totalMarks: 100,
        },
        {
          id: '2',
          title: 'CA Inter - Law Mock Test',
          subject: 'Law',
          date: '2024-01-20',
          status: 'IN_PROGRESS',
          totalMarks: 100,
        },
        {
          id: '3',
          title: 'CA Foundation - Economics',
          subject: 'Economics',
          date: '2024-01-25',
          status: 'UPCOMING',
          totalMarks: 100,
        },
      ])
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error)
    }
  }

  useEffect(() => {
    if (status === 'loading') return

    if (!session || session.user.role !== 'STUDENT') {
      router.push('/auth/signin')
      return
    }

    // Fetch dashboard data
    fetchDashboardData()
  }, [session, status, router])

  if (status === 'loading') {
    return <div>Loading...</div>
  }

  if (!session) {
    return null
  }

  const completionRate = stats.totalExams > 0 ? (stats.completedExams / stats.totalExams) * 100 : 0

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Welcome back, {session.user.name}! 👋
              </h1>
              <p className="text-gray-600">
                {session.user.studentProfile?.caLevel} • {session.user.studentProfile?.institute || 'Independent'}
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <Badge variant="outline" className="px-3 py-1">
                <Target className="w-4 h-4 mr-1" />
                Rank #{stats.currentRank}
              </Badge>
              <Button asChild>
                <Link href="/dashboard/student/exams">
                  <BookOpen className="w-4 h-4 mr-2" />
                  Browse Exams
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Exams</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalExams}</div>
              <p className="text-xs text-muted-foreground">
                {stats.completedExams} completed
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Average Score</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.averageScore}%</div>
              <p className="text-xs text-muted-foreground">
                +2.5% from last month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Evaluations</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.pendingEvaluations}</div>
              <p className="text-xs text-muted-foreground">
                Awaiting results
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">All India Rank</CardTitle>
              <Award className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">#{stats.currentRank}</div>
              <p className="text-xs text-muted-foreground">
                Out of {stats.totalStudents} students
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Progress Overview */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Your Progress</CardTitle>
            <CardDescription>
              Track your CA exam preparation journey
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between text-sm">
                <span>Overall Completion</span>
                <span>{completionRate.toFixed(1)}%</span>
              </div>
              <Progress value={completionRate} className="h-2" />
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-green-600">{stats.completedExams}</div>
                  <div className="text-sm text-gray-600">Completed</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-blue-600">{stats.pendingEvaluations}</div>
                  <div className="text-sm text-gray-600">In Progress</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-600">
                    {stats.totalExams - stats.completedExams - stats.pendingEvaluations}
                  </div>
                  <div className="text-sm text-gray-600">Remaining</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent Exams */}
        <Tabs defaultValue="recent" className="space-y-4">
          <TabsList>
            <TabsTrigger value="recent">Recent Exams</TabsTrigger>
            <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
            <TabsTrigger value="results">Results</TabsTrigger>
          </TabsList>

          <TabsContent value="recent" className="space-y-4">
            <div className="grid gap-4">
              {recentExams.map((exam) => (
                <Card key={exam.id}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <h3 className="font-semibold">{exam.title}</h3>
                          <Badge variant={exam.status === 'COMPLETED' ? 'default' : exam.status === 'IN_PROGRESS' ? 'secondary' : 'outline'}>
                            {exam.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">{exam.subject}</p>
                        <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                          <div className="flex items-center">
                            <Calendar className="w-4 h-4 mr-1" />
                            {exam.date}
                          </div>
                          <div>
                            {exam.score !== undefined ? `${exam.score}/${exam.totalMarks} marks` : `${exam.totalMarks} marks`}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {exam.status === 'COMPLETED' && (
                          <Button variant="outline" size="sm">
                            <Eye className="w-4 h-4 mr-2" />
                            View Result
                          </Button>
                        )}
                        {exam.status === 'IN_PROGRESS' && (
                          <Button size="sm">
                            <Upload className="w-4 h-4 mr-2" />
                            Submit Answer
                          </Button>
                        )}
                        {exam.status === 'UPCOMING' && (
                          <Button variant="outline" size="sm">
                            <Calendar className="w-4 h-4 mr-2" />
                            Set Reminder
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="upcoming">
            <Card>
              <CardContent className="p-6 text-center">
                <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No upcoming exams</h3>
                <p className="text-gray-600 mb-4">
                  Check back later for new exam schedules
                </p>
                <Button asChild>
                  <Link href="/dashboard/student/exams">Browse All Exams</Link>
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="results">
            <Card>
              <CardContent className="p-6 text-center">
                <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No results available</h3>
                <p className="text-gray-600 mb-4">
                  Your evaluated exam results will appear here
                </p>
                <Button variant="outline">
                  <Eye className="w-4 h-4 mr-2" />
                  Check Evaluation Status
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}