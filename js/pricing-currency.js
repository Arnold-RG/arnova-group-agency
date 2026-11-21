(function () {
  var select = document.getElementById("currency-choice");
  if (!select) return;

  var bundled = window.ARNOVA_FX_RATES && window.ARNOVA_FX_RATES.rates;
  var rates = bundled || { RWF: 1, EUR: 0.000615, USD: 0.000676, PLN: 0.002718 };

  function hasRate(code) {
    return rates && Number.isFinite(rates[code]) && rates[code] > 0;
  }

  var currency = hasRate(select.value) ? select.value : "RWF";
  var cards = Array.prototype.slice.call(document.querySelectorAll(".card .price"));
  var base = [35000, 65000, 110000, 120000];

  function fmt(n, c) {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: c,
      maximumFractionDigits: c === "RWF" ? 0 : 2
    }).format(n);
  }

  function fromRwf(amount, c) {
    if (c === "RWF") return amount;
    return amount * rates[c];
  }

  function fromPln(amount, c) {
    if (c === "PLN") return amount;
    if (c === "RWF") return amount / rates.PLN;
    return amount * rates[c] / rates.PLN;
  }

  function render() {
    var c = hasRate(select.value) ? select.value : "RWF";
    currency = c;
    cards.forEach(function (el, i) {
      el.textContent = fmt(fromRwf(base[i], c), c);
    });
    document.querySelectorAll("[data-rwf]").forEach(function (el) {
      el.textContent = fmt(fromRwf(Number(el.getAttribute("data-rwf")), c), c);
    });
    document.querySelectorAll("[data-pln]").forEach(function (el) {
      el.textContent = fmt(fromPln(Number(el.getAttribute("data-pln")), c), c);
    });
  }

  select.addEventListener("change", render);
  render();
})();
