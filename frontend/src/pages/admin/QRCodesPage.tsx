import { useState, useRef } from 'react'
import { motion } from 'framer-motion'
import { QRCodeSVG } from 'qrcode.react'
import { Download, Printer, Wine, Recycle, Copy, Check } from 'lucide-react'
import { getProductImage } from '@/lib/productImages'

type QREntry = {
  code: string
  label: string
  sublabel: string
  type: 'bottle' | 'recycle'
  region?: string
}

const BOTTLE_CODES: QREntry[] = [
  { code: 'BTL-DEMO-0001', label: 'Coca-Cola 0.5L',       sublabel: 'Покупка → +1 очко',        type: 'bottle' },
  { code: 'BTL-DEMO-0002', label: 'Fanta Апельсин 0.5L',  sublabel: 'Покупка → +1 очко',        type: 'bottle' },
  { code: 'BTL-DEMO-0003', label: 'Sprite 1L',             sublabel: 'Покупка → +1 очко',        type: 'bottle' },
  { code: 'BTL-DEMO-0004', label: 'Bonaqua 0.5L',          sublabel: 'Покупка → +1 очко',        type: 'bottle' },
  { code: 'BTL-DEMO-0005', label: 'Fuse Tea Лимон 0.5L',  sublabel: 'Покупка → +1 очко',        type: 'bottle' },
]

const RECYCLING_CODES: QREntry[] = [
  { code: 'RP-DEMO-001', label: 'Базар Мехргон',      sublabel: 'Душанбе — Переработка +5', type: 'recycle', region: 'dushanbe' },
  { code: 'RP-DS-002',   label: 'ТЦ Душанбе Сити',   sublabel: 'Душанбе — Переработка +5', type: 'recycle', region: 'dushanbe' },
  { code: 'RP-DS-003',   label: 'Зелёный базар',      sublabel: 'Душанбе — Переработка +5', type: 'recycle', region: 'dushanbe' },
  { code: 'RP-DS-004',   label: 'Супермаркет Корвон', sublabel: 'Душанбе — Переработка +5', type: 'recycle', region: 'dushanbe' },
  { code: 'RP-KH-001',   label: 'Базар Панчшанбе',   sublabel: 'Худжанд — Переработка +5', type: 'recycle', region: 'sughd' },
  { code: 'RP-BK-001',   label: 'Центральный базар',  sublabel: 'Бохтар — Переработка +5',  type: 'recycle', region: 'khatlon' },
  { code: 'RP-KG-001',   label: 'Базар Хорог',        sublabel: 'ГБАО — Переработка +5',    type: 'recycle', region: 'gbao' },
  { code: 'RP-RRS-001',  label: 'Базар Ховалинг',     sublabel: 'РРС — Переработка +5',     type: 'recycle', region: 'rrs' },
]

const REGION_COLORS: Record<string, string> = {
  dushanbe: '#F40009',
  sughd:    '#FF6B35',
  khatlon:  '#FFB800',
  gbao:     '#00A651',
  rrs:      '#0066CC',
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)
  const copy = async () => {
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }
  return (
    <button
      onClick={copy}
      className="flex items-center gap-1 text-[10px] font-bold transition-all"
      style={{ color: copied ? '#00A651' : 'rgba(255,255,255,0.3)' }}
    >
      {copied ? <Check size={11} /> : <Copy size={11} />}
      {copied ? 'Скопировано' : 'Копировать'}
    </button>
  )
}

function QRCard({ entry, size }: { entry: QREntry; size: number }) {
  const isBottle = entry.type === 'bottle'
  const accentColor = isBottle ? '#F40009' : (REGION_COLORS[entry.region ?? ''] ?? '#00A651')

  const downloadSVG = () => {
    const svg = document.getElementById(`qr-svg-${entry.code}`)
    if (!svg) return
    const blob = new Blob([svg.outerHTML], { type: 'image/svg+xml' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = `${entry.code}.svg`
    a.click()
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      className="rounded-3xl overflow-hidden flex flex-col"
      style={{ background: '#1a1a1a', border: `1px solid ${accentColor}22` }}
    >
      {/* Top accent bar */}
      <div className="h-1 w-full" style={{ background: `linear-gradient(90deg, ${accentColor}, transparent)` }} />

      {/* QR area */}
      <div className="flex items-center justify-center gap-4 px-5 pt-5 pb-3">
        {/* bottle image for bottle type */}
        {isBottle && (
          <img
            src={getProductImage(entry.label)}
            alt={entry.label}
            className="h-20 w-auto flex-shrink-0"
            style={{ filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.5))' }}
          />
        )}
        <div className="p-3 rounded-2xl bg-white shadow-lg flex-shrink-0">
          <QRCodeSVG
            id={`qr-svg-${entry.code}`}
            value={entry.code}
            size={size}
            fgColor="#111111"
            bgColor="#ffffff"
            level="M"
          />
        </div>
      </div>

      {/* Info */}
      <div className="px-5 pb-3 flex-1">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-5 h-5 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: `${accentColor}22` }}>
            {isBottle
              ? <Wine size={11} style={{ color: accentColor }} />
              : <Recycle size={11} style={{ color: accentColor }} />
            }
          </div>
          <p className="text-white font-black text-sm truncate">{entry.label}</p>
        </div>
        <p className="text-white/40 text-[11px] ml-7 mb-2">{entry.sublabel}</p>
        <div className="flex items-center justify-between ml-7">
          <code className="text-[10px] font-mono text-white/25 truncate mr-2">{entry.code}</code>
          <CopyButton text={entry.code} />
        </div>
      </div>

      {/* Download */}
      <div className="px-5 pb-4">
        <button
          onClick={downloadSVG}
          className="w-full flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-bold transition-all hover:opacity-80"
          style={{ background: `${accentColor}18`, color: accentColor, border: `1px solid ${accentColor}25` }}
        >
          <Download size={12} />
          Скачать SVG
        </button>
      </div>
    </motion.div>
  )
}

