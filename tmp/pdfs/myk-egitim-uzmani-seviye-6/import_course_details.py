import json
import re
import shutil
from pathlib import Path


ROOT = Path(__file__).resolve().parents[3]
WORK_DIR = Path(__file__).resolve().parent
TABLES_PATH = WORK_DIR / "tables.json"
COURSES_PATH = ROOT / "data" / "courses.json"
SOURCE_PDF = Path(r"C:\Users\KaanPC\Downloads\21UY0465-6 Rev 00 Eğitim Uzmanı.pdf")
DOCUMENT_NAME = "21UY0465-6_Rev_00_Egitim_Uzmani.pdf"
DOCUMENT_PATH = ROOT / "documents" / DOCUMENT_NAME


def clean(value):
    if value is None:
        return ""
    return re.sub(r"\s+", " ", value).strip()


def collect_rows(table_pages, kind):
    rows = []
    pattern = re.compile(rf"^\*?{kind}\.\d+$")
    for page in table_pages:
        for table in page["tables"]:
            for row in table["rows"]:
                if len(row) < 5 or not pattern.match(clean(row[0])):
                    continue
                raw_id = clean(row[0])
                rows.append(
                    {
                        "id": raw_id.lstrip("*"),
                        "critical": raw_id.startswith("*"),
                        "text": clean(row[1]),
                        "ums": clean(row[2]),
                        "outcome": clean(row[3]),
                        "tool": clean(row[4]),
                    }
                )
    return rows


def format_checklist(records):
    result = []
    for record in records:
        critical = " - Kritik adım" if record["critical"] else ""
        result.append(
            f'{record["id"]}{critical}: {record["text"]} '
            f'(UMS: {record["ums"]}; Alt öğrenme kazanımı: {record["outcome"]}; '
            f'Değerlendirme aracı: {record["tool"]})'
        )
    return result


tables = json.loads(TABLES_PATH.read_text(encoding="utf-8"))
pages = {item["page"]: item for item in tables}
a1_knowledge = collect_rows([pages[9], pages[10]], "BG")
a2_knowledge = collect_rows([pages[13], pages[14], pages[15]], "BG")
a2_skills = collect_rows([pages[15], pages[16], pages[17]], "BY")

expected_counts = (20, 30, 27)
actual_counts = (len(a1_knowledge), len(a2_knowledge), len(a2_skills))
if actual_counts != expected_counts:
    raise ValueError(f"Beklenmeyen kontrol listesi sayıları: {actual_counts}")

checklists = {
    "a1Knowledge": a1_knowledge,
    "a2Knowledge": a2_knowledge,
    "a2Skills": a2_skills,
}
(WORK_DIR / "checklists.json").write_text(
    json.dumps(checklists, ensure_ascii=False, indent=2) + "\n",
    encoding="utf-8",
)

