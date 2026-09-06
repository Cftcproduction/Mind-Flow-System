const temp = document.getElementById('template')
let coursesObj = null;

fetch("data/courses.json").then(response =>{
    if(!response.ok){throw new Error("Json yüklenemedi")}
    return response.json()})
.then(data =>{ 
    console.log(data);
    const course = data.courses.find(c => 
       c.page.slug 

    )
console.log(course);


coursesObj = {
  title: course.heading.title,
  price: course.sidebar.courseInfo.price,
  heroImage: course.content.heroImage.src
}

const templateCard = `
<article class="popular-post">
                    <div class="aligncenter">
                      <img src="${coursesObj.heroImage}" alt="${coursesObj.title}">
                    </div>
                    <div>
                      <strong class="bg-success text-white font-lato text-uppercase price-tag">${coursesObj.price}</strong>
                    </div>
                    <h3 class="post-heading"><a href="course-single-temp.html?slug=egiticinin-egitimi" tabindex="-1">${coursesObj.title}</a></h3>
                    <div class="post-author">
                      <div class="alignleft no-shrink rounded-circle">
                        <a href="instructor-single.html" tabindex="-1"><img src="images/Selcan-Arslan.jpg" class="rounded-circle" alt="image description"></a>
                      </div>
                      <h4 class="author-heading"><a href="instructor-single.html" tabindex="-1">Selcan Arslan</a></h4>
                    </div>
                    <footer class="post-foot gutter-reset">
                      <ul class="list-unstyled post-statuses-list">
                        <li>
                          <a href="#" tabindex="-1">
                            <span class="fas icn fa-users no-shrink"><span class="sr-only">Kullanıcılar</span></span>
                            <strong class="text fw-normal">200</strong>
                          </a>
                        </li>
                        <li>
                          <a href="#" tabindex="-1">
                            <span class="fas icn no-shrink fa-comments"><span class="sr-only">Yorumlar</span></span>
                            <strong class="text fw-normal">3</strong>
                          </a>
                        </li>
                      </ul>
                      <ul class="star-rating list-unstyled">
                        <li>
                          <span class="fas fa-star"><span class="sr-only">star</span></span>
                        </li>
                        <li>
                          <span class="fas fa-star"><span class="sr-only">star</span></span>
                        </li>
                        <li>
                          <span class="fas fa-star"><span class="sr-only">star</span></span>
                        </li>
                        <li>
                          <span class="fas fa-star"><span class="sr-only">star</span></span>
                        </li>
                        <li>
                          <span class="far fa-star"><span class="sr-only">star</span></span>
                        </li>
                      </ul>
                    </footer>
                  </article>
`

temp.innerHTML = templateCard
})