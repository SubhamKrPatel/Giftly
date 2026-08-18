import { Link } from 'react-router-dom'
import { ArrowLeft, Check, Loader2, Save, Eye } from 'lucide-react'
import { cn } from '@/lib/utils'

interface EditorHeaderProps {
  giftTitle: string
  status: 'draft' | 'published'
  saveStatus: 'saved' | 'saving' | 'unsaved'
  onSave: () => void
}

export default function EditorHeader({
  giftTitle,
  status,
  saveStatus,
  onSave,
}: EditorHeaderProps) {
  return (
    <header className="bg-white/90 backdrop-blur-md border-b border-warm-200 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Left: Back link and Title */}
        <div className="flex items-center gap-3 sm:gap-4 min-w-0">
          <Link
            to="/dashboard"
            className="flex items-center gap-1.5 text-xs sm:text-sm font-medium text-neutral-600 hover:text-rose-600 px-2.5 py-1.5 rounded-lg hover:bg-rose-50 transition-colors flex-shrink-0"
            aria-label="Back to dashboard"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Dashboard</span>
          </Link>

          <div className="h-4 w-px bg-warm-300 hidden sm:block flex-shrink-0" />

          {/* Gift Title & Status */}
          <div className="min-w-0 flex items-center gap-2">
            <h1 className="font-serif text-base sm:text-lg font-semibold text-neutral-800 truncate">
              {giftTitle || 'Untitled Gift'}
            </h1>
            <span
              className={cn(
                'px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-semibold uppercase tracking-wider flex-shrink-0',
                status === 'published'
                  ? 'bg-emerald-100 text-emerald-700'
                  : 'bg-amber-100 text-amber-700'
              )}
            >
              {status}
            </span>
          </div>
        </div>

        {/* Right: Save Status & Actions */}
        <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
          {/* Live Save Status Feedback */}
          <div className="hidden sm:flex items-center gap-1.5 text-xs font-medium text-neutral-500">
            {saveStatus === 'saving' && (
              <>
                <Loader2 className="w-3.5 h-3.5 text-rose-500 animate-spin" />
                <span>Saving changes…</span>
              </>
            )}
            {saveStatus === 'saved' && (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-500 stroke-[3]" />
                <span className="text-neutral-500">All changes saved</span>
              </>
            )}
            {saveStatus === 'unsaved' && (
              <>
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                <span className="text-neutral-500">Unsaved changes</span>
              </>
            )}
          </div>

          {/* Preview button (Coming Soon) */}
          <button
            type="button"
            disabled
            className="hidden md:inline-flex items-center gap-1.5 text-xs font-semibold text-neutral-400 bg-warm-100 px-3 py-2 rounded-xl cursor-not-allowed"
            title="Preview will be available in Part 4"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Preview (Part 4)</span>
          </button>

          {/* Manual Save button */}
          <button
            type="button"
            onClick={onSave}
            disabled={saveStatus === 'saving'}
            className="inline-flex items-center gap-1.5 bg-gradient-to-r from-rose-500 to-rose-600 text-white font-semibold text-xs sm:text-sm px-4 sm:px-5 py-2 rounded-full hover:from-rose-600 hover:to-rose-700 transition-all duration-200 shadow-sm hover:shadow-glow disabled:opacity-60"
          >
            {saveStatus === 'saving' ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Saving…</span>
              </>
            ) : (
              <>
                <Save className="w-3.5 h-3.5" />
                <span>Save</span>
              </>
            )}
          </button>
        </div>
      </div>
    </header>
  )
}
