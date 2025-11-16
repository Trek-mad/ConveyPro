import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'ConveyPro - Authentication',
  description: 'Sign in or sign up to ConveyPro',
}

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
