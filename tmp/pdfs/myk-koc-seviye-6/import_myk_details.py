import json
from pathlib import Path


root = Path(__file__).resolve().parents[3]
checklists_path = Path(__file__).with_name("checklists.json")
courses_path = root / "data" / "courses.json"

checklists = json.loads(checklists_path.read_text(encoding="utf-8"))

# Correct three cells where the PDF table extraction split Turkish characters
# across columns. All other rows were extracted cleanly from the source tables.
a2_knowledge_corrections = {
    "BG.8": "Müşteri ile etkili koçluk ilişkisi ve iletişiminin (etkin dinleme, empati, beden dili ve benzeri) kavramlarını tanımlar.",
    "BG.10": "Örnek durum/senaryoya göre müşterinin amacına ve ihtiyaçlarına uygun gelişim alanları ve ana çalışma temasını belirler.",
    "BG.11": "Müşterinin amacına göre gelişim alanları ve ana çalışma temasını belirlemesine yönelik durum tespiti ve ihtiyaç analizi tekniklerini açıklar.",
}
for record in checklists["a2Knowledge"]:
    if record["id"] in a2_knowledge_corrections:
        record["text"] = a2_knowledge_corrections[record["id"]]


def format_checklist(records):
    return [
        f'{record["id"]}: {record["text"]} '
        f'(UMS: {record["ums"]}; Başarım ölçütü: {record["criterion"]}; '
        f'Değerlendirme aracı: {record["tool"]})'
        for record in records
    ]


glossary = [
    "Beden dili: Yüz ifadeleri, mimikler, bakış, baş, el, kol, bacak, ayak, duruş biçimi, ses tonu ve konuşma tarzı gibi bedensel iletilerin bütünü.",
    "Canlandırma: Uygun koçluk teknikleriyle müşterinin ulaşmak istediği hedef anını yaşamasını sağlama.",
    "Etik kurallar: Profesyonel davranış, kişisel ve mesleki bütünlük, sorumluluk, yetkinlik sınırları, sürekli gelişim, gizlilik ve tarafsızlık kuralları.",
    "Etkin dinleme: Müşterinin sözlü ve sözsüz mesajlarını doğru biçimde alıp geri bildirim ve yansıtma yoluyla iletme.",
    "Geçmiş başarıları hatırlatma tekniği: Müşterinin motivasyonunu ve güçlü yönlerini fark etmesini destekleyen koçluk tekniği.",
    "Gizlilik politikası: Müşteriye ait kişisel veya kurumsal özel bilgileri izin olmadan üçüncü kişilerle paylaşmama kuralı.",
    "Görüşme: Koçluk hizmetinin verildiği oturumların her biri.",
    "Güçlü sorular: Müşteriyi keşfetmeye, düşünmeye ve harekete geçmeye yönelten sorular.",
    "Hedefe ulaştığındaki başarıyı hayal etme tekniği: Kararlılık ve motivasyonu desteklemek için hedefe ulaşma anını zihinde canlandırma tekniği.",
    "ISCO: Uluslararası Standart Meslek Sınıflaması.",
    "Koçluk gündemi: Müşterinin görüşmelerde konuşmak ve netleştirmek istediği konuların her biri.",
    "Koçluk hizmeti/süreci: İstenen performans ve yaşam tatminine ulaşmak için koç ile müşteri arasında kurulan planlı gelişim ilişkisi.",
    "Müşteri: Koçluk hizmetinin verildiği kişi.",
    "Ödev verme tekniği: Müşterinin hedefe uygun eylem planı kapsamında gerçekleştirmesi için verilen görev ve sorumluluklar.",
    "Referans belgesi: Verilen hizmetin konusu ve toplam saatini beyan eden, kimlik ve adres bilgileri bulunan tarihli ve imzalı resmî kayıt.",
    "Risk: Tehlikeden kaynaklanabilecek kayıp, yaralanma veya başka zararlı sonuçların meydana gelme ihtimali.",
    "Söz alma tekniği: Müşterinin verilen ödevi veya eylem planını gerçekleştireceğine söz vermesine dayalı teknik.",
    "Sponsor: Koçluk hizmetinin bedelini ödeyen taraf.",
    "Takip etme tekniği: Verilen görevlerle ilgili müşteriden geri bildirim alma.",
    "Tehlike: Çalışanı veya iş yerini etkileyebilecek zarar ya da hasar verme potansiyeli.",
    "Yaşam çemberi: Müşterinin yaşam alanlarını birlikte tasvir etmek için kullanılan koçluk aracı.",
    "Davranış bozukluğu: Bedensel bir neden olmadan özellikle toplumsal uyuma ilişkin davranışlarda görülen düzensizlikler.",
]

