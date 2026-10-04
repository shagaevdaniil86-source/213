document.getElementById("subscribe").addEventListener("submit", (event) => {
  event.preventDefault();
  document.getElementById("subscribe-result").textContent =
    "Учебная подписка оформлена. Данные остались в браузере.";
});
