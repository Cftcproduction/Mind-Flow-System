// ==============================
// helpers
// ==============================

const legacyCourseSlugs = {
  "kocluk-icf-seviye-1": "icf-level-1",
  "kocluk-icf-seviye-2": "icf-level-2",
  "kocluk-icf-seviye-3": "myk-koc-seviye-6",
  "nlp-uygulama-egitimi": "nlp-kocluk-egitimi",
  "beden-analiz-egitimi": "myk-egitim-uzmani-seviye-6",
  "pcc-mcc-sinav-mentorlugu": "mind-flow-system-performans-koclugu-liderlik-egitimi",
};

function normalizeCourseSlug(slug) {
  return legacyCourseSlugs[slug] || slug;
}

function getSlugFromUrl() {
  const url = new URL(window.location.href);
  const qp = url.searchParams.get("slug");
  if (qp) return normalizeCourseSlug(qp);

  const parts = url.pathname.split("/").filter(Boolean);
  const last = parts[parts.length - 1] || "";
  if (last.endsWith(".html")) return null;
  return last ? normalizeCourseSlug(last) : null;
}

/**
 * load the index JSON and return the course whose page.slug matches
 */
async function fetchCourseBySlug({ indexUrl, slug }) {
  const res = await fetch(indexUrl, { cache: "no-store" });
  if (!res.ok) throw new Error(`Index JSON bulunamadı: ${res.status} (${indexUrl})`);
  const indexData = await res.json();
  const list = Array.isArray(indexData) ? indexData : indexData.courses || [];
  const course = list.find((item) => item?.page?.slug === slug);
  if (!course) throw new Error(`Slug bulunamadı: ${slug}`);
  return course;
}

/**
 * Accept regular YouTube, youtu.be, Shorts and embed links and return a
 * privacy-enhanced embed URL. Invalid or unsupported links stay hidden.
 */
function getYouTubeEmbedUrl(value) {
  const rawUrl = String(value || "").trim();
  if (!rawUrl) return null;

  try {
    const url = new URL(rawUrl);
    const host = url.hostname.toLowerCase().replace(/^www\./, "");
    let videoId = "";

    if (host === "youtu.be") {
      videoId = url.pathname.split("/").filter(Boolean)[0] || "";
    } else if (["youtube.com", "m.youtube.com", "music.youtube.com", "youtube-nocookie.com"].includes(host)) {
      if (url.pathname === "/watch") {
        videoId = url.searchParams.get("v") || "";
      } else {
        const parts = url.pathname.split("/").filter(Boolean);
        if (["shorts", "embed", "live"].includes(parts[0])) videoId = parts[1] || "";
      }
    }

    if (!/^[A-Za-z0-9_-]{6,}$/.test(videoId)) return null;
    return `https://www.youtube-nocookie.com/embed/${videoId}`;
  } catch (error) {
    return null;
  }
}

/**
 * On desktop, start the sidebar at the actual top edge of the course image.
 * The offset is measured instead of hard-coded so wrapped course titles and
 * late-loading fonts do not break the alignment. Mobile/tablet keep the
 * theme's original stacked layout.
 */
function alignCourseSidebarWithHero() {
  const sidebar = document.getElementById("sidebar");
  const hero = document.querySelector(".content-aligncenter");
  if (!sidebar || !hero) return;

  if (window.innerWidth < 992) {
    sidebar.style.removeProperty("--course-sidebar-offset");
    return;
  }

  sidebar.style.setProperty("--course-sidebar-offset", "0px");
  const offset = Math.max(0, Math.round(hero.getBoundingClientRect().top - sidebar.getBoundingClientRect().top));
  sidebar.style.setProperty("--course-sidebar-offset", `${offset}px`);
}

let courseSidebarResizeTimer;
function scheduleCourseSidebarAlignment() {
  window.clearTimeout(courseSidebarResizeTimer);
  courseSidebarResizeTimer = window.setTimeout(alignCourseSidebarWithHero, 50);
}

window.addEventListener("resize", scheduleCourseSidebarAlignment);
window.addEventListener("load", scheduleCourseSidebarAlignment);

