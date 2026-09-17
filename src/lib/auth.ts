import { supabase } from './supabase'

export const LOGIN_ERROR_MESSAGE = 'Email or password are incorrect.'
const UNEXPECTED_ERROR_MESSAGE = 'Something went wrong. Please try again.'

export async function signInWithPassword(email: string, password: string): Promise<void> {
  const { error } = await supabase.auth.signInWithPassword({ email, password })

  if (error) {
    if (error.code === 'invalid_credentials') {
      throw new Error(LOGIN_ERROR_MESSAGE)
    }
    throw new Error(UNEXPECTED_ERROR_MESSAGE)
  }
}

export async function signOut(): Promise<void> {
  const { error } = await supabase.auth.signOut()

  if (error) {
    throw new Error(UNEXPECTED_ERROR_MESSAGE)
  }
}
