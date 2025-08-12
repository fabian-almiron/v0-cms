'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Globe, 
  Plus, 
  Settings, 
  Activity, 
  Bell, 
  User,
  Menu,
  X,
  BarChart3,
  Layout,
  Layers
} from 'lucide-react'
import { getNotifications, type Notification } from '@/lib/master-supabase'

export default function MasterLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    loadNotifications()
    // Set up polling for notifications every 30 seconds
    const interval = setInterval(loadNotifications, 30000)
    return () => clearInterval(interval)
  }, [])

  const loadNotifications = async () => {
    try {
      const notificationsData = await getNotifications(10, true) // Get unread notifications
      setNotifications(notificationsData)
      setUnreadCount(notificationsData.length)
    } catch (error) {
      console.error('Error loading notifications:', error)
    }
  }

  const navigation = [
    {
      name: 'Dashboard',
      href: '/master',
      icon: Layout,
      current: pathname === '/master'
    },
    {
      name: 'Create Website',
      href: '/master/create',
      icon: Plus,
      current: pathname === '/master/create'
    },
    {
      name: 'All Instances',
      href: '/master/instances',
      icon: Globe,
      current: pathname.startsWith('/master/instances')
    },
    {
      name: 'Templates',
      href: '/master/templates',
      icon: Layers,
      current: pathname.startsWith('/master/templates')
    },
    {
      name: 'Analytics',
      href: '/master/analytics',
      icon: BarChart3,
      current: pathname.startsWith('/master/analytics')
    },
    {
      name: 'Settings',
      href: '/master/settings',
      icon: Settings,
      current: pathname.startsWith('/master/settings')
    }
  ]

  return (
    <div className="min-h-screen bg-gray-950 flex">
      {/* Mobile menu backdrop */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-gray-900/95 backdrop-blur-xl shadow-2xl border-r border-gray-800/50 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:flex-shrink-0
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex items-center justify-between h-16 px-6 border-b border-gray-800/50">
          <div className="flex items-center">
            <div className="relative">
              <Globe className="h-8 w-8 text-blue-400" />
              <div className="absolute inset-0 h-8 w-8 bg-blue-400/20 rounded-full blur-md"></div>
            </div>
            <span className="ml-3 text-xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              TruKraft
            </span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="lg:hidden text-gray-400 hover:text-white hover:bg-gray-800"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <nav className="mt-6 px-3">
          <div className="space-y-2">
            {navigation.map((item) => {
              const Icon = item.icon
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`
                    group flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 relative overflow-hidden
                    ${item.current
                      ? 'bg-gradient-to-r from-blue-500/20 to-purple-500/20 text-white border border-blue-500/30 shadow-lg shadow-blue-500/10'
                      : 'text-gray-300 hover:bg-gray-800/50 hover:text-white border border-transparent hover:border-gray-700/50'
                    }
                  `}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {item.current && (
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 blur-xl"></div>
                  )}
                  <Icon
                    className={`
                      mr-3 h-5 w-5 flex-shrink-0 relative z-10
                      ${item.current ? 'text-blue-400' : 'text-gray-400 group-hover:text-blue-400'}
                    `}
                  />
                  <span className="relative z-10">{item.name}</span>
                  {item.current && (
                    <div className="absolute right-0 top-1/2 transform -translate-y-1/2 w-1 h-8 bg-gradient-to-b from-blue-400 to-purple-400 rounded-full"></div>
                  )}
                </Link>
              )
            })}
          </div>

          {/* Quick Stats */}
          <div className="mt-8 px-3">
            <h3 className="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">
              Quick Stats
            </h3>
            <div className="mt-4 space-y-3">
              <div className="flex items-center justify-between px-4 py-3 bg-gray-800/40 rounded-lg border border-gray-700/50">
                <span className="text-gray-300 text-sm">Active Sites</span>
                <Badge className="bg-green-500/20 text-green-400 border border-green-500/30 hover:bg-green-500/30">
                  --
                </Badge>
              </div>
              <div className="flex items-center justify-between px-4 py-3 bg-gray-800/40 rounded-lg border border-gray-700/50">
                <span className="text-gray-300 text-sm">This Month</span>
                <Badge className="bg-blue-500/20 text-blue-400 border border-blue-500/30 hover:bg-blue-500/30">
                  --
                </Badge>
              </div>
            </div>
          </div>

          {/* Recent Notifications */}
          {notifications.length > 0 && (
            <div className="mt-8 px-3">
              <h3 className="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Recent Alerts
              </h3>
              <div className="mt-4 space-y-2">
                {notifications.slice(0, 3).map((notification) => (
                  <div
                    key={notification.id}
                    className="px-4 py-3 text-xs bg-amber-500/10 border border-amber-500/30 rounded-lg backdrop-blur-sm"
                  >
                    <div className="font-medium text-amber-300">{notification.title}</div>
                    <div className="truncate text-amber-400/80 mt-1">{notification.message}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </nav>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top navigation */}
        <div className="sticky top-0 z-10 bg-gray-900/95 backdrop-blur-xl shadow-lg border-b border-gray-800/50">
          <div className="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
            <Button
              variant="ghost"
              size="sm"
              className="lg:hidden text-gray-400 hover:text-white hover:bg-gray-800"
              onClick={() => setIsMobileMenuOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </Button>

            <div className="flex items-center space-x-2 ml-auto">
              {/* Notifications */}
              <div className="relative">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="relative text-gray-400 hover:text-white hover:bg-gray-800 rounded-xl"
                >
                  <Bell className="h-5 w-5" />
                  {unreadCount > 0 && (
                    <div className="absolute -top-1 -right-1">
                      <Badge 
                        className="h-5 w-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center p-0 border-2 border-gray-900 animate-pulse"
                      >
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </Badge>
                    </div>
                  )}
                </Button>
              </div>

              {/* Activity */}
              <Button 
                variant="ghost" 
                size="sm"
                className="text-gray-400 hover:text-white hover:bg-gray-800 rounded-xl"
              >
                <Activity className="h-5 w-5" />
              </Button>

              {/* User */}
              <Button 
                variant="ghost" 
                size="sm"
                className="text-gray-400 hover:text-white hover:bg-gray-800 rounded-xl"
              >
                <User className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="flex-1 overflow-auto bg-gray-950">
          <div className="min-h-full bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
} 