glossary = [
    "Acil durum planı: Kuruluşlarda meydana gelebilecek acil durumlarda yapılacak iş ve işlemler ile uygulamaya yönelik eylemleri içeren plan.",
    "Davranış: Kişinin mesleğini başarıyla icra etmesi için sergilemesi gereken gözlenebilir ve ölçülebilir hal ve hareketler.",
    "Değerlendirme: Ölçme sonuçlarını belirli bir ölçütle kıyaslayarak ölçülen nitelik hakkında karara varma süreci.",
    "Eğitim: Öğretim programlarını, örgün, yaygın ve serbest öğrenme etkinliklerini ve bireyin yaşantısı yoluyla davranış değişikliği deneyimlerini içeren süreç.",
    "Eğitim ihtiyaç analizi: Kurumsal hedefler için beklenen bilgi, beceri ve tutumlar ile çalışanda bulunanlar arasındaki farkı ortaya çıkaran çalışma.",
    "Eğitim materyali: Öğrenme ve öğretmeyi desteklemek için geliştirilmiş görsel, işitsel araçlar ile yardımcı bilgi, gereç ve kaynaklar.",
    "Eğitim planlama: Eğitim faaliyetlerinin amacı, yeri, yöntemi, zamanı, sorumluları, hedef kitlesi ve kaynaklarının belirlenmesi süreci.",
    "ISCO: Uluslararası Standart Meslek Sınıflaması.",
    "İK: İnsan kaynakları.",
    "Kazanım: Öğretim sonunda katılımcının göstereceği davranış, bilgi, beceri, tutum ve değerin ölçülebilir öğrenme çıktısı.",
    "Kurumsal eğitmen: Eğitim programının uygulanmasından ve öğrenme sürecinin yönetiminden sorumlu nitelikli kişi.",
    "Öğrenme: Bireyin kendisi ve çevresiyle etkileşimi sonucunda davranışlarında meydana gelen kalıcı etki.",
    "Öğretim: Bilgi, beceri, tutum ve davranış değişikliğinin planlı ve programlı biçimde eğitim ortamında gerçekleştirilmesi.",
    "Öğretim tekniği: Öğretim yöntemini uygulamaya aktarma biçimi; soru-cevap, beyin fırtınası, gösterim, oyunlaştırma ve benzeşim gibi teknikler.",
    "Öğretim yöntemi: Öğretim hedefleri için seçilen teknik, içerik, araç-gereç ve kaynakları ilişkili biçimde sunan öğretme yolu.",
    "Öğretme: Bir konunun öğretim programına uygun hazırlanması, uygulanması ve beklenen davranışlar oluşuncaya kadar sürdürülmesi.",
    "Ölçme: Bireylerin belirli özelliklere sahip olma durum ve derecelerini belirleyip sonuçları sayı veya sembollerle ifade etme işlemi.",
    "Program: Bir amaca ulaşmak için gereken faaliyetleri, aşamaları, süreleri, yöntemleri ve uygunluk ölçütlerini belirleyen tasarı.",
    "Risk: Tehlikeden kaynaklanabilecek kayıp, yaralanma veya başka zararlı sonuçların meydana gelme ihtimali.",
    "Risk değerlendirmesi: Tehlikeleri belirleme, riskleri analiz edip derecelendirme ve kontrol tedbirlerini kararlaştırma çalışması.",
    "Tehlike: Çalışanı veya işyerini etkileyebilecek zarar ya da hasar verme potansiyeli.",
]

a1_curriculum = [
    "İş sağlığı ve güvenliğinde işveren ve çalışan yükümlülükleri; araç, gereç ve ekipmanların güvenli kullanımı; risk ve tehlikeleri belirleme",
    "Acil durum türleri, acil durumlarda hareket tarzı ve talimatlara uygun davranma",
    "Temel atık yönetimi, enerji verimliliği ve tasarruf uygulamaları",
    "Süreçlerle ilgili mevzuat, temel kalite yönetimi, kişisel ve kurumsal bilgilerin gizliliği ve güvenliği",
    "Kişisel gelişim, stres ve motivasyon yönetimi, meslek etiği, bilgi paylaşımı ve temel araştırma yöntemleri",
]

a2_curriculum = [
    "Bütçe mevzuatı, bütçe hazırlama ve bütçe takibi",
    "Teknik şartname hazırlama, satın alma mevzuatı ve yöntemleri ile hizmet kalitesinin takibi",
    "Eğitim işleri yaklaşımları ve dokümanları ile İK bilgi sistemi",
    "Eğitim ihtiyaç analizi yöntemleri ve eğitim planlaması",
    "Eğitim programı ilkeleri, içerik geliştirme, uygulama planlama, eğitmen organizasyonu ve ölçme-değerlendirme araçları",
    "Çalışanların bilgilendirilmesi, eğitim organizasyonu, eğitim etkinliği ölçümü, kayıt ve raporlama",
]

