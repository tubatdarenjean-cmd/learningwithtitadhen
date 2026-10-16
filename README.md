# ♡ titadhen Academy — Supabase-connected starter

## What works
- Email/password sign up and login through Supabase
- Password recovery email initiation
- Per-account lesson completion, quiz pass flags, and assignment notes, protected with Row Level Security
- Existing editorial hot-pink-and-white website and Taglish teaching course

## Before public launch
1. Publish on GitHub Pages and configure the exact URL under Supabase Authentication > URL Configuration (Site URL and Redirect URLs).
2. Confirm email confirmation is enabled, test real registration and login. Set up custom SMTP for reliable production emails.
3. Test learning progress on two devices. Improve evaluation and signed-in-only access rules for a fully assessed course.
4. Add a privacy notice and compliant consent handling. The optional marketing checkbox is not yet a complete consent/nurture integration.
5. Implement verified, server-authorized course completion and a PRIVATE Storage bucket with short-lived signed URL delivery for the bonus. The prompt document is intentionally NOT inside this public static package.
6. Test the password recovery email redirect and password-update screen after you configure the published URL.

Do not commit service-role keys or passwords to GitHub. This website contains only a Supabase public publishable key.
