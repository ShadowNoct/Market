const app = document.getElementById("app");
const timerText = document.getElementById("timerText");
const toast = document.getElementById("toast");

let currentScreen = "home";
let selectedStock = null;
let seconds = 30;

const state = {
  inventory: {
    copper: 192,
    iron: 96,
    gold: 40,
    diamond: 28,
    netherite: 4
  },
  history: [],
  stocks: [
    { key: "copper", icon: "🟤", name: "Copper Co.", ticker: "CPC", item: "Copper", itemKey: "copper", price: 32, last: 28, min: 16, max: 64, shares: 3, news: "Copper is moving because builders keep needing blocks for spawn details." },
    { key: "iron", icon: "⚙️", name: "IronWorks", ticker: "IRW", item: "Iron", itemKey: "iron", price: 16, last: 20, min: 8, max: 32, shares: 2, news: "Iron demand is tied to anvils, hoppers, tools, and community farms." },
    { key: "gold", icon: "🟡", name: "GoldBank", ticker: "GBK", item: "Gold", itemKey: "gold", price: 12, last: 10, min: 6, max: 24, shares: 1, news: "GoldBank shifts when nether trading and powered rails get popular." },
    { key: "diamond", icon: "💎", name: "Diamond Mine Corp", ticker: "DMC", item: "Diamonds", itemKey: "diamond", price: 3, last: 2, min: 1, max: 8, shares: 5, news: "Diamond Mine Corp moves fast after mining booms or dry cave runs." },
    { key: "netherite", icon: "⬛", name: "Netherite Holdings", ticker: "NTH", item: "Netherite", itemKey: "netherite", price: 1, last: 2, min: 1, max: 4, shares: 1, news: "Netherite Holdings is slow, expensive, and risky." }
  ]
};

function trend(s) {
  if (s.price > s.last) return { mark: "▲", word: "Rising", cls: "up", diff: `+${s.price - s.last}` };
  if (s.price < s.last) return { mark: "▼", word: "Falling", cls: "down", diff: `-${s.last - s.price}` };
  return { mark: "■", word: "Stable", cls: "flat", diff: "0" };
}

function setForm(title, body) {
  app.innerHTML = `<div class="title">${title}</div><div class="body">${body}</div>`;
}

function btn(icon, title, sub, onclick) {
  return `<button class="btn" onclick="${onclick}">
    <span class="icon">${icon}</span>
    <span><strong>${title}</strong><small>${sub || ""}</small></span>
  </button>`;
}

function marketLine(s) {
  const t = trend(s);
  return `<button class="market-row" onclick="stock('${s.key}')">
    <span class="icon">${s.icon}</span>
    <span class="row-main">
      <strong>${s.name} [${s.ticker}] <span class="${t.cls}">${t.mark}</span></strong>
      <small>${t.word} ${t.diff} since last tick • Owned: ${s.shares}</small>
    </span>
    <span class="price-pill">${s.price} ${s.item}</span>
  </button>`;
}

function home() {
  currentScreen = "home";
  selectedStock = null;
  const up = state.stocks.filter(s => s.price > s.last).length;
  const down = state.stocks.filter(s => s.price < s.last).length;

  setForm("📈 StoneHaven Exchange",
    `<div class="summary">
      A Minecraft item-based stock market. Buy shares with real resources, then wait for the market to move on its own.
      <br><br><strong>Market:</strong> Open 🟢 &nbsp; <strong>Trend:</strong> ${up} up / ${down} down
    </div>
    ${btn("📊", "Market Board", "View item stocks and prices", "market()")}
    ${btn("💼", "My Portfolio", "See shares and sell values", "portfolio()")}
    ${btn("📰", "Market News", "Why prices are moving", "news()")}
    ${btn("❓", "How It Works", "Simple trading rules", "help()")}`
  );
}

