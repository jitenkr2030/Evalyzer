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
  FileText, 
  Clock, 
  CheckCircle, 
  DollarSign,
  TrendingUp,
  Users,
  AlertCircle,
  Play,
  Pause
} from 'lucide-react'
import Link from 'next/link'

interface EvaluatorStats {
  totalAssigned: number
  completedToday: number
  pendingEvaluation: number
  averageTime: number
  todayEarnings: number
  monthlyEarnings: number
  rating: number
  totalEarnings: number
}

interface PendingEvaluation {
  id: string
  examTitle: string
  studentName: string
  subject: string
  submittedAt: string
  urgency: 'HIGH' | 'MEDIUM' | 'LOW'
  estimatedTime: number
}

export default function EvaluatorDashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [stats, setStats] = useState<EvaluatorStats>({
    totalAssigned: 0,
    completedToday: 0,
    pendingEvaluation: 0,
    averageTime: 0,
    todayEarnings: 0,
    monthlyEarnings: 0,
    rating: 0,
    totalEarnings: 0,
  })
  const [pendingEvaluations, setPendingEvaluations] = useState<PendingEvaluation[]>([])

  const fetchDashboardData = async () => {
    try {
      // Mock data for now - replace with actual API calls
      setStats({
        totalAssigned: 45,
        completedToday: 8,
        pendingEvaluation: 12,
        averageTime: 15,
        todayEarnings: 800,
        monthlyEarnings: 18500,
        rating: 4.7,
        totalEarnings: 245000,
      })

      setPendingEvaluations([
        {
          id: '1',
          examTitle: 'CA Final - Financial Reporting',
          studentName: 'Rahul Sharma',
          subject: 'Accounting',
          submittedAt: '2024-01-15T10:30:00Z',
          urgency: 'HIGH',
          estimatedTime: 20,
        },
        {
          id: '2',
          examTitle: 'CA Inter - Law Mock Test',
          studentName: 'Priya Patel',
          subject: 'Law',
          submittedAt: '2024-01-15T09:15:00Z',
          urgency: 'MEDIUM',
          estimatedTime: 15,
        },
        {
          id: '3',
          examTitle: 'CA Foundation - Economics',
          studentName: 'Amit Kumar',
          subject: 'Economics',
          submittedAt: '2024-01-15T08:45:00Z',
          urgency: 'LOW',
          estimatedTime: 12,
        },
      ])
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error)
    }
  }

  useEffect(() => {
    if (status === 'loading') return

    if (!session || session.user.role !== 'EVALUATOR') {
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

  const dailyProgress = session.user.evaluatorProfile?.maxCopiesPerDay 
    ? (stats.completedToday / session.user.evaluatorProfile.maxCopiesPerDay) * 100 
    : 0

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'HIGH': return 'destructive'
      case 'MEDIUM': return 'secondary'
      case 'LOW': return 'outline'
      default: return 'outline'
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Evaluator Dashboard
              </h1>
              <p className="text-gray-600">
                {session.user.name} • {session.user.evaluatorProfile?.employeeId}
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <Badge variant="outline" className="px-3 py-1">
                <TrendingUp className="w-4 h-4 mr-1" />
                {stats.rating} ⭐ Rating
              </Badge>
              <Button asChild>
                <Link href="/dashboard/evaluator/evaluations">
                  <FileText className="w-4 h-4 mr-2" />
                  Start Evaluating
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
              <CardTitle className="text-sm font-medium">Pending Evaluations</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.pendingEvaluation}</div>
              <p className="text-xs text-muted-foreground">
                {stats.completedToday} completed today
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Today's Earnings</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₹{stats.todayEarnings}</div>
              <p className="text-xs text-muted-foreground">
                ₹{stats.monthlyEarnings} this month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Time/Copy</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.averageTime}m</div>
              <p className="text-xs text-muted-foreground">
                -2m from average
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₹{stats.totalEarnings.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                Lifetime earnings
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Daily Progress */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Daily Progress</CardTitle>
            <CardDescription>
              Your evaluation progress for today
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between text-sm">
                <span>Daily Target</span>
                <span>{stats.completedToday}/{session.user.evaluatorProfile?.maxCopiesPerDay || 10} copies</span>
              </div>
              <Progress value={dailyProgress} className="h-2" />
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-green-600">{stats.completedToday}</div>
                  <div className="text-sm text-gray-600">Completed</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-blue-600">{stats.pendingEvaluation}</div>
                  <div className="text-sm text-gray-600">Pending</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-600">
                    {(session.user.evaluatorProfile?.maxCopiesPerDay || 10) - stats.completedToday}
                  </div>
                  <div className="text-sm text-gray-600">Remaining</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Pending Evaluations */}
        <Tabs defaultValue="pending" className="space-y-4">
          <TabsList>
            <TabsTrigger value="pending">Pending Evaluations</TabsTrigger>
            <TabsTrigger value="inprogress">In Progress</TabsTrigger>
            <TabsTrigger value="completed">Completed Today</TabsTrigger>
            <TabsTrigger value="payments">Payments</TabsTrigger>
          </TabsList>

          <TabsContent value="pending" className="space-y-4">
            <div className="grid gap-4">
              {pendingEvaluations.map((evaluation) => (
                <Card key={evaluation.id}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <h3 className="font-semibold">{evaluation.examTitle}</h3>
                          <Badge variant={getUrgencyColor(evaluation.urgency)}>
                            {evaluation.urgency} PRIORITY
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">
                          Student: {evaluation.studentName} • {evaluation.subject}
                        </p>
                        <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                          <div className="flex items-center">
                            <Clock className="w-4 h-4 mr-1" />
                            Submitted {new Date(evaluation.submittedAt).toLocaleDateString()}
                          </div>
                          <div className="flex items-center">
                            <AlertCircle className="w-4 h-4 mr-1" />
                            Est. {evaluation.estimatedTime} minutes
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button size="sm">
                          <Play className="w-4 h-4 mr-2" />
                          Start Evaluation
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="inprogress">
            <Card>
              <CardContent className="p-6 text-center">
                <Pause className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No evaluations in progress</h3>
                <p className="text-gray-600 mb-4">
                  Start evaluating from the pending list
                </p>
                <Button asChild>
                  <Link href="/dashboard/evaluator/evaluations">View Pending</Link>
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="completed">
            <Card>
              <CardContent className="p-6 text-center">
                <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Great work today!</h3>
                <p className="text-gray-600 mb-4">
                  You've completed {stats.completedToday} evaluations today
                </p>
                <div className="text-2xl font-bold text-green-600 mb-4">
                  ₹{stats.todayEarnings} earned today
                </div>
                <Button variant="outline">
                  <FileText className="w-4 h-4 mr-2" />
                  View Completed
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="payments">
            <div className="grid gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>Payment Summary</CardTitle>
                  <CardDescription>Your earnings overview</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">₹{stats.todayEarnings}</div>
                      <div className="text-sm text-gray-600">Today</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">₹{stats.monthlyEarnings}</div>
                      <div className="text-sm text-gray-600">This Month</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-600">₹{stats.totalEarnings.toLocaleString()}</div>
                      <div className="text-sm text-gray-600">Total</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}