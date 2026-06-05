const app = document.getElementById("app");
const toast = document.getElementById("toast");
const dayText = document.getElementById("dayText");

let screen = "home";
let selected = null;
let activePlayer = "DarkKnight0943";
let day = 142;

const icons = {
  copper: "https://minecraft.wiki/images/Copper_Ingot_JE2_BE1.png",
  iron: "https://minecraft.wiki/images/Iron_Ingot_JE3_BE2.png",
  gold: "https://minecraft.wiki/images/Gold_Ingot_JE4_BE2.png",
  diamond: "https://minecraft.wiki/images/Diamond_JE3_BE3.png",
  netherite: "https://minecraft.wiki/images/Netherite_Ingot_JE1_BE2.png",
  book: "https://minecraft.wiki/images/Book_JE2_BE2.png",
  paper: "https://minecraft.wiki/images/Paper_JE2_BE2.png",
  chest: "https://minecraft.wiki/images/Chest_%28item%29_JE2_BE2.png",
  redstone: "https://minecraft.wiki/images/Redstone_Dust_JE2_BE2.png"
};

const players = {
  DarkKnight0943: {
    inventory: { copper: 192, iron: 96, gold: 40, diamond: 28, netherite: 4 },
    shares: { copper: 3, iron: 2, gold: 1, diamond: 5, netherite: 1 }
  },
  Bwoody8121: {
    inventory: { copper: 80, iron: 164, gold: 24, diamond: 12, netherite: 1 },
    shares: { copper: 0, iron: 8, gold: 2, diamond: 1, netherite: 0 }
  },
  JAMRIOT: {
    inventory: { copper: 320, iron: 50, gold: 72, diamond: 6, netherite: 0 },
    shares: { copper: 10, iron: 1, gold: 0, diamond: 0, netherite: 0 }
  }
};

const stocks = [
  { key: "copper", name: "Copper Co.", ticker: "CPC", item: "Copper", price: 64, last: 24, min: 8, max: 96, mood: "Very High", news: "Builder boom hit spawn. Copper demand exploded." },
  { key: "iron", name: "IronWorks", ticker: "IRW", item: "Iron", price: 8, last: 32, min: 4, max: 64, mood: "Low", news: "Iron supply flooded the market after farms ran overnight." },
  { key: "gold", name: "GoldBank", ticker: "GBK", item: "Gold", price: 36, last: 12, min: 3, max: 48, mood: "High", news: "Piglin trading got popular again. Gold jumped hard." },
  { key: "diamond", name: "Diamond Mine Corp", ticker: "DMC", item: "Diamonds", price: 2, last: 8, min: 1, max: 12, mood: "Low", news: "A huge cave haul crashed diamond prices today." },
  { key: "netherite", name: "Netherite Holdings", ticker: "NTH", item: "Netherite", price: 5, last: 1, min: 1, max: 5, mood: "Peak", news: "Ancient debris rumors pushed netherite to peak value." }
];

function player() {
  return players[activePlayer];
}

function trend(s) {
  if (s.price > s.last) return { cls: "up", text: `▲ ${s.last} → ${s.price}`, word: "Rising" };
  if (s.price < s.last) return { cls: "down", text: `▼ ${s.last} → ${s.price}`, word: "Falling" };
  return { cls: "flat", text: `■ ${s.price}`, word: "Stable" };
}

function img(key) {
  return `<img class="mc-icon" src="${icons[key]}" alt="${key}">`;
}

function fake(text) {
  return `<span class="fake-icon">${text}</span>`;
}

function setForm(title, body) {
  dayText.textContent = `Minecraft Day ${day}`;
  app.innerHTML = `<div class="title">${title}</div><div class="body">${body}</div>`;
}

function btn(iconHtml, title, sub, action) {
  return `<button class="btn" onclick="${action}">
    ${iconHtml}
    <span><strong>${title}</strong><small>${sub || ""}</small></span>
  </button>`;
}

function profilePicker() {
  return `<div class="profile-switcher">
    ${Object.keys(players).map(name => `<button class="${name === activePlayer ? "active" : ""}" onclick="switchPlayer('${name}')">${name}</button>`).join("")}
  </div>`;
}

