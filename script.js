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

    /* =====================
       Disappearing and appearing menu
    ===================== */

    let lastScrollY = window.scrollY;
    const navbar = document.querySelector(".navbar");

    window.addEventListener("scroll", () => {
         if (!navbar || navMenu.classList.contains("active")) return;

         if (window.scrollY > lastScrollY && window.scrollY > 100) {
             // scrolling down
             navbar.classList.add("hide");
         } else {
             // scrolling up
             navbar.classList.remove("hide");
         }

         lastScrollY = window.scrollY;
    });

    /* =====================
        Registration Form Handler
    ===================== */

    const registrationForm = document.getElementById("registrationForm");

    if (registrationForm) {
        registrationForm.addEventListener("submit", function (e) {
            e.preventDefault(); // stop page reload

            const formData = new FormData(registrationForm);

            const data = {
                batch: formData.get("batch"),
                name: formData.get("name"),
                age: formData.get("age"),
                gender: formData.get("gender"),
                address: formData.get("address"),
                whatsapp: formData.get("whatsapp")
            };

            // TEMP: store data locally
            localStorage.setItem("registrationData", JSON.stringify(data));

            // Go to payment page (next step)
            window.location.href = "payment.html";
        });
    }

    /* =====================
        Payment Page Logic
    ===================== */

    const paymentBox = document.getElementById("paymentSummary");

    if (paymentBox) {
        const data = JSON.parse(localStorage.getItem("registrationData"));

        if (!data) {
            paymentBox.innerHTML = "<p>No registration data found.</p>";
        } else {
            let amount = 0;

            if (data.batch.includes("Beginner")) amount = 1500;
            if (data.batch.includes("Intermediate")) amount = 2000;
            if (data.batch.includes("Advanced")) amount = 2500;

            paymentBox.innerHTML = `
                <p><strong>Name:</strong> ${data.name}</p>
                <p><strong>Batch:</strong> ${data.batch}</p>
                <p><strong>WhatsApp:</strong> ${data.whatsapp}</p>
                <p><strong>Amount Payable:</strong> ₹${amount}</p>
            `;
        }
    }


});
