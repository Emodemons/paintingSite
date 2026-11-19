//nav between diff pages
//each page names itself on its <body data-page="...">, which matches the
//id of its nav button, so this works whatever the web address looks like
//(e.g. "/", "/index.html", "/bio" or "/bio.html")
const currentPage = document.body.dataset.page;
const currentButton = currentPage && document.getElementById(currentPage);

if (currentButton) {
  currentButton.disabled = true;
}

//mobile nav dropdown
const navToggle = document.getElementById("nav-toggle");
const navLinks = document.getElementById("nav-links");

if (navToggle && navLinks) {
  navToggle.addEventListener("click", function (e) {
    e.stopPropagation();
    const isOpen = navLinks.classList.toggle("open");
    navToggle.setAttribute("aria-expanded", isOpen);
  });

  //close dropdown when clicking elsewhere
  document.addEventListener("click", function (e) {
    if (!navLinks.contains(e.target)) {
      navLinks.classList.remove("open");
      navToggle.setAttribute("aria-expanded", "false");
    }
  });
}

