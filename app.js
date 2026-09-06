/* =========================================
   PIUS MEDICALS
   Main JavaScript
========================================= */


/* =========================================
   MOBILE MENU
========================================= */

const menuButton = document.querySelector(".menu-button");
const mobileMenu = document.querySelector("#mobileMenu");

if (menuButton && mobileMenu) {

    menuButton.addEventListener("click", function (event) {

        event.stopPropagation();

        mobileMenu.classList.toggle("open");

        const isOpen = mobileMenu.classList.contains("open");

        menuButton.setAttribute(
            "aria-expanded",
            isOpen
        );

    });


    /* CLOSE WHEN CLICKING OUTSIDE */

    document.addEventListener("click", function (event) {

        if (
            mobileMenu.classList.contains("open") &&
            !mobileMenu.contains(event.target) &&
            !menuButton.contains(event.target)
        ) {

            mobileMenu.classList.remove("open");

            menuButton.setAttribute(
                "aria-expanded",
                "false"
            );

        }

    });


    /* CLOSE AFTER SELECTING A MENU LINK */

    const menuLinks =
        mobileMenu.querySelectorAll("a");

    menuLinks.forEach(function (link) {

        link.addEventListener("click", function () {

            mobileMenu.classList.remove("open");

            menuButton.setAttribute(
                "aria-expanded",
                "false"
            );

        });

    });

}