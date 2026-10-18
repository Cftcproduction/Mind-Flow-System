from pathlib import Path

import pypdfium2 as pdfium
from PIL import Image, ImageDraw


PDF_PATH = Path(r"C:\Users\KaanPC\Downloads\21UY0465-6 Rev 00 Eğitim Uzmanı.pdf")
OUTPUT_DIR = Path(__file__).resolve().parent

pdf = pdfium.PdfDocument(PDF_PATH)
thumbs = []
for index in range(len(pdf)):
    page = pdf[index]
    bitmap = page.render(scale=0.65)
    image = bitmap.to_pil().convert("RGB")
    image.thumbnail((390, 520))
    tile = Image.new("RGB", (410, 555), "white")
    tile.paste(image, ((410 - image.width) // 2, 25))
    ImageDraw.Draw(tile).text((10, 5), f"Page {index + 1}", fill="black")
    thumbs.append(tile)

columns = 4
rows = (len(thumbs) + columns - 1) // columns
sheet = Image.new("RGB", (columns * 410, rows * 555), "#d8d8d8")
for index, thumb in enumerate(thumbs):
    sheet.paste(thumb, ((index % columns) * 410, (index // columns) * 555))
sheet.save(OUTPUT_DIR / "contact-sheet.png")

for page_number in (5, 6, 9, 10, 12, 13, 14, 15, 16, 17):
    page = pdf[page_number - 1]
    image = page.render(scale=1.5).to_pil().convert("RGB")
    image.save(OUTPUT_DIR / f"page-{page_number:02}.png")

print(f"rendered_pages={len(pdf)}")