export default function QRCodesPage() {
  const [tab, setTab] = useState<'all' | 'bottles' | 'recycle'>('all')
  const [qrSize, setQrSize] = useState(140)
  const printRef = useRef<HTMLDivElement>(null)

  const handlePrint = () => window.print()

  const bottleList = tab === 'recycle' ? [] : BOTTLE_CODES
  const recycleList = tab === 'bottles' ? [] : RECYCLING_CODES

  return (
    <div className="min-h-screen" style={{ background: '#0d0d0d' }}>
      {/* Print styles */}
      <style>{`
        @media print {
          body { background: white !important; }
          .no-print { display: none !important; }
          .print-area { background: white !important; }
          .print-card { background: white !important; border: 1px solid #eee !important; break-inside: avoid; }
        }
      `}</style>

      {/* Header */}
      <div className="no-print px-8 pt-8 pb-6 border-b border-white/5">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <p className="text-white/30 text-[10px] font-bold tracking-widest uppercase mb-1">Демо</p>
            <h1 className="text-white text-2xl font-black">QR-коды для сканирования</h1>
            <p className="text-white/40 text-sm mt-1">
              Покажите QR-код на экране и отсканируйте телефоном через приложение
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Size slider */}
            <div className="flex items-center gap-3 bg-white/5 rounded-2xl px-4 py-2.5">
              <span className="text-white/40 text-xs font-bold whitespace-nowrap">Размер</span>
              <input
                type="range" min={80} max={220} step={20}
                value={qrSize}
                onChange={(e) => setQrSize(Number(e.target.value))}
                className="w-24 accent-brand-red"
              />
              <span className="text-white/60 text-xs font-mono w-10">{qrSize}px</span>
            </div>

            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-5 py-2.5 rounded-2xl text-sm font-bold bg-white/8 hover:bg-white/12 text-white transition-all"
            >
              <Printer size={15} />
              Печать
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mt-5">
          {([['all', 'Все'], ['bottles', '🍾 Бутылки'], ['recycle', '♻️ Пункты приёма']] as const).map(([key, label]) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                tab === key
                  ? 'bg-brand-red text-white shadow-[0_4px_16px_rgba(244,0,9,0.3)]'
                  : 'bg-white/5 text-white/40 hover:bg-white/8 hover:text-white'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div ref={printRef} className="print-area px-8 py-8 space-y-10">

        {/* Bottle codes section */}
        {bottleList.length > 0 && (
          <section>
            <div className="flex items-center gap-3 mb-5">
              <div className="w-8 h-8 bg-brand-red/15 rounded-xl flex items-center justify-center">
                <Wine size={16} className="text-brand-red" />
              </div>
              <div>
                <h2 className="text-white font-black text-base">QR-коды бутылок</h2>
                <p className="text-white/30 text-xs">Сканируйте при покупке → +1 очко</p>
              </div>
              <span className="ml-auto text-white/20 text-xs font-bold bg-white/5 px-3 py-1 rounded-full">
                {bottleList.length} кодов
              </span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {bottleList.map((entry, i) => (
                <motion.div key={entry.code} transition={{ delay: i * 0.05 }}>
                  <QRCard entry={entry} size={qrSize} />
                </motion.div>
              ))}
            </div>
          </section>
        )}

        {/* Recycling codes section */}
        {recycleList.length > 0 && (
          <section>
            <div className="flex items-center gap-3 mb-5">
              <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: '#00A65115' }}>
                <Recycle size={16} style={{ color: '#00A651' }} />
              </div>
              <div>
                <h2 className="text-white font-black text-base">QR-коды пунктов переработки</h2>
                <p className="text-white/30 text-xs">Сканируйте при сдаче бутылки → +5 очков</p>
              </div>
              <span className="ml-auto text-white/20 text-xs font-bold bg-white/5 px-3 py-1 rounded-full">
                {recycleList.length} кодов
              </span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {recycleList.map((entry, i) => (
                <motion.div key={entry.code} transition={{ delay: i * 0.05 }}>
                  <QRCard entry={entry} size={qrSize} />
                </motion.div>
              ))}
            </div>
          </section>
        )}

        {/* Flow reminder */}
        <div className="no-print rounded-3xl p-6" style={{ background: '#161616', border: '1px solid rgba(255,255,255,0.05)' }}>
          <h3 className="text-white/50 text-xs font-bold uppercase tracking-widest mb-4">Порядок демонстрации</h3>
          <div className="flex flex-col lg:flex-row gap-4">
            {[
              { step: '1', icon: '🍾', color: '#F40009', title: 'Купить', desc: 'Отсканировать BTL-DEMO-* бутылку → +1 очко на счёт' },
              { step: '2', icon: '♻️', color: '#00A651', title: 'Сдать на переработку', desc: 'Отсканировать RP-* пункт приёма → +5 очков, CO₂ сохранено' },
              { step: '3', icon: '🎁', color: '#FFB800', title: 'Обменять', desc: 'Перейти в «Награды», потратить очки на призы Alif Mobi' },
            ].map(({ step, icon, color, title, desc }) => (
              <div key={step} className="flex items-start gap-4 flex-1">
                <div className="w-9 h-9 rounded-2xl flex items-center justify-center text-lg flex-shrink-0" style={{ background: `${color}18` }}>
                  {icon}
                </div>
                <div>
                  <p className="text-white font-black text-sm">{step}. {title}</p>
                  <p className="text-white/35 text-xs mt-0.5 leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
