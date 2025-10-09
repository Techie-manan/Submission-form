import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Demo mode check
const isDemoMode = supabaseUrl?.includes('demo') || supabaseAnonKey?.includes('demo')

let supabaseClient = null

if (!isDemoMode && supabaseUrl && supabaseAnonKey) {
  supabaseClient = createClient(supabaseUrl, supabaseAnonKey)
}

export const supabase = supabaseClient

// Mock data for demo mode
const mockSubmissions = []

export const submitHackathonForm = async (formData) => {
  if (isDemoMode || !supabase) {
    // Demo mode - simulate API delay and return mock success
    await new Promise(resolve => setTimeout(resolve, 1000))
    const newSubmission = {
      id: `demo_${Date.now()}`,
      ...formData,
      createdAt: new Date().toISOString()
    }
    mockSubmissions.push(newSubmission)
    console.log('Demo submission saved:', newSubmission)
    return { success: true, data: newSubmission }
  }

  try {
    const { data, error } = await supabase
      .from('hackathon_submissions')
      .insert([{
        id: `submission_${Date.now()}`,
        team_name: formData.teamName,
        team_lead_name: formData.teamLeadName,
        email: formData.email,
        contact: formData.contact,
        git_link: formData.gitLink,
        project_url: formData.projectUrl,
        other_details: formData.otherDetails,
        created_at: new Date().toISOString()
      }])
      .select()
      .single()

    if (error) {
      throw error
    }

    return { success: true, data }
  } catch (error) {
    console.error('Supabase submission error:', error)
    return { success: false, error: error.message }
  }
}

export const getSubmissions = async () => {
  if (isDemoMode || !supabase) {
    return { success: true, data: mockSubmissions }
  }

  try {
    const { data, error } = await supabase
      .from('hackathon_submissions')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      throw error
    }

    return { success: true, data: data || [] }
  } catch (error) {
    console.error('Supabase fetch error:', error)
    return { success: false, error: error.message }
  }
}