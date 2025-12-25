const BACKEND_URL = "https://blissout-backend.onrender.com";

document.addEventListener("DOMContentLoaded", function () {

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
        if (!data) return;

        let amount = 1500;
        if (data.batch.includes("Intermediate")) amount = 2000;
        if (data.batch.includes("Advanced")) amount = 2500;

        document.getElementById("batchInfo").innerText = `Batch: ${data.batch}`;
        document.getElementById("amountInfo").innerText = `Amount to Pay: ₹${amount}`;
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
                    },

                    theme: { color: "#e94560" }
                };

                new Razorpay(options).open();

            } catch (err) {
                console.error(err);
                alert("Payment error");
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
