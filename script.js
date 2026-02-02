const BACKEND_URL = "https://blissout-backend.onrender.com";
let razorpayKey = null;

async function fetchRazorpayKey() {
  try {
    const res = await fetch(`${BACKEND_URL}/razorpay-key`);
    if (!res.ok) throw new Error("Backend not responding");
    const data = await res.json();
    razorpayKey = data.key;
    console.log("✅ Razorpay Key Loaded");
  } catch (err) {
    console.error("❌ Failed to load Razorpay key:", err);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  fetchRazorpayKey();

  /* ===================== REGISTRATION ===================== */
  const registrationForm = document.getElementById("registrationForm");
  if (registrationForm) {
    registrationForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const formData = new FormData(registrationForm);
      const data = {
        batch: formData.get("batch"),
        name: formData.get("name"),
        whatsapp: formData.get("whatsapp"),
        passId: `BLISS-${formData.get("batch").substring(0, 3).toUpperCase()}-${Math.floor(10000 + Math.random() * 90000)}`,
        status: "Pending Payment",
      };
      localStorage.setItem("registrationData", JSON.stringify(data));
      window.location.href = "payment.html";
    });
  }

  /* ===================== PAYMENT PAGE ===================== */
  if (window.location.pathname.includes("payment.html")) {
    const data = JSON.parse(localStorage.getItem("registrationData"));
    if (data) {
      let amount = 1500;
      if (data.batch.includes("Intermediate")) amount = 2000;
      if (data.batch.includes("Advanced")) amount = 2500;

      const batchEl = document.getElementById("batchInfo");
      const amountEl = document.getElementById("amountInfo");
      
      if (batchEl) batchEl.innerText = `Batch: ${data.batch}`;
      if (amountEl) amountEl.innerText = `Total: ₹${amount}`;
      localStorage.setItem("temp_amount", amount);
    }
  }

  /* ===================== RAZORPAY PAYMENT ===================== */
  const confirmPaymentBtn = document.getElementById("confirmPaymentBtn");
  if (confirmPaymentBtn) {
    confirmPaymentBtn.addEventListener("click", async () => {
      if (!razorpayKey) {
        alert("Payment system is loading, please try again in a moment.");
        return;
      }
      const data = JSON.parse(localStorage.getItem("registrationData"));
      const amount = localStorage.getItem("temp_amount");
      if (!data || !amount) return alert("No registration found");

      try {
        const orderRes = await fetch(`${BACKEND_URL}/create-order`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ amount }),
        });

        const order = await orderRes.json();

        const options = {
          key: razorpayKey,
          amount: order.amount,
          currency: "INR",
          name: "Bliss Out Dance Studio",
          description: data.batch,
          order_id: order.id,
          handler: async (response) => {
            const verifyRes = await fetch(`${BACKEND_URL}/verify-payment`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(response),
            });

            const result = await verifyRes.json();
            if (result.success) {
              localStorage.setItem("payment_id", response.razorpay_payment_id);
              window.location.href = "payment-success.html";
            } else {
              alert("Payment verification failed");
            }
          },
          theme: { color: "#e94560" },
        };
        new Razorpay(options).open();
      } catch (err) {
        console.error("Payment Error:", err);
        alert("Payment error occurred.");
      }
    });
  }

  /* ===================== SUCCESS PAGE ===================== */
  if (window.location.pathname.includes("payment-success.html")) {
    const data = JSON.parse(localStorage.getItem("registrationData"));
    const pId = localStorage.getItem("payment_id");
    const amt = localStorage.getItem("temp_amount");

    if (data && pId) {
        document.getElementById("successBatch").innerText = `Batch: ${data.batch}`;
        document.getElementById("successAmount").innerText = `Amount Paid: ₹${amt}`;
        document.getElementById("successPaymentId").innerText = `Payment ID: ${pId}`;
    }
  }

  /* ===================== PASS PAGE RENDER & DOWNLOAD ===================== */
  if (window.location.pathname.includes("pass.html")) {
    const data = JSON.parse(localStorage.getItem("registrationData"));
    const downloadContainer = document.getElementById("download-container");
    const whatsappBtn = document.getElementById("whatsappBtn");

    if (!data || !localStorage.getItem("payment_id")) {
      window.location.href = "index.html";
    } else {
      // Logic for PDF Download
      async function triggerPassDownload() {
        try {
          const response = await fetch(`${BACKEND_URL}/generate-pass`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              name: data.name,
              batch: data.batch,
              passId: data.passId
            }),
          });

          // Check if the response is a PDF
          const contentType = response.headers.get("content-type");
          if (!response.ok || contentType !== "application/pdf") {
            const errorText = await response.text();
            console.error("Backend Error:", errorText);
            throw new Error("Failed to generate valid PDF");
          }

          const blob = await response.blob();
          const url = window.URL.createObjectURL(blob);

          if (downloadContainer) {
            downloadContainer.innerHTML = `
              <p style="color: #2ecc71; margin-bottom: 15px;">✅ Your pass is ready!</p>
              <a href="${url}" download="BlissOut_Pass_${data.passId}.pdf" class="about-cta" style="background-color: #e94560; border: none; text-decoration:none;">
                  Download PDF Pass
              </a>`;
          }
        } catch (err) {
          console.error(err);
          if (downloadContainer) downloadContainer.innerHTML = `<p style="color: #e94560;">Error generating pass. Please refresh.</p>`;
        }
      }

      triggerPassDownload();

      // Logic for WhatsApp Link
      if (whatsappBtn) {
        const message = `Hello Bliss Out 👋\n\nI have downloaded my entry pass.\n\nName: ${data.name}\nBatch: ${data.batch}\nPass ID: ${data.passId}\n\nThank you!`.trim();
        whatsappBtn.href = "https://wa.me/918964033641?text=" + encodeURIComponent(message);
      }
    }
  }

  /* ===================== HOME GALLERY CAROUSEL ===================== */
  const track = document.querySelector(".carousel-track");
  const prevBtn = document.querySelector(".carousel-btn.left");
  const nextBtn = document.querySelector(".carousel-btn.right");

  if (track && prevBtn && nextBtn) {
    const visible = 3;
    const gap = 40;
    let items = Array.from(track.children);
    if (items.length > 0) {
      const itemWidth = items[0].getBoundingClientRect().width + gap;
      const firstClones = items.slice(0, visible).map((el) => el.cloneNode(true));
      const lastClones = items.slice(-visible).map((el) => el.cloneNode(true));

      lastClones.forEach((clone) => track.prepend(clone));
      firstClones.forEach((clone) => track.append(clone));

      items = Array.from(track.children);
      let index = visible;
      track.style.transform = `translateX(-${itemWidth * index}px)`;

      function moveToIndex(i, animate = true) {
        track.style.transition = animate ? "transform 0.6s ease" : "none";
        track.style.transform = `translateX(-${itemWidth * i}px)`;
        index = i;
      }

      nextBtn.addEventListener("click", () => moveToIndex(index + 1));
      prevBtn.addEventListener("click", () => moveToIndex(index - 1));

      track.addEventListener("transitionend", () => {
        if (index >= items.length - visible) moveToIndex(visible, false);
        if (index < visible) moveToIndex(items.length - visible * 2, false);
      });

      setInterval(() => moveToIndex(index + 1), 4000);
    }
  }

  /* ===================== MOBILE NAV TOGGLE ===================== */
  const hamburger = document.querySelector(".hamburger");
  const navMenu = document.getElementById("nav-menu");
  const backdrop = document.querySelector(".nav-backdrop");

  if (hamburger && navMenu) {
    hamburger.addEventListener("click", () => {
      navMenu.classList.toggle("open");
      hamburger.classList.toggle("active");
      if (backdrop) backdrop.classList.toggle("active");
    });
  }

  /* ===================== MOBILE DROPDOWN ===================== */
  const dropdownToggles = document.querySelectorAll(".dropdown-arrow");
  dropdownToggles.forEach((arrow) => {
    arrow.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      const parent = arrow.closest(".has-dropdown");
      if (parent) parent.classList.toggle("open");
    });
  });
});