a1_outcomes = [
    "Güvenli ve sağlıklı çalışma yöntemlerini açıklar.",
    "Acil durumlara karşı alınması gereken önlemleri açıklar.",
    "Çalışma ortamında uygulanacak çevre önlemlerini açıklar.",
    "Mevzuat, kalite gereklilikleri, kuruluş prosedürleri ve bilgi güvenliği çerçevesinde iş süreçlerini açıklar.",
    "Bireysel ve ekip mesleki gelişimine yönelik faaliyetleri açıklar.",
]

a2_outcomes = [
    "Bütçe ve satın alma süreçlerini tanımlar; dokümantasyon ve bilgi sistemi çalışmalarına destek verir.",
    "Eğitim işleri yaklaşımı ve dokümanlarının hazırlanmasına destek verir.",
    "Eğitim ihtiyaç analizi yapar ve eğitimleri planlar.",
    "Eğitim programının ilkelerini, içeriğini, uygulama sürecini, eğitmen organizasyonunu ve ölçme araçlarını geliştirir.",
    "Eğitim hakkında bilgilendirme, organizasyon, etkinlik ölçümü, kayıt ve raporlama faaliyetlerini yürütür.",
]

accordion_items = [
    {
        "title": "Genel Başarı Koşulu",
        "content": "MYK Eğitim Uzmanı (Seviye 6) belgesini almak isteyen adayların A1 ve A2 zorunlu birimlerinde tanımlanan sınavlardan başarılı olması gerekir. Teorik sınavlar birlikte yapılabilse de her birim bağımsız değerlendirilir. Sınava giriş için ön koşul bulunmamaktadır.",
    },
    {
        "title": "A1 Teorik Sınavı",
        "content": "A1 biriminde en az 20 soruluk, 5 seçenekli çoktan seçmeli T1 sınavı uygulanır. Her soru için ortalama 1,5 dakika verilir; yanlış cevaplar puan götürmez. Başarı için soruların en az yüzde 70'inin doğru yanıtlanması gerekir. A1 biriminde performans sınavı yoktur.",
    },
    {
        "title": "A2 Teorik Sınavı",
        "content": "A2 biriminde en az 30 soruluk, 5 seçenekli çoktan seçmeli T1 sınavı uygulanır. Her soru için ortalama 1,5 dakika verilir; yanlış cevaplar puan götürmez. Başarı için soruların en az yüzde 70'inin doğru yanıtlanması gerekir.",
    },
    {
        "title": "A2 Performans Sınavı - P1",
        "content": "P1, eğitim planlama, süreç yönetme ve program geliştirme senaryosuna dayalı örnek olay çözümlemesidir. Adaya hazırlık için en az 60 dakika verilir ve sunum en az 30 dakika sürer. Kritik adımların tamamından başarılı olmak ve sınav genelinde en az yüzde 80 başarı göstermek gerekir.",
    },
    {
        "title": "Sınav ve Birim Geçerlilik Süreleri",
        "content": "A2 birimindeki sınav sonuçları başarı tarihinden itibaren bir yıl geçerlidir; başarılı sınav tarihleri arasındaki fark bir yılı aşamaz. A1 ve A2 yeterlilik birimlerinin geçerliliği, birimin başarıldığı tarihten itibaren iki yıldır.",
    },
    {
        "title": "Belge Geçerliliği ve Yenileme",
        "content": "Mesleki Yeterlilik Belgesi beş yıl geçerlidir ve gözetim şartı bulunmaz. Yenilemede aday, beş yıllık sürede toplam en az iki yıl veya son altı ay ilgili alanda çalıştığını kayıtlarla kanıtlar ya da yeterlilik birimlerinin uygulama sınavlarına katılır. Olumlu değerlendirmede belge beş yıl uzatılır.",
    },
    {"title": "Terimler, Simgeler ve Kısaltmalar", "items": glossary},
    {"title": "A1 Bilgi Kontrol Listesi (BG.1-BG.20)", "items": format_checklist(a1_knowledge)},
    {"title": "A2 Bilgi Kontrol Listesi (BG.1-BG.30)", "items": format_checklist(a2_knowledge)},
    {"title": "A2 Beceri ve Yetkinlik Kontrol Listesi (BY.1-BY.27)", "items": format_checklist(a2_skills)},
    {
        "title": "Değerlendirici Ölçütleri",
        "items": [
            "Sınav komisyonunda lisans mezunu ve koşulları karşılayan en az iki değerlendirici görevlendirilir.",
            "Değerlendiricilerden biri, insan kaynaklarının eğitim planlama ve organizasyon alanında en az beş yıl danışman, uzman veya yönetici olarak çalışmış olmalıdır.",
            "Diğer değerlendirici veya değerlendiriciler, üniversitelerde eğitim ve teknoloji fakültelerinde ya da kalite yönetim sistemleri, yönetim ve organizasyon, yönetim sistemleri veya insan kaynakları alanlarından birinde en az beş yıl öğretim görevlisi/üyesi olarak çalışmış olmalıdır.",
            "Değerlendiricilere mesleki yeterlilik sistemi, ilgili standart ve yeterlilikler, ölçme-değerlendirme ve kalite güvencesi konularında eğitim sağlanmalıdır.",
        ],
    },
    {
        "title": "Yeterliliğin İdari Bilgileri",
        "items": [
            "Yeterliliğin adı: Eğitim Uzmanı",
            "Referans kodu: 21UY0465-6",
            "Seviye: 6",
            "Uluslararası sınıflandırma: ISCO 08 - 2424, personel eğitimi ve eleman yetiştirme ile ilgili profesyonel meslek mensupları",
            "Yayın tarihi: 8 Aralık 2021",
            "Revizyon numarası: 00",
            "Kaynak meslek standardı: 13UMS0337-6 Eğitim Uzmanı (Seviye 6)",
            "A1 ve A2 birimleri zorunludur; seçmeli birim bulunmamaktadır.",
            "Sınava giriş şartı bulunmamaktadır.",
            "Yeterlilik birimlerinin geçerliliği başarı tarihinden itibaren iki yıldır.",
            "Belge geçerlilik süresi beş yıldır; gözetim şartı bulunmamaktadır.",
            "Meslekte yatay veya dikey ilerleme yolu tanımlanmamıştır.",
        ],
    },
    {
        "title": "Geliştiren ve Doğrulayan Kuruluşlar",
        "items": [
            "Yeterliliği geliştiren kuruluş: Yönetim Danışmanları Derneği.",
            "Yeterliliği doğrulayan komite: MYK İş ve Yönetim Sektör Komitesi.",
        ],
    },
]

