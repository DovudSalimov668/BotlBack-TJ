import { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Html5QrcodeScanner } from 'html5-qrcode'
import { useScanBottle } from '@/api/bottles'
import { ArrowLeft } from 'lucide-react'

export default function ScanPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const scannerRef = useRef<Html5QrcodeScanner | null>(null)
  const hasScannedRef = useRef(false)

  const mutation = useScanBottle()

  useEffect(() => {
    scannerRef.current = new Html5QrcodeScanner(
      'qr-reader',
      { fps: 10, qrbox: { width: 260, height: 260 }, aspectRatio: 1.0 },
      false
    )

    scannerRef.current.render(
      async (decodedText) => {
        if (!hasScannedRef.current) {
          hasScannedRef.current = true
          try {
            const data = await mutation.mutateAsync({ qr_code: decodedText.trim() })
            navigate(`/scan/result/${data.scan_id}`, {
              state: {
                points: data.points_awarded,
                total: data.total_points,
                sku: data.sku,
                type: 'purchase',
              },
            })
          } catch (err: unknown) {
            const error = err as { response?: { data?: { code?: string } } }
            if (error?.response?.data?.code === 'already_scanned') {
              navigate('/scan/result/error', {
                state: { error: t('scan.already_scanned') },
              })
            } else {
              hasScannedRef.current = false
            }
          }
        }
      },
      () => {}
    )

    return () => {
      scannerRef.current?.clear().catch(() => {})
    }
  }, [])

  return (
    <div className="min-h-screen bg-brand-charcoal flex flex-col">
      <div className="flex items-center gap-3 p-4 text-white">
        <button onClick={() => navigate(-1)}>
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-lg font-bold">{t('scan.title')}</h1>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-4">
        <p className="text-gray-400 text-sm mb-6">{t('scan.subtitle')}</p>
        <div id="qr-reader" className="w-full max-w-sm rounded-2xl overflow-hidden" />
        {mutation.isPending && (
          <div className="mt-6 text-white text-center">
            <div className="w-8 h-8 border-4 border-brand-red border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            <p className="text-sm">{t('common.loading')}</p>
          </div>
        )}
        {mutation.isError && (
          <p className="mt-4 text-red-400 text-sm text-center">{t('common.error')}</p>
        )}
      </div>

      <div className="p-6 text-center">
        <p className="text-gray-500 text-xs">{t('scan.tip')}</p>
      </div>
    </div>
  )
}
