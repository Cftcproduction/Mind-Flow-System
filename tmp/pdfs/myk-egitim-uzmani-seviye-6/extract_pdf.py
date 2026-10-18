import json
from pathlib import Path

import pdfplumber


PDF_PATH = Path(r"C:\Users\KaanPC\Downloads\21UY0465-6 Rev 00 Eğitim Uzmanı.pdf")
OUTPUT_DIR = Path(__file__).resolve().parent


all_text = []
all_tables = []

with pdfplumber.open(PDF_PATH) as pdf:
    for page_number, page in enumerate(pdf.pages, start=1):
        text = page.extract_text(x_tolerance=2, y_tolerance=2) or ""
        all_text.append(f"\n===== PAGE {page_number} =====\n{text}")

        page_tables = []
        for table_number, table in enumerate(page.extract_tables(), start=1):
            cleaned = [
                [cell.strip() if isinstance(cell, str) else cell for cell in row]
                for row in table
            ]
            page_tables.append({"table": table_number, "rows": cleaned})
        if page_tables:
            all_tables.append({"page": page_number, "tables": page_tables})

(OUTPUT_DIR / "content.txt").write_text("\n".join(all_text), encoding="utf-8")
(OUTPUT_DIR / "tables.json").write_text(
    json.dumps(all_tables, ensure_ascii=False, indent=2) + "\n",
    encoding="utf-8",
)

print(f"pages={len(all_text)}")
print(f"pages_with_tables={len(all_tables)}")
print(f"tables={sum(len(item['tables']) for item in all_tables)}")
