import { NextResponse } from 'next/server'
import { submitHackathonForm, getSubmissions } from '../../../lib/supabase.js'

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
      const { teamName, teamLeadName, email, contact } = body
      
      if (!teamName || !teamLeadName || !email || !contact) {
        return NextResponse.json({ 
          error: 'Missing required fields: teamName, teamLeadName, email, contact' 
        }, { status: 400 })
      }
      
      const result = await submitHackathonForm(body)
      
      if (!result.success) {
        return NextResponse.json({ error: result.error }, { status: 500 })
      }
      
      return NextResponse.json({ 
        success: true, 
        message: 'Hackathon submission successful!',
        data: result.data 
      })
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