const VERSION = "v5.1 Fixed Clean Preview";

const app = document.getElementById("app");
const toast = document.getElementById("toast");
const dayText = document.getElementById("dayText");

let screen = "home";
let selectedStock = null;
let day = 142;

const playerData = {
  inventory: { copper: 192, iron: 96, gold: 40, diamond: 28, netherite: 4 },
  shares: { copper: 3, iron: 2, gold: 1, diamond: 5, netherite: 1 }
};

const iconUrls = {
  copper: "https://minecraft.wiki/images/Copper_Ingot_JE2_BE1.png",
  iron: "https://minecraft.wiki/images/Iron_Ingot_JE3_BE2.png",
  gold: "https://minecraft.wiki/images/Gold_Ingot_JE4_BE2.png",
  diamond: "https://minecraft.wiki/images/Diamond_JE3_BE3.png",
  netherite: "https://minecraft.wiki/images/Netherite_Ingot_JE1_BE2.png",
  portfolio: "https://minecraft.wiki/images/Emerald_JE3_BE3.png",
  paper: "https://minecraft.wiki/images/Paper_JE2_BE2.png",
  book: "https://minecraft.wiki/images/Book_JE2_BE2.png",
  computer: "https://minecraft.wiki/images/Redstone_Dust_JE2_BE2.png"
};

const stocks = [
  { key: "copper", name: "Copper Co.", ticker: "CPC", item: "Copper", price: 64, last: 24, min: 8, max: 96, event: "Builder Boom", news: "Spawn projects are using copper everywhere. Copper jumped hard today." },
  { key: "iron", name: "IronWorks", ticker: "IRW", item: "Iron", price: 8, last: 32, min: 4, max: 64, event: "Resource Flood", news: "Iron farms ran overnight and flooded supply. Iron dropped." },
  { key: "gold", name: "GoldBank", ticker: "GBK", item: "Gold", price: 36, last: 12, min: 3, max: 48, event: "Nether Rush", news: "Piglin trading got popular again. Gold is moving up fast." },
  { key: "diamond", name: "Diamond Mine Corp", ticker: "DMC", item: "Diamonds", price: 2, last: 8, min: 1, max: 12, event: "Cave Haul", news: "A huge cave haul crashed diamond prices for the day." },
  { key: "netherite", name: "Netherite Holdings", ticker: "NTH", item: "Netherite", price: 5, last: 1, min: 1, max: 5, event: "Ancient Debris Rumor", news: "Netherite hit peak value after ancient debris rumors spread." }
];

function setForm(title, body) {
  dayText.textContent = "Minecraft Day " + day;
  app.innerHTML = '<div class="form-title">' + title + '</div><div class="form-body">' + body + '</div>';
}

function icon(key) {
  if (key === "back") {
    return '<span class="item-icon back"></span>';
  }

  const url = iconUrls[key];
  if (!url) {
    return '<span class="item-icon"></span>';
  }

  return '<span class="item-icon"><img src="' + url + '" alt="' + key + '" loading="lazy"></span>';
}

function button(iconKey, title, sub, actionName, args) {
  const safeArgs = args ? args.map(encodeURIComponent).join("|") : "";
  return '<button class="btn" data-action="' + actionName + '" data-args="' + safeArgs + '">' +
    icon(iconKey) +
    '<span><strong>' + title + '</strong><small>' + (sub || "") + '</small></span>' +
  '</button>';
}

function trend(stock) {
  if (stock.price > stock.last) {
    return { cls: "up", word: "Rising", text: "▲ " + stock.last + " → " + stock.price };
  }

  if (stock.price < stock.last) {
    return { cls: "down", word: "Falling", text: "▼ " + stock.last + " → " + stock.price };
  }

  return { cls: "flat", word: "Stable", text: "■ " + stock.price };
}

function marketButton(stock) {
  const t = trend(stock);
  const owned = playerData.shares[stock.key] || 0;

  return '<button class="market-row" data-action="stockPage" data-args="' + encodeURIComponent(stock.key) + '">' +
    icon(stock.key) +
    '<span class="stock-main">' +
      '<strong>' + stock.name + ' [' + stock.ticker + '] <span class="' + t.cls + '">' + t.word + '</span></strong>' +
      '<small>' + t.text + ' ' + stock.item + '/share • Owned: ' + owned + ' • Event: ' + stock.event + '</small>' +
    '</span>' +
    '<span class="price">' + stock.price + ' ' + stock.item + '</span>' +
  '</button>';
}

