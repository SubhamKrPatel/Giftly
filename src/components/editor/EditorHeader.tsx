import { Link } from 'react-router-dom'
import {
  ArrowLeft,
  Check,
  Loader2,
  Save,
  AlertCircle,
  ExternalLink,
  Globe,
  Share2,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface EditorHeaderProps {
  giftId?: string
  giftTitle: string
  status: 'draft' | 'published'
  saveStatus: 'saved' | 'saving' | 'unsaved' | 'error'
  onSave: () => void
  onPublishClick?: () => void
  onShareClick?: () => void
  onUnpublishClick?: () => void
}

export default function EditorHeader({
  giftId,
  giftTitle,
  status,
  saveStatus,
  onSave,
  onPublishClick,
  onShareClick,
  onUnpublishClick,
}: EditorHeaderProps) {
  return (
    <header className="bg-white/95 backdrop-blur-md border-b border-warm-200 sticky top-0 z-40 transition-all">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-15 sm:h-16 flex items-center justify-between gap-2 sm:gap-4">
        {/* Left: Back Link & Title */}
        <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1 sm:flex-initial">
          <Link
            to="/dashboard"
            className="flex items-center gap-1 text-xs sm:text-sm font-semibold text-neutral-600 hover:text-rose-600 px-2 sm:px-2.5 py-2 rounded-xl hover:bg-rose-50 transition-colors flex-shrink-0 min-h-[44px] touch-manipulation"
            aria-label="Back to dashboard"
          >
            <ArrowLeft className="w-4 h-4 text-neutral-600" />
            <span className="hidden xs:inline">Dashboard</span>
          </Link>

          <div className="h-4 w-px bg-warm-300 hidden sm:block flex-shrink-0" />

          {/* Gift Title & Status Pill */}
          <div className="min-w-0 flex items-center gap-1.5 sm:gap-2">
            <h1 className="font-serif text-xs sm:text-base font-bold text-neutral-900 truncate max-w-[130px] xs:max-w-[200px] sm:max-w-xs md:max-w-sm">
              {giftTitle || 'Untitled Gift'}
            </h1>
            <span
              className={cn(
                'px-1.5 sm:px-2 py-0.5 rounded-full text-[9px] sm:text-[10px] font-bold uppercase tracking-wider flex-shrink-0',
                status === 'published'
                  ? 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                  : 'bg-amber-100 text-amber-700 border border-amber-200'
              )}
            >
              {status}
            </span>
          </div>
        </div>

        {/* Right: Live Save Status & Action CTAs */}
        <div className="flex items-center gap-1.5 sm:gap-3 flex-shrink-0">
          {/* Live Save Status Feedback (Visible on all viewports) */}
          <div
            className="flex items-center gap-1 text-[11px] sm:text-xs font-medium text-neutral-500 min-h-[44px]"
            aria-live="polite"
          >
            {saveStatus === 'saving' && (
              <span className="inline-flex items-center gap-1 text-rose-600 font-medium animate-pulse">
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span className="hidden sm:inline">Saving…</span>
              </span>
            )}
            {saveStatus === 'saved' && (
              <span className="inline-flex items-center gap-1 text-emerald-600">
                <Check className="w-3.5 h-3.5 stroke-[3]" />
                <span className="hidden sm:inline text-neutral-500">Saved</span>
              </span>
            )}
            {saveStatus === 'unsaved' && (
              <span className="inline-flex items-center gap-1 text-amber-600">
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                <span className="hidden sm:inline text-neutral-500">Unsaved</span>
              </span>
            )}
            {saveStatus === 'error' && (
              <span className="inline-flex items-center gap-1 text-rose-600">
                <AlertCircle className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Error</span>
              </span>
            )}
          </div>

          {/* Recipient View Link (Desktop only) */}
          {giftId && (
            <Link
              to={`/gift-preview/${giftId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden lg:inline-flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-semibold text-neutral-600 hover:text-rose-600 bg-warm-100 hover:bg-warm-200 transition-colors shadow-xs min-h-[44px]"
              title="Open recipient preview in a new tab"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Preview</span>
            </Link>
          )}

          {/* Publishing Controls */}
          {status === 'draft' && onPublishClick && (
            <button
              type="button"
              onClick={onPublishClick}
              className="inline-flex items-center gap-1 sm:gap-1.5 px-3 sm:px-4 py-2 rounded-full text-xs sm:text-sm font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition-all shadow-xs min-h-[44px] touch-manipulation cursor-pointer"
              title="Publish gift and generate unique share link"
            >
              <Globe className="w-3.5 h-3.5 text-rose-500 flex-shrink-0" />
              <span>Publish</span>
            </button>
          )}

          {status === 'published' && (
            <div className="flex items-center gap-1 sm:gap-1.5">
              {onShareClick && (
                <button
                  type="button"
                  onClick={onShareClick}
                  className="inline-flex items-center gap-1 sm:gap-1.5 px-3 sm:px-4 py-2 rounded-full text-xs sm:text-sm font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 transition-all shadow-xs min-h-[44px] touch-manipulation cursor-pointer"
                  title="Share public gift link"
                >
                  <Share2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                  <span>Share</span>
                </button>
              )}

              {onUnpublishClick && (
                <button
                  type="button"
                  onClick={onUnpublishClick}
                  className="hidden sm:inline-flex items-center gap-1 px-2.5 py-2 rounded-full text-xs font-medium text-neutral-400 hover:text-amber-700 hover:bg-amber-50 transition-colors min-h-[44px]"
                  title="Unpublish this gift"
                >
                  <span>Unpublish</span>
                </button>
              )}
            </div>
          )}

          {/* Manual Save Button */}
          <button
            type="button"
            onClick={onSave}
            disabled={saveStatus === 'saving'}
            className="inline-flex items-center justify-center gap-1 sm:gap-1.5 bg-gradient-to-r from-rose-500 to-rose-600 text-white font-semibold text-xs sm:text-sm px-3.5 sm:px-5 py-2 rounded-full hover:from-rose-600 hover:to-rose-700 transition-all shadow-xs hover:shadow-glow disabled:opacity-60 min-h-[44px] min-w-[44px] touch-manipulation cursor-pointer"
            aria-label="Save changes"
          >
            {saveStatus === 'saving' ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Save className="w-3.5 h-3.5" />
            )}
            <span className="hidden xs:inline">{saveStatus === 'saving' ? 'Saving…' : 'Save'}</span>
          </button>
        </div>
      </div>
    </header>
  )
}
