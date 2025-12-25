const BACKEND_URL = "https://blissout-backend.onrender.com";

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
        Payment Page Details
    ===================== */

    const paymentSummary = document.getElementById("paymentSummary");

    if (paymentSummary) {
        const data = JSON.parse(localStorage.getItem("registrationData"));

        if (data) {
            document.getElementById("batchInfo").innerText =
                `Batch: ${data.batch}`;

            let amount = "₹1500";

            if (data.batch.includes("Intermediate")) amount = "₹2000";
            if (data.batch.includes("Advanced")) amount = "₹2500";

            document.getElementById("amountInfo").innerText =
                `Amount to Pay: ${amount}`;
        }
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
                <h2>Bliss Out Dance Studio</h2>

                <p><strong>Name:</strong> ${data.name}</p>
                <p><strong>Batch:</strong> ${data.batch}</p>

                <div class="pass-id">
                    PASS ID: ${data.passId}
                </div>

                <div class="pass-status">
                    Status: ${data.status}
                </div>
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

    /* =====================
        Payment Confirmation
    ===================== */

    const confirmPaymentBtn = document.getElementById("confirmPaymentBtn");

if (confirmPaymentBtn) {
    confirmPaymentBtn.addEventListener("click", async () => {
        const data = JSON.parse(localStorage.getItem("registrationData"));
        if (!data) {
            alert("No registration found");
            return;
        }

        // Decide amount
        let amount = 1500;
        if (data.batch.includes("Intermediate")) amount = 2000;
        if (data.batch.includes("Advanced")) amount = 2500;

        try {
            // 1️⃣ Create order from backend
            const orderRes = await fetch(`${BACKEND_URL}/create-order`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ amount })
            });

            const order = await orderRes.json();

            // 2️⃣ Open Razorpay checkout
            const options = {
                key: "rzp_test_RvL7VYt7d6Awls", // 🔴 your TEST key only
                amount: order.amount,
                currency: "INR",
                name: "Bliss Out Dance Studio",
                description: data.batch,
                order_id: order.id,

                handler: async function (response) {
                    // 3️⃣ Verify payment on backend
                    const verifyRes = await fetch(`${BACKEND_URL}/verify-payment`, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify(response)
                    });

                    const verifyData = await verifyRes.json();

                    if (verifyData.status === "success") {
                        data.status = "Payment Completed";
                        data.paymentId = response.razorpay_payment_id;

                        localStorage.setItem(
                            "registrationData",
                            JSON.stringify(data)
                        );

                        window.location.href = "pass.html";
                    } else {
                        alert("Payment verification failed");
                    }
                },

                theme: { color: "#e94560" }
            };

            const rzp = new Razorpay(options);
            rzp.open();

        } catch (err) {
            alert("Something went wrong. Try again.");
            console.error(err);
        }
    });
}

});
