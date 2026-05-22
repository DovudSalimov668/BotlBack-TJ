"""
Generate demo QR code images + a printable HTML sheet.

Usage:
    python manage.py generate_qrcodes

Output:
    backend/media/qrcodes/          ← individual PNG files
    backend/media/qrcodes/sheet.html ← open in browser and print
"""

import os
import qrcode
from django.core.management.base import BaseCommand

BOTTLE_CODES = [
    ('BTL-DEMO-0001', 'Coca-Cola 0.5L'),
    ('BTL-DEMO-0002', 'Fanta Апельсин 0.5L'),
    ('BTL-DEMO-0003', 'Sprite 1L'),
    ('BTL-DEMO-0004', 'Bonaqua 0.5L'),
    ('BTL-DEMO-0005', 'Fuse Tea Лимон 0.5L'),
]

RECYCLING_CODES = [
    ('RP-DEMO-001', 'Базар Мехргон, Душанбе'),
    ('RP-DS-002',   'ТЦ Душанбе Сити'),
    ('RP-DS-003',   'Зелёный базар, Душанбе'),
    ('RP-KH-001',   'Базар Панчшанбе, Худжанд'),
    ('RP-BK-001',   'Базар, Бохтар'),
]


def make_qr_png(data: str, path: str):
    qr = qrcode.QRCode(
        version=3,
        error_correction=qrcode.constants.ERROR_CORRECT_M,
        box_size=10,
        border=3,
    )
    qr.add_data(data)
    qr.make(fit=True)
    img = qr.make_image(fill_color='black', back_color='white')
    img.save(path)


def make_html_sheet(bottle_codes, recycling_codes, out_dir: str):
    def card(code, label, color, emoji):
        img_path = f"{code}.png"
        return f"""
        <div class="card">
          <div class="badge" style="background:{color}">{emoji} {'Бутылка' if emoji == '🍾' else 'Пункт приёма'}</div>
          <img src="{img_path}" alt="{code}">
          <div class="code">{code}</div>
          <div class="label">{label}</div>
        </div>"""

    cards_html = ''
    for code, label in bottle_codes:
        cards_html += card(code, label, '#F40009', '🍾')
    for code, label in recycling_codes:
        cards_html += card(code, label, '#00A651', '♻️')

    html = f"""<!DOCTYPE html>
<html lang="ru">
<head>
<meta charset="utf-8">
<title>BotlBack TJ — Demo QR Codes</title>
<style>
  body {{ font-family: Arial, sans-serif; background: #f5f5f5; padding: 24px; }}
  h1   {{ color: #F40009; margin-bottom: 4px; }}
  p    {{ color: #666; font-size: 13px; margin-bottom: 24px; }}
  .grid {{ display: flex; flex-wrap: wrap; gap: 16px; }}
  .card {{
    background: white; border-radius: 12px; padding: 16px;
    text-align: center; width: 180px; box-shadow: 0 2px 8px rgba(0,0,0,.08);
    page-break-inside: avoid;
  }}
  .card img {{ width: 148px; height: 148px; display: block; margin: 8px auto; }}
  .badge {{ display:inline-block; color:white; font-size:11px; font-weight:bold;
            border-radius:20px; padding:3px 10px; margin-bottom:8px; }}
  .code  {{ font-family: monospace; font-size: 12px; font-weight:bold; color:#222; margin: 6px 0 2px; }}
  .label {{ font-size: 11px; color: #888; }}
  @media print {{ body {{ background: white; padding: 0; }} }}
</style>
</head>
<body>
<h1>BotlBack TJ — Demo QR Codes</h1>
<p>Распечатайте и используйте для демонстрации. OTP для входа: <strong>1234</strong></p>
<div class="grid">{cards_html}</div>
</body>
</html>"""

    with open(os.path.join(out_dir, 'sheet.html'), 'w', encoding='utf-8') as f:
        f.write(html)


class Command(BaseCommand):
    help = 'Generate demo QR code PNG images and a printable HTML sheet'

    def handle(self, *args, **options):
        out_dir = os.path.join('media', 'qrcodes')
        os.makedirs(out_dir, exist_ok=True)

        all_codes = BOTTLE_CODES + RECYCLING_CODES
        for code, label in all_codes:
            path = os.path.join(out_dir, f'{code}.png')
            make_qr_png(code, path)
            self.stdout.write(f'  ✓ {code}  →  {path}')

        make_html_sheet(BOTTLE_CODES, RECYCLING_CODES, out_dir)
        self.stdout.write(self.style.SUCCESS(
            '\nDone! Open  media/qrcodes/sheet.html  in a browser to print.\n'
            'PNG files are in  media/qrcodes/'
        ))
