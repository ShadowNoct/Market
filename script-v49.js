const VERSION = "v4.9 Final Preview";

const app = document.getElementById("app");
const toast = document.getElementById("toast");
const dayText = document.getElementById("dayText");

let screen = "home";
let selectedStock = null;
let activePlayer = "DarkKnight0943";
let day = 142;

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

const players = {
  "DarkKnight0943": {
    inventory: { copper: 192, iron: 96, gold: 40, diamond: 28, netherite: 4 },
    shares: { copper: 3, iron: 2, gold: 1, diamond: 5, netherite: 1 }
  },
  "Bwoody8121": {
    inventory: { copper: 24, iron: 220, gold: 18, diamond: 4, netherite: 0 },
    shares: { copper: 0, iron: 12, gold: 1, diamond: 0, netherite: 0 }
  },
  "JAMRIOT": {
    inventory: { copper: 420, iron: 30, gold: 90, diamond: 2, netherite: 1 },
    shares: { copper: 15, iron: 0, gold: 5, diamond: 0, netherite: 0 }
  }
};

const stocks = [
  { key: "copper", name: "Copper Co.", ticker: "CPC", item: "Copper", price: 64, last: 24, min: 8, max: 96, event: "Builder Boom", news: "Spawn projects are using copper everywhere. Copper jumped hard today." },
  { key: "iron", name: "IronWorks", ticker: "IRW", item: "Iron", price: 8, last: 32, min: 4, max: 64, event: "Resource Flood", news: "Iron farms ran overnight and flooded supply. Iron dropped." },
  { key: "gold", name: "GoldBank", ticker: "GBK", item: "Gold", price: 36, last: 12, min: 3, max: 48, event: "Nether Rush", news: "Piglin trading got popular again. Gold is moving up fast." },
  { key: "diamond", name: "Diamond Mine Corp", ticker: "DMC", item: "Diamonds", price: 2, last: 8, min: 1, max: 12, event: "Cave Haul", news: "A huge cave haul crashed diamond prices for the day." },
  { key: "netherite", name: "Netherite Holdings", ticker: "NTH", item: "Netherite", price: 5, last: 1, min: 1, max: 5, event: "Ancient Debris Rumor", news: "Netherite hit peak value after ancient debris rumors spread." }
];

const pricePools = {
  copper: [
    { price: 8, event: "Copper Crash", news: "Copper demand collapsed after builders paused their projects." },
    { price: 16, event: "Quiet Builds", news: "Copper moved low during a quiet building day." },
    { price: 32, event: "Normal Demand", news: "Copper held around normal building demand." },
    { price: 64, event: "Builder Boom", news: "Spawn projects are using copper everywhere. Copper jumped hard today." },
    { price: 96, event: "Copper Rush", news: "A huge decorating trend pushed copper to peak value." }
  ],
  iron: [
    { price: 4, event: "Iron Flood", news: "Iron farms flooded supply and pushed prices to the floor." },
    { price: 8, event: "Resource Flood", news: "Iron farms ran overnight and flooded supply. Iron dropped." },
    { price: 16, event: "Normal Tools", news: "Iron settled around normal tool and hopper demand." },
    { price: 32, event: "Hopper Demand", news: "Storage builds and hoppers pushed iron higher." },
    { price: 64, event: "Anvil Shortage", news: "Anvil demand spiked and IronWorks hit peak value." }
  ],
  gold: [
    { price: 3, event: "Gold Crash", news: "Gold supply flooded the market after nether mining." },
    { price: 6, event: "Low Trade Day", news: "Piglin trading slowed down and gold dropped." },
    { price: 12, event: "Normal Trade", news: "Gold held near normal nether trading demand." },
    { price: 36, event: "Nether Rush", news: "Piglin trading got popular again. Gold is moving up fast." },
    { price: 48, event: "Gold Rush", news: "Gold hit peak value after a massive trading craze." }
  ],
  diamond: [
    { price: 1, event: "Diamond Crash", news: "Diamonds crashed after a huge strip-mining haul." },
    { price: 2, event: "Cave Haul", news: "A huge cave haul crashed diamond prices for the day." },
    { price: 4, event: "Normal Mining", news: "Diamond prices settled around normal mining activity." },
    { price: 8, event: "Mining Boom", news: "Diamond demand jumped after players geared up." },
    { price: 12, event: "Diamond Fever", news: "Diamond Mine Corp hit peak value after demand exploded." }
  ],
  netherite: [
    { price: 1, event: "Netherite Drop", news: "Netherite cooled off after risky nether runs failed." },
    { price: 2, event: "Stable Debris", news: "Netherite stayed stable through a normal nether day." },
    { price: 3, event: "Upgrade Demand", news: "Upgrade demand pushed Netherite Holdings higher." },
    { price: 4, event: "Ancient Debris Hunt", news: "Ancient debris hunting pushed netherite close to peak." },
    { price: 5, event: "Ancient Debris Rumor", news: "Netherite hit peak value after ancient debris rumors spread." }
  ]
};

