'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertCircle, CheckCircle2, Rocket, Users, Code2, ExternalLink, Mail, Phone } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'

export default function HackathonForm() {
  const [formData, setFormData] = useState({
    teamName: '',
    teamLeadName: '',
    email: '',
    contact: '',
    gitLink: '',
    projectUrl: '',
    otherDetails: ''
  })
  
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState(null) // 'success' | 'error'
  const [submitMessage, setSubmitMessage] = useState('')

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    setSubmitStatus(null)
    
    try {
      const response = await fetch('/api/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const result = await response.json()

      if (response.ok) {
        setSubmitStatus('success')
        setSubmitMessage('Your hackathon project has been submitted successfully! 🚀')
        // Reset form
        setFormData({
          teamName: '',
          teamLeadName: '',
          email: '',
          contact: '',
          gitLink: '',
          projectUrl: '',
          otherDetails: ''
        })
      } else {
        setSubmitStatus('error')
        setSubmitMessage(result.error || 'Submission failed. Please try again.')
      }
    } catch (error) {
      setSubmitStatus('error')
      setSubmitMessage('Network error. Please check your connection and try again.')
      console.error('Submission error:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-4">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      <div className="relative z-10 container mx-auto max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8 pt-8">
          <div className="flex justify-center mb-4">
            <div className="p-3 rounded-full bg-blue-600/20 border border-blue-500/30">
              <Rocket className="w-8 h-8 text-blue-400" />
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 tracking-tight">
            Hackathon Project
            <span className="block text-blue-400 mt-2">Submission Portal</span>
          </h1>
          <p className="text-slate-300 text-lg max-w-2xl mx-auto">
            Submit your innovative project and compete with the best minds. 
            Share your creation and let your code speak for itself.
          </p>
        </div>

        {/* Form Card */}
        <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700/50 shadow-2xl">
          <CardHeader className="border-b border-slate-700/50">
            <CardTitle className="text-2xl text-white flex items-center gap-2">
              <Code2 className="w-6 h-6 text-blue-400" />
              Project Details
            </CardTitle>
          </CardHeader>
          <CardContent className="p-8">
            {/* Status Alert */}
            {submitStatus && (
              <Alert className={`mb-6 ${
                submitStatus === 'success' 
                  ? 'border-green-500/50 bg-green-500/10' 
                  : 'border-red-500/50 bg-red-500/10'
              }`}>
                {submitStatus === 'success' ? (
                  <CheckCircle2 className="h-4 w-4 text-green-400" />
                ) : (
                  <AlertCircle className="h-4 w-4 text-red-400" />
                )}
                <AlertDescription className={
                  submitStatus === 'success' ? 'text-green-300' : 'text-red-300'
                }>
                  {submitMessage}
                </AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Team Information */}
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="teamName" className="text-slate-200 font-medium flex items-center gap-2">
                    <Users className="w-4 h-4 text-blue-400" />
                    Team Name *
                  </Label>
                  <Input
                    id="teamName"
                    name="teamName"
                    value={formData.teamName}
                    onChange={handleInputChange}
                    placeholder="Enter your team name"
                    className="bg-slate-900/50 border-slate-600 text-white placeholder:text-slate-400 focus:border-blue-500 focus:ring-blue-500/20"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="teamLeadName" className="text-slate-200 font-medium">
                    Team Lead Name *
                  </Label>
                  <Input
                    id="teamLeadName"
                    name="teamLeadName"
                    value={formData.teamLeadName}
                    onChange={handleInputChange}
                    placeholder="Enter team lead name"
                    className="bg-slate-900/50 border-slate-600 text-white placeholder:text-slate-400 focus:border-blue-500 focus:ring-blue-500/20"
                    required
                  />
                </div>
              </div>

              {/* Contact Information */}
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-slate-200 font-medium flex items-center gap-2">
                    <Mail className="w-4 h-4 text-blue-400" />
                    Email Address *
                  </Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="team.lead@example.com"
                    className="bg-slate-900/50 border-slate-600 text-white placeholder:text-slate-400 focus:border-blue-500 focus:ring-blue-500/20"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="contact" className="text-slate-200 font-medium flex items-center gap-2">
                    <Phone className="w-4 h-4 text-blue-400" />
                    Contact Number *
                  </Label>
                  <Input
                    id="contact"
                    name="contact"
                    value={formData.contact}
                    onChange={handleInputChange}
                    placeholder="+1 (555) 123-4567"
                    className="bg-slate-900/50 border-slate-600 text-white placeholder:text-slate-400 focus:border-blue-500 focus:ring-blue-500/20"
                    required
                  />
                </div>
              </div>

              {/* Project Links */}
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="gitLink" className="text-slate-200 font-medium flex items-center gap-2">
                    <Code2 className="w-4 h-4 text-blue-400" />
                    Git Repository Link
                  </Label>
                  <Input
                    id="gitLink"
                    name="gitLink"
                    value={formData.gitLink}
                    onChange={handleInputChange}
                    placeholder="https://github.com/your-team/project"
                    className="bg-slate-900/50 border-slate-600 text-white placeholder:text-slate-400 focus:border-blue-500 focus:ring-blue-500/20"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="projectUrl" className="text-slate-200 font-medium flex items-center gap-2">
                    <ExternalLink className="w-4 h-4 text-blue-400" />
                    Project Demo URL
                  </Label>
                  <Input
                    id="projectUrl"
                    name="projectUrl"
                    value={formData.projectUrl}
                    onChange={handleInputChange}
                    placeholder="https://your-project-demo.com"
                    className="bg-slate-900/50 border-slate-600 text-white placeholder:text-slate-400 focus:border-blue-500 focus:ring-blue-500/20"
                  />
                </div>
              </div>

              {/* Additional Details */}
              <div className="space-y-2">
                <Label htmlFor="otherDetails" className="text-slate-200 font-medium">
                  Additional Project Details
                </Label>
                <Textarea
                  id="otherDetails"
                  name="otherDetails"
                  value={formData.otherDetails}
                  onChange={handleInputChange}
                  placeholder="Tell us more about your project, technologies used, challenges faced, or any other relevant information..."
                  rows={4}
                  className="bg-slate-900/50 border-slate-600 text-white placeholder:text-slate-400 focus:border-blue-500 focus:ring-blue-500/20 resize-none"
                />
              </div>

              {/* Submit Button */}
              <div className="pt-4">
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium py-3 px-6 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2" />
                      Submitting Project...
                    </>
                  ) : (
                    <>
                      <Rocket className="w-5 h-5 mr-2" />
                      Submit Project
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center mt-8 pb-8">
          <p className="text-slate-400 text-sm">
            Demo mode active - Real Supabase integration ready for your credentials
          </p>
        </div>
      </div>
    </div>
  )
}