import { useState, useEffect, useRef } from 'react'
import QRCode from 'qrcode'
import { Download, Printer, Loader2, AlertCircle } from 'lucide-react'

interface QRCodeCardProps {
  publicSlug: string
  recipientName?: string
  giftTitle?: string
}

export default function QRCodeCard({
  publicSlug,
  recipientName = 'Someone Special',
  giftTitle,
}: QRCodeCardProps) {
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)

  const publicUrl = `${window.location.origin}/g/${publicSlug}`

  useEffect(() => {
    let isMounted = true

    async function generateQR() {
      setLoading(true)
      setError(null)

      try {
        // High-res QR code with medium error correction level
        const url = await QRCode.toDataURL(publicUrl, {
          width: 512,
          margin: 2,
          errorCorrectionLevel: 'M',
          color: {
            dark: '#1f2937',
            light: '#ffffff',
          },
        })

        if (isMounted) {
          setQrDataUrl(url)
        }
      } catch (err: unknown) {
        console.error('[QRCodeCard] Generation error:', err)
        if (isMounted) {
          setError('Failed to generate QR code.')
        }
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    generateQR()

    return () => {
      isMounted = false
    }
  }, [publicUrl])

  // Download high-res PNG
  const handleDownload = () => {
    if (!qrDataUrl) return

    const link = document.createElement('a')
    link.download = `giftly-qr-${publicSlug}.png`
    link.href = qrDataUrl
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // Print QR card
  const handlePrint = () => {
    if (!qrDataUrl) return

    const printWindow = window.open('', '_blank', 'width=600,height=700')
    if (!printWindow) return

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Giftly QR — ${recipientName}</title>
          <style>
            body {
              font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              min-height: 90vh;
              margin: 0;
              padding: 20px;
              color: #1f2937;
              text-align: center;
            }
            .card {
              border: 2px dashed #f43f5e;
              border-radius: 24px;
              padding: 36px 32px;
              max-width: 380px;
              width: 100%;
              box-sizing: border-box;
            }
            h1 {
              font-size: 22px;
              margin: 0 0 8px 0;
              color: #e11d48;
            }
            p {
              font-size: 14px;
              color: #6b7280;
              margin: 0 0 20px 0;
            }
            img {
              width: 240px;
              height: 240px;
              border-radius: 16px;
            }
            .tag {
              margin-top: 16px;
              font-size: 12px;
              font-weight: bold;
              color: #9ca3af;
              letter-spacing: 1px;
              text-transform: uppercase;
            }
          </style>
        </head>
        <body>
          <div class="card">
            <h1>A Gift For ${recipientName} ❤️</h1>
            <p>Scan with your phone camera to open your special surprise</p>
            <img src="${qrDataUrl}" alt="Giftly QR Code" />
            <div class="tag">Crafted on Giftly</div>
          </div>
          <script>
            window.onload = function() {
              window.print();
            };
          </script>
        </body>
      </html>
    `)
    printWindow.document.close()
  }

  return (
    <div className="space-y-4 text-center select-none animate-fade-in">
      {/* Hidden canvas for drawing if needed */}
      <canvas ref={canvasRef} className="hidden" />

      {error ? (
        <div
          role="alert"
          className="flex items-center justify-center gap-2 p-6 bg-rose-50 border border-rose-200 text-rose-700 rounded-2xl text-xs"
        >
          <AlertCircle className="w-4 h-4" />
          <span>{error}</span>
        </div>
      ) : loading ? (
        <div className="w-56 h-56 mx-auto bg-warm-50 rounded-2xl border border-warm-200 flex flex-col items-center justify-center text-neutral-400 gap-2">
          <Loader2 className="w-6 h-6 animate-spin text-rose-500" />
          <span className="text-xs">Generating QR code…</span>
        </div>
      ) : qrDataUrl ? (
        <div className="space-y-3">
          <div className="inline-block p-3 bg-white border border-warm-200 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
            <img
              src={qrDataUrl}
              alt={`QR code to open ${giftTitle || 'gift'} for ${recipientName}`}
              className="w-52 h-52 sm:w-56 sm:h-56 mx-auto rounded-xl object-contain"
            />
          </div>

          <p className="text-xs text-neutral-500 max-w-xs mx-auto leading-relaxed">
            Scan with any phone camera to instantly open the gift on the recipient&apos;s device.
          </p>
        </div>
      ) : null}

      {/* Action Buttons */}
      <div className="flex items-center justify-center gap-2 pt-2">
        <button
          type="button"
          onClick={handleDownload}
          disabled={!qrDataUrl || loading}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold text-white bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-600 hover:to-pink-600 shadow-xs hover:shadow-sm transition-all disabled:opacity-50"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Download PNG</span>
        </button>

        <button
          type="button"
          onClick={handlePrint}
          disabled={!qrDataUrl || loading}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold text-neutral-700 hover:text-neutral-900 bg-warm-100 hover:bg-warm-200 transition-colors disabled:opacity-50"
        >
          <Printer className="w-3.5 h-3.5" />
          <span>Print</span>
        </button>
      </div>
    </div>
  )
}
