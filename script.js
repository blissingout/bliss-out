const BACKEND_URL = "https://blissout-backend.onrender.com";

document.addEventListener("DOMContentLoaded", function () {

    /* =====================
       LIGHTBOX (HOME PAGE)
    ===================== */
    const lightbox = document.getElementById("lightbox");
    const lightboxImg = document.getElementById("lightbox-img");
    const lightboxClose = document.querySelector(".lightbox .close");

    if (lightbox && lightboxImg && lightboxClose) {
        window.openLightbox = function (src) {
            lightboxImg.src = src;
            lightbox.style.display = "flex";
        };

        lightboxClose.onclick = () => lightbox.style.display = "none";
        lightbox.onclick = (e) => {
            if (e.target === lightbox) lightbox.style.display = "none";
        };
    }

    /* =====================
       MOBILE MENU
    ===================== */
    const hamburger = document.querySelector(".hamburger");
    const navMenu = document.getElementById("nav-menu");

    if (hamburger && navMenu) {
        hamburger.addEventListener("click", () => {
            hamburger.classList.toggle("active");
            navMenu.classList.toggle("active");
        });

        document.querySelectorAll("#nav-menu a").forEach(link => {
            link.addEventListener("click", () => {
                hamburger.classList.remove("active");
                navMenu.classList.remove("active");
            });
        });
    }

    /* =====================
       FADE IN ON SCROLL
    ===================== */
    const fadeElements = document.querySelectorAll(".fade-in");
    if (fadeElements.length) {
        const observer = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add("visible");
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.15 });

        fadeElements.forEach(el => observer.observe(el));
    }

    /* =====================
       HIDE / SHOW NAVBAR
    ===================== */
    let lastScrollY = window.scrollY;
    const navbar = document.querySelector(".navbar");

    window.addEventListener("scroll", () => {
        if (!navbar || navMenu?.classList.contains("active")) return;

        if (window.scrollY > lastScrollY && window.scrollY > 100) {
            navbar.classList.add("hide");
        } else {
            navbar.classList.remove("hide");
        }
        lastScrollY = window.scrollY;
    });

    /* =====================
       REGISTRATION FORM
    ===================== */
    const registrationForm = document.getElementById("registrationForm");

    if (registrationForm) {
        registrationForm.addEventListener("submit", e => {
            e.preventDefault();

            const formData = new FormData(registrationForm);
            const data = {
                batch: formData.get("batch"),
                name: formData.get("name"),
                age: formData.get("age"),
                gender: formData.get("gender"),
                address: formData.get("address"),
                whatsapp: formData.get("whatsapp"),
                passId: generatePassId(formData.get("batch")),
                status: "Pending Payment"
            };

            localStorage.setItem("registrationData", JSON.stringify(data));
            window.location.href = "payment.html";
        });
    }

    function generatePassId(batch) {
        const code = batch.includes("Beginner")
            ? "BEG"
            : batch.includes("Intermediate")
            ? "INT"
            : "ADV";
        return `BLISS-${code}-${Math.floor(10000 + Math.random() * 90000)}`;
    }

    /* =====================
       PAYMENT PAGE DETAILS
    ===================== */
    const paymentSummary = document.getElementById("paymentSummary");

    if (paymentSummary) {
        const data = JSON.parse(localStorage.getItem("registrationData"));
        if (data) {
            let amount = 1500;
            if (data.batch.includes("Intermediate")) amount = 2000;
            if (data.batch.includes("Advanced")) amount = 2500;

            document.getElementById("batchInfo").innerText = `Batch: ${data.batch}`;
            document.getElementById("amountInfo").innerText = `Amount to Pay: ₹${amount}`;
        }
    }

    /* =====================
       PAYMENT CONFIRMATION
    ===================== */
    const confirmPaymentBtn = document.getElementById("confirmPaymentBtn");

    if (confirmPaymentBtn) {
        confirmPaymentBtn.addEventListener("click", async () => {
            const data = JSON.parse(localStorage.getItem("registrationData"));
            if (!data) return alert("No registration found");

            let amount = 1500;
            if (data.batch.includes("Intermediate")) amount = 2000;
            if (data.batch.includes("Advanced")) amount = 2500;

            try {
                const orderRes = await fetch(`${BACKEND_URL}/create-order`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ amount })
                });

                const order = await orderRes.json();

                const options = {
                    key: "rzp_test_RvL7VYt7d6Awls",
                    amount: order.amount,
                    currency: "INR",
                    name: "Bliss Out Dance Studio",
                    description: data.batch,
                    order_id: order.id,

                    handler: async function (response) {
                        try {
                            const verifyRes = await fetch(`${BACKEND_URL}/verify-payment`, {
                                method: "POST",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({
                                    razorpay_order_id: response.razorpay_order_id,
                                    razorpay_payment_id: response.razorpay_payment_id,
                                    razorpay_signature: response.razorpay_signature
                                })
                            });

                            const result = await verifyRes.json();

                            if (result.success) {
                                localStorage.setItem("payment_id", response.razorpay_payment_id);
                                localStorage.setItem("batch", data.batch);
                                localStorage.setItem("amount", amount);

                                data.status = "Payment Completed";
                                data.paymentId = response.razorpay_payment_id;
                                localStorage.setItem("registrationData", JSON.stringify(data));

                                window.location.href = "payment-success.html";
                            } else {
                                alert("Payment verification failed");
                            }
                        } catch (err) {
                            alert("Payment verification error");
                            console.error(err);
                        }
                    },

                    theme: { color: "#e94560" }
                };

                new Razorpay(options).open();

            } catch (err) {
                alert("Payment error");
                console.error(err);
            }
        });
    }

    /* =====================
       PAYMENT SUCCESS PAGE
    ===================== */
    if (window.location.pathname.includes("payment-success")) {
        const paymentId = localStorage.getItem("payment_id");
        if (!paymentId) window.location.href = "index.html";

        document.getElementById("successBatch").innerText =
            `Batch: ${localStorage.getItem("batch")}`;

        document.getElementById("successAmount").innerText =
            `Amount Paid: ₹${localStorage.getItem("amount")}`;

        document.getElementById("successPaymentId").innerText =
            `Payment ID: ${paymentId}`;
    }

    /* =====================
       PASS PAGE PROTECTION
    ===================== */
    if (
        window.location.pathname.includes("pass.html") &&
        !localStorage.getItem("payment_id")
    ) {
        window.location.href = "index.html";
    }

});
