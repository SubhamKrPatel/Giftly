import { Link } from 'react-router-dom'
import {
  ArrowLeft,
  Check,
  Loader2,
  Save,
  Eye,
  Edit3,
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
  mobileTab?: 'editor' | 'preview'
  onMobileTabChange?: (tab: 'editor' | 'preview') => void
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
  mobileTab = 'editor',
  onMobileTabChange,
}: EditorHeaderProps) {
  return (
    <header className="bg-white/90 backdrop-blur-md border-b border-warm-200 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-3">
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
            <h1 className="font-serif text-sm sm:text-base md:text-lg font-semibold text-neutral-800 truncate">
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

        {/* Center/Mobile View Switcher (Visible only on <lg screens) */}
        {onMobileTabChange && (
          <div className="flex lg:hidden items-center bg-warm-200/80 p-1 rounded-xl">
            <button
              type="button"
              onClick={() => onMobileTabChange('editor')}
              className={cn(
                'flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-medium transition-all',
                mobileTab === 'editor'
                  ? 'bg-white text-neutral-900 shadow-xs'
                  : 'text-neutral-500 hover:text-neutral-800'
              )}
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Edit</span>
            </button>

            <button
              type="button"
              onClick={() => onMobileTabChange('preview')}
              className={cn(
                'flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-medium transition-all',
                mobileTab === 'preview'
                  ? 'bg-white text-neutral-900 shadow-xs'
                  : 'text-neutral-500 hover:text-neutral-800'
              )}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Preview</span>
            </button>
          </div>
        )}

        {/* Right: Save Status Feedback & Manual Save CTA */}
        <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
          {/* Live Save Status Feedback */}
          <div className="hidden sm:flex items-center gap-1.5 text-xs font-medium text-neutral-500">
            {saveStatus === 'saving' && (
              <>
                <Loader2 className="w-3.5 h-3.5 text-rose-500 animate-spin" />
                <span>Saving…</span>
              </>
            )}
            {saveStatus === 'saved' && (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-500 stroke-[3]" />
                <span className="text-neutral-500">Saved</span>
              </>
            )}
            {saveStatus === 'unsaved' && (
              <>
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                <span className="text-neutral-500">Unsaved changes</span>
              </>
            )}
            {saveStatus === 'error' && (
              <>
                <AlertCircle className="w-3.5 h-3.5 text-rose-500" />
                <span className="text-rose-500">Save failed</span>
              </>
            )}
          </div>

          {/* Recipient View Link (Part 6) */}
          {giftId && (
            <Link
              to={`/gift-preview/${giftId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden lg:inline-flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-semibold text-neutral-600 hover:text-rose-600 bg-warm-100 hover:bg-warm-200 transition-colors shadow-xs"
              title="Open recipient preview in a new tab"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Preview</span>
            </Link>
          )}

          {/* Publishing Controls (Part 7) */}
          {status === 'draft' && onPublishClick && (
            <button
              type="button"
              onClick={onPublishClick}
              className="inline-flex items-center gap-1.5 px-3.5 sm:px-4 py-2 rounded-full text-xs sm:text-sm font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition-all shadow-xs hover:shadow-sm"
              title="Publish gift and generate unique share link"
            >
              <Globe className="w-3.5 h-3.5 text-rose-500" />
              <span>Publish</span>
            </button>
          )}

          {status === 'published' && (
            <div className="flex items-center gap-1.5">
              {onShareClick && (
                <button
                  type="button"
                  onClick={onShareClick}
                  className="inline-flex items-center gap-1.5 px-3.5 sm:px-4 py-2 rounded-full text-xs sm:text-sm font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 transition-all shadow-xs"
                  title="Share public gift link"
                >
                  <Share2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Share</span>
                </button>
              )}

              {onUnpublishClick && (
                <button
                  type="button"
                  onClick={onUnpublishClick}
                  className="hidden sm:inline-flex items-center gap-1 px-2.5 py-2 rounded-full text-xs font-medium text-neutral-400 hover:text-amber-700 hover:bg-amber-50 transition-colors"
                  title="Unpublish this gift"
                >
                  <span>Unpublish</span>
                </button>
              )}
            </div>
          )}

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
