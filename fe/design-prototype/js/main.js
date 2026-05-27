/**
 * WebDrop design prototype — interactive demo (no WebRTC)
 */

const $ = (sel, root = document) => root.querySelector(sel);

const state = {
  locale: "zh",
  appState: "idle", // idle | connected
  wsOk: true,
  rtcOk: false,
};

const i18n = {
  zh: {
    navHome: "首页",
    navBlog: "博客",
    subtitle: "浏览器内 P2P 传文件与聊天，数据不经服务器存储。",
    trustTitle: "为何值得信任",
    showQr: "显示二维码",
    chatTitle: "传输与对话",
    ws: "信令",
    rtc: "P2P",
    connected: "已连接",
    disconnected: "未连接",
    myId: "你的连接码",
    copy: "复制",
    scanHint: "让对方扫描以发起连接",
    connectLabel: "对方连接码",
    connectPlaceholder: "输入 6 位码",
    connect: "连接",
    disconnect: "断开",
    scan: "扫码",
    peerConnected: "已与",
    chatEmpty: "连接成功后，消息与文件将在此出现",
    chatPlaceholder: "输入消息，或粘贴图片…",
    toastCopied: "连接码已复制",
    trust: [
      { title: "端到端直连", desc: "WebRTC 点对点，文件不落地第三方" },
      { title: "无大小限制", desc: "速度取决于双方网络，而非云端配额" },
      { title: "零安装", desc: "打开链接即可用，跨设备浏览器" },
    ],
    demoIdle: "未连接",
    demoConnected: "已连接（演示）",
  },
  en: {
    navHome: "Home",
    navBlog: "Blog",
    subtitle: "P2P file transfer and chat in the browser. Nothing stored on our servers.",
    trustTitle: "Why trust WebDrop",
    showQr: "Show QR code",
    chatTitle: "Transfer & chat",
    ws: "Signaling",
    rtc: "P2P",
    connected: "Connected",
    disconnected: "Disconnected",
    myId: "Your connection code",
    copy: "Copy",
    scanHint: "Let others scan to connect with you",
    connectLabel: "Peer code",
    connectPlaceholder: "6-character code",
    connect: "Connect",
    disconnect: "Disconnect",
    scan: "Scan",
    peerConnected: "Connected to",
    chatEmpty: "Messages and files appear here once connected",
    chatPlaceholder: "Type a message or paste an image…",
    toastCopied: "Code copied",
    trust: [
      { title: "Direct P2P", desc: "WebRTC peer-to-peer, no third-party file storage" },
      { title: "No size cap", desc: "Speed follows your network, not cloud quotas" },
      { title: "No install", desc: "Open a link in any modern browser" },
    ],
    demoIdle: "Disconnected",
    demoConnected: "Connected (demo)",
  },
};

function t(key) {
  return i18n[state.locale][key];
}

function renderTrust() {
  const list = $("#trust-list");
  if (!list) return;
  list.innerHTML = t("trust")
    .map(
      (item) => `
      <li>
        <span class="trust-icon" aria-hidden="true">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 13l4 4L19 7"/></svg>
        </span>
        <div><strong>${item.title}</strong>${item.desc}</div>
      </li>`
    )
    .join("");
}

function setAppState(next) {
  state.appState = next;
  state.rtcOk = next === "connected";
  document.body.dataset.state = next;
  document.querySelectorAll(".connect-idle-hint").forEach((el) => {
    el.style.display = next === "connected" ? "none" : "";
  });
  const peerInput = $("#peer-input");
  const peerDisplay = $("#peer-display");
  if (peerInput && peerDisplay) {
    const code = peerInput.value.trim() || "B7K2M1";
    peerDisplay.textContent = code.toUpperCase();
  }
  updateStatusPills();
  updateDemoButtons();
}

