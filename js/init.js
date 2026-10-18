var config = {
  '.chosen-select'           : {},
  '.chosen-select-deselect'  : { allow_single_deselect: true },
  '.chosen-select-no-single' : { disable_search_threshold: 10 },
  '.chosen-select-no-results': { no_results_text: 'Oops, nothing found!' },
  '.chosen-select-rtl'       : { rtl: true },
  '.chosen-select-width'     : { width: '95%' }
}
for (var selector in config) {
  $(selector).chosen(config[selector]);
}

// Kurs adlari, sirasi ve temiz URL'leri icin tek kaynak.
// Sayfalarda kalan eski sablon linklerini de ziyaretciye gosterilmeden duzeltir.
const courseCatalog = [
  {
    slug: "mind-flow-system-performans-koclugu-liderlik-egitimi",
    title: "Mind Flow System ile Performans Koçluk ve Liderlik Eğitimi",
  },
  {
    slug: "myk-koc-seviye-6",
    title: "MYK Koç Seviye 6 Sınav Hazırlık Eğitimi",
  },
  {
    slug: "myk-egitim-uzmani-seviye-6",
    title: "MYK Eğitim Uzmanı Seviye 6 Sınav Hazırlık Eğitimi",
  },
  {
    slug: "icf-level-1",
    title: "ICF Level 1 Professional Coaching - Diploma Programı",
  },
  {
    slug: "icf-level-2",
    title: "ICF Level 2 Professional Coaching - Diploma Programı",
  },
  { slug: "nlp-kocluk-egitimi", title: "NLP Koçluk Eğitimi" },
  { slug: "egiticinin-egitimi", title: "Eğiticinin Eğitimi" },
];

const courseImages = {
  "mind-flow-system-performans-koclugu-liderlik-egitimi": "images/sinav-metorlugu.jpg",
  "myk-koc-seviye-6": "images/kurslar/seviye3.jpg",
  "myk-egitim-uzmani-seviye-6": "images/beden-dili.jpg",
  "icf-level-1": "images/kurslar/seviye1.jpg",
  "icf-level-2": "images/kurslar/seviye2.jpg",
  "nlp-kocluk-egitimi": "images/NPL.jpg",
  "egiticinin-egitimi": "images/egiticinin-egitimi.jpg",
};

window.courseCatalog = courseCatalog;
window.getCourseUrl = function getCourseUrl(slug) {
  return `/kurslar/${encodeURIComponent(slug)}`;
};

function getCourseSlugFromHref(href) {
  const rawHref = String(href || "").trim();
  if (!rawHref || rawHref.startsWith("#")) return null;

  try {
    const url = new URL(rawHref, window.location.href);
    const querySlug = url.searchParams.get("slug");
    if (querySlug) return querySlug;

    // A hash-only link (for example #popup1) resolves to the current course
    // pathname. Only treat href values that explicitly contain /kurslar/ as
    // course links; otherwise Giriş/Kaydol and in-page controls get renamed.
    if (!rawHref.includes("/kurslar/")) return null;

    const match = url.pathname.match(/\/kurslar\/([^/]+)\/?$/);
    return match ? decodeURIComponent(match[1]) : null;
  } catch (error) {
    return null;
  }
}

function normalizeCourseLinksAndNames() {
  const bySlug = new Map(courseCatalog.map((course) => [course.slug, course]));

  document.querySelectorAll("a[href]").forEach((link) => {
    const slug = getCourseSlugFromHref(link.getAttribute("href"));
    const course = bySlug.get(slug);
    if (!course) return;

    link.setAttribute("href", window.getCourseUrl(slug));

    const titleNode = link.querySelector("h1, h2, h3, h4, [data-course-name]");
    if (titleNode) {
      titleNode.textContent = course.title;
      if (titleNode.hasAttribute("data-course-name")) {
        titleNode.setAttribute("data-course-name", course.title);
      }
    } else if (!link.children.length) {
      link.textContent = course.title;
    }
  });

  // Kurslar sayfasindaki kartlari verilen siraya dizer ve listede olmayan
  // eski "Kendini Tanima" kartini kaldirir.
  const courseCards = Array.from(document.querySelectorAll("[data-course-name]"))
    .map((titleNode) => {
      const link = titleNode.closest("a[href]") || titleNode.querySelector("a[href]");
      const column = titleNode.closest(".col-xs-12");
      return { slug: getCourseSlugFromHref(link?.getAttribute("href")), column };
    })
    .filter((item) => item.slug && item.column);

  if (courseCards.length) {
    const parent = courseCards[0].column.parentElement;
    const cardsBySlug = new Map(courseCards.map((item) => [item.slug, item.column]));
    courseCards.forEach((item) => {
      if (!bySlug.has(item.slug)) item.column.remove();
    });
    courseCatalog.forEach((course) => {
      const column = cardsBySlug.get(course.slug);
      if (column && column.parentElement === parent) parent.appendChild(column);
    });
  }

  document.querySelectorAll(".fooer-navigation").forEach((list) => {
    list.innerHTML = `
      <li><a href="courses-list.html">Tüm Kurslar</a></li>
      ${courseCatalog
        .map((course) => `<li><a href="${window.getCourseUrl(course.slug)}">${course.title}</a></li>`)
        .join("")}
    `;
  });

  const sidebarCourseList = document.querySelector("#sidebar .widget_popular_posts .widget-cources-list");
  if (sidebarCourseList) {
    sidebarCourseList.innerHTML = courseCatalog
      .map(
        (course) => `
          <li>
            <a href="${window.getCourseUrl(course.slug)}">
              <div class="alignleft large">
                <img src="${courseImages[course.slug]}" alt="${course.title}">
              </div>
              <div class="description-wrap"><h4>${course.title}</h4></div>
            </a>
          </li>`,
      )
      .join("");
  }
}

document.addEventListener("DOMContentLoaded", normalizeCourseLinksAndNames);
