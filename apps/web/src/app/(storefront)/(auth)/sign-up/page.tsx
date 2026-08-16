import type { Metadata } from 'next'
import SignUpForm from './SignUpForm'

export const metadata: Metadata = { title: 'Create your B2B account' }

export default function SignUpPage() {
  return (
    <main className="py-12 px-6">
      <div className="max-w-[880px] mx-auto">
        <p className="font-mono text-[11px] tracking-[0.14em] text-ih-muted uppercase mb-1.5">
          B2B Account · 2 min setup
        </p>
        <h1 className="text-[36px] font-semibold tracking-tight mb-1.5">Create your B2B account</h1>
        <p className="text-ih-muted mb-8 max-w-xl">
          Verified company accounts get tier-pricing, contract terms, datasheet vault access, and a named sales engineer.
        </p>

        <SignUpForm />

        <p className="mt-4 text-[13px] text-ih-muted text-center">
          Already have an account?{' '}
          <a href={`/sign-in`} className="text-ih-accent font-medium hover:underline">
            Sign in →
          </a>
        </p>
      </div>
    </main>
  )
}
