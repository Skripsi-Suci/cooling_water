import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import fs from 'fs'

const envContent = fs.readFileSync('.env.local', 'utf8')
const env = {}
envContent.split('\n').forEach(line => {
  const parts = line.split('=')
  if (parts.length >= 2) {
    const key = parts[0].trim()
    const val = parts.slice(1).join('=').trim()
    env[key] = val
  }
})

const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY)

async function run() {
  const email = `admin_temp_${Math.floor(Math.random() * 10000)}@pln.co.id`
  const password = 'password123'
  
  console.log("Signing up user:", email)
  const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: 'Temp Admin User'
      }
    }
  })

  if (signUpError) {
    console.error("Sign up error:", signUpError.message)
    return
  }

  const user = signUpData.user
  console.log("User registered with ID:", user.id)

  // Try to sign in to get active session
  console.log("Signing in...")
  const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
    email,
    password
  })

  if (signInError) {
    console.error("Sign in error:", signInError.message)
    return
  }

  console.log("Sign in success. Session active.")

  // Try to update the role to 'admin' in profiles table
  console.log("Updating role in profiles...")
  const { data: updateData, error: updateError } = await supabase
    .from('profiles')
    .update({ role: 'admin', full_name: 'Temp Admin User' })
    .eq('id', user.id)
    .select()

  if (updateError) {
    console.error("Update profile error:", updateError.message)
  } else {
    console.log("Profile updated successfully:", updateData)
    console.log(`USE THESE CREDENTIALS TO LOG IN:`)
    console.log(`Email: ${email}`)
    console.log(`Password: ${password}`)
  }
}

run()
