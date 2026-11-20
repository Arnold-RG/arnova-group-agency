"use strict";

(function () {
  const select = document.getElementById("currency-choice");
  const fxStatus = document.getElementById("fx-status");
  if (!select) return;

  const prices = Array.from(document.querySelectorAll("[data-amount][data-currency]"));
  const baseCurrency = "RWF";
  let rates = null;

  function formatAmount(amount, currency) {
    const digits = currency === "RWF" ? 0 : 2;
    const number = new Intl.NumberFormat("en-US", {
      maximumFractionDigits: digits,
      minimumFractionDigits: digits
    }).format(amount);
    return number + " " + currency;
  }

  function toDisplayAmount(el, currency) {
    const amount = Number(el.getAttribute("data-amount"));
    const from = el.getAttribute("data-currency") || baseCurrency;
    if (!Number.isFinite(amount)) return null;
    if (currency === from) return amount;
    if (from === baseCurrency && rates && Number.isFinite(rates[currency])) {
      return amount * rates[currency];
    }
    return null;
  }

  function render() {
    const currency = select.value;
    prices.forEach(function (el) {
      const converted = toDisplayAmount(el, currency);
      if (converted == null) {
        el.textContent = formatAmount(Number(el.getAttribute("data-amount")), el.getAttribute("data-currency") || baseCurrency);
        return;
      }
      el.textContent = formatAmount(converted, currency);
    });
    if (!fxStatus) return;
    if (currency === baseCurrency) {
      fxStatus.textContent = "";
    } else if (rates && Number.isFinite(rates[currency])) {
      fxStatus.textContent = "Estimated conversion from listed RWF starting prices.";
    } else {
      fxStatus.textContent = "Rates unavailable — showing listed RWF prices.";
    }
  }

  select.addEventListener("change", render);
  render();

  fetch("https://open.er-api.com/v6/latest/RWF", { mode: "cors" })
    .then(function (response) {
      if (!response.ok) throw new Error("Rate service unavailable");
      return response.json();
    })
    .then(function (data) {
      if (
        data.result !== "success" ||
        !data.rates ||
        !["EUR", "USD", "PLN"].every(function (code) {
          return Number.isFinite(data.rates[code]) && data.rates[code] > 0;
        })
      ) {
        throw new Error("Missing rates");
      }
      rates = data.rates;
      render();
    })
    .catch(function () {
      rates = null;
      render();
    });
})();