function rollDailyMarket() {
  day += 1;

  stocks.forEach(function(stock) {
    stock.last = stock.price;

    const pool = pricePools[stock.key];
    const roll = pool[Math.floor(Math.random() * pool.length)];

    stock.price = roll.price;
    stock.event = roll.event;
    stock.news = roll.news;
  });

  showToast("Skipped to Minecraft Day " + day + " — market updated");
  renderCurrent();
}


function player() { return players[activePlayer]; }

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

function marketButton(stock) {
  const t = trend(stock);
  const owned = player().shares[stock.key] || 0;

  return '<button class="market-row" data-action="stockPage" data-args="' + encodeURIComponent(stock.key) + '">' +
    icon(stock.key) +
    '<span class="stock-main">' +
      '<strong>' + stock.name + ' [' + stock.ticker + '] <span class="' + t.cls + '">' + t.word + '</span></strong>' +
      '<small>' + t.text + ' ' + stock.item + '/share • Owned: ' + owned + ' • Event: ' + stock.event + '</small>' +
    '</span>' +
    '<span class="price">' + stock.price + ' ' + stock.item + '</span>' +
  '</button>';
}

function tabs() {
  return "";
}

function switchPlayer(name) {
  activePlayer = name;
  showToast("Previewing " + name);
  renderCurrent();
}

function trend(stock) {
  if (stock.price > stock.last) return { cls: "up", word: "Rising", text: "▲ " + stock.last + " → " + stock.price };
  if (stock.price < stock.last) return { cls: "down", word: "Falling", text: "▼ " + stock.last + " → " + stock.price };
  return { cls: "flat", word: "Stable", text: "■ " + stock.price };
}

function home() {
  screen = "home";
  selectedStock = null;

  const p = player();
  const totalShares = Object.values(p.shares).reduce(function(a, b) { return a + b; }, 0);

  setForm("StoneHaven Exchange",
    '<span class="version-pill">' + VERSION + '</span>' +
    tabs() +
    '<div class="computer-header">' +
      '<div class="computer-title">Stock Market Computer</div>' +
      '<div class="computer-subtitle">Buy and sell market shares using real Minecraft items. No coins. No deposits.</div>' +
    '</div>' +
    '<div class="meta-grid">' +
      '<div class="meta"><small>Player</small><strong>Your Portfolio</strong></div>' +
      '<div class="meta"><small>Market Updates</small><strong>Every Minecraft Sunrise</strong></div>' +
      '<div class="meta"><small>Prices</small><strong>Global for Realm</strong></div>' +
      '<div class="meta"><small>Player Shares</small><strong>' + totalShares + '</strong></div>' +
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
    tabs() +
    '<div class="panel"><strong>Today’s Market</strong><br>Prices are shared by everyone on the Realm. Buys and sells only affect the player using the computer.</div>' +
    stocks.map(marketButton).join("") +
    button("back", "Back", "Return to computer menu", "home")
  );
}

function getStock(key) {
  return stocks.find(function(s) { return s.key === key; });
}

function stockPage(key) {
  screen = "stock";
  selectedStock = key;

  const s = getStock(key);
  const p = player();
  const t = trend(s);
  const shares = p.shares[key] || 0;
  const value = shares * s.price;

  setForm(s.name,
    '<span class="version-pill">' + VERSION + '</span>' +
    tabs() +
    '<div class="panel">' +
      '<strong>' + s.name + ' [' + s.ticker + ']</strong><br>' +
      'Current Price: <strong>' + s.price + ' ' + s.item + '/share</strong><br>' +
      'Movement: <span class="' + t.cls + '"><strong>' + t.text + '</strong></span><br>' +
      'Daily Market Event: <strong>' + s.event + '</strong>' +
    '</div>' +
    '<div class="stat-grid">' +
      '<div class="stat"><small>Your Shares</small><strong>' + shares + '</strong></div>' +
      '<div class="stat"><small>Sell Value</small><strong>' + value + ' ' + s.item + '</strong></div>' +
      '<div class="stat"><small>Your Inventory</small><strong>' + p.inventory[key] + ' ' + s.item + '</strong></div>' +
      '<div class="stat"><small>Daily Range</small><strong>' + s.min + '–' + s.max + ' ' + s.item + '</strong></div>' +
    '</div>' +
    '<div class="notice">' + s.news + '</div>' +
    button(key, "Buy 1 Share", "Costs " + s.price + " " + s.item, "confirmTrade", [key, "buy", "1"]) +
    button(key, "Buy 5 Shares", "Costs " + (s.price * 5) + " " + s.item, "confirmTrade", [key, "buy", "5"]) +
    button(key, "Sell 1 Share", "Receive " + s.price + " " + s.item, "confirmTrade", [key, "sell", "1"]) +
    button(key, "Sell All Shares", "Receive " + value + " " + s.item, "confirmTrade", [key, "sell", String(shares)]) +
    button("back", "Back", "Return to Market Board", "market")
  );
}

