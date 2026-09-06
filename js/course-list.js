// common elements used on the course list page
const educationCount = document.getElementById("educationCount");
const ul = document.getElementById('pagination');
const searchTag = document.getElementById('searchTag');

// helper that returns all anchors which carry the course title attribute
function getCourseAnchors() {
    return Array.from(document.querySelectorAll('[data-course-name]'));
}

// update the paragraph that shows how many items are visible
function updateEducationCount(visibleCount) {
    const totalCount = getCourseAnchors().length;
    educationCount.textContent = `${totalCount} Eğitimden ${visibleCount} tanesi listeleniyor`;
}

// show/hide courses based on the query string
function filterCourses(query) {
    const anchors = getCourseAnchors();
    let visible = 0;
    anchors.forEach(a => {
        const txt = a.textContent.trim().toLowerCase();
        const show = query === '' || txt.includes(query);
        const container = a.closest('.col-xs-12');
        if (container) {
            container.style.display = show ? '' : 'none';
        }
        if (show) visible++;
    });
    updateEducationCount(visible);
}

// wire up the search input
if (searchTag) {
    searchTag.addEventListener('input', e => {
        filterCourses(e.target.value.trim().toLowerCase());
    });
}

// set initial state once DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    filterCourses('');
});

// the JSON fetch was previously used to count courses/paginate.
// if you still need it for other features, leave it but don't
// override the results produced by the DOM-based logic.
//     const count = data.courses.length;
//     if (count < 9) {
    //         educationCount.textContent = `${count} Eğitimden tamamı listeleniyor`;
    //     } else {
        //         educationCount.textContent = `${count} Eğitimden 9'u listeleniyor`;
        //     }
        // });
//    const coursePrice = document.querySelector('[data-course-price]');
//    const courseName = document.querySelector('[data-course-name]')?.textContent.trim();

//    if (coursePrice && courseName) {
//        fetch('./data/courses.json')
//            .then(res => res.json())
//            .then(data => {
//                const course = data.courses.find(c => c.heading.title === courseName);
//                if (course) {
//                    coursePrice.innerHTML = `${course.sidebar.courseInfo.price}`;
//                    console.log("Price set:", coursePrice.innerHTML);
//                }
//            })
//            .catch(err => console.error('Error fetching course data:', err));
//    }
