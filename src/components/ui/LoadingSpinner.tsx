import { Heart } from 'lucide-react'

export default function LoadingSpinner() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
      <div className="relative">
        <div className="w-12 h-12 rounded-full border-2 border-rose-100 border-t-rose-500 animate-spin" />
        <div className="absolute inset-0 flex items-center justify-center">
          <Heart className="w-4 h-4 text-rose-500 fill-rose-500 animate-pulse-soft" />
        </div>
      </div>
      <p className="text-sm text-neutral-400 font-medium">Loading...</p>
    </div>
  )
}