administrative_details = [
    "Yeterliliğin adı: Koç",
    "Referans kodu: 15UY0215-6",
    "Seviye: 6",
    "Uluslararası sınıflandırma: ISCO 08 - 2635, sosyal hizmet ve danışmanlık ile ilgili profesyonel meslek mensupları",
    "Yayın tarihi: 22 Temmuz 2015",
    "Revizyon: Rev. 01 - 30 Ekim 2019 tarihli ve 2019/140 sayılı karar",
    "Tadil tarihleri: 10 Haziran 2020 (1570), 14 Şubat 2022 (915) ve 24 Mayıs 2022 (3065)",
    "Kaynak meslek standardı: 13UMS0318-6 Koç (Seviye 6) Rev. 01",
    "Seçmeli birim bulunmamaktadır; A1 ve A2 birimleri zorunludur.",
    "Yeterlilik birimlerinin geçerliliği, başarı tarihinden itibaren iki yıldır.",
    "Belge geçerlilik süresi beş yıldır; gözetim şartı tanımlanmamıştır.",
    "Meslekte yatay veya dikey ilerleme yolu tanımlanmamıştır.",
]

evaluator_details = [
    "Sınav komisyonunda en az iki değerlendirici görevlendirilir.",
    "Değerlendiricilerden biri psikoloji, sosyoloji, eğitim bilimleri, insan kaynakları, işletme veya iletişim alanlarından birinde öğretim üyesi/görevlisi olmalı ve en az 60 saat koçluk eğitimi almış olmalıdır.",
    "Diğer değerlendirici; en az 500 saat fiilî koçluk deneyimi ile en az 500 saat koçluk eğitimi verme deneyimine veya en az 800 saat fiilî koçluk deneyimine sahip olmalıdır.",
    "Eğitim ve deneyim; fatura, sözleşme ve referans belgesi gibi resmî kayıtlarla belgelendirilmelidir.",
    "Değerlendiricilere mesleki yeterlilik sistemi, ilgili standart ve yeterlilikler, ölçme-değerlendirme ve kalite güvencesi konularında eğitim sağlanmalıdır.",
]

organization_details = [
    "Yeterliliği geliştiren kuruluşlar: Koçluk Platformu Derneği, Uluslararası Profesyonel Koçluk Derneği ve Yönderlik ve Koçluk Derneği.",
    "Yeterliliği güncelleyen kurum: Mesleki Yeterlilik Kurumu.",
    "Yeterliliği doğrulayan komite: MYK İş ve Yönetim Sektör Komitesi.",
]

data = json.loads(courses_path.read_text(encoding="utf-8"))
course = next(item for item in data["courses"] if item.get("page", {}).get("slug") == "myk-koc-seviye-6")
accordion = next(block for block in course["content"]["blocks"] if block.get("type") == "accordion")

detail_titles = {
    "Terimler, Simgeler ve Kısaltmalar",
    "A1 Bilgi Kontrol Listesi (BG.1-BG.35)",
    "A2 Bilgi Kontrol Listesi (BG.1-BG.12)",
    "A2 Beceri ve Yetkinlik Kontrol Listesi (BY.1-BY.35)",
    "Değerlendirici Ölçütleri",
    "Yeterliliğin İdari Bilgileri",
    "Geliştiren ve Doğrulayan Kuruluşlar",
}
accordion["items"] = [item for item in accordion["items"] if item.get("title") not in detail_titles]
accordion["items"].extend(
    [
        {"title": "Terimler, Simgeler ve Kısaltmalar", "items": glossary},
        {"title": "A1 Bilgi Kontrol Listesi (BG.1-BG.35)", "items": format_checklist(checklists["a1Knowledge"])},
        {"title": "A2 Bilgi Kontrol Listesi (BG.1-BG.12)", "items": format_checklist(checklists["a2Knowledge"])},
        {"title": "A2 Beceri ve Yetkinlik Kontrol Listesi (BY.1-BY.35)", "items": format_checklist(checklists["a2Skills"])},
        {"title": "Değerlendirici Ölçütleri", "items": evaluator_details},
        {"title": "Yeterliliğin İdari Bilgileri", "items": administrative_details},
        {"title": "Geliştiren ve Doğrulayan Kuruluşlar", "items": organization_details},
    ]
)

course["sidebar"]["officialDocument"] = {
    "title": "Resmî Yeterlilik Dokümanı",
    "description": "15UY0215-6 Koç (Seviye 6) Rev. 01 - Tadil No: 03 belgesinin tam metni.",
    "url": "documents/15UY0215-6_Rev_01_Koc_1.pdf",
}

courses_path.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

print(f'A1 knowledge rows: {len(checklists["a1Knowledge"])}')
print(f'A2 knowledge rows: {len(checklists["a2Knowledge"])}')
print(f'A2 skill rows: {len(checklists["a2Skills"])}')
print(f'Accordion sections: {len(accordion["items"])}')
