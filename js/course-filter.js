document.addEventListener("DOMContentLoaded", () => {
  const courseList = document.getElementById("courseList")
  const coursePrice = document.getElementById("coursePrice")
   const btn = document.getElementById("btnSearchCourse")

  // console.log("courseList:", courseList)
  // console.log("coursePrice:", coursePrice)

  let courses = []

  fetch("./data/courses.json")
    .then(res => res.json())
    .then(data => {
      courses = data.courses || []

      // Kursları bas
      courseList.innerHTML = `<option value="">Kurs Seç</option>`
      courses.forEach(c => {
        const opt = document.createElement("option")

        // Burada value: id/slug ne varsa onu ver
        const id = c.page?.id || c.page?.slug || c.slug || c.id
        opt.value = id

        opt.textContent = c.heading?.title || c.title || "Başlıksız Kurs"
        courseList.appendChild(opt)
      })

      // Fiyat placeholder
      coursePrice.innerHTML = `<option value="">Fiyat</option>`

      $("#courseList").trigger("chosen:updated")
      $("#coursePrice").trigger("chosen:updated")
    })

  // Chosen ile change'i jQuery'den yakalamak daha sağlam
  $("#courseList").on("change", function () {
    const selectedId = this.value

    // console.log("selectedId:", selectedId)

    if (!selectedId) {
      coursePrice.innerHTML = `<option value="">Fiyat</option>`
      $("#coursePrice").trigger("chosen:updated")
      return
    }

    const found = courses.find(c => {
      const id = c.page?.id || c.page?.slug || c.slug || c.id
      return String(id) === String(selectedId)
    })

    // console.log("found course:", found)

    const priceValue = found?.price ?? found?.content?.price ?? found?.sidebar?.courseInfo.price 
    // console.log(priceValue, typeof priceValue);
    // console.log("priceValue:", priceValue)

    const priceText = priceValue != null ? `${(priceValue).toLocaleString("tr-TR")} ` : "Fiyat bulunamadı"

    coursePrice.innerHTML = `<option value="${priceValue ?? ""}" selected>${priceText}</option>`
    $("#coursePrice").trigger("chosen:updated")
  })

   btn.addEventListener("click", () => {
     const slug = courseList.value // option.value buraya slug/id basılmış olmalı

     if (!slug) {
       // seçili kurs yoksa hiçbir şey yapma ya da uyarı ver
       alert("Lütfen bir kurs seçin.")
       return
     }

     // sayfaya slug ile git
     // not: index.html ve diğer linklerde kullanılan şablon sayfa
     // course-single-temp.html olduğu için burayı ona göre ayarlıyoruz.
     // Eğer ileride farklı bir hedef gerekirse bu satırı tek değişken
     // ile yönetmek daha kolay olacaktır.
     const targetPage = 'course-single-temp.html';
     window.location.href = `${targetPage}?slug=${encodeURIComponent(slug)}`
   })
 })

