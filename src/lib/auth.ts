import { queryClient } from './queryClient'
import { supabase } from './supabase'

export const LOGIN_ERROR_MESSAGE = 'Email or password are incorrect.'
const UNEXPECTED_ERROR_MESSAGE = 'Something went wrong. Please try again.'

export const MIN_SIGNUP_PASSWORD_LENGTH = 8
export const MAX_SIGNUP_PASSWORD_LENGTH = 64
export const SIGNUP_ALREADY_IN_USE_MESSAGE = 'Email or username are already in use.'
const SIGNUP_UNEXPECTED_ERROR_MESSAGE = 'Something went wrong creating your account. Please try again.'

export async function signInWithPassword(email: string, password: string): Promise<void> {
  const { error } = await supabase.auth.signInWithPassword({ email, password })

  if (error) {
    if (error.code === 'invalid_credentials') {
      throw new Error(LOGIN_ERROR_MESSAGE)
    }
    throw new Error(UNEXPECTED_ERROR_MESSAGE)
  }
}

export async function signUp(
  email: string,
  username: string,
  password: string,
): Promise<{ hasSession: boolean }> {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { username } },
  })

  if (error) {
    // GoTrue's own duplicate-email check is cleanly identifiable via
    // error.code. A duplicate username (or, in principle, a missing
    // username -- unreachable through this app's own form, which always
    // validates one first) is instead raised inside our handle_new_user
    // trigger, which GoTrue reports as a generic 500 with no error.code at
    // all -- the two trigger-side failures aren't distinguishable from each
    // other on the client, only from unrelated unexpected errors, by this
    // specific message text. Verified against the real local Auth API
    // rather than assumed.
    if (
      error.code === 'user_already_exists' ||
      error.message === 'Database error saving new user'
    ) {
      throw new Error(SIGNUP_ALREADY_IN_USE_MESSAGE)
    }
    throw new Error(SIGNUP_UNEXPECTED_ERROR_MESSAGE)
  }

  return { hasSession: data.session !== null }
}

export async function signOut(): Promise<void> {
  const { error } = await supabase.auth.signOut()

  if (error) {
    throw new Error(UNEXPECTED_ERROR_MESSAGE)
  }

  // Query cache keys (e.g. ['customDecks']) don't include the user id, so a
  // second user signing in on the same tab would otherwise briefly see the
  // previous user's cached data before the next fetch replaces it.
  queryClient.clear()
}
