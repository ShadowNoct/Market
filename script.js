const VERSION = "v4.2 Clean Rebuild";

const app = document.getElementById("app");
const toast = document.getElementById("toast");
const dayText = document.getElementById("dayText");

let screen = "home";
let selectedStock = null;
let activePlayer = "DarkKnight0943";
let day = 142;

const players = {
  DarkKnight0943: {
    inventory: { copper: 192, iron: 96, gold: 40, diamond: 28, netherite: 4 },
    shares: { copper: 3, iron: 2, gold: 1, diamond: 5, netherite: 1 }
  },
  Bwoody8121: {
    inventory: { copper: 24, iron: 220, gold: 18, diamond: 4, netherite: 0 },
    shares: { copper: 0, iron: 12, gold: 1, diamond: 0, netherite: 0 }
  },
  JAMRIOT: {
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

function player() {
  return players[activePlayer];
}

function setForm(title, body) {
  dayText.textContent = "Minecraft Day " + day;
  app.innerHTML = '<div class="form-title">' + title + '</div><div class="form-body">' + body + '</div>';
}

function icon(key) {
  return '<span class="item-icon ' + key + '"></span>';
}

function button(iconKey, title, sub, action) {
  return '<button class="btn" onclick="' + action + '">' +
    icon(iconKey) +
    '<span><strong>' + title + '</strong><small>' + (sub || "") + '</small></span>' +
  '</button>';
}

function tabs() {
  return '<div class="profile-label">Preview Player — real addon uses the player who clicked the computer:</div>' +
    '<div class="profile-tabs">' +
    Object.keys(players).map(function(name) {
      return '<button class="' + (name === activePlayer ? "active" : "") + '" onclick="switchPlayer(\\'' + name + '\\')">' + name + '</button>';
    }).join("") +
    '</div>';
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
      '<div class="meta"><small>Viewing Player</small><strong>' + activePlayer + '</strong></div>' +
      '<div class="meta"><small>Market Updates</small><strong>Every Minecraft Sunrise</strong></div>' +
      '<div class="meta"><small>Prices</small><strong>Global for Realm</strong></div>' +
      '<div class="meta"><small>Player Shares</small><strong>' + totalShares + '</strong></div>' +
    '</div>' +
    button("computer", "Market Board", "View today's stock prices", "market()") +
    button("portfolio", "My Portfolio", "Personal shares and item balances", "portfolio()") +
    button("paper", "Market News", "Daily events and price movement", "news()") +
    button("book", "How Trading Works", "Global prices, per-player trades", "help()")
  );
}

function market() {
  screen = "market";
  selectedStock = null;

  setForm("Market Board",
    '<span class="version-pill">' + VERSION + '</span>' +
    tabs() +
    '<div class="panel"><strong>Today’s Market</strong><br>Prices are shared by everyone on the Realm. Buys and sells only affect the player using the computer.</div>' +
    stocks.map(marketRow).join("") +
    button("back", "Back", "Return to computer menu", "home()")
  );
}

function marketRow(stock) {
  const t = trend(stock);
  const owned = player().shares[stock.key] || 0;

  return '<button class="market-row" onclick="stockPage(\\'' + stock.key + '\\')">' +
    icon(stock.key) +
    '<span class="stock-main">' +
      '<strong>' + stock.name + ' [' + stock.ticker + '] <span class="' + t.cls + '">' + t.word + '</span></strong>' +
      '<small>' + t.text + ' ' + stock.item + '/share • Owned: ' + owned + ' • Event: ' + stock.event + '</small>' +
    '</span>' +
    '<span class="price">' + stock.price + ' ' + stock.item + '</span>' +
  '</button>';
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
      '<div class="stat"><small>Your Items</small><strong>' + p.inventory[key] + ' ' + s.item + '</strong></div>' +
      '<div class="stat"><small>Daily Range</small><strong>' + s.min + '–' + s.max + ' ' + s.item + '</strong></div>' +
    '</div>' +
    '<div class="notice">' + s.news + '</div>' +
    button(key, "Buy 1 Share", "Costs " + s.price + " " + s.item, "confirmTrade('" + key + "','buy',1)") +
    button(key, "Buy 5 Shares", "Costs " + (s.price * 5) + " " + s.item, "confirmTrade('" + key + "','buy',5)") +
    button(key, "Sell 1 Share", "Receive " + s.price + " " + s.item, "confirmTrade('" + key + "','sell',1)") +
    button(key, "Sell All Shares", "Receive " + value + " " + s.item, "confirmTrade('" + key + "','sell'," + shares + ")") +
    button("back", "Back", "Return to Market Board", "market()")
  );
}

