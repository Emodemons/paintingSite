//nav between diff pages
const currentPage = window.location.pathname.split("/").pop();

if (currentPage === "painting.html") {
  document.getElementById("painting").disabled = true;
}

if (currentPage === "bio.html") {
  document.getElementById("biography").disabled = true;
}

if (currentPage === "video.html") {
  document.getElementById("performance").disabled = true;
}