function home() {
  screen = "home";
  selectedStock = null;

  const totalShares = Object.values(playerData.shares).reduce(function(a, b) {
    return a + b;
  }, 0);

  setForm("StoneHaven Exchange",
    '<span class="version-pill">' + VERSION + '</span>' +
    '<div class="computer-header">' +
      '<div class="computer-title">Stock Market Computer</div>' +
      '<div class="computer-subtitle">Buy and sell market shares using real Minecraft items. No coins. No deposits.</div>' +
    '</div>' +
    '<div class="meta-grid">' +
      '<div class="meta"><small>Prices</small><strong>Global for Realm</strong></div>' +
      '<div class="meta"><small>Your Shares</small><strong>' + totalShares + '</strong></div>' +
    '</div>' +
    button("computer", "Market Board", "View today's stock prices", "market") +
    button("portfolio", "My Portfolio", "Personal shares and current values", "portfolio") +
    button("paper", "Market News", "Daily events and price movement", "news") +
    button("book", "How Trading Works", "Global prices, per-player trades", "help")
  );
}

function market() {
  screen = "market";
  selectedStock = null;

  setForm("Market Board",
    '<span class="version-pill">' + VERSION + '</span>' +
    '<div class="panel"><strong>Today’s Market</strong><br>Prices are shared by everyone on the Realm. Buys and sells only affect the player using the computer.</div>' +
    stocks.map(marketButton).join("") +
    button("back", "Back", "Return to computer menu", "home")
  );
}

function getStock(key) {
  return stocks.find(function(stock) {
    return stock.key === key;
  });
}

function stockPage(key) {
  screen = "stock";
  selectedStock = key;

  const stock = getStock(key);
  const t = trend(stock);
  const shares = playerData.shares[key] || 0;
  const value = shares * stock.price;

  setForm(stock.name,
    '<span class="version-pill">' + VERSION + '</span>' +
    '<div class="panel">' +
      '<strong>' + stock.name + ' [' + stock.ticker + ']</strong><br>' +
      'Current Price: <strong>' + stock.price + ' ' + stock.item + '/share</strong><br>' +
      'Movement: <span class="' + t.cls + '"><strong>' + t.text + '</strong></span><br>' +
      'Daily Market Event: <strong>' + stock.event + '</strong>' +
    '</div>' +
    '<div class="stat-grid">' +
      '<div class="stat"><small>Your Shares</small><strong>' + shares + '</strong></div>' +
      '<div class="stat"><small>Sell Value</small><strong>' + value + ' ' + stock.item + '</strong></div>' +
      '<div class="stat"><small>Your Inventory</small><strong>' + playerData.inventory[key] + ' ' + stock.item + '</strong></div>' +
      '<div class="stat"><small>Daily Range</small><strong>' + stock.min + '–' + stock.max + ' ' + stock.item + '</strong></div>' +
    '</div>' +
    '<div class="notice">' + stock.news + '</div>' +
    button(key, "Buy 1 Share", "Costs " + stock.price + " " + stock.item, "confirmTrade", [key, "buy", "1"]) +
    button(key, "Buy 5 Shares", "Costs " + (stock.price * 5) + " " + stock.item, "confirmTrade", [key, "buy", "5"]) +
    button(key, "Sell 1 Share", "Receive " + stock.price + " " + stock.item, "confirmTrade", [key, "sell", "1"]) +
    button(key, "Sell All Shares", "Receive " + value + " " + stock.item, "confirmTrade", [key, "sell", String(shares)]) +
    button("back", "Back", "Return to Market Board", "market")
  );
}

function confirmTrade(key, type, amountText) {
  const amount = Number(amountText);
  const stock = getStock(key);
  const total = stock.price * amount;
  const allowed = type === "buy"
    ? playerData.inventory[key] >= total
    : playerData.shares[key] >= amount;
  const actionWord = type === "buy" ? "Buy" : "Sell";

  setForm("Confirm " + actionWord,
    '<span class="version-pill">' + VERSION + '</span>' +
    '<div class="panel">' +
      actionWord + ' <strong>' + amount + '</strong> ' + stock.name + ' share' + (amount === 1 ? "" : "s") + '?<br>' +
      'Price: <strong>' + stock.price + ' ' + stock.item + '/share</strong><br>' +
      (type === "buy" ? "Cost" : "Receive") + ': <strong>' + total + ' ' + stock.item + '</strong><br><br>' +
      (allowed ? "Only your portfolio changes." : '<span class="down"><strong>Not enough ' + (type === "buy" ? stock.item : "shares") + '.</strong></span>') +
    '</div>' +
    (allowed ? button(key, "Complete " + actionWord, "Confirm this trade", "doTrade", [key, type, String(amount)]) : "") +
    button("back", "Cancel", "Return to stock", "stockPage", [key])
  );
}