function market() {
  currentScreen = "market";
  selectedStock = null;
  setForm("📊 Market Board",
    `<div class="summary">Prices update automatically every market tick. No manual update button.</div>
    ${state.stocks.map(marketLine).join("")}
    ${btn("⬅️", "Back", "Return to exchange", "home()")}`
  );
}

function getStock(key) {
  return state.stocks.find(s => s.key === key);
}

function stock(key) {
  currentScreen = "stock";
  selectedStock = key;
  const s = getStock(key);
  const t = trend(s);
  const value = s.shares * s.price;

  setForm(`${s.icon} ${s.name}`,
    `<div class="summary">
      <strong>Ticker:</strong> ${s.ticker}<br>
      <strong>Current Price:</strong> ${s.price} ${s.item}/share<br>
      <strong>Movement:</strong> <span class="${t.cls}">${t.mark} ${t.word} ${t.diff}</span>
    </div>
    <div class="stat-grid">
      <div class="stat"><small>Your Shares</small><strong>${s.shares}</strong></div>
      <div class="stat"><small>Sell Value</small><strong>${value} ${s.item}</strong></div>
      <div class="stat"><small>Your Inventory</small><strong>${state.inventory[s.itemKey]} ${s.item}</strong></div>
      <div class="stat"><small>Range</small><strong>${s.min}–${s.max} ${s.item}</strong></div>
    </div>
    <div class="news">${s.news}</div>
    ${btn("🛒", "Buy 1 Share", `Costs ${s.price} ${s.item}`, `confirmTrade('${s.key}','buy',1)`)}
    ${btn("🛒", "Buy 5 Shares", `Costs ${s.price * 5} ${s.item}`, `confirmTrade('${s.key}','buy',5)`)}
    ${btn("📤", "Sell 1 Share", `Receive ${s.price} ${s.item}`, `confirmTrade('${s.key}','sell',1)`)}
    ${btn("📤", "Sell All Shares", `Receive ${value} ${s.item}`, `confirmTrade('${s.key}','sell',${s.shares})`)}
    ${btn("⬅️", "Back", "Return to Market Board", "market()")}`
  );
}

function confirmTrade(key, type, amount) {
  const s = getStock(key);
  const total = s.price * amount;
  const allowed = type === "buy" ? state.inventory[s.itemKey] >= total : s.shares >= amount;
  const word = type === "buy" ? "Buy" : "Sell";

  setForm(`${type === "buy" ? "🛒" : "📤"} ${word} ${s.ticker}`,
    `<div class="summary">
      ${word} <strong>${amount}</strong> ${s.name} share${amount === 1 ? "" : "s"}?<br><br>
      Price: <strong>${s.price} ${s.item}/share</strong><br>
      ${type === "buy" ? "Cost" : "Receive"}: <strong>${total} ${s.item}</strong><br><br>
      ${allowed ? "Confirm to complete the trade." : `<span class="down">Not enough ${type === "buy" ? s.item : "shares"}.</span>`}
    </div>
    ${allowed ? btn("✅", `Confirm ${word}`, "Complete this trade", `doTrade('${key}','${type}',${amount})`) : ""}
    ${btn("⬅️", "Cancel", "Return to stock", `stock('${key}')`)}`
  );
}

function doTrade(key, type, amount) {
  const s = getStock(key);
  const total = s.price * amount;

  if (type === "buy") {
    state.inventory[s.itemKey] -= total;
    s.shares += amount;
  } else {
    state.inventory[s.itemKey] += total;
    s.shares -= amount;
  }

  setForm("✅ Trade Complete",
    `<div class="summary">
      ${type === "buy" ? "Bought" : "Sold"} <strong>${amount}</strong> ${s.name} share${amount === 1 ? "" : "s"}.<br>
      ${type === "buy" ? "Spent" : "Received"}: <strong>${total} ${s.item}</strong><br>
      New shares owned: <strong>${s.shares}</strong>
    </div>
    ${btn("📊", "Back to Stock", "View this stock", `stock('${key}')`)}
    ${btn("💼", "Portfolio", "View all holdings", "portfolio()")}
    ${btn("🏠", "Main Menu", "Return to exchange", "home()")}`
  );
}

