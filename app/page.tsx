'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Globe, ArrowRight, Zap, Shield, BarChart3 } from 'lucide-react'
import Link from 'next/link'

export default function HomePage() {
  const router = useRouter()

  // Auto-redirect to master dashboard after a brief display
  useEffect(() => {
    const timer = setTimeout(() => {
      router.push('/master')
    }, 3000) // Redirect after 3 seconds

    return () => clearTimeout(timer)
  }, [router])

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        {/* Main Card */}
        <Card className="bg-gray-900/50 backdrop-blur-xl border-gray-800/50 shadow-2xl">
          <CardHeader className="text-center pb-8">
            <div className="mx-auto flex items-center justify-center w-20 h-20 bg-blue-500/20 rounded-full mb-6 relative">
              <Globe className="h-10 w-10 text-blue-400" />
              <div className="absolute inset-0 bg-blue-400/20 rounded-full blur-md animate-pulse"></div>
            </div>
            <CardTitle className="text-4xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent mb-4">
              Master Dashboard
            </CardTitle>
            <CardDescription className="text-xl text-gray-300 max-w-2xl mx-auto">
              Deploy and manage unlimited CMS instances from one powerful control center. 
              Create websites with one click, monitor performance, and scale effortlessly.
            </CardDescription>
          </CardHeader>
          
          <CardContent className="pb-8">
            {/* Features Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="text-center p-6 bg-gray-800/30 rounded-xl border border-gray-700/50">
                <div className="mx-auto w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center mb-4">
                  <Zap className="h-6 w-6 text-blue-400" />
                </div>
                <h3 className="font-semibold text-white mb-2">One-Click Deploy</h3>
                <p className="text-gray-400 text-sm">
                  Create complete CMS instances with automatic Vercel deployment and database setup
                </p>
              </div>
              
              <div className="text-center p-6 bg-gray-800/30 rounded-xl border border-gray-700/50">
                <div className="mx-auto w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center mb-4">
                  <BarChart3 className="h-6 w-6 text-purple-400" />
                </div>
                <h3 className="font-semibold text-white mb-2">Monitor & Manage</h3>
                <p className="text-gray-400 text-sm">
                  Track performance, manage deployments, and monitor all your sites from one dashboard
                </p>
              </div>
              
              <div className="text-center p-6 bg-gray-800/30 rounded-xl border border-gray-700/50">
                <div className="mx-auto w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center mb-4">
                  <Shield className="h-6 w-6 text-green-400" />
                </div>
                <h3 className="font-semibold text-white mb-2">Secure & Scalable</h3>
                <p className="text-gray-400 text-sm">
                  Multi-tenant architecture with automatic security, backups, and unlimited scaling
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link href="/master">
                <Button 
                  size="lg" 
                  className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white border-0 text-lg px-8 py-3 shadow-lg shadow-blue-500/25"
                >
                  Go to Master Dashboard
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              
              <Link href="/master/create">
                <Button 
                  variant="outline" 
                  size="lg"
                  className="border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white text-lg px-8 py-3"
                >
                  Create First Website
                </Button>
              </Link>
            </div>

            {/* Auto-redirect notice */}
            <div className="text-center mt-8">
              <p className="text-gray-500 text-sm">
                Redirecting to Master Dashboard in a few seconds...
              </p>
              <div className="w-64 h-1 bg-gray-800 rounded-full mx-auto mt-2 overflow-hidden">
                <div className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full animate-pulse"></div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <div className="mt-8 text-center">
          <p className="text-gray-500 text-sm mb-4">
            Perfect for agencies, developers, and entrepreneurs
          </p>
          <div className="flex justify-center space-x-8 text-center">
            <div>
              <div className="text-2xl font-bold text-white">∞</div>
              <div className="text-gray-400 text-sm">Websites</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-white">1</div>
              <div className="text-gray-400 text-sm">Dashboard</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-white">0</div>
              <div className="text-gray-400 text-sm">Hassle</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}