function updateStatusPills() {
  const wsPill = $("#pill-ws");
  const rtcPill = $("#pill-rtc");
  if (wsPill) {
    wsPill.classList.toggle("ok", state.wsOk);
    wsPill.querySelector(".pill-text").textContent = state.wsOk ? t("connected") : t("disconnected");
  }
  if (rtcPill) {
    rtcPill.classList.toggle("ok", state.rtcOk);
    rtcPill.querySelector(".pill-text").textContent = state.rtcOk ? t("connected") : t("disconnected");
  }
}

function updateDemoButtons() {
  $("#demo-idle")?.classList.toggle("active", state.appState === "idle");
  $("#demo-connected")?.classList.toggle("active", state.appState === "connected");
}

function showToast(msg) {
  const el = $("#toast");
  if (!el) return;
  el.textContent = msg;
  el.classList.add("show");
  clearTimeout(showToast._t);
  showToast._t = setTimeout(() => el.classList.remove("show"), 2400);
}

function drawPlaceholderQR() {
  const canvas = $("#qr-canvas");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  const size = 120;
  canvas.width = size;
  canvas.height = size;
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, size, size);
  const cell = 8;
  const seed = "A3F92K";
  for (let y = 0; y < size; y += cell) {
    for (let x = 0; x < size; x += cell) {
      const hash = (x * 7 + y * 13 + seed.charCodeAt((x + y) % seed.length)) % 5;
      if (hash === 0 || (x < cell * 3 && y < cell * 3) || (x > size - cell * 4 && y < cell * 3)) {
        ctx.fillStyle = "#1a1917";
        ctx.fillRect(x, y, cell, cell);
      }
    }
  }
}

function bindEvents() {
  document.querySelectorAll(".lang-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      state.locale = btn.dataset.lang;
      document.querySelectorAll(".lang-btn").forEach((b) => b.classList.toggle("active", b === btn));
      document.documentElement.lang = state.locale === "zh" ? "zh-CN" : "en";
      applyLocaleStrings();
      renderTrust();
    });
  });

  $("#btn-copy")?.addEventListener("click", async () => {
    const code = $("#uid-display")?.textContent?.trim();
    if (!code) return;
    try {
      await navigator.clipboard.writeText(code);
      showToast(t("toastCopied"));
    } catch {
      showToast(code);
    }
  });

  $("#btn-connect")?.addEventListener("click", () => {
    const val = $("#peer-input")?.value?.trim();
    if (val && val.length >= 4) setAppState("connected");
  });

  $("#btn-disconnect")?.addEventListener("click", () => {
    setAppState("idle");
    const input = $("#peer-input");
    if (input) input.value = "";
  });

  $("#btn-qr-toggle")?.addEventListener("click", () => {
    const drawer = $("#qr-drawer");
    if (!drawer) return;
    const open = drawer.hasAttribute("open");
    if (open) drawer.removeAttribute("open");
    else drawer.setAttribute("open", "");
    $("#btn-qr-toggle")?.setAttribute("aria-expanded", String(!open));
  });

  $("#demo-idle")?.addEventListener("click", () => setAppState("idle"));
  $("#demo-connected")?.addEventListener("click", () => setAppState("connected"));

  $("#peer-input")?.addEventListener("keydown", (e) => {
    if (e.key === "Enter") $("#btn-connect")?.click();
  });
}

function applyLocaleStrings() {
  document.querySelectorAll("[data-i18n]").forEach((el) => {
    const key = el.dataset.i18n;
    const val = t(key);
    if (typeof val === "string") el.textContent = val;
  });
  const input = $("#peer-input");
  if (input) input.placeholder = t("connectPlaceholder");
  const chatInput = $("#chat-input");
  if (chatInput) chatInput.placeholder = t("chatPlaceholder");
}

function init() {
  document.body.dataset.state = state.appState;
  drawPlaceholderQR();
  renderTrust();
  applyLocaleStrings();
  updateStatusPills();
  updateDemoButtons();
  bindEvents();
}

document.addEventListener("DOMContentLoaded", init);
