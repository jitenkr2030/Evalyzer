'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, GraduationCap, User, Users } from 'lucide-react'
import { UserRole, CALevel } from '@prisma/client'

export default function SignUpPage() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    role: '' as UserRole,
    phone: '',
    // Student fields
    rollNumber: '',
    caLevel: CALevel.FOUNDATION,
    institute: '',
    targetExam: '',
    preparationStage: '',
    // Evaluator fields
    employeeId: '',
    expertise: '',
    experience: '',
    qualification: '',
  })
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Registration failed')
        return
      }

      // Redirect to sign in page
      router.push('/auth/signin?message=Registration successful')
    } catch (error) {
      setError('An error occurred. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl w-full space-y-8">
        <div className="text-center">
          <div className="flex justify-center">
            <GraduationCap className="h-12 w-12 text-primary" />
          </div>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Join Evalyzer
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Create your account to start your CA journey
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Sign Up</CardTitle>
            <CardDescription>
              Fill in your details to create a new account
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-6">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              
              {/* Basic Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Basic Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      placeholder="Enter your full name"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="Enter your email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      required
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="Enter your password"
                      value={formData.password}
                      onChange={(e) => handleInputChange('password', e.target.value)}
                      required
                      minLength={6}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      placeholder="Enter your phone number"
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="role">I am a</Label>
                  <Select onValueChange={(value) => handleInputChange('role', value)} required>
                    <SelectTrigger>
                      <SelectValue placeholder="Select your role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="STUDENT">
                        <div className="flex items-center">
                          <GraduationCap className="mr-2 h-4 w-4" />
                          CA Student
                        </div>
                      </SelectItem>
                      <SelectItem value="EVALUATOR">
                        <div className="flex items-center">
                          <Users className="mr-2 h-4 w-4" />
                          Evaluator
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Role-specific fields */}
              {formData.role === 'STUDENT' && (
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Student Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="rollNumber">Roll Number</Label>
                      <Input
                        id="rollNumber"
                        placeholder="Enter your roll number"
                        value={formData.rollNumber}
                        onChange={(e) => handleInputChange('rollNumber', e.target.value)}
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="caLevel">CA Level</Label>
                      <Select onValueChange={(value) => handleInputChange('caLevel', value)} defaultValue={CALevel.FOUNDATION}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value={CALevel.FOUNDATION}>Foundation</SelectItem>
                          <SelectItem value={CALevel.INTERMEDIATE}>Intermediate</SelectItem>
                          <SelectItem value={CALevel.FINAL}>Final</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="institute">Institute</Label>
                    <Input
                      id="institute"
                      placeholder="Enter your institute name"
                      value={formData.institute}
                      onChange={(e) => handleInputChange('institute', e.target.value)}
                    />
                  </div>
                </div>
              )}

              {formData.role === 'EVALUATOR' && (
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Evaluator Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="employeeId">Employee ID</Label>
                      <Input
                        id="employeeId"
                        placeholder="Enter your employee ID"
                        value={formData.employeeId}
                        onChange={(e) => handleInputChange('employeeId', e.target.value)}
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="experience">Experience (years)</Label>
                      <Input
                        id="experience"
                        type="number"
                        placeholder="Years of experience"
                        value={formData.experience}
                        onChange={(e) => handleInputChange('experience', parseInt(e.target.value) || 0)}
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="qualification">Qualification</Label>
                    <Input
                      id="qualification"
                      placeholder="Enter your qualification"
                      value={formData.qualification}
                      onChange={(e) => handleInputChange('qualification', e.target.value)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="expertise">Expertise (comma-separated)</Label>
                    <Input
                      id="expertise"
                      placeholder="e.g., Accounting, Law, Taxation"
                      value={formData.expertise}
                      onChange={(e) => handleInputChange('expertise', e.target.value)}
                    />
                  </div>
                </div>
              )}
            </CardContent>
            
            <CardFooter className="flex flex-col space-y-4">
              <Button 
                type="submit" 
                className="w-full" 
                disabled={isLoading || !formData.role}
              >
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Create Account
              </Button>
              
              <div className="text-center text-sm">
                <span className="text-gray-600">Already have an account? </span>
                <Link href="/auth/signin" className="text-primary hover:underline">
                  Sign in
                </Link>
              </div>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  )
}