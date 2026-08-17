import { Link } from 'react-router-dom'
import { Heart, Instagram } from 'lucide-react'
import { brand } from '@/config/brand'

const footerLinks = [
  { label: 'Home', href: '/' },
  { label: 'Occasions', href: '/occasions' },
  { label: 'Wedding Cards', href: '/wedding' },
  { label: 'How It Works', href: '/how-it-works' },
  { label: 'Privacy', href: '/privacy' },
  { label: 'Terms', href: '/terms' },
]

// WhatsApp icon (custom SVG since not in Lucide)
function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  )
}

export default function Footer() {
  return (
    <footer className="bg-neutral-900 text-neutral-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <Link to="/" className="flex items-center gap-2 group">
              <div className="w-8 h-8 bg-gradient-to-br from-rose-400 to-rose-600 rounded-lg flex items-center justify-center">
                <Heart className="w-4 h-4 text-white fill-white" />
              </div>
              <span className="font-serif text-xl font-semibold text-white tracking-tight">
                {brand.name}
              </span>
            </Link>
            <p className="text-sm text-neutral-400 leading-relaxed max-w-xs">
              {brand.tagline} Create beautiful digital gifts that feel personal, emotional and unforgettable.
            </p>
            {/* Social */}
            <div className="flex items-center gap-3 pt-1">
              <a
                href="#"
                aria-label={`Follow ${brand.name} on Instagram`}
                className="w-9 h-9 bg-neutral-800 hover:bg-rose-600 rounded-full flex items-center justify-center transition-colors duration-200"
              >
                <Instagram className="w-4 h-4" />
              </a>
              <a
                href="#"
                aria-label={`Contact ${brand.name} on WhatsApp`}
                className="w-9 h-9 bg-neutral-800 hover:bg-green-600 rounded-full flex items-center justify-center transition-colors duration-200"
              >
                <WhatsAppIcon className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Links */}
          <div>
            <h3 className="text-white font-medium text-sm mb-4 uppercase tracking-wider">
              Navigation
            </h3>
            <ul className="space-y-2.5" role="list">
              {footerLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    to={link.href}
                    className="text-sm text-neutral-400 hover:text-rose-400 transition-colors duration-200"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* CTA column */}
          <div className="space-y-4">
            <h3 className="text-white font-medium text-sm mb-4 uppercase tracking-wider">
              Ready to surprise someone?
            </h3>
            <p className="text-sm text-neutral-400">
              Create your first digital gift in minutes. No design skills needed.
            </p>
            <Link
              to="/create"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-rose-500 to-rose-600 text-white text-sm font-semibold px-5 py-3 rounded-full hover:from-rose-600 hover:to-rose-700 transition-all duration-200"
            >
              <Heart className="w-3.5 h-3.5 fill-white" />
              Create Your Gift
            </Link>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-6 border-t border-neutral-800 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-neutral-500 font-serif italic">
            "{brand.tagline}"
          </p>
          <p className="text-xs text-neutral-500">
            © {new Date().getFullYear()} {brand.name}. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}
