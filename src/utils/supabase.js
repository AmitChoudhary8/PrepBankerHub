import { createClient } from '@supabase/supabase-js'

// Netlify Environment Variables se Supabase connect karna
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Supabase client banayenge
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Login karne ke liye
export const signIn = async (email, password) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: email,
    password: password
  })
  return { data, error }
}

// Signup karne ke liye  
export const signUp = async (email, password, fullName, mobileNumber, examType) => {
  const { data, error } = await supabase.auth.signUp({
    email: email,
    password: password,
    options: {
      data: {
        full_name: fullName,
        mobile_number: mobileNumber,
        exam_type: examType
      }
    }
  })
  return { data, error }
}

// Logout karne ke liye
export const signOut = async () => {
  const { error } = await supabase.auth.signOut()
  return { error }
}

// User ki details check karne ke liye
export const getCurrentUser = async () => {
  const { data, error } = await supabase.auth.getUser()
  return { data, error }
}

// Password reset karne ke liye
export const resetPassword = async (email) => {
  const { data, error } = await supabase.auth.resetPasswordForEmail(email)
  return { data, error }
}

export default supabase
