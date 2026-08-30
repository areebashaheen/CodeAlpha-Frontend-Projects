document.addEventListener("DOMContentLoaded", function () {
    // Gallery items select karna
    const galleryItems = Array.from(
        document.querySelectorAll(".gallery-item")
    );

    // Filter buttons select karna
    const filterButtons = document.querySelectorAll(
        ".filter-btn, .filter-button"
    );

    // Lightbox elements
    const lightbox = document.getElementById("lightbox");

    const lightboxImage =
        document.getElementById("lightboxImage") ||
        document.getElementById("lightbox-image");

    const closeBtn =
        document.getElementById("closeBtn") ||
        document.getElementById("close-lightbox");

    const prevBtn =
        document.getElementById("prevBtn") ||
        document.getElementById("previous-image");

    const nextBtn =
        document.getElementById("nextBtn") ||
        document.getElementById("next-image");

    const imageCounter =
        document.getElementById("imageCounter") ||
        document.getElementById("lightbox-counter");

    // Currently visible images
    let visibleImages = [...galleryItems];

    // Current image index
    let currentIndex = 0;

    /*
        Selected category ke according images show/hide karna
    */
    function filterImages(category) {
        galleryItems.forEach(function (item) {
            const itemCategory = item.dataset.category;

            if (category === "all" || itemCategory === category) {
                item.classList.remove("hide");
                item.classList.remove("is-hidden");
            } else {
                item.classList.add("hide");
                item.classList.add("is-hidden");
            }
        });

        // Sirf visible images ki new list banana
        visibleImages = galleryItems.filter(function (item) {
            return (
                !item.classList.contains("hide") &&
                !item.classList.contains("is-hidden")
            );
        });
    }

    /*
        Filter button click functionality
    */
    filterButtons.forEach(function (button) {
        button.addEventListener("click", function () {
            const selectedCategory = button.dataset.filter;

            // Sab buttons se active class remove karna
            filterButtons.forEach(function (btn) {
                btn.classList.remove("active");
            });

            // Clicked button active banana
            button.classList.add("active");

            // Images filter karna
            filterImages(selectedCategory);
        });
    });

    /*
        Lightbox mein image show karna
    */
    function showImage(index) {
        if (visibleImages.length === 0) {
            return;
        }

        // Last ke baad first image
        if (index >= visibleImages.length) {
            currentIndex = 0;
        }
        // First se pehle last image
        else if (index < 0) {
            currentIndex = visibleImages.length - 1;
        }
        // Normal index
        else {
            currentIndex = index;
        }

        const selectedItem = visibleImages[currentIndex];
        const selectedImage = selectedItem.querySelector("img");

        // Lightbox image update karna
        lightboxImage.src = selectedImage.src;
        lightboxImage.alt = selectedImage.alt;

        // Counter show karna
        if (imageCounter) {
            imageCounter.textContent =
                `${currentIndex + 1} / ${visibleImages.length}`;
        }
    }

    /*
        Lightbox open karna
    */
    function openLightbox(item) {
        // Visible images ki list update karna
        visibleImages = galleryItems.filter(function (galleryItem) {
            return (
                !galleryItem.classList.contains("hide") &&
                !galleryItem.classList.contains("is-hidden")
            );
        });

        // Clicked image ka index find karna
        currentIndex = visibleImages.indexOf(item);

        if (currentIndex === -1) {
            currentIndex = 0;
        }

        showImage(currentIndex);

        // Dono class names support karne ke liye
        lightbox.classList.add("show");
        lightbox.classList.add("is-open");

        document.body.style.overflow = "hidden";
    }

    /*
        Lightbox close karna
    */
    function closeLightbox() {
        lightbox.classList.remove("show");
        lightbox.classList.remove("is-open");

        document.body.style.overflow = "auto";
    }

    /*
        Gallery image click
    */
    galleryItems.forEach(function (item) {
        item.addEventListener("click", function () {
            openLightbox(item);
        });
    });

    /*
        Close button
    */
    if (closeBtn) {
        closeBtn.addEventListener("click", closeLightbox);
    }

    /*
        Lightbox ke bahar click karne par close
    */
    lightbox.addEventListener("click", function (event) {
        if (event.target === lightbox) {
            closeLightbox();
        }
    });

    /*
        Next image
    */
    if (nextBtn) {
        nextBtn.addEventListener("click", function (event) {
            event.stopPropagation();
            showImage(currentIndex + 1);
        });
    }

    /*
        Previous image
    */
    if (prevBtn) {
        prevBtn.addEventListener("click", function (event) {
            event.stopPropagation();
            showImage(currentIndex - 1);
        });
    }

    /*
        Keyboard controls:
        Right Arrow = Next
        Left Arrow = Previous
        Escape = Close
    */
    document.addEventListener("keydown", function (event) {
        const lightboxIsOpen =
            lightbox.classList.contains("show") ||
            lightbox.classList.contains("is-open");

        if (!lightboxIsOpen) {
            return;
        }

        if (event.key === "ArrowRight") {
            showImage(currentIndex + 1);
        }

        if (event.key === "ArrowLeft") {
            showImage(currentIndex - 1);
        }

        if (event.key === "Escape") {
            closeLightbox();
        }
    });

    /*
        Starting mein All category show hogi
    */
    filterImages("all");
});