function switchPlayer(name) {
  activePlayer = name;
  showToast(`Viewing as ${name}`);
  rerender();
}

function home() {
  screen = "home";
  selected = null;
  const p = player();
  const totalShares = Object.values(p.shares).reduce((a, b) => a + b, 0);

  setForm("StoneHaven Exchange",
    `${profilePicker()}
    <div class="exchange-header">
      <div class="exchange-name">Stock Market Computer</div>
      <div class="meta-row">
        <div class="meta"><small>Player</small><strong>${activePlayer}</strong></div>
        <div class="meta"><small>Market Updates</small><strong>Every Minecraft sunrise</strong></div>
        <div class="meta"><small>Market Mood</small><strong>Wild Swings</strong></div>
        <div class="meta"><small>Your Shares</small><strong>${totalShares}</strong></div>
      </div>
    </div>
    ${btn(img("redstone"), "Market Board", "View stocks using real Minecraft items", "market()")}
    ${btn(img("chest"), "My Portfolio", "Your personal shares and item balances", "portfolio()")}
    ${btn(img("paper"), "Market News", "Daily market stories and price moves", "news()")}
    ${btn(img("book"), "How Trading Works", "Buy low, sell high, risk drops", "help()")}`
  );
}

function marketRow(s) {
  const t = trend(s);
  const owned = player().shares[s.key] || 0;
  return `<button class="market-row" onclick="stock('${s.key}')">
    ${img(s.key)}
    <span class="stock-title">
      <strong>${s.name} [${s.ticker}] <span class="${t.cls}">${t.word}</span></strong>
      <small>${t.text} ${s.item}/share • Owned: ${owned} • ${s.mood}</small>
    </span>
    <span class="price">${s.price} ${s.item}</span>
  </button>`;
}

function market() {
  screen = "market";
  selected = null;
  setForm("Market Board",
    `${profilePicker()}
    <div class="panel">
      These prices are global for the Realm. Player shares are personal per player.
      Prices reroll once per Minecraft day.
    </div>
    ${stocks.map(marketRow).join("")}
    ${btn(fake("←"), "Back", "Return to computer menu", "home()")}`
  );
}

function getStock(key) {
  return stocks.find(s => s.key === key);
}

function stock(key) {
  screen = "stock";
  selected = key;
  const s = getStock(key);
  const p = player();
  const t = trend(s);
  const shares = p.shares[s.key] || 0;
  const sellValue = shares * s.price;

  setForm(s.name,
    `${profilePicker()}
    <div class="panel">
      <strong>${s.name} [${s.ticker}]</strong><br>
      Current: <strong>${s.price} ${s.item}/share</strong><br>
      Movement: <span class="${t.cls}"><strong>${t.text}</strong></span><br>
      Daily Mood: <strong>${s.mood}</strong>
    </div>
    <div class="stat-grid">
      <div class="stat"><small>Your Shares</small><strong>${shares}</strong></div>
      <div class="stat"><small>Sell Value</small><strong>${sellValue} ${s.item}</strong></div>
      <div class="stat"><small>Your Items</small><strong>${p.inventory[s.key]} ${s.item}</strong></div>
      <div class="stat"><small>Possible Range</small><strong>${s.min}–${s.max} ${s.item}</strong></div>
    </div>
    <div class="news">${s.news}</div>
    ${btn(img(s.key), "Buy 1 Share", `Costs ${s.price} ${s.item}`, `confirmTrade('${s.key}', 'buy', 1)`)}
    ${btn(img(s.key), "Buy 5 Shares", `Costs ${s.price * 5} ${s.item}`, `confirmTrade('${s.key}', 'buy', 5)`)}
    ${btn(img(s.key), "Sell 1 Share", `Receive ${s.price} ${s.item}`, `confirmTrade('${s.key}', 'sell', 1)`)}
    ${btn(img(s.key), "Sell All Shares", `Receive ${sellValue} ${s.item}`, `confirmTrade('${s.key}', 'sell', ${shares})`)}
    ${btn(fake("←"), "Back", "Return to Market Board", "market()")}`
  );
}

