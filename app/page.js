'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertCircle, CheckCircle2, Rocket, Users, Code2, ExternalLink, Mail, Phone, FileImage, Video, Upload, X } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'

export default function HackathonForm() {
  const [formData, setFormData] = useState({
    teamName: '',
    teamLeadName: '',
    teamLeadEmail: '',
    teamLeadContact: '',
    projectTitle: '',
    projectDescription: '',
    gitLink: '',
    projectUrl: '',
    projectLogoUrl: '',
    projectBannerUrl: '',
    videoDemoLink: ''
  })

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState(null)
  const [submitMessage, setSubmitMessage] = useState('')
  const [wordCount, setWordCount] = useState(0)
  const [uploadingFiles, setUploadingFiles] = useState({
    logo: false,
    banner: false
  })

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))

    // Update word count for project description
    if (name === 'projectDescription') {
      const words = value.trim().split(/\s+/).filter(word => word.length > 0)
      setWordCount(words.length)
    }
  }

  const handleFileUpload = async (file, type) => {
    if (!file) return

    // Validate image dimensions for logo and banner
    const img = new Image()
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')

    return new Promise((resolve) => {
      img.onload = async () => {
        let targetWidth, targetHeight, expectedRatio

        if (type === 'logo') {
          targetWidth = targetHeight = 100
          expectedRatio = 1 // Square
        } else if (type === 'banner') {
          targetWidth = 300
          targetHeight = 100
          expectedRatio = 3 // 3:1 ratio
        }

        // Resize image to target dimensions
        canvas.width = targetWidth
        canvas.height = targetHeight
        ctx.drawImage(img, 0, 0, targetWidth, targetHeight)

        canvas.toBlob(async (blob) => {
          setUploadingFiles(prev => ({ ...prev, [type]: true }))

          try {
            const formData = new FormData()
            const resizedFile = new File([blob], file.name, { type: file.type })
            formData.append('file', resizedFile)
            formData.append('folder', type === 'logo' ? 'logos' : 'banners')

            const response = await fetch('/api/upload', {
              method: 'POST',
              body: formData
            })

            const result = await response.json()

            if (response.ok) {
              setFormData(prev => ({
                ...prev,
                [type === 'logo' ? 'projectLogoUrl' : 'projectBannerUrl']: result.url
              }))
              resolve({ success: true, url: result.url })
            } else {
              resolve({ success: false, error: result.error })
            }
          } catch (error) {
            resolve({ success: false, error: 'Upload failed' })
          } finally {
            setUploadingFiles(prev => ({ ...prev, [type]: false }))
          }
        }, file.type, 0.9)
      }

      img.src = URL.createObjectURL(file)
    })
  }

  const removeUploadedFile = (type) => {
    setFormData(prev => ({
      ...prev,
      [type === 'logo' ? 'projectLogoUrl' : 'projectBannerUrl']: ''
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
        setSubmitMessage('Your hackathon project has been submitted successfully!')
        // Reset form
        setFormData({
          teamName: '',
          teamLeadName: '',
          teamLeadEmail: '',
          teamLeadContact: '',
          projectTitle: '',
          projectDescription: '',
          gitLink: '',
          projectUrl: '',
          projectLogoUrl: '',
          projectBannerUrl: '',
          videoDemoLink: ''
        })
        setWordCount(0)
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
    <div className="min-h-screen bg-gradient-to-br from-violet-900 via-violet-700 to-violet-900 p-4">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      <div className="relative z-10 container mx-auto max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8 pt-8">
          <div className="flex items-center justify-center gap-4 mb-4">
            
              {/* <Rocket className="w-8 h-8 text-blue-400" /> */}
              <img src="/genesis.png" alt="Rocket Icon" className="h-12" />
              <h1 className='font-bold text-xl'>X</h1>
              <img src="/duality.png" alt="Gengite Logo" className="h-12" />
           
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 tracking-tight">
            Duality Hackathon
            <span className="block text-violet-200 mt-2">PPT Submission Portal</span>
          </h1>
          <p className="text-slate-300 text-lg max-w-2xl mx-auto">
            Submit your innovative project PPT and compete with the best minds.
            Share your creation and let your code speak for itself.
          </p>
        </div>

        {/* Form Card */}
        <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700/50 shadow-2xl">
          <CardHeader className="border-b border-slate-700/50">
            <CardTitle className="text-2xl text-white flex items-center gap-2">
              {/* <Code2 className="w-6 h-6 text-blue-400" /> */}
              Project Details
            </CardTitle>
          </CardHeader>
          <CardContent className="">
            {/* Status Alert */}
            {submitStatus && (
              <Alert className={`mb-6 ${submitStatus === 'success'
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
                  <Label htmlFor="teamLeadName" className="text-slate-200 font-medium flex items-center gap-2">
                    <Users className="w-4 h-4 text-blue-400" />

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

              {/* Team Lead Contact Information */}
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="teamLeadEmail" className="text-slate-200 font-medium flex items-center gap-2">
                    <Mail className="w-4 h-4 text-blue-400" />
                    Team Lead Email *
                  </Label>
                  <Input
                    id="teamLeadEmail"
                    name="teamLeadEmail"
                    type="email"
                    value={formData.teamLeadEmail}
                    onChange={handleInputChange}
                    placeholder="lead@example.com"
                    className="bg-slate-900/50 border-slate-600 text-white placeholder:text-slate-400 focus:border-blue-500 focus:ring-blue-500/20"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="teamLeadContact" className="text-slate-200 font-medium flex items-center gap-2">
                    <Phone className="w-4 h-4 text-blue-400" />
                    Team Lead Contact *
                  </Label>
                  <Input
                    id="teamLeadContact"
                    name="teamLeadContact"
                    value={formData.teamLeadContact}
                    onChange={handleInputChange}
                    placeholder="+1 (555) 123-4567"
                    className="bg-slate-900/50 border-slate-600 text-white placeholder:text-slate-400 focus:border-blue-500 focus:ring-blue-500/20"
                    required
                  />
                </div>
              </div>

              {/* Project Information */}
              <div className="space-y-2">
                <Label htmlFor="projectTitle" className="text-slate-200 font-medium flex items-center gap-2">
                  <Rocket className="w-4 h-4 text-blue-400" />
                  Project Title *
                </Label>
                <Input
                  id="projectTitle"
                  name="projectTitle"
                  value={formData.projectTitle}
                  onChange={handleInputChange}
                  placeholder="Enter your project title"
                  className="bg-slate-900/50 border-slate-600 text-white placeholder:text-slate-400 focus:border-blue-500 focus:ring-blue-500/20"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="projectDescription" className="text-slate-200 font-medium flex items-center justify-between">
                  <span>Project Description (Max 100 words) *</span>
                  <span className={`text-sm ${wordCount > 100 ? 'text-red-400' : 'text-slate-400'}`}>
                    {wordCount}/100 words
                  </span>
                </Label>
                <Textarea
                  id="projectDescription"
                  name="projectDescription"
                  value={formData.projectDescription}
                  onChange={handleInputChange}
                  placeholder="Describe your project in 100 words or less..."
                  rows={4}
                  className={`bg-slate-900/50 border-slate-600 text-white placeholder:text-slate-400 focus:border-blue-500 focus:ring-blue-500/20 resize-none ${wordCount > 100 ? 'border-red-500' : ''
                    }`}
                  required  
                />
                {wordCount > 100 && (
                  <p className="text-red-400 text-sm">Please reduce to 100 words or less</p>
                )}
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

                {/* <div className="space-y-2">
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
                </div> */}
              </div>

              {/* Video Demo Link */}
              <div className="space-y-2">
                <Label htmlFor="videoDemoLink" className="text-slate-200 font-medium flex items-center gap-2">
                  <Video className="w-4 h-4 text-blue-400" />
                  Drive Link to Project PPT *
                </Label>
                <Input
                  id="videoDemoLink"
                  name="videoDemoLink"
                  value={formData.videoDemoLink}
                  onChange={handleInputChange}
                  placeholder="https://drive.google.com/file/..."
                  className="bg-slate-900/50 border-slate-600 text-white placeholder:text-slate-400 focus:border-blue-500 focus:ring-blue-500/20"
                />
              </div>

              {/* File Uploads */}
              {/* <div className="grid md:grid-cols-2 gap-6"> */}
                {/* Project Logo Upload */}
                {/* <div className="space-y-2">
                  <Label className="text-slate-200 font-medium flex items-center gap-2">
                    <FileImage className="w-4 h-4 text-blue-400" />
                    Project Logo (100x100px) *
                  </Label>
                  <div className="space-y-3">
                    {!formData.projectLogoUrl ? (
                      <div className="border-2 border-dashed border-slate-600 rounded-lg p-4 text-center">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleFileUpload(e.target.files[0], 'logo')}
                          className="hidden"
                          id="logo-upload"
                          disabled={uploadingFiles.logo}
                        required/>
                        <label
                          htmlFor="logo-upload"
                          className={`cursor-pointer flex flex-col items-center gap-2 ${uploadingFiles.logo ? 'opacity-50' : 'hover:text-blue-400'
                            }`}
                        >
                          <Upload className="w-8 h-8 text-slate-400" />
                          <span className="text-sm text-slate-400">
                            {uploadingFiles.logo ? 'Uploading...' : 'Click to upload logo'}
                          </span>
                        </label>
                      </div>
                    ) : (
                      <div className="relative border border-slate-600 rounded-lg p-2 bg-slate-900/50">
                        <img
                          src={formData.projectLogoUrl}
                          alt="Project Logo"
                          className="w-20 h-20 object-cover rounded mx-auto"
                        />
                        <button
                          type="button"
                          onClick={() => removeUploadedFile('logo')}
                          className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                </div> */}

                {/* Project Banner Upload */}
                {/* <div className="space-y-2">
                  <Label className="text-slate-200 font-medium flex items-center gap-2">
                    <FileImage className="w-4 h-4 text-blue-400" />
                    Project Banner (300x100px) *
                  </Label>
                  <div className="space-y-3">
                    {!formData.projectBannerUrl ? (
                      <div className="border-2 border-dashed border-slate-600 rounded-lg p-4 text-center">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleFileUpload(e.target.files[0], 'banner')}
                          className="hidden"
                          id="banner-upload"
                          disabled={uploadingFiles.banner}
                        required/>
                        <label
                          htmlFor="banner-upload"
                          className={`cursor-pointer flex flex-col items-center gap-2 ${uploadingFiles.banner ? 'opacity-50' : 'hover:text-blue-400'
                            }`}
                        >
                          <Upload className="w-8 h-8 text-slate-400" />
                          <span className="text-sm text-slate-400">
                            {uploadingFiles.banner ? 'Uploading...' : 'Click to upload banner'}
                          </span>
                        </label>
                      </div>
                    ) : (
                      <div className="relative border border-slate-600 rounded-lg p-2 bg-slate-900/50">
                        <img
                          src={formData.projectBannerUrl}
                          alt="Project Banner"
                          className="w-full h-20 object-cover rounded"
                        />
                        <button
                          type="button"
                          onClick={() => removeUploadedFile('banner')}
                          className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                </div> */}
              {/* </div> */}

              {/* Submit Button */}
              <div className="pt-4">
                <Button
                  type="submit"
                  disabled={isSubmitting || wordCount > 100 || uploadingFiles.logo || uploadingFiles.banner}
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium py-3 px-6 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2" />
                      Submitting Project...
                    </>
                  ) : (
                    <>
                      {/* <Rocket className="w-5 h-5 mr-2" /> */}
                      Submit Project
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Footer */}
        {/* <div className="text-center mt-8 pb-8">
          <p className="text-slate-400 text-sm">
            Demo mode active - Real Supabase integration ready for your credentials
          </p>
        </div> */}
      </div>
    </div>
  )
}