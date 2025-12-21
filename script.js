document.addEventListener("DOMContentLoaded", function () {

    /* =====================
       Lightbox (Home page only)
    ===================== */
    const lightbox = document.getElementById("lightbox");
    const lightboxImg = document.getElementById("lightbox-img");
    const lightboxClose = document.querySelector(".lightbox .close");

    if (lightbox && lightboxImg && lightboxClose) {

        window.openLightbox = function (src) {
            lightboxImg.src = src;
            lightbox.style.display = "flex";
        };

        lightboxClose.onclick = function () {
            lightbox.style.display = "none";
        };

        lightbox.onclick = function (e) {
            if (e.target === lightbox) {
                lightbox.style.display = "none";
            }
        };
    }

    /* =====================
       Mobile Menu Logic
    ===================== */
    const hamburger = document.querySelector(".hamburger");
    const navMenu = document.getElementById("nav-menu");

    if (hamburger && navMenu) {

        hamburger.addEventListener("click", function () {
            navMenu.classList.toggle("active");
            hamburger.classList.toggle("active");
        });

        document.querySelectorAll("#nav-menu a").forEach(link => {
            link.addEventListener("click", () => {
                navMenu.classList.remove("active");
                hamburger.classList.remove("active");
            });
        });
    }

    /* =====================
       Fade-in on Scroll
    ===================== */
    const fadeElements = document.querySelectorAll(".fade-in");

    if (fadeElements.length > 0) {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add("visible");
                        observer.unobserve(entry.target);
                    }
                });
            },
            { threshold: 0.15 }
        );

        fadeElements.forEach((el) => observer.observe(el));
    }
});
