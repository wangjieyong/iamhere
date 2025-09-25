"use client"

import { useState, useRef, useEffect } from "react"
import { useSession, signOut } from "next-auth/react"
import { User, LogOut, Settings } from "lucide-react"
import { Button } from "./button"
import Link from "next/link"

export function UserAvatar() {
  const { data: session } = useSession()
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  if (!session?.user) {
    return (
      <Link href="/auth/signin">
        <Button variant="outline" size="sm">
          登录
        </Button>
      </Link>
    )
  }

  const handleSignOut = async () => {
    await signOut({ callbackUrl: "/" })
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 p-2 rounded-lg hover:bg-accent transition-colors"
      >
        {session.user.image ? (
          <img
            src={session.user.image}
            alt={session.user.name || "User"}
            className="w-8 h-8 rounded-full"
          />
        ) : (
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
            <User className="w-4 h-4 text-primary" />
          </div>
        )}
        <span className="text-sm font-medium hidden sm:block">
          {session.user.name || "用户"}
        </span>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-background border border-border rounded-lg shadow-lg z-50">
          <div className="p-3 border-b border-border">
            <div className="flex items-center space-x-3">
              {session.user.image ? (
                <img
                  src={session.user.image}
                  alt={session.user.name || "User"}
                  className="w-10 h-10 rounded-full"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <User className="w-5 h-5 text-primary" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">
                  {session.user.name || "用户"}
                </p>
                {session.user.email && (
                  <p className="text-xs text-muted-foreground truncate">
                    {session.user.email}
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="p-1">
            <Link
              href="/gallery"
              className="flex items-center space-x-3 px-3 py-2 text-sm rounded-md hover:bg-accent transition-colors w-full"
              onClick={() => setIsOpen(false)}
            >
              <User className="w-4 h-4" />
              <span>我的图库</span>
            </Link>
            
            <Link
              href="/settings"
              className="flex items-center space-x-3 px-3 py-2 text-sm rounded-md hover:bg-accent transition-colors w-full"
              onClick={() => setIsOpen(false)}
            >
              <Settings className="w-4 h-4" />
              <span>账户设置</span>
            </Link>
            
            <button
              onClick={handleSignOut}
              className="flex items-center space-x-3 px-3 py-2 text-sm rounded-md hover:bg-accent transition-colors w-full text-left"
            >
              <LogOut className="w-4 h-4" />
              <span>退出登录</span>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}