function portfolio() {
  currentScreen = "portfolio";
  selectedStock = null;
  const rows = state.stocks.map(s => `
    <div class="news"><strong>${s.icon} ${s.name} [${s.ticker}]</strong><br>
    ${s.shares} shares = ${s.shares * s.price} ${s.item}</div>
  `).join("");

  setForm("💼 My Portfolio",
    `<div class="summary">Your sell values are based on the current live market prices.</div>
    ${rows}
    <div class="summary">
      <strong>Inventory:</strong><br>
      🟤 ${state.inventory.copper} Copper<br>
      ⚙️ ${state.inventory.iron} Iron<br>
      🟡 ${state.inventory.gold} Gold<br>
      💎 ${state.inventory.diamond} Diamonds<br>
      ⬛ ${state.inventory.netherite} Netherite
    </div>
    ${btn("⬅️", "Back", "Return to exchange", "home()")}`
  );
}

function news() {
  currentScreen = "news";
  selectedStock = null;
  setForm("📰 Market News",
    `<div class="summary">Market news changes automatically when prices update.</div>
    ${state.stocks.map(s => {
      const t = trend(s);
      return `<div class="news"><strong>${s.icon} ${s.ticker} <span class="${t.cls}">${t.mark} ${t.word}</span></strong><br>${s.news}</div>`;
    }).join("")}
    ${btn("⬅️", "Back", "Return to exchange", "home()")}`
  );
}

function help() {
  currentScreen = "help";
  selectedStock = null;
  setForm("❓ How It Works",
    `<div class="summary">
      Buy shares using the stock's matching item.<br><br>
      Copper Co. uses Copper.<br>
      IronWorks uses Iron.<br>
      GoldBank uses Gold.<br>
      Diamond Mine Corp uses Diamonds.<br>
      Netherite Holdings uses Netherite.<br><br>
      Prices update automatically. Sell when the price rises, or hold if it drops.
    </div>
    ${btn("⬅️", "Back", "Return to exchange", "home()")}`
  );
}

function marketUpdate() {
  const newsBits = {
    copper: ["Copper rose after builders started a spawn project.", "Copper dipped after a mining rush.", "Copper stayed steady around builder demand."],
    iron: ["Iron rose from hopper and anvil demand.", "Iron dipped after farms increased supply.", "Iron stayed calm this cycle."],
    gold: ["Gold climbed from nether trading.", "Gold dropped as piglin hype cooled.", "Gold held steady."],
    diamond: ["Diamond jumped after cave rumors.", "Diamond dipped after a big mining haul.", "Diamond stayed calm."],
    netherite: ["Netherite climbed after ancient debris rumors.", "Netherite dropped after a bad nether cycle.", "Netherite stayed risky but steady."]
  };

  state.history = [];
  for (const s of state.stocks) {
    s.last = s.price;
    let move = Math.floor(Math.random() * 5) - 2;
    if (s.key === "netherite") move = Math.floor(Math.random() * 3) - 1;
    s.price = Math.max(s.min, Math.min(s.max, s.price + move));

    const t = trend(s);
    state.history.push(`${s.ticker}: ${s.last} → ${s.price}`);
    const list = newsBits[s.key];
    s.news = list[Math.floor(Math.random() * list.length)];
  }

  showToast("📈 Market prices updated automatically");
  rerender();
}

function rerender() {
  if (currentScreen === "home") home();
  else if (currentScreen === "market") market();
  else if (currentScreen === "portfolio") portfolio();
  else if (currentScreen === "news") news();
  else if (currentScreen === "stock" && selectedStock) stock(selectedStock);
}

function showToast(text) {
  toast.textContent = text;
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), 2400);
}

setInterval(() => {
  seconds -= 1;
  if (seconds <= 0) {
    seconds = 30;
    marketUpdate();
  }
  timerText.textContent = `Next market tick: ${seconds}s`;
}, 1000);

home();
