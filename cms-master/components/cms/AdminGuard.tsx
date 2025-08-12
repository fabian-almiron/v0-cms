'use client'

import { useState, useEffect } from 'react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Shield, Lock, CheckCircle } from 'lucide-react'

interface AdminGuardProps {
  children: React.ReactNode
  fallback?: React.ReactNode
}

// Simple admin check - in production, this should connect to your auth system
const checkAdminAccess = (): boolean => {
  // For now, check if service role key is configured (indicates admin setup)
  // In production, replace with proper authentication
  const hasServiceKey = typeof window !== 'undefined' && 
    localStorage.getItem('admin_authenticated') === 'true'
  
  // Check if we're in development mode (Next.js client-side compatible)
  const isDevelopment = typeof window !== 'undefined' && 
    (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
  
  return hasServiceKey || isDevelopment
}

export default function AdminGuard({ children, fallback }: AdminGuardProps) {
  const [isAdmin, setIsAdmin] = useState(false)
  const [isChecking, setIsChecking] = useState(true)
  const [adminCode, setAdminCode] = useState('')
  const [showAuthForm, setShowAuthForm] = useState(false)

  useEffect(() => {
    // Check admin access on mount
    const hasAccess = checkAdminAccess()
    setIsAdmin(hasAccess)
    setIsChecking(false)
    
    if (!hasAccess) {
      setShowAuthForm(true)
    }
  }, [])

  const handleAdminAuth = () => {
    // Simple admin code check - replace with real authentication
    const validCodes = ['admin123', 'sudo', 'superuser']
    
    if (validCodes.includes(adminCode.toLowerCase())) {
      localStorage.setItem('admin_authenticated', 'true')
      setIsAdmin(true)
      setShowAuthForm(false)
    } else {
      alert('Invalid admin code')
      setAdminCode('')
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('admin_authenticated')
    setIsAdmin(false)
    setShowAuthForm(true)
    setAdminCode('')
  }

  if (isChecking) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <Shield className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
          <p className="text-muted-foreground">Checking admin access...</p>
        </div>
      </div>
    )
  }

  if (!isAdmin) {
    if (fallback) {
      return <>{fallback}</>
    }

    return (
      <div className="space-y-4">
        <Alert>
          <Lock className="h-4 w-4" />
          <AlertDescription>
            This section requires administrator privileges. Please authenticate to continue.
          </AlertDescription>
        </Alert>

        {showAuthForm && (
          <div className="max-w-md mx-auto space-y-4 p-6 border rounded-lg">
            <div className="text-center">
              <Shield className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
              <h3 className="font-semibold">Admin Authentication</h3>
              <p className="text-sm text-muted-foreground">
                Enter admin code to access system settings
              </p>
            </div>
            
            <div className="space-y-2">
              <Input
                type="password"
                placeholder="Enter admin code"
                value={adminCode}
                onChange={(e) => setAdminCode(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleAdminAuth()
                  }
                }}
              />
              <Button onClick={handleAdminAuth} className="w-full">
                Authenticate
              </Button>
            </div>

            <div className="text-xs text-muted-foreground text-center">
              <p>Development codes: admin123, sudo, superuser</p>
              <p className="mt-1">⚠️ Replace with proper auth in production</p>
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <div>
      {/* Admin Status Indicator */}
      <div className="flex items-center justify-between mb-4 p-2 bg-green-50 dark:bg-green-950 rounded-lg border border-green-200 dark:border-green-800">
        <div className="flex items-center gap-2">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <span className="text-sm font-medium text-green-900 dark:text-green-100">
            Admin Access Active
          </span>
        </div>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={handleLogout}
          className="text-green-700 hover:text-green-900 dark:text-green-300"
        >
          Logout
        </Button>
      </div>
      
      {children}
    </div>
  )
}

// Hook for checking admin status in other components
export function useAdminAccess() {
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    const hasAccess = checkAdminAccess()
    setIsAdmin(hasAccess)
  }, [])

  return isAdmin
} 