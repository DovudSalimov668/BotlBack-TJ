#!/usr/bin/env python3
"""Generate a WiFi-access QR code for the demo.

Usage: python demo/wifi-qr.py
Opens demo-access.png — display it on projector so audience can scan to join.
"""
import socket
import sys

try:
    import qrcode
    from PIL import Image, ImageDraw, ImageFont
except ImportError:
    print("Install deps first:  pip install qrcode pillow")
    sys.exit(1)


def get_local_ip() -> str:
    s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    try:
        s.connect(("8.8.8.8", 80))
        return s.getsockname()[0]
    except Exception:
        return "127.0.0.1"
    finally:
        s.close()


def main():
    ip = get_local_ip()
    url = f"https://{ip}:5173"

    print(f"\n  ╔══════════════════════════════════════╗")
    print(f"  ║   BotlBack TJ — Demo Access           ║")
    print(f"  ║                                        ║")
    print(f"  ║   URL:  {url:<31}║")
    print(f"  ║   OTP:  1234 (for all accounts)        ║")
    print(f"  ║                                        ║")
    print(f"  ║   Demo phone:  +992900000001            ║")
    print(f"  ║   Admin login: admin / Botlback2026!   ║")
    print(f"  ╚══════════════════════════════════════╝\n")

    # Generate QR
    qr = qrcode.QRCode(
        version=3,
        error_correction=qrcode.constants.ERROR_CORRECT_H,
        box_size=12,
        border=4,
    )
    qr.add_data(url)
    qr.make(fit=True)
    img = qr.make_image(fill_color="#1E1E1E", back_color="white")

    # Add label below QR
    w, h = img.size
    label_h = 90
    canvas = Image.new("RGB", (w, h + label_h), "white")
    canvas.paste(img, (0, 0))
    draw = ImageDraw.Draw(canvas)

    try:
        font_big  = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", 22)
        font_small = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf", 16)
    except Exception:
        font_big = font_small = ImageFont.load_default()

    draw.text((w // 2, h + 10), "BotlBack TJ", font=font_big, fill="#F40009", anchor="mt")
    draw.text((w // 2, h + 40), url, font=font_small, fill="#1E1E1E", anchor="mt")
    draw.text((w // 2, h + 65), "OTP: 1234  •  Принять самоподписанный сертификат", font=font_small, fill="#888888", anchor="mt")

    out = "demo-access.png"
    canvas.save(out)
    print(f"  QR saved → {out}\n")
    print(f"  IMPORTANT: audience must tap 'Advanced → Proceed' on the HTTPS warning\n")


if __name__ == "__main__":
    main()
