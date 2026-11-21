(function(){
  var select = document.getElementById("currency-choice");
  var fxStatus = document.getElementById("fx-status");
  if (!select || !fxStatus) return;
  var cards = Array.prototype.slice.call(document.querySelectorAll(".card .price"));
  var base = [35000, 65000, 110000, 120000];
  var rates = null;

  function fmt(n, c) {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: c,
      maximumFractionDigits: c === "RWF" ? 0 : 2
    }).format(n);
  }

  function fromRwf(amount, currency) {
    if (currency === "RWF") return amount;
    if (rates && Number.isFinite(rates[currency]) && rates[currency] > 0) return amount * rates[currency];
    return null;
  }

  function fromPln(amount, currency) {
    if (currency === "PLN") return amount;
    if (!rates || !Number.isFinite(rates.PLN) || rates.PLN <= 0) return null;
    if (currency === "RWF") return amount / rates.PLN;
    if (Number.isFinite(rates[currency]) && rates[currency] > 0) return amount * rates[currency] / rates.PLN;
    return null;
  }

  function render() {
    var c = select.value;
    cards.forEach(function (el, i) {
      var converted = fromRwf(base[i], c);
      el.textContent = converted == null ? fmt(base[i], "RWF") : fmt(converted, c);
    });
    document.querySelectorAll("[data-rwf]").forEach(function (el) {
      var amount = Number(el.getAttribute("data-rwf"));
      var converted = fromRwf(amount, c);
      el.textContent = converted == null ? fmt(amount, "RWF") : fmt(converted, c);
    });
    document.querySelectorAll("[data-pln]").forEach(function (el) {
      var amount = Number(el.getAttribute("data-pln"));
      var converted = fromPln(amount, c);
      el.textContent = converted == null ? fmt(amount, "PLN") : fmt(converted, c);
    });
    if (c === "RWF") fxStatus.textContent = "";
    else if (rates && (c === "PLN" || (Number.isFinite(rates[c]) && rates[c] > 0))) fxStatus.textContent = "Estimated conversion";
    else fxStatus.textContent = "Rates unavailable — showing original prices";
  }

  select.addEventListener("change", render);
  render();
  fetch("https://open.er-api.com/v6/latest/RWF", { mode: "cors" })
    .then(function (r) {
      if (!r.ok) throw Error("Rate service unavailable");
      return r.json();
    })
    .then(function (data) {
      if (data.result !== "success" || !data.rates) throw Error("Missing rates");
      if (!["EUR", "USD", "PLN"].every(function (code) {
        return Number.isFinite(data.rates[code]) && data.rates[code] > 0;
      })) throw Error("Missing rates");
      rates = data.rates;
      render();
    })
    .catch(function () {
      rates = null;
      render();
    });
})();
