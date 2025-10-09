import { NextResponse } from 'next/server'
import { submitHackathonForm, getSubmissions, uploadFile } from '../../../lib/supabase.js'

export async function GET(request) {
  try {
    const { pathname } = new URL(request.url)
    
    if (pathname.includes('/submissions')) {
      const result = await getSubmissions()
      
      if (!result.success) {
        return NextResponse.json({ error: result.error }, { status: 500 })
      }
      
      return NextResponse.json(result.data)
    }

    // Health check endpoint
    if (pathname.includes('/health')) {
      return NextResponse.json({ 
        status: 'ok', 
        timestamp: new Date().toISOString(),
        mode: process.env.NEXT_PUBLIC_SUPABASE_URL?.includes('demo') ? 'demo' : 'production'
      })
    }

    return NextResponse.json({ error: 'Endpoint not found' }, { status: 404 })
  } catch (error) {
    console.error('API GET Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    const { pathname } = new URL(request.url)
    
    if (pathname.includes('/submit')) {
      const body = await request.json()
      
      // Validate required fields
      const { teamName, teamLeadName, teamLeadEmail, teamLeadContact, projectTitle, projectDescription } = body
      
      if (!teamName || !teamLeadName || !teamLeadEmail || !teamLeadContact || !projectTitle || !projectDescription) {
        return NextResponse.json({ 
          error: 'Missing required fields: teamName, teamLeadName, teamLeadEmail, teamLeadContact, projectTitle, projectDescription' 
        }, { status: 400 })
      }

      // Validate project description word count (max 100 words)
      const wordCount = projectDescription.trim().split(/\s+/).length
      if (wordCount > 100) {
        return NextResponse.json({ 
          error: `Project description must be 100 words or less. Current: ${wordCount} words.` 
        }, { status: 400 })
      }
      
      const result = await submitHackathonForm(body)
      
      if (!result.success) {
        return NextResponse.json({ error: result.error }, { status: 500 })
      }
      
      return NextResponse.json({ 
        success: true, 
        message: 'Hackathon submission successful! 🎉',
        data: result.data 
      })
    }

    if (pathname.includes('/upload')) {
      try {
        const formData = await request.formData()
        const file = formData.get('file')
        const folder = formData.get('folder') || 'uploads'

        if (!file) {
          return NextResponse.json({ error: 'No file provided' }, { status: 400 })
        }

        // Validate file type for images
        if (!file.type.startsWith('image/')) {
          return NextResponse.json({ error: 'Only image files are allowed' }, { status: 400 })
        }

        // Validate file size (max 5MB)
        const maxSize = 5 * 1024 * 1024 // 5MB
        if (file.size > maxSize) {
          return NextResponse.json({ error: 'File size must be less than 5MB' }, { status: 400 })
        }

        const result = await uploadFile(file, folder)
        
        if (!result.success) {
          return NextResponse.json({ error: result.error }, { status: 500 })
        }

        return NextResponse.json({ 
          success: true, 
          url: result.url,
          message: 'File uploaded successfully'
        })
      } catch (uploadError) {
        console.error('Upload error:', uploadError)
        return NextResponse.json({ error: 'File upload failed' }, { status: 500 })
      }
    }

    return NextResponse.json({ error: 'Endpoint not found' }, { status: 404 })
  } catch (error) {
    console.error('API POST Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function OPTIONS(request) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  })
}