function confirmTrade(key, type, amountText) {
  const amount = Number(amountText);
  const s = getStock(key);
  const p = player();
  const total = s.price * amount;
  const allowed = type === "buy" ? p.inventory[key] >= total : p.shares[key] >= amount;
  const actionWord = type === "buy" ? "Buy" : "Sell";

  setForm("Confirm " + actionWord,
    '<span class="version-pill">' + VERSION + '</span>' +
    '<div class="panel">' +
      '' +
      actionWord + ' <strong>' + amount + '</strong> ' + s.name + ' share' + (amount === 1 ? "" : "s") + '?<br>' +
      'Price: <strong>' + s.price + ' ' + s.item + '/share</strong><br>' +
      (type === "buy" ? "Cost" : "Receive") + ': <strong>' + total + ' ' + s.item + '</strong><br><br>' +
      (allowed ? "Only this player’s portfolio changes." : '<span class="down"><strong>Not enough ' + (type === "buy" ? s.item : "shares") + '.</strong></span>') +
    '</div>' +
    (allowed ? button(key, "Complete " + actionWord, "Confirm this trade", "doTrade", [key, type, String(amount)]) : "") +
    button("back", "Cancel", "Return to stock", "stockPage", [key])
  );
}

function doTrade(key, type, amountText) {
  const amount = Number(amountText);
  const s = getStock(key);
  const p = player();
  const total = s.price * amount;

  if (type === "buy") {
    p.inventory[key] -= total;
    p.shares[key] += amount;
  } else {
    p.inventory[key] += total;
    p.shares[key] -= amount;
  }

  showToast("Trade complete");

  setForm("Trade Complete",
    '<span class="version-pill">' + VERSION + '</span>' +
    '<div class="panel">' +
      '' +
      (type === "buy" ? "Bought" : "Sold") + ' <strong>' + amount + '</strong> ' + s.name + ' share' + (amount === 1 ? "" : "s") + '.<br>' +
      (type === "buy" ? "Spent" : "Received") + ': <strong>' + total + ' ' + s.item + '</strong><br>' +
      'New owned shares: <strong>' + p.shares[key] + '</strong>' +
    '</div>' +
    button(key, "Back to Stock", "View updated stock page", "stockPage", [key]) +
    button("portfolio", "Portfolio", "View personal holdings", "portfolio") +
    button("back", "Main Menu", "Return to computer menu", "home")
  );
}

function portfolio() {
  screen = "portfolio";
  selectedStock = null;

  const p = player();
  const rows = stocks.map(function(s) {
    return '<div class="notice"><strong>' + s.name + ' [' + s.ticker + ']</strong><br>' +
      p.shares[s.key] + ' shares × ' + s.price + ' ' + s.item + ' = <strong>' + (p.shares[s.key] * s.price) + ' ' + s.item + '</strong></div>';
  }).join("");

  setForm("My Portfolio",
    '<span class="version-pill">' + VERSION + '</span>' +
    tabs() +
    '<div class="panel">This portfolio belongs only to the player using the Stock Market Computer.</div>' +
    rows +
    '<div class="panel"><strong>Your Inventory</strong><br>' +
      'Copper: ' + p.inventory.copper + '<br>' +
      'Iron: ' + p.inventory.iron + '<br>' +
      'Gold: ' + p.inventory.gold + '<br>' +
      'Diamonds: ' + p.inventory.diamond + '<br>' +
      'Netherite: ' + p.inventory.netherite +
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
    stocks.map(function(s) {
      const t = trend(s);
      return '<div class="notice"><strong>' + s.name + ' [' + s.ticker + '] <span class="' + t.cls + '">' + t.word + '</span></strong><br>' +
        'Daily Market Event: <strong>' + s.event + '</strong><br>' + s.news + '</div>';
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

  const actions = { home, market, portfolio, news, help, stockPage, confirmTrade, doTrade };

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
