import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  FileText, 
  Palette, 
  BarChart3, 
  Users, 
  TrendingUp,
  Eye,
  Edit,
  Plus
} from 'lucide-react'

export default function AdminDashboard() {
  // Mock data - replace with real data from Supabase
  const stats = [
    {
      title: 'Total Pages',
      value: '12',
      change: '+2 this week',
      icon: FileText,
      color: 'text-blue-600'
    },
    {
      title: 'Published Pages',
      value: '8',
      change: '+1 this week',
      icon: Eye,
      color: 'text-green-600'
    },
    {
      title: 'Draft Pages',
      value: '4',
      change: 'unchanged',
      icon: Edit,
      color: 'text-yellow-600'
    },
    {
      title: 'Page Views',
      value: '2,453',
      change: '+12% this month',
      icon: TrendingUp,
      color: 'text-purple-600'
    }
  ]

  const recentPages = [
    { id: '1', title: 'Homepage', status: 'Published', updated: '2 hours ago' },
    { id: '2', title: 'About Us', status: 'Draft', updated: '1 day ago' },
    { id: '3', title: 'Contact', status: 'Published', updated: '3 days ago' },
    { id: '4', title: 'Services', status: 'Draft', updated: '1 week ago' },
  ]

  return (
    <div className="h-full overflow-y-auto">
      <div className="p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">Dashboard</h1>
            <p className="text-muted-foreground mt-1">
              Welcome back! Here's what's happening with your site.
            </p>
          </div>
          <Button asChild>
            <Link href="/admin/pages/new">
              <Plus className="h-4 w-4 mr-2" />
              New Page
            </Link>
          </Button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat) => {
            const Icon = stat.icon
            return (
              <Card key={stat.title}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    {stat.title}
                  </CardTitle>
                  <Icon className={`h-4 w-4 ${stat.color}`} />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stat.value}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {stat.change}
                  </p>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="h-5 w-5" />
                Quick Actions
              </CardTitle>
              <CardDescription>
                Common tasks to get you started
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button className="w-full justify-start" asChild>
                <Link href="/admin/builder">
                  <Palette className="h-4 w-4 mr-2" />
                  Open Page Builder
                </Link>
              </Button>
              <Button variant="outline" className="w-full justify-start" asChild>
                <Link href="/admin/pages">
                  <FileText className="h-4 w-4 mr-2" />
                  Manage Pages
                </Link>
              </Button>
              <Button variant="outline" className="w-full justify-start" asChild>
                <Link href="/" target="_blank">
                  <Eye className="h-4 w-4 mr-2" />
                  View Live Site
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Recent Pages
              </CardTitle>
              <CardDescription>
                Your most recently updated pages
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentPages.map((page) => (
                  <div key={page.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <div className="font-medium">{page.title}</div>
                      <div className="text-sm text-muted-foreground">
                        Updated {page.updated}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        page.status === 'Published' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {page.status}
                      </span>
                      <Button size="sm" variant="ghost" asChild>
                        <Link href={`/admin/builder?page=${page.id}`}>
                          <Edit className="h-4 w-4" />
                        </Link>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
} 