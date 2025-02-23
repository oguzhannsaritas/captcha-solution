import pytesseract
from PIL import Image, ImageEnhance, ImageFilter
import requests
import sys
import re
from io import BytesIO
import base64

if len(sys.argv) < 2:
    print("Captcha URL'si belirtilmedi!")
    sys.exit(1)

captcha_src = sys.argv[1]  # Puppeteer'dan gelen Captcha URL'si

try:
    # Base64 URI kontrolü
    if captcha_src.startswith("data:image"):
        base64_data = captcha_src.split(",")[1]  # Base64 verisini ayır
        image_bytes = base64.b64decode(base64_data)  # Base64 verisini çöz
    else:
        # Captcha URL'sinden resmi indirme
        response = requests.get(captcha_src)
        if response.status_code == 200:
            image_bytes = response.content
        else:
            print(f"Captcha resmi indirilemedi. HTTP Durum Kodu: {response.status_code}")
            sys.exit(1)

    # Resmi işleme
    image = Image.open(BytesIO(image_bytes))
    image = image.convert('L')  # Gri tonlamalı
    image = ImageEnhance.Contrast(image).enhance(2)  # Kontrast artırma
    image = image.filter(ImageFilter.MedianFilter())  # Gürültü azaltma

    # OCR işlemi
    text = pytesseract.image_to_string(image)

    # Yalnızca sayıları filtreleme
    numbers = re.findall(r'\d+', text)  # Sadece sayıları al
    if numbers:
        print(" ".join(numbers))
    else:
        print("Hiçbir sayı bulunamadı.")

except Exception as e:
    print(f"Hata: {e}")
    sys.exit(1)
