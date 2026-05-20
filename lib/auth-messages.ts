export function getLoginErrorMessage(
  message?: string | null,
  status?: number | null
): string {
  if (!message) {
    return "Something went wrong. Please try again.";
  }

  const lower = message.toLowerCase();

  if (lower.includes("invalid api key")) {
    return "Sign-in is not configured correctly. Update NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local with the anon public key from Supabase (Project Settings → API), then restart the dev server.";
  }

  if (
    lower.includes("invalid login credentials") ||
    lower.includes("invalid email or password")
  ) {
    return "Incorrect email or password. Please check your details and try again.";
  }

  if (lower.includes("email not confirmed")) {
    return "Your email is not verified yet. Please check your inbox and confirm your account.";
  }

  if (
    lower.includes("too many requests") ||
    status === 429
  ) {
    return "Too many sign-in attempts. Please wait a few minutes and try again.";
  }

  if (
    lower.includes("network") ||
    lower.includes("fetch") ||
    lower.includes("failed to fetch")
  ) {
    return "We could not reach the server. Check your internet connection and try again.";
  }

  if (lower.includes("user not found")) {
    return "No account found with this email. Please contact your administrator.";
  }

  if (lower.includes("email") && lower.includes("invalid")) {
    return "Please enter a valid email address.";
  }

  return "Sign-in failed. Please try again or contact support if the problem continues.";
}

export function validateLoginForm(email: string, password: string): string | null {
  const trimmedEmail = email.trim();

  if (!trimmedEmail) {
    return "Please enter your email address.";
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
    return "Please enter a valid email address.";
  }

  if (!password) {
    return "Please enter your password.";
  }

  if (password.length < 6) {
    return "Password must be at least 6 characters.";
  }

  return null;
}
