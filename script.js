function openLightbox(src) {
    const lightbox = document.getElementById("lightbox");
    const lightboxImg = document.getElementById("lightbox-img");
    lightboxImg.src = src;
    lightbox.style.display = "flex";
}

document.querySelector(".lightbox .close").onclick = function () {
    document.getElementById("lightbox").style.display = "none";
};

document.getElementById("lightbox").onclick = function (e) {
    if (e.target.id === "lightbox") {
        this.style.display = "none";
    }
};

document.addEventListener("DOMContentLoaded", function () {
    const hamburger = document.querySelector(".hamburger");
    const navMenu = document.getElementById("nav-menu");

    hamburger.addEventListener("click", function () {
         navMenu.classList.toggle("active");
         hamburger.classList.toggle("active");
    });

});

// Fade-in on scroll
document.addEventListener("DOMContentLoaded", function () {
    const fadeElements = document.querySelectorAll(".fade-in");

    const observer = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add("visible");
                    observer.unobserve(entry.target); // run once
                }
            });
        },
        {
            threshold: 0.15
        }
    );

    fadeElements.forEach((el) => observer.observe(el));
});
