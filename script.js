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

            const passId = generatePassId(data.batch);

            const finalData = {
                ...data,
                passId: passId,
                status: "Pending Payment"
            };

            localStorage.setItem("registrationData", JSON.stringify(finalData));

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

    function generatePassId(batch) {
    const code = batch.includes("Beginner")
        ? "BEG"
        : batch.includes("Intermediate")
        ? "INT"
        : "ADV";

    const random = Math.floor(10000 + Math.random() * 90000);
    return `BLISS-${code}-${random}`;
    }

    /* =====================
        Entry Pass Page Logic
    ===================== */

    const passBox = document.getElementById("passDetails");
    const whatsappBtn = document.getElementById("whatsappBtn");

    if (passBox && whatsappBtn) {
        const data = JSON.parse(localStorage.getItem("registrationData"));

        if (!data) {
            passBox.innerHTML = "<p>No pass data found.</p>";
        } else {
            passBox.innerHTML = `
                <p><strong>Pass ID:</strong> ${data.passId}</p>
                <p><strong>Name:</strong> ${data.name}</p>
                <p><strong>Batch:</strong> ${data.batch}</p>
                <p><strong>Status:</strong> ${data.status}</p>
            `;

            const message = encodeURIComponent(
                `Hello Bliss Out 👋\n\n` +
                `I have registered successfully.\n\n` +
                `Name: ${data.name}\n` +
                `Batch: ${data.batch}\n` +
                `Pass ID: ${data.passId}\n\n` +
                `Please guide me for payment confirmation.`
            );

            whatsappBtn.href = `https://wa.me/918964033641?text=${message}`;
        }
    }


});