/**
 * all of the DOM‑manipulation code that used to run on "data"
 */
async function renderCourse(data) {
  try {
    // heading banner
    document.getElementById("headingBg").style.backgroundImage = data.heading.backgroundImage;
    document.getElementById("headingTitle").textContent = data.heading.title;

    // Always present a human-readable course hierarchy. The URL slug is only
    // used to find the course and must never be exposed as breadcrumb text.
    const breadcrumbItems = [
      { label: "Anasayfa", href: "index.html" },
      { label: "Kurslar", href: "courses-list.html" },
      { label: data.content?.mainTitle || data.heading?.title || "Kurs" },
    ];
    const breadCrumb = document.getElementById("js-breadcrumb");
    breadCrumb.innerHTML = "";
    breadcrumbItems.forEach((item, index) => {
      const li = document.createElement("li");
      const isLast = index === breadcrumbItems.length - 1;

      if (!isLast && item.href) {
        const link = document.createElement("a");
        link.href = item.href;
        link.textContent = item.label;
        li.appendChild(link);
      } else {
        li.textContent = item.label;
      }

      breadCrumb.appendChild(li);
      if (isLast) li.classList.add("active");
    });

    // head content
    const dataContent = data.content;
    document.getElementById("courseTitle").textContent = dataContent.mainTitle;

    // Preselect the current course in the consultation form.
    const programSelect = document.getElementById("course-consultation-program");
    if (programSelect) {
      const currentProgram = String(dataContent.mainTitle || "").trim();
      const matchingOption = Array.from(programSelect.options).find((option) => option.value === currentProgram);
      if (matchingOption) programSelect.value = matchingOption.value;
    }

    // Word belgesinde bulunmayan eğitmen, kategori ve puan bilgilerini gösterme.
    const courseViewHeader = document.getElementById("courseViewHeader");
    const viewHeader = dataContent.viewHeader;
    if (viewHeader?.author && viewHeader?.category && viewHeader?.rating) {
      const { src, alt } = viewHeader.author.image || {};
      const img = document.getElementById("vhAuthorImg");
      if (img) {
        img.src = src || "";
        img.alt = alt || "";
      }

      document.getElementById("vhAuthorLabel").textContent = viewHeader.author.label || "";
      document.getElementById("vhAuthorName").textContent = viewHeader.author.name || "";
      document.getElementById("vhCategoryValue").textContent = viewHeader.category.value || "";
      document.getElementById("vhReviewCount").textContent = `(${viewHeader.rating.totalReviews || 0} Yorum)`;
      if (courseViewHeader) courseViewHeader.hidden = false;
    } else if (courseViewHeader) {
      courseViewHeader.hidden = true;
    }

    const courseHeroImg = document.getElementById("courseHeroImg");
    courseHeroImg.src = dataContent.heroImage?.src || "";
    courseHeroImg.alt = dataContent.heroImage?.alt || dataContent.mainTitle || "";

    // paragraf başlangıç

    const courseBlocksMount = document.getElementById("courseBlocksMount");

    courseBlocksMount.innerHTML = "";
    (dataContent.blocks || []).forEach((block) => {
      const { type, level, text, intro, items } = block;

      if (type === "heading" && level === 3) {
        const h3 = document.createElement("h3");
        h3.textContent = text;
        h3.classList.add("content-h3");
        courseBlocksMount.appendChild(h3);
      } else if (type === "heading" && level === 2) {
        const h2 = document.createElement("h2");
        h2.textContent = text;
        h2.classList.add("content-h2");
        courseBlocksMount.appendChild(h2);
      }

      if (type === "paragraph") {
        const p = document.createElement("p");
        p.textContent = text;
        courseBlocksMount.appendChild(p);
      }
      if (type === "list") {
        // optional introductory text before the list
        if (intro) {
          const introP = document.createElement("p");
          introP.textContent = intro;
          courseBlocksMount.appendChild(introP);
        }

        const ul = document.createElement("ul");
        ul.classList.add("listDefault", "list-unstyled");
        // create an <li> for each item and append to the <ul>
        items.forEach((item) => {
          const li = document.createElement("li");
          li.textContent = item;
          ul.appendChild(li);
        });

        courseBlocksMount.appendChild(ul);
      }
    });
    async function buildAccordionFromCourse(jsonUrl) {
      const res = await fetch(jsonUrl);
      const data = await res.json();

      // 1️⃣ Accordion bloğunu bul
      const accordionBlock = dataContent.blocks.find((block) => block.type === "accordion");

      if (!accordionBlock) {
        const mount = document.getElementById("accordion");
        if (mount) mount.hidden = true;
        return;
      }

      const items = accordionBlock.items;
      const mount = document.getElementById("accordion");

      mount.innerHTML = items
        .map((item, index) => {
          const collapseId = `collapse${index}`;
          const headingId = `heading${index}`;
          const isFirst = index === 0; // ister ilk açık olsun
          const panelContent = Array.isArray(item.items)
            ? `<ul class="listDefault list-unstyled">${item.items.map((entry) => `<li>${escapeHTML(entry)}</li>`).join("")}</ul>`
            : `<p>${escapeHTML(item.content)}</p>`;

          return `
      <div class="panel panel-default">
        <div class="panel-heading" role="tab" id="${headingId}">
          <h3 class="panel-title fw-normal">
            <a class="accOpener"
               role="button"
               data-toggle="collapse"
               data-parent="#accordion"
               href="#${collapseId}"
               aria-expanded="${isFirst}"
               aria-controls="${collapseId}">
              <span class="accOpenerCol">
                <i class="fas fa-chevron-circle-right accOpenerIcn"></i><i class="fas fa-play-circle inlineIcn"></i>${escapeHTML(item.title)}
              </span>
            </a>
          </h3>
        </div>

        <div id="${collapseId}"
             class="panel-collapse collapse ${isFirst ? "in" : ""}"
             role="tabpanel"
             aria-labelledby="${headingId}">
          <div class="panel-body">
            ${panelContent}
          </div>
        </div>
      </div>
    `;
        })
        .join("");
    }

    // Çalıştır
    await buildAccordionFromCourse("./data/courses.json");

    // =====================================================
    // COURSE SINGLE (accordion'dan sonrası)
    // JSON: courses.json  -> data.content.instructor, data.content.reviews, data.sidebar, data.content.blocks(accordion)
    // HTML: courses.html  -> #accordion2, .instructorInfoBox, .reviewsList, #sidebar
    // =====================================================

    function escapeHTML(str) {
      // JSON içeriği güvenilir değilse XSS riskini azaltır.
      // Senin içeriklerin güvenilir ise bile, iyi alışkanlık.
      return String(str ?? "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
    }

    // Basit yıldız HTML'i (5 üzerinden)
    function buildStars(rating) {
      const r = Math.max(0, Math.min(5, Number(rating) || 0));
      const full = Math.round(r); // istersen floor kullan
      let out = "";
      for (let i = 0; i < 5; i++) {
        out += `
      <li><span class="fas fa-star"><span class="sr-only">star</span></span></li>
    `;
      }
      return out; // temada boş yıldız ikonu yoksa aynı bırakıyoruz
    }

    // 1) accordion2 doldur (JSON’daki accordion items'tan kalanlar)
    function fillAccordion2FromJSON(data) {
      const acc2 = document.getElementById("accordion2");
      if (!acc2) return;

      // JSON’daki accordion block
      const blocks = data?.content?.blocks || [];
      const accordionBlock = blocks.find((b) => b.type === "accordion");
      if (!accordionBlock || !Array.isArray(accordionBlock.items)) return;

      // Senin HTML’inde accordion(ilk) 5 panel, accordion2 ikinci grup gibi.
      // JSON’da 6 item var; 6. item "Başvurunuzun İncelenmesi" -> accordion2
      const remainingItems = accordionBlock.items.slice(5); // 6. ve sonrası
      if (remainingItems.length === 0) return;

      acc2.innerHTML = remainingItems
        .map((item, idx) => {
          // HTML’de eski isimlendirme: heading2One, collapse2One
          const suffix = idx === 0 ? "One" : String(idx + 1);
          const headingId = `heading2${suffix}`;
          const collapseId = `collapse2${suffix}`;

          return `
      <div class="panel panel-default">
        <div class="panel-heading" role="tab" id="${headingId}">
          <h3 class="panel-title fw-normal">
            <a class="accOpener" role="button"
               data-toggle="collapse"
               data-parent="#accordion2"
               href="#${collapseId}"
               aria-expanded="false"
               aria-controls="${collapseId}">
              <span class="accOpenerCol">
                <i class="fas fa-chevron-circle-right accOpenerIcn"></i><i class="fas fa-play-circle inlineIcn"></i>${escapeHTML(item.title)}
              </span>
            </a>
          </h3>
        </div>

        <div id="${collapseId}" class="panel-collapse collapse" role="tabpanel" aria-labelledby="${headingId}">
          <div class="panel-body">
            <p>${escapeHTML(item.content)}</p>
          </div>
        </div>
      </div>
    `;
        })
        .join("");
    }

    // 2) Eğitmen Hakkında kutusu
    function fillInstructorBox(data) {
      const box = document.querySelector(".instructorInfoBox");
      if (!box) return;

      const instructor = data?.content?.instructor;
      if (!instructor) return;

      const imgEl = box.querySelector(".alignleft img");
      if (imgEl && instructor.image?.src) {
        imgEl.src = instructor.image.src;
        imgEl.alt = instructor.image?.alt || instructor.name || "Eğitmen";
      }

      const nameEl = box.querySelector(".description-wrap h3 a");
      if (nameEl) nameEl.textContent = instructor.name || "";

      const titleEl = box.querySelector(".description-wrap h4");
      if (titleEl) titleEl.textContent = instructor.title || "";

      const bioEl = box.querySelector(".description-wrap p");
      if (bioEl) bioEl.textContent = instructor.bio || "";
    }

    // 3) Yorumlar listesi + üst başlık (2 yorum var yazısı)
    function fillReviews(data) {
      const reviews = data?.content?.reviews;
      if (!reviews) return;

      // "Bu kurs için X yorum var" satırı (HTML’de: h3.h6 fw-semi)
      const summaryEl = document.querySelector("h3.h6.fw-semi");
      if (summaryEl && typeof reviews.total !== "undefined") {
        summaryEl.textContent = `Bu kurs için ${reviews.total} yorum var`;
      }

      const list = document.querySelector("ul.reviewsList");
      if (!list) return;

      const items = Array.isArray(reviews.items) ? reviews.items : [];
      list.innerHTML = items
        .map((r) => {
          const author = escapeHTML(r.author);
          const dateISO = r.date || "";
          // Temadaki örnek "March 7, 2016" formatında; biz ISO'yu direkt basıyoruz.
          // İstersen TR formatına çevirebiliriz.
          const dateText = escapeHTML(dateISO);
          const starsHtml = buildStars(r.rating);

          return `
      <li>
        <div class="alignleft">
          <a href="about.html">
            <img src="" alt="${author}">
          </a>
        </div>
        <div class="description-wrap">
          <div class="descrHead">
            <h3>${author} – <time datetime="${escapeHTML(dateISO)}">${dateText}</time></h3>
            <ul class="star-rating list-unstyled justify-end">
              ${starsHtml}
            </ul>
          </div>
          <p>${escapeHTML(r.text)}</p>
        </div>
      </li>
    `;
        })
        .join("");
    }

    // =========================
    // ACCORDION'DAN SONRASI
    // courses-temp.html ID'lerine göre
    // JSON: courses.json
    // =========================

    function esc(s) {
      return String(s ?? "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
    }

    function starsHTML(rating) {
      const r = Math.max(0, Math.min(5, Number(rating) || 0));
      const full = Math.round(r); // istersen Math.floor
      let out = "";
      for (let i = 0; i < 5; i++) {
        out += `<li><span class="fas fa-star"><span class="sr-only">star</span></span></li>`;
      }
      return out;
    }

    /**
     * Accordion'dan sonraki tüm alanları doldurur.
     * @param {any} data - courses.json içeriği
     */
    function renderAfterAccordion(data) {
      fillBookmarkCTA(data);
      fillInstructorBox(data);
      fillReviews(data);
      fillSidebar(data);
    }

    // 1) Bookmark footer CTA (opsiyonel)
    function fillBookmarkCTA(data) {
      const cta = document.getElementById("courseCTA");
      if (!cta) return;

      // JSON’da CTA yoksa dokunma. (istersen seo/page slug'tan link üretiriz)
      // Örn: cta.href = `checkout.html?course=${data.page.slug}`
    }

    // 2) Eğitmen kutusu
    function fillInstructorBox(data) {
      const instructor = data?.content?.instructor;
      const box = document.getElementById("courseInstructorBox");
      if (!instructor) {
        if (box) box.hidden = true;
        return;
      }

      if (box) box.hidden = false;

      const img = document.getElementById("instructorImg");
      if (img && instructor.image?.src) {
        img.src = instructor.image.src;
        img.alt = instructor.image.alt || instructor.name || "Eğitmen";
      }

      const nameEl = document.getElementById("instructorName");
      if (nameEl) nameEl.textContent = instructor.name || "";

      const titleEl = document.getElementById("instructorTitle");
      if (titleEl) titleEl.textContent = instructor.title || "";

      const bioEl = document.getElementById("instructorBio");
      if (bioEl) bioEl.textContent = instructor.bio || "";
    }

    // 3) Yorumlar listesi
    function fillReviews(data) {
      const reviews = data?.content?.reviews;
      const mount = document.getElementById("courseReviewsMount");
      const form = document.querySelector(".reviesSubmissionForm");
      if (!reviews) {
        if (mount) mount.hidden = true;
        if (form) form.hidden = true;
        return;
      }

      if (!mount) return;
      mount.hidden = false;
      if (form) form.hidden = false;

      const items = Array.isArray(reviews.items) ? reviews.items : [];
      mount.innerHTML = items
        .map((r) => {
          const author = esc(r.author);
          const dateISO = esc(r.date || "");
          const text = esc(r.text || "");
          const stars = starsHTML(r.rating);

          // Not: HTML template'inde review avatar placeholder idi.
          const avatar = "";

          return `
      <li>
        <div class="alignleft">
          <a href="#"><img src="${avatar}" alt="${author}"></a>
        </div>
        <div class="description-wrap">
          <div class="descrHead">
            <h3>${author} – <time datetime="${dateISO}">${dateISO}</time></h3>
            <ul class="star-rating list-unstyled justify-end">
              ${stars}
            </ul>
          </div>
          <p>${text}</p>
        </div>
      </li>
    `;
        })
        .join("");
    }

    // 4) Sidebar
    function fillSidebar(data) {
      const sb = data?.sidebar;
      const sidebar = document.getElementById("sidebar");
      const content = document.getElementById("content");
      if (!sb) {
        if (sidebar) sidebar.hidden = false;
        if (content) {
          content.classList.remove("col-md-12");
          content.classList.add("col-md-9");
        }
        ["sbCourseInfo", "sbCategories", "sbOfficialDocument", "sbCourseVideo", "sbTags"].forEach((id) => {
          const section = document.getElementById(id);
          if (section) section.hidden = true;
        });
        return;
      }

      if (sidebar) sidebar.hidden = false;
      if (content) {
        content.classList.remove("col-md-12");
        content.classList.add("col-md-9");
      }

      const courseInfoSection = document.getElementById("sbCourseInfo");
      if (courseInfoSection) courseInfoSection.hidden = !sb.courseInfo;

      const categoriesSection = document.getElementById("sbCategories");
      if (categoriesSection) categoriesSection.hidden = !Array.isArray(sb.categories) || !sb.categories.length;

      const tagsSection = document.getElementById("sbTags");
      if (tagsSection) tagsSection.hidden = !Array.isArray(sb.tags) || !sb.tags.length;

      // Facts (Students, Duration, Lectures, Video, Certificate)
      const facts = document.getElementById("sbFacts");
      if (facts && sb.courseInfo) {
        const ci = sb.courseInfo;

        if (Array.isArray(ci.facts) && ci.facts.length) {
          const factIcons = {
            clock: "far fa-clock",
            units: "fas fa-book-open",
            exam: "far fa-edit",
            success: "fas fa-check-circle",
            certificate: "far fa-address-card",
          };
          facts.innerHTML = ci.facts
            .map((fact) => {
              const iconClass = factIcons[fact.icon] || "fas fa-info-circle";
              return `<li><i class="${iconClass} icn no-shrink"></i> ${esc(fact.text)}</li>`;
            })
            .join("");
        } else {
          facts.innerHTML = `
      <li><i class="far fa-user icn no-shrink"></i> ${esc(ci.students)} Katılımcı</li>
      <li><i class="far fa-clock icn no-shrink"></i> Süre: ${esc(ci.duration)}</li>
      <li><i class="fas fa-bullhorn icn no-shrink"></i> Dersler: ${esc(ci.lectures)}</li>
      <li><i class="far fa-play-circle icn no-shrink"></i> Video: ${esc(ci.videoHours)} saat</li>
      <li><i class="far fa-address-card icn no-shrink"></i> ${ci.certificate ? "Sertifika" : "Sertifika Var"}</li>
    `;
        }
      }

      // 4.3 Categories
      const catList = document.getElementById("sbCategoriesList");
      if (catList && Array.isArray(sb.categories)) {
        catList.innerHTML = sb.categories.map((c) => `<li class="cat-item"><a href="#">${esc(c)}</a></li>`).join("");
      }

      // Optional official qualification document for regulated programs.
      const documentSection = document.getElementById("sbOfficialDocument");
      const documentTitle = document.getElementById("sbOfficialDocumentTitle");
      const documentText = document.getElementById("sbOfficialDocumentText");
      const documentLink = document.getElementById("sbOfficialDocumentLink");
      const documentData = sb.officialDocument;

      if (documentSection && documentLink && documentData?.url) {
        documentLink.href = documentData.url;
        if (documentTitle) documentTitle.textContent = documentData.title || "Resmî Yeterlilik Dokümanı";
        if (documentText) documentText.textContent = documentData.description || "";
        documentSection.hidden = false;
      }

      // YouTube / Shorts video shown immediately after Education Categories.
      const videoSection = document.getElementById("sbCourseVideo");
      const videoFrame = document.getElementById("sbCourseVideoFrame");
      const videoLink = document.getElementById("sbCourseVideoLink");
      const videoTitle = document.getElementById("sbCourseVideoTitle");
      const videoData = sb.youtubeReels;
      const originalVideoUrl = String(videoData?.url || "").trim();
      const embedVideoUrl = getYouTubeEmbedUrl(originalVideoUrl);

      if (videoSection && videoFrame && videoLink && embedVideoUrl) {
        videoFrame.src = embedVideoUrl;
        videoFrame.title = videoData?.title || `${data?.content?.mainTitle || "Eğitim"} videosu`;
        videoLink.href = originalVideoUrl;
        if (videoTitle) videoTitle.textContent = videoData?.title || "Eğitim Videosu";
        videoSection.hidden = false;
      }

      // 4.5 Tags
      const tagList = document.getElementById("sbTagsList");
      if (tagList && Array.isArray(sb.tags)) {
        tagList.innerHTML = sb.tags.map((t) => `<li><a href="#">${esc(t)}</a></li>`).join("");
      }
    }
    renderAfterAccordion(data);
    if (typeof renderPage === "function") renderPage(data);
    if (typeof renderAfterAccordion === "function") renderAfterAccordion(data);
    alignCourseSidebarWithHero();
  } catch (error) {
    console.error("Hata:", error);
  }
}

// -----------------------------
// STARTUP
// -----------------------------

// fetch appropriate course and render on page load
document.addEventListener("DOMContentLoaded", async () => {
  try {
    const slug = getSlugFromUrl() || "icf-level-1";
    const course = await fetchCourseBySlug({
      indexUrl: "data/courses.json",
      slug,
    });
    await renderCourse(course);
  } catch (err) {
    console.error("initCoursePage error", err);
    // optionally show a user-friendly message or redirect
  } finally {
    const main = document.getElementById("main");
    if (main) main.classList.remove("is-loading");
  }
});
