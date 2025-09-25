"use client"

import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Camera, AlertCircle } from "lucide-react"
import { useTranslation } from "@/hooks/use-translation"

export default function AuthError() {
  const searchParams = useSearchParams()
  const error = searchParams.get("error")
  const { t } = useTranslation()

  const getErrorMessage = (error: string | null) => {
    switch (error) {
      case "Configuration":
        return "服务器配置错误，请联系管理员"
      case "AccessDenied":
        return "访问被拒绝，您可能没有权限访问此应用"
      case "Verification":
        return "验证失败，请重试"
      case "Callback":
        return "OAuth回调错误，请检查应用配置"
      case "OAuthSignin":
        return "OAuth登录错误，请重试"
      case "OAuthCallback":
        return "OAuth回调处理失败"
      case "OAuthCreateAccount":
        return "创建OAuth账户失败"
      case "EmailCreateAccount":
        return "创建邮箱账户失败"
      case "Signin":
        return "登录失败，请重试"
      case "SessionRequired":
        return "需要登录才能访问此页面"
      default:
        return "登录过程中发生未知错误，请重试"
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-md text-center">
        {/* Header */}
        <div className="mb-8">
          <Link href="/" className="inline-flex items-center space-x-2 mb-6">
            <Camera className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold">IAmHere</span>
          </Link>
          
          <div className="flex justify-center mb-4">
            <AlertCircle className="h-16 w-16 text-destructive" />
          </div>
          
          <h1 className="text-2xl font-semibold mb-2">登录失败</h1>
          <p className="text-muted-foreground mb-6">
            {getErrorMessage(error)}
          </p>
          
          {error && (
            <div className="bg-muted p-3 rounded-md mb-6">
              <p className="text-sm text-muted-foreground">
                错误代码: <code className="bg-background px-2 py-1 rounded">{error}</code>
              </p>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="space-y-4">
          <Button asChild className="w-full">
            <Link href="/auth/signin">重新登录</Link>
          </Button>
          
          <Button variant="outline" asChild className="w-full">
            <Link href="/">返回首页</Link>
          </Button>
        </div>

        {/* Help */}
        <div className="mt-8 text-sm text-muted-foreground">
          <p>
            如果问题持续存在，请{" "}
            <Link href="/contact" className="underline hover:text-foreground">
              联系我们
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}