data = json.loads(COURSES_PATH.read_text(encoding="utf-8"))
course = next(
    item
    for item in data["courses"]
    if item.get("page", {}).get("slug") == "myk-egitim-uzmani-seviye-6"
)

course["seo"] = {
    "title": "MYK Eğitim Uzmanı Seviye 6 Sınav Hazırlık Eğitimi",
    "description": "21UY0465-6 Eğitim Uzmanı (Seviye 6) yeterliliğine yönelik A1-A2 birimleri, T1 ve P1 sınavları ile belgelendirme süreci.",
}
course["content"]["viewHeader"]["category"]["value"] = "MYK Sınav Hazırlık"
course["content"]["blocks"] = [
    {"type": "heading", "level": 3, "text": "MYK Eğitim Uzmanı (Seviye 6) Sınav Hazırlık Eğitimi"},
    {
        "type": "paragraph",
        "text": "Bu program, Mesleki Yeterlilik Kurumunun 21UY0465-6 Eğitim Uzmanı (Seviye 6) Ulusal Yeterliliği esas alınarak hazırlanmıştır. Amaç; eğitim ihtiyacını analiz eden, eğitimleri planlayan, program geliştirme ve organizasyon süreçlerini yöneten nitelikli eğitim uzmanları için gereken bilgi, beceri ve yetkinlikleri kazandırmak ve adayları MYK sınav sürecine hazırlamaktır.",
    },
    {
        "type": "paragraph",
        "text": "Yeterliliğin seviyesi 6, uluslararası sınıflandırması ISCO 08: 2424 ve kaynak meslek standardı 13UMS0337-6 Eğitim Uzmanı (Seviye 6)'dır. A1 ve A2 birimleri zorunludur; seçmeli birim ve sınava giriş ön koşulu bulunmaz.",
    },
    {"type": "heading", "level": 3, "text": "Zorunlu Yeterlilik Birimleri"},
    {
        "type": "list",
        "items": [
            "A1 - İSG, Çevre Koruma, İş Süreçlerinin Uygunluğunu Sağlama ve Mesleki Gelişim",
            "A2 - Eğitim Planlama, Eğitim Programı Hazırlanmasını Sağlama ve Süreç Yönetimi",
        ],
    },
    {"type": "heading", "level": 3, "text": "A1 Birimi Eğitim İçeriği"},
    {"type": "list", "items": a1_curriculum},
    {"type": "heading", "level": 3, "text": "A2 Birimi Eğitim İçeriği"},
    {"type": "list", "items": a2_curriculum},
    {"type": "heading", "level": 3, "text": "A1 Birimi Öğrenme Kazanımları"},
    {"type": "list", "items": a1_outcomes},
    {"type": "heading", "level": 3, "text": "A2 Birimi Öğrenme Kazanımları"},
    {"type": "list", "items": a2_outcomes},
    {
        "type": "paragraph",
        "text": "Önemli: Bu eğitim sınava hazırlık sağlar. MYK Eğitim Uzmanı (Seviye 6) Mesleki Yeterlilik Belgesi yalnızca yetkilendirilmiş belgelendirme kuruluşunun uyguladığı teorik ve performansa dayalı sınavlarda başarılı olunması halinde düzenlenir.",
    },
    {"type": "heading", "level": 2, "text": "Ölçme, Değerlendirme ve Belgelendirme"},
    {
        "type": "accordion",
        "title": "MYK Eğitim Uzmanı Seviye 6 Sınav ve Belgelendirme Bilgileri",
        "items": accordion_items,
    },
]

