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

function toggleMenu() {
    const nav = document.getElementById("nav-menu");
    nav.classList.toggle("active");
}
