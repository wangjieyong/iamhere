"use client"

import { signIn, getSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Camera } from "lucide-react"
import Link from "next/link"

export default function SignIn() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

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
      const result = await signIn("google", {
        callbackUrl: "/create",
        redirect: false,
      })
      
      if (result?.ok) {
        router.push("/create")
      } else {
        console.error("Sign in failed:", result?.error)
      }
    } catch (error) {
      console.error("Sign in error:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDevSkip = async () => {
    // For development only - skip authentication
    if (true) {
      setIsLoading(true)
      try {
        const result = await signIn("dev-skip", {
          callbackUrl: "/create",
          redirect: false,
        })
        
        if (result?.ok) {
          router.push("/create")
        } else {
          console.error("Dev skip failed:", result?.error)
        }
      } catch (error) {
        console.error("Dev skip error:", error)
      } finally {
        setIsLoading(false)
      }
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center space-x-2 mb-6">
            <Camera className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold">IAmHere</span>
          </Link>
          <h1 className="text-2xl font-semibold mb-2">欢迎回来</h1>
          <p className="text-muted-foreground">
            登录开始你的AI旅行之旅
          </p>
        </div>

        {/* Sign In Form */}
        <div className="space-y-4">
          <Button
            onClick={handleGoogleSignIn}
            disabled={isLoading}
            className="w-full h-12 text-base"
            variant="outline"
          >
            {isLoading ? (
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                <span>登录中...</span>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="currentColor"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                <span>使用 Google 登录</span>
              </div>
            )}
          </Button>

          {/* Development Skip Button - Only shown in development */}
          {true && (
            <Button
              onClick={handleDevSkip}
              disabled={isLoading}
              className="w-full h-12 text-base"
              variant="secondary"
            >
              {isLoading ? (
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  <span>跳过中...</span>
                </div>
              ) : (
                <div className="flex items-center space-x-3">
                  <span>🚀</span>
                  <span>开发模式 - 跳过登录</span>
                </div>
              )}
            </Button>
          )}

          {/* Note: Apple Sign In will be added when credentials are configured */}
          <div className="text-center text-sm text-muted-foreground">
            Apple 登录即将推出
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-muted-foreground">
          <p>
            登录即表示您同意我们的{" "}
            <Link href="/terms" className="underline hover:text-foreground">
              服务条款
            </Link>{" "}
            和{" "}
            <Link href="/privacy" className="underline hover:text-foreground">
              隐私政策
            </Link>
          </p>
        </div>

        {/* Back to Home */}
        <div className="mt-6 text-center">
          <Link
            href="/"
            className="text-sm text-muted-foreground hover:text-foreground underline"
          >
            返回首页
          </Link>
        </div>
      </div>
    </div>
  )
}