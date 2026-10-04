/* =========================================================
   NEXAFLOW — INTERACTION SYSTEM
========================================================= */

"use strict";

document.addEventListener("DOMContentLoaded", () => {

    /* =====================================================
       ELEMENTS
    ===================================================== */

    const html = document.documentElement;
    const body = document.body;

    const sidebar = document.getElementById("sidebar");
    const sidebarOverlay = document.getElementById("sidebarOverlay");
    const mobileMenu = document.getElementById("mobileMenu");
    const mobileClose = document.getElementById("mobileClose");

    const themeToggle = document.getElementById("themeToggle");
    const themeSelect = document.getElementById("themeSelect");

    const searchTrigger = document.getElementById("searchTrigger");
    const searchOverlay = document.getElementById("searchOverlay");
    const searchClose = document.getElementById("searchClose");
    const globalSearch = document.getElementById("globalSearch");

    const notificationButton = document.getElementById("notificationButton");
    const breadcrumbCurrent = document.getElementById("breadcrumbCurrent");

    const navLinks = document.querySelectorAll(".nav-link");
    const pages = document.querySelectorAll(".page-section");
    const pageLinks = document.querySelectorAll("[data-page-link]");
    const searchResults = document.querySelectorAll("[data-search-page]");

    const THEME_KEY = "nexaflow-theme";
    const PAGE_KEY = "nexaflow-page";


    /* =====================================================
       THEME SYSTEM
    ===================================================== */

    function getStoredTheme() {
    const stored = localStorage.getItem(THEME_KEY);

    if (stored === "light" || stored === "dark") {
        return stored;
    }

    return "dark";
}


    function applyTheme(theme) {

        const validTheme =
            theme === "light" ||
            theme === "dark" ||
            theme === "system"
                ? theme
                : "system";

        html.setAttribute("data-theme", validTheme);
        localStorage.setItem(THEME_KEY, validTheme);

        if (themeSelect) {
            themeSelect.value = validTheme;
        }

        if (themeToggle) {
            if (validTheme === "dark") {
                themeToggle.textContent = "☀";
                themeToggle.setAttribute(
                    "aria-label",
                    "Switch to light theme"
                );
                themeToggle.title = "Switch to light theme";
            } else if (validTheme === "light") {
                themeToggle.textContent = "☾";
                themeToggle.setAttribute(
                    "aria-label",
                    "Switch to dark theme"
                );
                themeToggle.title = "Switch to dark theme";
            } else {
                themeToggle.textContent = "◐";
                themeToggle.setAttribute(
                    "aria-label",
                    "Change theme"
                );
                themeToggle.title = "Theme: System";
            }
        }
    }


   function cycleTheme() {
    const current = getStoredTheme();

    const next = current === "dark"
        ? "light"
        : "dark";

    applyTheme(next);

    showToast(`Theme changed to ${capitalize(next)}.`);
}

    function capitalize(value) {
        return value.charAt(0).toUpperCase() + value.slice(1);
    }


    applyTheme(getStoredTheme());


    if (themeToggle) {
        themeToggle.addEventListener("click", cycleTheme);
    }


    if (themeSelect) {
        themeSelect.addEventListener("change", (event) => {

            const selectedTheme = event.target.value;

            applyTheme(selectedTheme);

            showToast(
                `Theme set to ${capitalize(selectedTheme)}.`
            );
        });
    }


    /* =====================================================
       PAGE NAVIGATION
    ===================================================== */

    const pageNames = {
        overview: "Overview",
        workflows: "Workflows",
        risks: "Risk Monitor",
        activity: "Activity",
        reports: "Reports",
        team: "Team",
        settings: "Settings"
    };


    function showPage(pageName, save = true) {

        if (!pageNames[pageName]) {
            pageName = "overview";
        }

        pages.forEach((page) => {
            page.classList.toggle(
                "active-page",
                page.id === `page-${pageName}`
            );
        });


        navLinks.forEach((link) => {
            link.classList.toggle(
                "active",
                link.dataset.page === pageName
            );
        });


        if (breadcrumbCurrent) {
            breadcrumbCurrent.textContent =
                pageNames[pageName];
        }


        if (save) {
            localStorage.setItem(PAGE_KEY, pageName);
        }


        closeSidebar();

        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });
    }


    navLinks.forEach((link) => {

        link.addEventListener("click", () => {

            const page = link.dataset.page;

            showPage(page);
        });

    });


    pageLinks.forEach((link) => {

        link.addEventListener("click", () => {

            const page = link.dataset.pageLink;

            if (page) {
                showPage(page);
            }

        });

    });


    searchResults.forEach((result) => {

        result.addEventListener("click", () => {

            const page = result.dataset.searchPage;

            closeSearch();
            showPage(page);

        });

    });


    const savedPage = localStorage.getItem(PAGE_KEY);

    if (savedPage && pageNames[savedPage]) {
        showPage(savedPage, false);
    } else {
        showPage("overview", false);
    }


    /* =====================================================
       MOBILE SIDEBAR
    ===================================================== */

    function openSidebar() {

        if (!sidebar) {
            return;
        }

        sidebar.classList.add("open");
        sidebarOverlay?.classList.add("active");
        body.classList.add("sidebar-open");
    }


    function closeSidebar() {

        if (!sidebar) {
            return;
        }

        sidebar.classList.remove("open");
        sidebarOverlay?.classList.remove("active");
        body.classList.remove("sidebar-open");
    }


    mobileMenu?.addEventListener("click", openSidebar);
    mobileClose?.addEventListener("click", closeSidebar);
    sidebarOverlay?.addEventListener("click", closeSidebar);


    /* =====================================================
       SEARCH
    ===================================================== */

    function openSearch() {

        if (!searchOverlay) {
            return;
        }

        searchOverlay.classList.add("open");
        searchOverlay.setAttribute("aria-hidden", "false");

        setTimeout(() => {
            globalSearch?.focus();
        }, 50);
    }


    function closeSearch() {

        if (!searchOverlay) {
            return;
        }

        searchOverlay.classList.remove("open");
        searchOverlay.setAttribute("aria-hidden", "true");

        if (globalSearch) {
            globalSearch.value = "";
            filterSearchResults("");
        }
    }


    searchTrigger?.addEventListener("click", openSearch);
    searchClose?.addEventListener("click", closeSearch);


    searchOverlay?.addEventListener("click", (event) => {

        if (event.target === searchOverlay) {
            closeSearch();
        }

    });


    function filterSearchResults(query) {

        const normalized = query.trim().toLowerCase();

        searchResults.forEach((result) => {

            const text =
                result.textContent.toLowerCase();

            result.hidden =
                normalized.length > 0 &&
                !text.includes(normalized);

        });

    }


    globalSearch?.addEventListener("input", (event) => {

        filterSearchResults(event.target.value);

    });


    /* =====================================================
       KEYBOARD SHORTCUT
    ===================================================== */

    document.addEventListener("keydown", (event) => {

        const modifier =
            event.ctrlKey || event.metaKey;

        if (modifier && event.key.toLowerCase() === "k") {

            event.preventDefault();

            openSearch();
        }


        if (event.key === "Escape") {

            closeSearch();
            closeSidebar();

        }

    });


    /* =====================================================
       NOTIFICATIONS
    ===================================================== */

    notificationButton?.addEventListener(
        "click",
        () => {

            showToast(
                "No new critical notifications. 2 operational updates are available."
            );

            const dot =
                notificationButton.querySelector(
                    ".notification-dot"
                );

            if (dot) {
                dot.style.display = "none";
            }

        }
    );


    /* =====================================================
       BUTTON ACTIONS
    ===================================================== */

    document.addEventListener("click", (event) => {

        const actionElement =
            event.target.closest("[data-action]");

        if (!actionElement) {
            return;
        }

        const action =
            actionElement.dataset.action;


        switch (action) {

            case "refresh":
                showToast(
                    "Workspace refreshed. Operational data is up to date."
                );
                break;


            case "report":
                showToast(
                    "Operational report prepared successfully."
                );
                break;


            case "export":
                showToast(
                    "Export request prepared. Your report is ready to download."
                );
                break;


            case "risk-scan":
                showToast(
                    "Risk scan completed. 7 active risks identified."
                );
                break;


            case "risk-details":
                showToast(
                    "Risk review opened for the selected operational item."
                );
                break;


            case "filter":
                showToast(
                    "Filters are ready. Choose a workflow or activity category."
                );
                break;


            case "new-workflow":
                showToast(
                    "New workflow creation is available in the operations workspace."
                );
                break;


            case "team-export":
                showToast(
                    "Team roster prepared for export."
                );
                break;


            case "assign":
                showToast(
                    "Assignment workspace opened for pending actions."
                );
                break;


            case "save-settings":
                showToast(
                    "Workspace settings saved successfully."
                );
                break;


            default:
                break;
        }

    });


    /* =====================================================
       SEARCH PAGE LINKS
    ===================================================== */

    document.querySelectorAll("[data-search-page]")
        .forEach((item) => {

            item.addEventListener("click", () => {

                const page =
                    item.dataset.searchPage;

                showPage(page);
                closeSearch();

            });

        });


    /* =====================================================
       FORM FEEDBACK
    ===================================================== */

    document.querySelectorAll(
        ".settings-form-grid input:not([readonly]), .settings-form-grid select"
    ).forEach((field) => {

        field.addEventListener("change", () => {

            field.dataset.changed = "true";

        });

    });


    /* =====================================================
       TOGGLE ACCESSIBILITY
    ===================================================== */

    document.querySelectorAll(
        ".toggle-row"
    ).forEach((row) => {

        const checkbox =
            row.querySelector("input[type='checkbox']");

        const visualSwitch =
            row.querySelector(".toggle-switch");

        if (!checkbox || !visualSwitch) {
            return;
        }

        visualSwitch.setAttribute(
            "role",
            "switch"
        );

        visualSwitch.setAttribute(
            "aria-checked",
            String(checkbox.checked)
        );


        checkbox.addEventListener(
            "change",
            () => {

                visualSwitch.setAttribute(
                    "aria-checked",
                    String(checkbox.checked)
                );

            }
        );

    });


    /* =====================================================
       TOAST
    ===================================================== */

    let toastTimer = null;


    function showToast(message) {

        const existing =
            document.querySelector(".toast");

        existing?.remove();

        const toast =
            document.createElement("div");

        toast.className = "toast";
        toast.setAttribute("role", "status");
        toast.textContent = message;

        document.body.appendChild(toast);


        clearTimeout(toastTimer);

        toastTimer = setTimeout(() => {

            toast.style.opacity = "0";
            toast.style.transform = "translateY(8px)";

            setTimeout(() => {
                toast.remove();
            }, 180);

        }, 3000);

    }


    /* =====================================================
       SYSTEM THEME CHANGE
       System option remains dynamic.
    ===================================================== */

    const systemTheme =
        window.matchMedia(
            "(prefers-color-scheme: dark)"
        );


    systemTheme.addEventListener?.(
        "change",
        () => {

            if (getStoredTheme() === "system") {
                applyTheme("system");
            }

        }
    );


    /* =====================================================
       FINAL INITIALIZATION
    ===================================================== */

    closeSidebar();
    closeSearch();

});
/* =========================================================
   NEXAFLOW — TWO-STATE THEME
   DARK <-> LIGHT ONLY
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    const themeButton = document.querySelector(".theme-toggle");
    const themeSelect = document.getElementById("themeSelect");
    const root = document.documentElement;

    function applyTheme(theme) {
        const finalTheme = theme === "light" ? "light" : "dark";

        root.setAttribute("data-theme", finalTheme);
        document.body.setAttribute("data-theme", finalTheme);

        localStorage.setItem("nexaflow-theme", finalTheme);

        if (themeSelect) {
            themeSelect.value = finalTheme;
        }

        if (themeButton) {
            themeButton.setAttribute(
                "aria-label",
                finalTheme === "dark"
                    ? "Switch to light mode"
                    : "Switch to dark mode"
            );

            themeButton.setAttribute(
                "title",
                finalTheme === "dark"
                    ? "Switch to light mode"
                    : "Switch to dark mode"
            );
        }
    }

    /* Remove any previous theme-button listeners */
    if (themeButton) {
        const cleanThemeButton = themeButton.cloneNode(true);
        themeButton.replaceWith(cleanThemeButton);

        cleanThemeButton.addEventListener("click", () => {
            const currentTheme =
                root.getAttribute("data-theme") || "dark";

            applyTheme(
                currentTheme === "dark"
                    ? "light"
                    : "dark"
            );
        });
    }

    /* Theme selector */
    if (themeSelect) {
        const cleanThemeSelect = themeSelect.cloneNode(true);
        themeSelect.replaceWith(cleanThemeSelect);

        cleanThemeSelect.innerHTML = `
            <option value="light">Light</option>
            <option value="dark">Dark</option>
        `;

        cleanThemeSelect.addEventListener("change", (event) => {
            applyTheme(event.target.value);
        });
    }

    /* Always start with saved Light/Dark preference */
    const savedTheme = localStorage.getItem("nexaflow-theme");

    applyTheme(
        savedTheme === "light"
            ? "light"
            : "dark"
    );
});