function confirmTrade(key, type, amount) {
  const s = getStock(key);
  const p = player();
  const total = s.price * amount;
  const hasEnough = type === "buy" ? p.inventory[key] >= total : p.shares[key] >= amount;
  const title = type === "buy" ? "Confirm Buy" : "Confirm Sell";

  setForm(title,
    `<div class="panel">
      Player: <strong>${activePlayer}</strong><br><br>
      ${type === "buy" ? "Buy" : "Sell"} <strong>${amount}</strong> ${s.name} share${amount === 1 ? "" : "s"}?<br>
      Price: <strong>${s.price} ${s.item}/share</strong><br>
      ${type === "buy" ? "Cost" : "Receive"}: <strong>${total} ${s.item}</strong><br><br>
      ${hasEnough ? "This trade only changes this player's portfolio." : `<span class="down"><strong>Not enough ${type === "buy" ? s.item : "shares"}.</strong></span>`}
    </div>
    ${hasEnough ? btn(img(s.key), type === "buy" ? "Complete Buy" : "Complete Sale", "Confirm this trade", `doTrade('${key}', '${type}', ${amount})`) : ""}
    ${btn(fake("←"), "Cancel", "Return to stock", `stock('${key}')`)}`
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

  showToast(`${activePlayer} trade complete`);
  setForm("Trade Complete",
    `<div class="panel">
      Player: <strong>${activePlayer}</strong><br>
      ${type === "buy" ? "Bought" : "Sold"} <strong>${amount}</strong> ${s.name} share${amount === 1 ? "" : "s"}.<br>
      ${type === "buy" ? "Spent" : "Received"}: <strong>${total} ${s.item}</strong><br>
      New owned shares: <strong>${p.shares[key]}</strong>
    </div>
    ${btn(img(s.key), "Back to Stock", "View updated stock page", `stock('${key}')`)}
    ${btn(img("chest"), "Portfolio", "View personal holdings", "portfolio()")}
    ${btn(fake("⌂"), "Main Menu", "Return to computer menu", "home()")}`
  );
}

function portfolio() {
  screen = "portfolio";
  selected = null;
  const p = player();
  const rows = stocks.map(s => `
    <div class="news">
      <strong>${s.name} [${s.ticker}]</strong><br>
      ${p.shares[s.key]} shares × ${s.price} ${s.item} = <strong>${p.shares[s.key] * s.price} ${s.item}</strong>
    </div>
  `).join("");

  setForm("My Portfolio",
    `${profilePicker()}
    <div class="panel">
      This is personal to <strong>${activePlayer}</strong>. Other players have separate shares and item balances.
    </div>
    ${rows}
    <div class="panel">
      <strong>Item Balance</strong><br>
      Copper: ${p.inventory.copper}<br>
      Iron: ${p.inventory.iron}<br>
      Gold: ${p.inventory.gold}<br>
      Diamonds: ${p.inventory.diamond}<br>
      Netherite: ${p.inventory.netherite}
    </div>
    ${btn(fake("←"), "Back", "Return to computer menu", "home()")}`
  );
}

function news() {
  screen = "news";
  selected = null;
  setForm("Market News",
    `<div class="panel">Daily prices are global, but buying and selling is saved per player.</div>
    ${stocks.map(s => {
      const t = trend(s);
      return `<div class="news"><strong>${s.name} [${s.ticker}] <span class="${t.cls}">${t.word}</span></strong><br>${s.news}</div>`;
    }).join("")}
    ${btn(fake("←"), "Back", "Return to computer menu", "home()")}`
  );
}

function help() {
  screen = "help";
  selected = null;
  setForm("How Trading Works",
    `<div class="panel">
      The Stock Market Computer opens this menu when a player interacts with the block.<br><br>
      Market prices are shared by the Realm and update every Minecraft sunrise.<br><br>
      Player portfolios are separate. If ${activePlayer} buys Diamond shares, only ${activePlayer}'s data changes.
    </div>
    ${btn(fake("←"), "Back", "Return to computer menu", "home()")}`
  );
}

function showToast(text) {
  toast.textContent = text;
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), 2200);
}

function rerender() {
  if (screen === "home") home();
  else if (screen === "market") market();
  else if (screen === "portfolio") portfolio();
  else if (screen === "news") news();
  else if (screen === "stock" && selected) stock(selected);
}

home();