function confirmTrade(key, type, amount) {
  const s = getStock(key);
  const p = player();
  const total = s.price * amount;
  const allowed = type === "buy" ? p.inventory[key] >= total : p.shares[key] >= amount;
  const actionWord = type === "buy" ? "Buy" : "Sell";

  setForm("Confirm " + actionWord,
    '<span class="version-pill">' + VERSION + '</span>' +
    '<div class="panel">' +
      'Player: <strong>' + activePlayer + '</strong><br><br>' +
      actionWord + ' <strong>' + amount + '</strong> ' + s.name + ' share' + (amount === 1 ? "" : "s") + '?<br>' +
      'Price: <strong>' + s.price + ' ' + s.item + '/share</strong><br>' +
      (type === "buy" ? "Cost" : "Receive") + ': <strong>' + total + ' ' + s.item + '</strong><br><br>' +
      (allowed ? "Only this player’s portfolio changes." : '<span class="down"><strong>Not enough ' + (type === "buy" ? s.item : "shares") + '.</strong></span>') +
    '</div>' +
    (allowed ? button(key, "Complete " + actionWord, "Confirm this trade", "doTrade('" + key + "','" + type + "'," + amount + ")") : "") +
    button("back", "Cancel", "Return to stock", "stockPage('" + key + "')")
  );
}

function doTrade(key, type, amount) {
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

  showToast(activePlayer + " trade complete");

  setForm("Trade Complete",
    '<span class="version-pill">' + VERSION + '</span>' +
    '<div class="panel">' +
      'Player: <strong>' + activePlayer + '</strong><br>' +
      (type === "buy" ? "Bought" : "Sold") + ' <strong>' + amount + '</strong> ' + s.name + ' share' + (amount === 1 ? "" : "s") + '.<br>' +
      (type === "buy" ? "Spent" : "Received") + ': <strong>' + total + ' ' + s.item + '</strong><br>' +
      'New owned shares: <strong>' + p.shares[key] + '</strong>' +
    '</div>' +
    button(key, "Back to Stock", "View updated stock page", "stockPage('" + key + "')") +
    button("portfolio", "Portfolio", "View personal holdings", "portfolio()") +
    button("back", "Main Menu", "Return to computer menu", "home()")
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
    '<div class="panel">This portfolio belongs only to <strong>' + activePlayer + '</strong>. Switch preview players to test separate data.</div>' +
    rows +
    '<div class="panel"><strong>Item Balance</strong><br>' +
      'Copper: ' + p.inventory.copper + '<br>' +
      'Iron: ' + p.inventory.iron + '<br>' +
      'Gold: ' + p.inventory.gold + '<br>' +
      'Diamonds: ' + p.inventory.diamond + '<br>' +
      'Netherite: ' + p.inventory.netherite +
    '</div>' +
    button("back", "Back", "Return to computer menu", "home()")
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
    button("back", "Back", "Return to computer menu", "home()")
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
    button("back", "Back", "Return to computer menu", "home()")
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

try {
  home();
} catch (error) {
  setForm("Preview Error", '<div class="panel error-panel"><strong>Script error:</strong><br>' + error.message + '</div>');
}
