'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Users, 
  FileText, 
  DollarSign,
  TrendingUp,
  BookOpen,
  AlertCircle,
  CheckCircle,
  Clock,
  Settings,
  BarChart3,
  Plus
} from 'lucide-react'
import Link from 'next/link'

interface AdminStats {
  totalStudents: number
  totalEvaluators: number
  activeExams: number
  pendingEvaluations: number
  monthlyRevenue: number
  totalRevenue: number
  avgCompletionTime: number
  satisfactionRate: number
}

interface RecentActivity {
  id: string
  type: 'EXAM_CREATED' | 'EVALUATION_COMPLETED' | 'USER_REGISTERED' | 'PAYMENT_PROCESSED'
  description: string
  timestamp: string
  user: string
}

export default function AdminDashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [stats, setStats] = useState<AdminStats>({
    totalStudents: 0,
    totalEvaluators: 0,
    activeExams: 0,
    pendingEvaluations: 0,
    monthlyRevenue: 0,
    totalRevenue: 0,
    avgCompletionTime: 0,
    satisfactionRate: 0,
  })
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([])

  const fetchDashboardData = async () => {
    try {
      // Mock data for now - replace with actual API calls
      setStats({
        totalStudents: 1250,
        totalEvaluators: 45,
        activeExams: 12,
        pendingEvaluations: 156,
        monthlyRevenue: 485000,
        totalRevenue: 12500000,
        avgCompletionTime: 18,
        satisfactionRate: 92,
      })

      setRecentActivity([
        {
          id: '1',
          type: 'EXAM_CREATED',
          description: 'New exam "CA Final - Advanced Accounting" created',
          timestamp: '2024-01-15T10:30:00Z',
          user: 'Admin User',
        },
        {
          id: '2',
          type: 'EVALUATION_COMPLETED',
          description: '25 answer sheets evaluated for "CA Inter - Law Mock Test"',
          timestamp: '2024-01-15T09:15:00Z',
          user: 'Evaluator Team',
        },
        {
          id: '3',
          type: 'USER_REGISTERED',
          description: 'New student registration: Rahul Sharma (CA Final)',
          timestamp: '2024-01-15T08:45:00Z',
          user: 'System',
        },
        {
          id: '4',
          type: 'PAYMENT_PROCESSED',
          description: 'Monthly payments processed for 32 evaluators',
          timestamp: '2024-01-15T08:00:00Z',
          user: 'Payment System',
        },
      ])
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error)
    }
  }

  useEffect(() => {
    if (status === 'loading') return

    if (!session || (session.user.role !== 'ADMIN' && session.user.role !== 'SUPER_ADMIN')) {
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

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'EXAM_CREATED': return <BookOpen className="w-4 h-4" />
      case 'EVALUATION_COMPLETED': return <CheckCircle className="w-4 h-4" />
      case 'USER_REGISTERED': return <Users className="w-4 h-4" />
      case 'PAYMENT_PROCESSED': return <DollarSign className="w-4 h-4" />
      default: return <AlertCircle className="w-4 h-4" />
    }
  }

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'EXAM_CREATED': return 'text-blue-600'
      case 'EVALUATION_COMPLETED': return 'text-green-600'
      case 'USER_REGISTERED': return 'text-purple-600'
      case 'PAYMENT_PROCESSED': return 'text-yellow-600'
      default: return 'text-gray-600'
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
                Admin Dashboard
              </h1>
              <p className="text-gray-600">
                Manage Evalyzer platform operations
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <Badge variant="outline" className="px-3 py-1">
                <BarChart3 className="w-4 h-4 mr-1" />
                {session.user.role}
              </Badge>
              <Button asChild>
                <Link href="/dashboard/admin/exams/new">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Exam
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
              <CardTitle className="text-sm font-medium">Total Students</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalStudents.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                +12% from last month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Evaluators</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalEvaluators}</div>
              <p className="text-xs text-muted-foreground">
                3 on leave today
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₹{(stats.monthlyRevenue / 1000).toFixed(0)}K</div>
              <p className="text-xs text-muted-foreground">
                +8% from last month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Satisfaction Rate</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.satisfactionRate}%</div>
              <p className="text-xs text-muted-foreground">
                +2% improvement
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="cursor-pointer hover:shadow-md transition-shadow">
            <CardContent className="p-6 text-center">
              <BookOpen className="w-8 h-8 text-blue-600 mx-auto mb-2" />
              <h3 className="font-semibold">Manage Exams</h3>
              <p className="text-sm text-gray-600">{stats.activeExams} active</p>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-md transition-shadow">
            <CardContent className="p-6 text-center">
              <Users className="w-8 h-8 text-green-600 mx-auto mb-2" />
              <h3 className="font-semibold">User Management</h3>
              <p className="text-sm text-gray-600">{stats.totalStudents + stats.totalEvaluators} total users</p>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-md transition-shadow">
            <CardContent className="p-6 text-center">
              <FileText className="w-8 h-8 text-purple-600 mx-auto mb-2" />
              <h3 className="font-semibold">Evaluations</h3>
              <p className="text-sm text-gray-600">{stats.pendingEvaluations} pending</p>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-md transition-shadow">
            <CardContent className="p-6 text-center">
              <Settings className="w-8 h-8 text-orange-600 mx-auto mb-2" />
              <h3 className="font-semibold">Settings</h3>
              <p className="text-sm text-gray-600">Platform config</p>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity & Analytics */}
        <Tabs defaultValue="activity" className="space-y-4">
          <TabsList>
            <TabsTrigger value="activity">Recent Activity</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="evaluations">Evaluations</TabsTrigger>
            <TabsTrigger value="revenue">Revenue</TabsTrigger>
          </TabsList>

          <TabsContent value="activity" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Latest platform activities</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentActivity.map((activity) => (
                    <div key={activity.id} className="flex items-center space-x-4 p-3 border rounded-lg">
                      <div className={`p-2 rounded-full bg-gray-100 ${getActivityColor(activity.type)}`}>
                        {getActivityIcon(activity.type)}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">{activity.description}</p>
                        <p className="text-sm text-gray-600">
                          by {activity.user} • {new Date(activity.timestamp).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics">
            <div className="grid gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Platform Analytics</CardTitle>
                  <CardDescription>Key performance indicators</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div className="text-center p-4 border rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">{stats.avgCompletionTime}m</div>
                      <div className="text-sm text-gray-600">Avg. Evaluation Time</div>
                    </div>
                    <div className="text-center p-4 border rounded-lg">
                      <div className="text-2xl font-bold text-green-600">{stats.satisfactionRate}%</div>
                      <div className="text-sm text-gray-600">Student Satisfaction</div>
                    </div>
                    <div className="text-center p-4 border rounded-lg">
                      <div className="text-2xl font-bold text-purple-600">{stats.activeExams}</div>
                      <div className="text-sm text-gray-600">Active Exams</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="evaluations">
            <Card>
              <CardHeader>
                <CardTitle>Evaluation Overview</CardTitle>
                <CardDescription>Current evaluation status</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h4 className="font-semibold">Pending by Subject</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center p-2 border rounded">
                        <span>Accounting</span>
                        <Badge variant="secondary">45</Badge>
                      </div>
                      <div className="flex justify-between items-center p-2 border rounded">
                        <span>Law</span>
                        <Badge variant="secondary">38</Badge>
                      </div>
                      <div className="flex justify-between items-center p-2 border rounded">
                        <span>Taxation</span>
                        <Badge variant="secondary">32</Badge>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <h4 className="font-semibold">Evaluator Performance</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center p-2 border rounded">
                        <span>Avg. Daily Output</span>
                        <span className="font-semibold">8.5 copies</span>
                      </div>
                      <div className="flex justify-between items-center p-2 border rounded">
                        <span>Avg. Quality Score</span>
                        <span className="font-semibold">4.6/5.0</span>
                      </div>
                      <div className="flex justify-between items-center p-2 border rounded">
                        <span>On-time Delivery</span>
                        <span className="font-semibold">94%</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="revenue">
            <div className="grid gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Revenue Overview</CardTitle>
                  <CardDescription>Financial performance metrics</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h4 className="font-semibold">Revenue Breakdown</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between items-center p-2 border rounded">
                          <span>Exam Fees</span>
                          <span className="font-semibold">₹{(stats.monthlyRevenue * 0.7 / 1000).toFixed(0)}K</span>
                        </div>
                        <div className="flex justify-between items-center p-2 border rounded">
                          <span>Evaluation Fees</span>
                          <span className="font-semibold">₹{(stats.monthlyRevenue * 0.3 / 1000).toFixed(0)}K</span>
                        </div>
                        <div className="flex justify-between items-center p-2 border rounded">
                          <span>Total Monthly</span>
                          <span className="font-bold text-green-600">₹{(stats.monthlyRevenue / 1000).toFixed(0)}K</span>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <h4 className="font-semibold">Yearly Performance</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between items-center p-2 border rounded">
                          <span>Total Revenue</span>
                          <span className="font-bold">₹{(stats.totalRevenue / 100000).toFixed(1)}L</span>
                        </div>
                        <div className="flex justify-between items-center p-2 border rounded">
                          <span>Growth Rate</span>
                          <span className="font-semibold text-green-600">+24%</span>
                        </div>
                        <div className="flex justify-between items-center p-2 border rounded">
                          <span>Profit Margin</span>
                          <span className="font-semibold">32%</span>
                        </div>
                      </div>
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