sidebar = course["sidebar"]
sidebar["courseInfo"] = {
    "price": "Bilgi Alın",
    "facts": [
        {"icon": "units", "text": "Zorunlu Birimler: A1 ve A2"},
        {"icon": "exam", "text": "Sınavlar: A1-T1, A2-T1 ve P1"},
        {"icon": "success", "text": "Başarı: T1 %70, P1 %80"},
        {"icon": "certificate", "text": "Belge Geçerliliği: 5 yıl"},
    ],
}
sidebar["categories"] = [
    "MYK",
    "Eğitim Uzmanlığı",
    "Seviye 6",
    "Sınav Hazırlık",
    "Mesleki Yeterlilik",
]
sidebar["tags"] = [
    "MYK",
    "Eğitim Uzmanı Seviye 6",
    "21UY0465-6",
    "A1",
    "A2",
    "Sınav Hazırlık",
]
sidebar["officialDocument"] = {
    "title": "Resmî Yeterlilik Dokümanı",
    "description": "21UY0465-6 Eğitim Uzmanı (Seviye 6) Rev. 00 belgesinin tam metni.",
    "url": f"documents/{DOCUMENT_NAME}",
}

COURSES_PATH.write_text(
    json.dumps(data, ensure_ascii=False, indent=2) + "\n",
    encoding="utf-8",
)
DOCUMENT_PATH.parent.mkdir(parents=True, exist_ok=True)
shutil.copy2(SOURCE_PDF, DOCUMENT_PATH)

critical_count = sum(item["critical"] for item in a2_skills)
print(f"A1 knowledge: {len(a1_knowledge)}")
print(f"A2 knowledge: {len(a2_knowledge)}")
print(f"A2 skills: {len(a2_skills)}")
print(f"Critical steps: {critical_count}")
print(f"Accordion sections: {len(accordion_items)}")
print(f"Document: {DOCUMENT_PATH.relative_to(ROOT)}")
