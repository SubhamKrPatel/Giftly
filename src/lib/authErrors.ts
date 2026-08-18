/**
 * Converts raw Supabase / network errors into friendly messages.
 * Never exposes SQL, stack traces, or internal error details to the user.
 */
export function getAuthErrorMessage(error: unknown): string {
  if (!error) return 'Something went wrong. Please try again.'

  const msg =
    error instanceof Error
      ? error.message
      : typeof error === 'object' && error !== null && 'message' in error
        ? String((error as { message: unknown }).message)
        : String(error)

  const lower = msg.toLowerCase()

  // Credentials
  if (lower.includes('invalid login credentials') || lower.includes('invalid credentials')) {
    return 'Incorrect email or password. Please try again.'
  }
  if (lower.includes('email not confirmed')) {
    return 'Please verify your email address before signing in.'
  }
  if (lower.includes('user already registered') || lower.includes('already been registered')) {
    return 'An account with this email already exists. Try signing in instead.'
  }
  if (lower.includes('password should be at least')) {
    return 'Your password must be at least 6 characters long.'
  }
  if (lower.includes('weak password') || lower.includes('password is too weak')) {
    return 'Please choose a stronger password (at least 6 characters).'
  }
  if (lower.includes('unable to validate email address')) {
    return 'Please enter a valid email address.'
  }
  if (lower.includes('signup is disabled')) {
    return 'New signups are currently disabled. Please try again later.'
  }
  if (lower.includes('rate limit') || lower.includes('too many requests')) {
    return 'Too many attempts. Please wait a moment and try again.'
  }

  // Network / server
  if (lower.includes('fetch') || lower.includes('network') || lower.includes('failed to fetch')) {
    return 'Network error. Please check your connection and try again.'
  }

  // Generic fallback — intentionally vague to avoid leaking internals
  return 'Something went wrong. Please try again.'
}