function doTrade(key, type, amountText) {
  const amount = Number(amountText);
  const stock = getStock(key);
  const total = stock.price * amount;

  if (type === "buy") {
    playerData.inventory[key] -= total;
    playerData.shares[key] += amount;
  } else {
    playerData.inventory[key] += total;
    playerData.shares[key] -= amount;
  }

  showToast("Trade complete");

  setForm("Trade Complete",
    '<span class="version-pill">' + VERSION + '</span>' +
    '<div class="panel">' +
      (type === "buy" ? "Bought" : "Sold") + ' <strong>' + amount + '</strong> ' + stock.name + ' share' + (amount === 1 ? "" : "s") + '.<br>' +
      (type === "buy" ? "Spent" : "Received") + ': <strong>' + total + ' ' + stock.item + '</strong><br>' +
      'New owned shares: <strong>' + playerData.shares[key] + '</strong>' +
    '</div>' +
    button(key, "Back to Stock", "View updated stock page", "stockPage", [key]) +
    button("portfolio", "Portfolio", "View personal holdings", "portfolio") +
    button("back", "Main Menu", "Return to computer menu", "home")
  );
}

function portfolio() {
  screen = "portfolio";
  selectedStock = null;

  const rows = stocks.map(function(stock) {
    return '<div class="notice"><strong>' + stock.name + ' [' + stock.ticker + ']</strong><br>' +
      playerData.shares[stock.key] + ' shares × ' + stock.price + ' ' + stock.item + ' = <strong>' + (playerData.shares[stock.key] * stock.price) + ' ' + stock.item + '</strong></div>';
  }).join("");

  setForm("My Portfolio",
    '<span class="version-pill">' + VERSION + '</span>' +
    '<div class="panel">This portfolio belongs only to the player using the Stock Market Computer.</div>' +
    rows +
    '<div class="panel"><strong>Your Inventory</strong><br>' +
      'Copper: ' + playerData.inventory.copper + '<br>' +
      'Iron: ' + playerData.inventory.iron + '<br>' +
      'Gold: ' + playerData.inventory.gold + '<br>' +
      'Diamonds: ' + playerData.inventory.diamond + '<br>' +
      'Netherite: ' + playerData.inventory.netherite +
    '</div>' +
    button("back", "Back", "Return to computer menu", "home")
  );
}

function news() {
  screen = "news";
  selectedStock = null;

  setForm("Market News",
    '<span class="version-pill">' + VERSION + '</span>' +
    '<div class="panel">Daily prices are global. Buying and selling is per-player.</div>' +
    stocks.map(function(stock) {
      const t = trend(stock);
      return '<div class="notice"><strong>' + stock.name + ' [' + stock.ticker + '] <span class="' + t.cls + '">' + t.word + '</span></strong><br>' +
        'Daily Market Event: <strong>' + stock.event + '</strong><br>' + stock.news + '</div>';
    }).join("") +
    button("back", "Back", "Return to computer menu", "home")
  );
}

function help() {
  screen = "help";
  selectedStock = null;

  setForm("How Trading Works",
    '<span class="version-pill">' + VERSION + '</span>' +
    '<div class="panel">' +
      '<strong>Buy:</strong> the addon checks your inventory, removes the required item, then adds shares to your personal portfolio.<br><br>' +
      '<strong>Sell:</strong> the addon checks your shares, removes the shares, then gives the item payout to your inventory.<br><br>' +
      '<strong>Market:</strong> prices update every Minecraft sunrise and are shared across the Realm.' +
    '</div>' +
    button("back", "Back", "Return to computer menu", "home")
  );
}

function renderCurrent() {
  if (screen === "home") home();
  else if (screen === "market") market();
  else if (screen === "portfolio") portfolio();
  else if (screen === "news") news();
  else if (screen === "stock" && selectedStock) stockPage(selectedStock);
  else home();
}

function showToast(text) {
  toast.textContent = text;
  toast.classList.add("show");
  setTimeout(function() {
    toast.classList.remove("show");
  }, 2200);
}

function handleClick(event) {
  const target = event.target.closest("[data-action]");
  if (!target) return;

  const action = target.getAttribute("data-action");
  const rawArgs = target.getAttribute("data-args") || "";
  const args = rawArgs ? rawArgs.split("|").map(decodeURIComponent) : [];

  const actions = {
    home,
    market,
    portfolio,
    news,
    help,
    stockPage,
    confirmTrade,
    doTrade
  };

  if (actions[action]) {
    actions[action].apply(null, args);
  }
}

document.addEventListener("click", handleClick);

try {
  home();
} catch (error) {
  setForm("Preview Error", '<div class="panel error-panel"><strong>Script error:</strong><br>' + error.message + '</div>');
}
