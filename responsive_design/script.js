const toggle = document.querySelector(".nav-toggle"),
  menu = document.querySelector(".nav-menu");
function closeMenu() {
  menu.classList.remove("active");
  toggle.setAttribute("aria-expanded", "false");
}
toggle.addEventListener("click", () => {
  const open = menu.classList.toggle("active");
  toggle.setAttribute("aria-expanded", String(open));
});
menu.addEventListener("click", (e) => {
  if (e.target.closest("a")) closeMenu();
});
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    closeMenu();
    toggle.focus();
  }
});
matchMedia("(min-width:769px)").addEventListener("change", closeMenu);
