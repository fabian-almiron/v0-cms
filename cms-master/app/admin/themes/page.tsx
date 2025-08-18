'use client'

import ThemeManager from '@/components/cms/ThemeManager'
import { Palette } from 'lucide-react'

export default function ThemesPage() {
  return (
    <div className="h-full overflow-y-auto">
      <div className="p-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <div className="flex items-center gap-2">
            <Palette className="h-8 w-8" />
            <div>
              <h1 className="text-3xl font-bold">Theme Manager</h1>
              <p className="text-muted-foreground mt-1">
                Customize your site's appearance with different themes
              </p>
            </div>
          </div>
        </div>

        {/* Theme Manager Component */}
        <div className="max-w-2xl">
          <ThemeManager />
        </div>
      </div>
    </div>
  )
} 