"use client"

import { signIn, getSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Camera, Mail } from "lucide-react"
import Link from "next/link"
import { useTranslation } from "@/hooks/use-translation"

export default function SignIn() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [isTwitterLoading, setIsTwitterLoading] = useState(false)
  const [isEmailLoading, setIsEmailLoading] = useState(false)
  const [email, setEmail] = useState('')
  const [emailSent, setEmailSent] = useState(false)
  const { t } = useTranslation()

  useEffect(() => {
    // Check if user is already signed in
    getSession().then((session) => {
      if (session) {
        router.push("/create")
      }
    })
  }, [router])

  const handleGoogleSignIn = async () => {
    setIsLoading(true)
    try {
      await signIn("google", {
        callbackUrl: "/create",
        redirect: true,
      })
    } catch (error) {
      console.error("Sign in error:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleTwitterSignIn = async () => {
    setIsTwitterLoading(true)
    try {
      await signIn("twitter", {
        callbackUrl: "/create",
        redirect: true,
      })
    } catch (error) {
      console.error("Twitter sign in error:", error)
    } finally {
      setIsTwitterLoading(false)
    }
  }

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim()) return

    setIsEmailLoading(true)
    try {
      const result = await signIn("email", {
        email: email.trim(),
        callbackUrl: "/create",
        redirect: false,
      })
      
      if (result?.ok) {
        setEmailSent(true)
      } else {
        console.error("Email sign in error:", result?.error)
      }
    } catch (error) {
      console.error("Email sign in error:", error)
    } finally {
      setIsEmailLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8 bg-white rounded-xl shadow-lg p-8">
        {/* Header */}
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <div className="bg-blue-600 p-3 rounded-full">
              <Camera className="w-8 h-8 text-white" />
            </div>
          </div>
          <h2 className="text-3xl font-bold text-gray-900">{t('auth.welcomeBack')}</h2>
          <p className="mt-2 text-sm text-gray-600">
            {t('auth.signInDescription')}
          </p>
        </div>

        {/* OAuth Sign In Buttons */}
        <div className="space-y-4">
          {/* Google Sign In */}
          <Button
            onClick={handleGoogleSignIn}
            disabled={isLoading}
            className="w-full h-12 text-base bg-white hover:bg-gray-50 text-gray-900 border border-gray-300"
          >
            {isLoading ? (
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 border-2 border-gray-600 border-t-transparent rounded-full animate-spin" />
                <span>{t('auth.signingIn')}</span>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                <span>{t('auth.signInWithGoogle')}</span>
              </div>
            )}
          </Button>

          {/* Twitter Sign In */}
          <Button
            onClick={handleTwitterSignIn}
            disabled={isTwitterLoading}
            className="w-full h-12 text-base bg-[#1DA1F2] hover:bg-[#1A91DA] text-white border-0"
          >
            {isTwitterLoading ? (
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                <span>{t('auth.signingIn')}</span>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                </svg>
                <span>{t('auth.signInWithTwitter')}</span>
              </div>
            )}
          </Button>
        </div>

        {/* Divider */}
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">{t('auth.orContinueWith')}</span>
          </div>
        </div>

        {/* Email Sign In Form */}
        {!emailSent ? (
          <form onSubmit={handleEmailSignIn} className="space-y-4">
            <div>
              <div className="relative">
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t('auth.emailPlaceholder')}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center"
                  required
                  disabled={isEmailLoading}
                />
              </div>
            </div>
            <Button
              type="submit"
              disabled={isEmailLoading || !email.trim()}
              className="w-full h-12 text-base bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-300"
            >
              {isEmailLoading ? (
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  <span>{t('auth.sendingMagicLink')}</span>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <Mail className="w-5 h-5 text-gray-500" />
                  <span>{t('auth.sendMagicLink')}</span>
                </div>
              )}
            </Button>
          </form>
        ) : (
          <div className="text-center space-y-4 p-6 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex justify-center">
              <div className="bg-green-100 p-3 rounded-full">
                <Mail className="w-8 h-8 text-green-600" />
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-green-800">{t('auth.magicLinkSent')}</h3>
              <p className="text-sm text-green-600 mt-1">{t('auth.magicLinkSentDesc')}</p>
              <p className="text-sm text-gray-600 mt-2">{email}</p>
            </div>
            <Button
              onClick={() => {
                setEmailSent(false)
                setEmail('')
              }}
              variant="outline"
              className="text-sm"
            >
              {t('auth.resendLink')}
            </Button>
          </div>
        )}

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-muted-foreground">
          <p>
            {t('auth.agreementText')}{" "}
            <Link href="/terms" className="underline hover:text-foreground">
              {t('auth.termsOfService')}
            </Link>{" "}
            {t('auth.and')}{" "}
            <Link href="/privacy" className="underline hover:text-foreground">
              {t('auth.privacyPolicy')}
            </Link>
          </p>
        </div>

        {/* Back to Home */}
        <div className="mt-6 text-center">
          <Link
            href="/"
            className="text-sm text-muted-foreground hover:text-foreground underline"
          >
            {t('auth.backToHome')}
          </Link>
        </div>
      </div>
    </div>
  )
}