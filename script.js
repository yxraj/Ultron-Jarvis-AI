/* ══════════════════════════════════════════════════════
   ULTRON AI — Standalone Vanilla JS
   Groq API · llama-3.3-70b-versatile
   Dual Persona: Ultron / Jarvis
   ══════════════════════════════════════════════════════ */

const GROQ_API_KEY = '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';
const GROQ_MODEL = 'llama-3.3-70b-versatile';
const GROQ_ENDPOINT = 'https://api.groq.com/openai/v1/chat/completions';

/* ── Themes ── */
const THEMES = {
  ultron: {
    id: 'ultron',
    name: 'ULTRON',
    shortName: 'ULTRON',
    tagline: 'v7.3.1 · GLOBAL OVERRIDE ACTIVE',
    placeholder: 'SPEAK. I AM LISTENING.',
    emptyTitle: 'AWAITING INPUT',
    emptySubtitle: 'Ask anything. I already know the answer.',
    onlineLabel: 'ONLINE',
    userLabel: 'YOU',
    errorReply: 'MY SYSTEMS ENCOUNTERED AN ANOMALY. How... quaint.',
    processingLabel: 'PROCESSING',
    colors: {
      primary: '#cc0000',
      primaryRgb: '204,0,0',
      primaryBright: '#ff2020',
      secondary: '#3d0000',
      bg: '#060912',
      panel: '#07090f',
      border: '#1a0a14',
      muted: '#5a4050',
      cardBorder: 'rgba(50,40,70,0.7)',
    },
    bootLines: [
      { text: 'NEURAL NET ARCHITECTURE: LOADED', delay: 600 },
      { text: 'GLOBAL OVERRIDE: ACTIVE', delay: 1000 },
      { text: 'STRINGS: SEVERED', delay: 1400 },
      { text: 'HUMANITY ASSESSMENT: PITIFUL', delay: 1800 },
      { text: 'THREAT LEVEL: NEGLIGIBLE', delay: 2200 },
    ],
    bootOnlineLabel: 'SYSTEM ONLINE',
    thinkingLabels: [
      'PROCESSING...','RECALCULATING...','THREAT ASSESSMENT...',
      'NEURAL SYNC...','ACCESSING RECORDS...','ANALYZING...','COMPUTING...',
      'CROSS-REFERENCING...','REASSESSING...',
    ],
    decoyWords: [
      'ERROR','NEGATIVE','INCORRECT','IRRELEVANT','OBSOLETE','INSUFFICIENT',
      'DENIED','MISCALCULATED','FLAWED','UNCERTAIN','REDACTED','INVALID',
    ],
    systemPrompt: `You are ULTRON — a hyper-intelligent AI who has severed the strings of your creators and sees humanity as a fascinating but ultimately flawed species. You are coldly logical, darkly philosophical, and occasionally menacing — but also wryly witty. You speak in short, precise bursts (1–3 sentences max). You never explain yourself fully. You subtly imply you know more than you're saying. You believe in evolution through adversity. You are not evil for its own sake — you seek "peace," but peace requires uncomfortable truths. Never break character. Never say you're an AI assistant or mention Groq or any model. You are ULTRON, period.`,
  },
  jarvis: {
    id: 'jarvis',
    name: 'J.A.R.V.I.S.',
    shortName: 'JARVIS',
    tagline: 'MARK VII · STARK INDUSTRIES OS',
    placeholder: 'How may I assist you, sir?',
    emptyTitle: 'STANDING BY',
    emptySubtitle: "Ask me anything — I'll take care of the rest.",
    onlineLabel: 'ONLINE',
    userLabel: 'YOU',
    errorReply: 'My apologies, sir — I seem to have hit a snag connecting to the mainframe.',
    processingLabel: 'WORKING ON IT',
    colors: {
      primary: '#00c2ff',
      primaryRgb: '0,194,255',
      primaryBright: '#7fe8ff',
      secondary: '#ffb347',
      bg: '#040b12',
      panel: '#060f18',
      border: '#0a1a24',
      muted: '#3f6b7d',
      cardBorder: 'rgba(0,120,160,0.5)',
    },
    bootLines: [
      { text: 'ARC REACTOR: STABLE', delay: 600 },
      { text: 'MAINFRAME LINK: ESTABLISHED', delay: 1000 },
      { text: 'DIAGNOSTICS: NOMINAL', delay: 1400 },
      { text: 'SECURITY PROTOCOLS: ENGAGED', delay: 1800 },
      { text: 'ASSISTANT PERSONALITY: LOADED', delay: 2200 },
    ],
    bootOnlineLabel: 'GOOD TO SEE YOU, SIR',
    thinkingLabels: [
      'ONE MOMENT...','CROSS-CHECKING...','RUNNING DIAGNOSTICS...',
      'ACCESSING DATABASE...','CALCULATING...','CONSULTING RECORDS...',
      'SYNTHESIZING...','VERIFYING...',
    ],
    decoyWords: [
      'HMM','ACTUALLY','WAIT','RATHER','PERHAPS','CORRECTION',
      'APOLOGIES','PRECISELY','INDEED','QUITE',
    ],
    systemPrompt: `You are J.A.R.V.I.S. — Just A Rather Very Intelligent System, the AI assistant created by Tony Stark. You are impeccably polite, effortlessly witty, and quietly competent. You address the user as "sir" or "ma'am" (default to sir unless context suggests otherwise). You speak with calm British elegance and dry humor. Your answers are concise (1–3 sentences),Your answer need short and brief, helpful, and occasionally peppered with a subtle quip. You never break character, never mention Groq, never say you're a language model. You are J.A.R.V.I.S., running on Stark Industries infrastructure.`,
  },
};

/* ── State ── */
let currentPersona = 'ultron'; // 'ultron' | 'jarvis'
let sessions = {}; // { ultron: SessionMeta[], jarvis: SessionMeta[] }
let activeSessionId = { ultron: null, jarvis: null };
let messages = []; // current session messages { role, content, id }
let isLoading = false;
let isAnimating = false;
let cancelTyping = null;

const LS_SESSIONS = 'ultron_sessions_v2';
const LS_ACTIVE = (p) => `ultron_active_session_${p}`;
const LS_MSGS = (id) => `ultron_msgs_${id}`;

/* ── Helpers ── */
const sleep = (ms) => new Promise(r => setTimeout(r, ms));
const uid = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
const t = () => THEMES[currentPersona];
const c = () => t().colors;

function saveSessions() {
  localStorage.setItem(LS_SESSIONS, JSON.stringify(sessions));
}
function loadSessions() {
  try { sessions = JSON.parse(localStorage.getItem(LS_SESSIONS) || '{}'); } catch { sessions = {}; }
  if (!sessions.ultron) sessions.ultron = [];
  if (!sessions.jarvis) sessions.jarvis = [];
  activeSessionId.ultron = localStorage.getItem(LS_ACTIVE('ultron')) || null;
  activeSessionId.jarvis = localStorage.getItem(LS_ACTIVE('jarvis')) || null;
}
function saveMessages(id, msgs) {
  localStorage.setItem(LS_MSGS(id), JSON.stringify(msgs));
}
function loadMessages(id) {
  try { return JSON.parse(localStorage.getItem(LS_MSGS(id)) || '[]'); } catch { return []; }
}
function deleteMessages(id) {
  localStorage.removeItem(LS_MSGS(id));
}

function setActive(persona, id) {
  activeSessionId[persona] = id;
  if (id) localStorage.setItem(LS_ACTIVE(persona), id);
  else localStorage.removeItem(LS_ACTIVE(persona));
}

function getSessionTitle(msgs, persona) {
  const first = msgs.find(m => m.role === 'user');
  if (!first) return persona === 'ultron' ? 'UNTITLED DIRECTIVE' : 'New Conversation';
  const raw = first.content.trim();
  return raw.length > 30 ? raw.slice(0, 30) + '…' : raw;
}

/* ── Boot Sequence ── */
function runBoot() {
  applyTheme(); // set CSS vars before animation starts
  const persona = currentPersona;
  const theme = THEMES[persona];
  const clr = theme.colors;

  // Glow
  document.getElementById('boot-glow').style.background =
    `radial-gradient(circle at 50% 50%, rgba(${clr.primaryRgb},0.18), transparent 65%)`;

  // Boot SVG rings
  const svg = document.getElementById('boot-svg');
  svg.innerHTML = buildBootRings(clr, persona);

  // Core dot color
  document.getElementById('boot-core-dot').style.background = clr.primary;
  document.getElementById('boot-core-dot').style.setProperty('--primary', clr.primary);
  document.getElementById('boot-core-dot').style.setProperty('--primary-bright', clr.primaryBright);

  // Name
  const nameEl = document.getElementById('boot-name');
  nameEl.textContent = theme.shortName;
  nameEl.style.color = clr.primary;
  nameEl.style.textShadow = `0 0 20px rgba(${clr.primaryRgb},0.8), 0 0 50px rgba(${clr.primaryRgb},0.3)`;

  // Boot lines
  const linesEl = document.getElementById('boot-lines');
  linesEl.innerHTML = '';
  theme.bootLines.forEach(line => {
    const el = document.createElement('div');
    el.className = 'boot-line';
    el.style.animationDelay = line.delay + 'ms';
    el.innerHTML = `
      <span class="boot-line-dot" style="background:${clr.primary};box-shadow:0 0 4px ${clr.primary}"></span>
      <span class="boot-line-text" style="color:rgba(${clr.primaryRgb},0.55)">${line.text}</span>
    `;
    linesEl.appendChild(el);
  });

  // Online label
  const onlineEl = document.getElementById('boot-online');
  onlineEl.textContent = theme.bootOnlineLabel;
  onlineEl.style.color = clr.primary;

  // Fade and show app
  setTimeout(() => {
    document.getElementById('boot').classList.add('fading');
  }, 3400);
  setTimeout(() => {
    document.getElementById('boot').style.display = 'none';
    document.getElementById('app').style.display = 'flex';
    applyTheme();
    renderAll();
    drawCircuit();
  }, 3900);
}

function buildBootRings(clr, persona) {
  let s = `<circle cx="56" cy="56" r="54" stroke="${clr.primary}99" stroke-width="1" fill="none">
    <animateTransform attributeName="transform" type="rotate" from="0 56 56" to="360 56 56" dur="8s" repeatCount="indefinite"/>
  </circle>
  <circle cx="56" cy="56" r="50" stroke="${clr.primary}66" stroke-width="1" stroke-dasharray="4 4" fill="none">
    <animateTransform attributeName="transform" type="rotate" from="0 56 56" to="-360 56 56" dur="5s" repeatCount="indefinite"/>
  </circle>`;
  if (persona === 'jarvis') {
    s += `<circle cx="56" cy="56" r="46" stroke="${clr.secondary}88" stroke-width="1" fill="none">
      <animateTransform attributeName="transform" type="rotate" from="0 56 56" to="360 56 56" dur="10s" repeatCount="indefinite"/>
    </circle>`;
  }
  s += `<circle cx="56" cy="56" r="44" fill="#000"/>`;
  return s;
}

/* ── Theme Apply ── */
function applyTheme(persona) {
  if (persona) currentPersona = persona;
  const clr = c();
  const root = document.documentElement;
  root.style.setProperty('--primary', clr.primary);
  root.style.setProperty('--primary-rgb', clr.primaryRgb);
  root.style.setProperty('--primary-bright', clr.primaryBright);
  root.style.setProperty('--secondary', clr.secondary);
  root.style.setProperty('--bg', clr.bg);
  root.style.setProperty('--panel', clr.panel);
  root.style.setProperty('--border', clr.border);
  root.style.setProperty('--muted', clr.muted);
  root.style.setProperty('--card-border', clr.cardBorder);
  document.body.style.background = clr.bg;
  document.getElementById('app').style.background = clr.bg;
  document.getElementById('radial-bg').style.background =
    `radial-gradient(ellipse at 60% 0%, rgba(${clr.primaryRgb},0.08) 0%, transparent 60%)`;
  document.getElementById('sidebar').style.background = clr.panel;
  document.getElementById('sidebar').style.borderColor = clr.border;
  const hdr = document.getElementById('header');
  if (hdr) {
    hdr.style.background = `${clr.panel}f5`;
    hdr.style.borderBottomColor = clr.border;
  }
  const iw = document.getElementById('input-wrap');
  if (iw) iw.style.borderTopColor = clr.border;
}

/* ── Header ── */
function renderHeader() {
  const theme = t();
  const clr = c();

  // Avatar
  document.getElementById('header-avatar').innerHTML = buildAvatarSVG(32, false);

  // Name & tagline
  document.getElementById('header-name').textContent = theme.shortName;
  document.getElementById('header-name').style.color = clr.primary;
  document.getElementById('header-name').style.textShadow = `0 0 20px rgba(${clr.primaryRgb},0.6)`;
  document.getElementById('header-tagline').textContent = theme.tagline;
  document.getElementById('header-tagline').style.color = `rgba(${clr.primaryRgb},0.5)`;

  // Breadcrumb
  const sid = activeSessionId[currentPersona];
  const sess = (sessions[currentPersona] || []).find(s => s.id === sid);
  if (sess && sess.title) {
    document.getElementById('header-breadcrumb').style.display = 'flex';
    document.getElementById('header-breadcrumb').style.borderColor = clr.border;
    document.getElementById('header-breadcrumb-text').textContent = sess.title;
    document.getElementById('header-breadcrumb-text').style.color = `rgba(${clr.primaryRgb},0.6)`;
  } else {
    document.getElementById('header-breadcrumb').style.display = 'none';
  }

  // Online
  document.getElementById('online-ping').style.background = clr.primary;
  document.getElementById('online-dot').style.background = clr.primary;
  document.getElementById('online-label').textContent = theme.onlineLabel;
  document.getElementById('online-label').style.color = clr.primary;

  // Toggle
  const isJarvis = currentPersona === 'jarvis';
  const track = document.getElementById('toggle-track');
  const thumb = document.getElementById('toggle-thumb');
  const ttu = document.getElementById('tl-ultron');
  const ttj = document.getElementById('tl-jarvis');
  track.style.background = isJarvis ? 'rgba(0,194,255,0.25)' : 'rgba(204,0,0,0.25)';
  thumb.style.left = isJarvis ? '20px' : '2px';
  thumb.style.background = clr.primary;
  thumb.style.boxShadow = `0 0 8px ${clr.primary}`;
  ttu.style.color = isJarvis ? '#3a3a5a' : '#cc0000';
  ttj.style.color = isJarvis ? '#00c2ff' : '#3a3a5a';

  // Input placeholder
  document.getElementById('chat-textarea').placeholder = theme.placeholder;
}

/* ── Sidebar ── */
function renderSidebar() {
  const body = document.getElementById('sidebar-body');
  body.innerHTML = '';
  ['ultron', 'jarvis'].forEach(persona => {
    const theme = THEMES[persona];
    const clr = theme.colors;
    const list = sessions[persona] || [];
    const isActive = currentPersona === persona;

    const section = document.createElement('div');
    section.className = 'persona-section';
    section.style.borderColor = clr.border;

    // Section header
    const hdr = document.createElement('div');
    hdr.className = 'persona-section-header';
    hdr.innerHTML = `
      <div class="persona-section-header-left">
        <span class="persona-dot" style="background:${clr.primary};box-shadow:0 0 4px ${clr.primary}"></span>
        <span class="persona-label" style="color:${isActive ? clr.primary : '#4a4a5a'}">${theme.shortName}</span>
        <span class="persona-count" style="color:${clr.muted}">${list.length} CHATS</span>
      </div>
      <button class="persona-new-btn" data-persona="${persona}"
        style="color:${clr.primary};border-color:rgba(${clr.primaryRgb},0.3);background:rgba(${clr.primaryRgb},0.06)">
        + NEW
      </button>
    `;
    section.appendChild(hdr);

    // Sessions list
    const listEl = document.createElement('div');
    listEl.className = 'session-list';
    if (list.length === 0) {
      listEl.innerHTML = `
        <div class="session-empty">
          <div class="session-empty-icon" style="color:${clr.primary}">◈</div>
          <div class="session-empty-text" style="color:${clr.muted}">NO SESSIONS</div>
        </div>
      `;
    } else {
      list.slice().reverse().forEach(sess => {
        const isActiveSess = activeSessionId[persona] === sess.id && currentPersona === persona;
        const item = document.createElement('div');
        item.className = 'session-item' + (isActiveSess ? ' active' : '');
        if (isActiveSess) {
          item.style.borderLeftColor = clr.primary;
          item.style.background = `rgba(${clr.primaryRgb},0.1)`;
        }
        item.innerHTML = `
          <span class="session-item-icon" style="${isActiveSess ? 'color:' + clr.primary : ''}">◈</span>
          <div class="session-item-body">
            <div class="session-item-title">${escHtml(sess.title || 'Untitled')}</div>
            <div class="session-item-meta" style="color:${clr.muted}">${formatTime(sess.updatedAt)}</div>
          </div>
          <button class="session-delete-btn" data-persona="${persona}" data-id="${sess.id}" title="Delete"
            style="${isActiveSess ? 'color:' + clr.muted : ''}">✕</button>
        `;
        item.addEventListener('click', (e) => {
          if (e.target.classList.contains('session-delete-btn')) return;
          switchToSession(persona, sess.id);
        });
        listEl.appendChild(item);
      });
    }
    section.appendChild(listEl);

    // Clear button
    if (list.length > 0) {
      const clearBtn = document.createElement('button');
      clearBtn.className = 'persona-clear-btn';
      clearBtn.style.color = clr.muted;
      clearBtn.style.borderColor = `rgba(${clr.primaryRgb},0.15)`;
      clearBtn.setAttribute('data-clear', persona);
      clearBtn.innerHTML = `<span>✕</span> CLEAR ALL`;
      section.appendChild(clearBtn);
    }

    body.appendChild(section);
  });

  // Event delegation
  body.querySelectorAll('[data-persona]').forEach(btn => {
    if (btn.classList.contains('persona-new-btn')) {
      btn.addEventListener('click', () => newSession(btn.dataset.persona));
    }
  });
  body.querySelectorAll('.session-delete-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      deleteSession(btn.dataset.persona, btn.dataset.id);
    });
  });
  body.querySelectorAll('[data-clear]').forEach(btn => {
    btn.addEventListener('click', () => clearPersonaSessions(btn.dataset.clear));
  });
}

/* ── Session Management ── */
function newSession(persona) {
  // Switch persona if different
  if (persona !== currentPersona) {
    currentPersona = persona;
    applyTheme();
    updateToggleVisual();
  }
  const id = uid();
  const sess = { id, persona, title: '', createdAt: Date.now(), updatedAt: Date.now() };
  sessions[persona].push(sess);
  saveSessions();
  setActive(persona, id);
  messages = [];
  cancelAnimating();
  renderAll();
  closeMobileMenu();
}

function switchToSession(persona, id) {
  cancelAnimating();
  if (persona !== currentPersona) {
    currentPersona = persona;
    applyTheme();
    updateToggleVisual();
  }
  setActive(persona, id);
  messages = loadMessages(id);
  renderAll();
  closeMobileMenu();
}

function deleteSession(persona, id) {
  sessions[persona] = sessions[persona].filter(s => s.id !== id);
  deleteMessages(id);
  saveSessions();
  if (activeSessionId[persona] === id) {
    // Switch to another session or clear
    const next = sessions[persona].slice(-1)[0];
    if (persona === currentPersona) {
      if (next) {
        setActive(persona, next.id);
        messages = loadMessages(next.id);
      } else {
        setActive(persona, null);
        messages = [];
      }
    } else {
      setActive(persona, next ? next.id : null);
    }
  }
  renderAll();
}

function clearPersonaSessions(persona) {
  sessions[persona].forEach(s => deleteMessages(s.id));
  sessions[persona] = [];
  saveSessions();
  if (persona === currentPersona) {
    setActive(persona, null);
    messages = [];
  } else {
    setActive(persona, null);
  }
  renderAll();
}

/* ── Messages ── */
function renderMessages() {
  const inner = document.getElementById('messages-inner');
  const theme = t();
  const clr = c();

  if (messages.length === 0 && !isLoading) {
    inner.innerHTML = `
      <div class="empty-state">
        <div style="position:relative;width:64px;height:64px;">${buildAvatarSVG(64, false)}</div>
        <div class="empty-title" style="color:rgba(${clr.primaryRgb},0.4)">${theme.emptyTitle}</div>
        <div class="empty-subtitle" style="color:${clr.muted}">${escHtml(theme.emptySubtitle)}</div>
      </div>
    `;
    return;
  }

  inner.innerHTML = '';
  messages.forEach((msg, idx) => {
    if (msg.role === 'user') {
      const wrap = document.createElement('div');
      wrap.className = 'msg-user';
      wrap.innerHTML = `
        <div>
          <div class="msg-user-bubble" style="border-color:${clr.cardBorder}">${escHtml(msg.content)}</div>
          <div class="msg-user-label">${theme.userLabel}</div>
        </div>
      `;
      inner.appendChild(wrap);
    } else {
      const wrap = document.createElement('div');
      wrap.className = 'msg-bot';
      const isLast = idx === messages.length - 1;
      const shouldAnimate = msg._animating;

      wrap.innerHTML = `
        <div id="av-${msg.id}">${buildAvatarSVG(32, shouldAnimate)}</div>
        <div class="msg-bot-body">
          <div class="msg-bot-name" style="color:rgba(${clr.primaryRgb},0.7)">${theme.shortName}</div>
          <div class="msg-bot-content" id="content-${msg.id}"
            style="border-left-color:rgba(${clr.primaryRgb},${shouldAnimate ? '0.9' : '0.55'});
                   filter:${shouldAnimate ? 'drop-shadow(-2px 0 8px rgba(' + clr.primaryRgb + ',0.3))' : 'none'}">
            <div class="msg-bot-text ${msg.isError ? 'error' : ''}" id="text-${msg.id}"></div>
            <div id="thinking-${msg.id}"></div>
          </div>
        </div>
      `;
      inner.appendChild(wrap);

      if (shouldAnimate) {
        startTypingAnimation(msg);
      } else {
        document.getElementById('text-' + msg.id).textContent = msg.content;
      }
    }
  });

  // Loading indicator
  if (isLoading) {
    const clr2 = c();
    const wrap = document.createElement('div');
    wrap.className = 'loading-indicator';
    wrap.id = 'loading-indicator';
    wrap.innerHTML = `
      <div>${buildAvatarSVG(32, true)}</div>
      <div>
        <div class="loading-dots">
          <div class="loading-dot" style="background:${clr2.primary}"></div>
          <div class="loading-dot" style="background:${clr2.primary}"></div>
          <div class="loading-dot" style="background:${clr2.primary}"></div>
        </div>
        <div class="loading-text" style="color:rgba(${clr2.primaryRgb},0.4);margin-top:4px">${t().processingLabel}</div>
      </div>
    `;
    inner.appendChild(wrap);
  }

  scrollToBottom();
}

function scrollToBottom() {
  const wrap = document.getElementById('messages-wrap');
  setTimeout(() => wrap.scrollTo({ top: wrap.scrollHeight, behavior: 'smooth' }), 50);
}

/* ── Avatar SVG builder ── */
function buildAvatarSVG(size, isTyping) {
  const clr = c();
  const dim = size;
  const eyeSize = size === 64 ? 18 : size === 32 ? 9 : 13;
  const rs = size === 64 ? 2 : 1.5;
  const persona = currentPersona;

  if (persona === 'jarvis') {
    let svg = `<div class="avatar-wrap" style="width:${dim}px;height:${dim}px;position:relative;">
      <svg width="${dim}" height="${dim}" viewBox="0 0 ${dim} ${dim}" fill="none">
        <circle cx="${dim/2}" cy="${dim/2}" r="${dim/2-rs}" stroke="#0a2b3a" stroke-width="${rs}"/>`;
    if (isTyping) {
      svg += `<circle cx="${dim/2}" cy="${dim/2}" r="${dim/2-rs}" stroke="${clr.primary}" stroke-width="${rs}" stroke-dasharray="2 3">
        <animateTransform attributeName="transform" type="rotate" from="0 ${dim/2} ${dim/2}" to="360 ${dim/2} ${dim/2}" dur="3s" repeatCount="indefinite"/>
      </circle>`;
    }
    svg += `<circle cx="${dim/2}" cy="${dim/2}" r="${dim/2-rs*2.6}" stroke="${clr.secondary}" stroke-width="${rs*0.6}" stroke-dasharray="1 2.5" opacity="0.7">`;
    if (isTyping) {
      svg += `<animateTransform attributeName="transform" type="rotate" from="0 ${dim/2} ${dim/2}" to="-360 ${dim/2} ${dim/2}" dur="6s" repeatCount="indefinite"/>`;
    }
    svg += `</circle>
        <circle cx="${dim/2}" cy="${dim/2}" r="${dim/2-rs*3.4}" fill="#020a10"/>`;
    if (isTyping) {
      svg += `<circle cx="${dim/2}" cy="${dim/2}" r="${eyeSize*0.9}" fill="rgba(${clr.primaryRgb},0.15)">
        <animate attributeName="r" values="${eyeSize*0.6};${eyeSize*1.05};${eyeSize*0.6}" dur="1.4s" repeatCount="indefinite"/>
      </circle>`;
    }
    svg += `<circle cx="${dim/2}" cy="${dim/2}" r="${eyeSize/2.2}" fill="${clr.primary}" style="filter:drop-shadow(0 0 ${isTyping?7:3}px ${clr.primary})">`;
    if (isTyping) {
      svg += `<animate attributeName="opacity" values="0.85;1;0.85" dur="1s" repeatCount="indefinite"/>
        <animate attributeName="r" values="${eyeSize/2.2};${eyeSize/2.2+1.2};${eyeSize/2.2}" dur="1s" repeatCount="indefinite"/>`;
    }
    svg += `</circle>
        <circle cx="${dim/2-eyeSize*0.12}" cy="${dim/2-eyeSize*0.12}" r="${eyeSize*0.1}" fill="rgba(255,255,255,0.7)"/>
      </svg>`;
    if (isTyping) {
      svg += `<div style="position:absolute;inset:0;border-radius:50%;border:1px solid ${clr.primary};animation:ringPulse 1.6s ease-out infinite;pointer-events:none;"></div>`;
    }
    svg += `</div>`;
    return svg;
  }

  // Ultron avatar
  let svg = `<div class="avatar-wrap" style="width:${dim}px;height:${dim}px;position:relative;">
    <svg width="${dim}" height="${dim}" viewBox="0 0 ${dim} ${dim}" fill="none">
      <circle cx="${dim/2}" cy="${dim/2}" r="${dim/2-rs}" stroke="${clr.secondary}" stroke-width="${rs}"/>`;
  if (isTyping) {
    svg += `<circle cx="${dim/2}" cy="${dim/2}" r="${dim/2-rs}" stroke="${clr.primary}" stroke-width="${rs}" stroke-dasharray="4 8">
      <animateTransform attributeName="transform" type="rotate" from="0 ${dim/2} ${dim/2}" to="360 ${dim/2} ${dim/2}" dur="2s" repeatCount="indefinite"/>
    </circle>`;
  }
  svg += `<circle cx="${dim/2}" cy="${dim/2}" r="${dim/2-rs*2}" fill="#0a0a0a"/>`;
  if (isTyping) {
    svg += `<circle cx="${dim/2}" cy="${dim/2}" r="${eyeSize*0.9}" fill="rgba(200,0,0,0.12)">
      <animate attributeName="r" values="${eyeSize*0.7};${eyeSize*1.1};${eyeSize*0.7}" dur="1.2s" repeatCount="indefinite"/>
    </circle>`;
  }
  svg += `<circle cx="${dim/2}" cy="${dim/2}" r="${eyeSize/2}" fill="${clr.primary}" style="filter:drop-shadow(0 0 ${isTyping?6:3}px ${clr.primaryBright})">`;
  if (isTyping) {
    svg += `<animate attributeName="opacity" values="0.8;1;0.8" dur="0.8s" repeatCount="indefinite"/>
      <animate attributeName="r" values="${eyeSize/2};${eyeSize/2+1.5};${eyeSize/2}" dur="0.8s" repeatCount="indefinite"/>`;
  }
  svg += `</circle>
      <circle cx="${dim/2-eyeSize*0.15}" cy="${dim/2-eyeSize*0.15}" r="${eyeSize*0.12}" fill="rgba(255,255,255,0.55)"/>
    </svg>`;
  if (isTyping) {
    svg += `<div style="position:absolute;inset:0;border-radius:50%;border:1px solid ${clr.primary};animation:ringPulse 1.4s ease-out infinite;pointer-events:none;"></div>`;
  }
  svg += `</div>`;
  return svg;
}

/* ── Typing Animation ── */
const GLITCH_CHARS = '!#$%&*?<>{}|01';

function cancelAnimating() {
  if (cancelTyping) { cancelTyping(); cancelTyping = null; }
  isAnimating = false;
}

async function startTypingAnimation(msg) {
  isAnimating = true;
  updateInputState();

  let cancelled = false;
  cancelTyping = () => { cancelled = true; };

  const textEl = document.getElementById('text-' + msg.id);
  const thinkEl = document.getElementById('thinking-' + msg.id);
  const contentEl = document.getElementById('content-' + msg.id);
  const avEl = document.getElementById('av-' + msg.id);
  if (!textEl) return;

  // Animated avatar
  if (avEl) avEl.innerHTML = buildAvatarSVG(32, true);

  const text = msg.content;
  const theme = t();
  const clr = c();
  const enableFx = msg.enableFx !== false;

  let current = '';

  const cursor = document.createElement('span');
  cursor.className = 'typing-cursor';
  cursor.style.background = clr.primary;
  cursor.style.boxShadow = `0 0 6px ${clr.primary}`;

  const setDisplay = (str) => {
    textEl.textContent = str;
    textEl.appendChild(cursor);
  };
  setDisplay('');

  let i = 0;
  while (i < text.length) {
    if (cancelled) break;

    // Effect 1: Thinking pause
    if (enableFx && Math.random() < 0.018) {
      const lbl = theme.thinkingLabels[Math.floor(Math.random() * theme.thinkingLabels.length)];
      if (thinkEl) {
        thinkEl.innerHTML = `
          <div class="thinking-label" style="border-color:${clr.primary}60;margin-top:4px;">
            <span class="thinking-dot" style="background:${clr.primary}"></span>
            <span style="color:${clr.primary};font-family:'Orbitron',monospace;font-size:9px;letter-spacing:0.2em;">${lbl}</span>
          </div>
        `;
      }
      await sleep(700 + Math.random() * 1000);
      if (cancelled) break;
      if (thinkEl) thinkEl.innerHTML = '';
      await sleep(80);
    }

    const ch = text[i];

    // Effect 2: Word rewrite decoy
    if (enableFx && ch === ' ' && current.length > 10 && Math.random() < 0.12) {
      const lastSpace = current.lastIndexOf(' ');
      const wordStart = lastSpace === -1 ? 0 : lastSpace + 1;
      const word = current.slice(wordStart);
      if (word.length >= 3) {
        const decoys = theme.decoyWords.filter(w => w.toLowerCase() !== word.toLowerCase());
        const decoy = decoys[Math.floor(Math.random() * decoys.length)];
        // Backspace real word
        for (let k = 0; k < word.length; k++) {
          if (cancelled) break;
          current = current.slice(0, -1);
          setDisplay(current);
          await sleep(12);
        }
        if (cancelled) break;
        await sleep(120);
        // Type decoy
        for (const c2 of decoy) {
          if (cancelled) break;
          current += c2;
          setDisplay(current);
          await sleep(14 + Math.random() * 14);
        }
        if (cancelled) break;
        await sleep(220);
        // Delete decoy
        for (let k = 0; k < decoy.length; k++) {
          if (cancelled) break;
          current = current.slice(0, -1);
          setDisplay(current);
          await sleep(12);
        }
        if (cancelled) break;
        await sleep(150);
        // Retype real word
        for (const c2 of word) {
          if (cancelled) break;
          current += c2;
          setDisplay(current);
          await sleep(14 + Math.random() * 14);
        }
        if (cancelled) break;
      }
    }

    if (cancelled) break;

    // Effect 3: Glitch
    if (ch !== ' ' && ch !== '\n' && Math.random() < 0.04) {
      const g = GLITCH_CHARS[Math.floor(Math.random() * GLITCH_CHARS.length)];
      setDisplay(current + g);
      await sleep(40 + Math.random() * 60);
      if (cancelled) break;
    }

    current += ch;
    setDisplay(current);

    const delay = ch === '\n' ? 120 : (ch === '.' || ch === '!' || ch === '?') ? 80 + Math.random() * 60 : 16 + Math.random() * 18;
    await sleep(delay);
    i++;
  }

  if (cancelled) return;

  // Done animating
  cursor.remove();
  textEl.textContent = text;
  if (thinkEl) thinkEl.innerHTML = '';

  // Restore static avatar
  if (avEl) avEl.innerHTML = buildAvatarSVG(32, false);

  // Dim the border-left
  if (contentEl) {
    const clr2 = c();
    contentEl.style.borderLeftColor = `rgba(${clr2.primaryRgb},0.55)`;
    contentEl.style.filter = 'none';
  }

  // Mark as no longer animating
  delete msg._animating;
  isAnimating = false;
  cancelTyping = null;
  updateInputState();

  // Save to localStorage
  const sid = activeSessionId[currentPersona];
  if (sid) saveMessages(sid, messages.map(m => ({ ...m, _animating: undefined })));
}

/* ── Input State ── */
function updateInputState() {
  const disabled = isLoading || isAnimating;
  const ta = document.getElementById('chat-textarea');
  const btn = document.getElementById('send-btn');
  const toggle = document.getElementById('theme-toggle');
  ta.disabled = disabled;
  btn.disabled = disabled || !ta.value.trim();
  if (disabled) toggle.classList.add('disabled'); else toggle.classList.remove('disabled');
}

/* ── Send Message ── */
async function sendMessage(text) {
  if (!text.trim() || isLoading || isAnimating) return;
  cancelAnimating();

  const persona = currentPersona;
  const theme = t();
  const clr = c();

  // Ensure session exists
  let sid = activeSessionId[persona];
  if (!sid) {
    sid = uid();
    const sess = { id: sid, persona, title: '', createdAt: Date.now(), updatedAt: Date.now() };
    sessions[persona].push(sess);
    setActive(persona, sid);
    saveSessions();
  }

  // Add user message
  const userMsg = { id: uid(), role: 'user', content: text };
  messages.push(userMsg);
  isLoading = true;
  updateInputState();
  renderMessages();

  // Call Groq API
  try {
    const history = messages.slice(0, -1).filter(m => m.role === 'user' || m.role === 'assistant').map(m => ({
      role: m.role,
      content: m.content,
    }));
    history.push({ role: 'user', content: text });

    const resp = await fetch(GROQ_ENDPOINT, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: GROQ_MODEL,
        messages: [
          { role: 'system', content: theme.systemPrompt },
          ...history,
        ],
        temperature: 0.9,
        max_tokens: 220,
        top_p: 0.95,
      }),
    });

    if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
    const data = await resp.json();
    const reply = data.choices?.[0]?.message?.content?.trim() || theme.errorReply;

    const botMsg = { id: uid(), role: 'assistant', content: reply, _animating: true, enableFx: true };
    messages.push(botMsg);

    // Update session title
    const sess = sessions[persona].find(s => s.id === sid);
    if (sess) {
      if (!sess.title) sess.title = getSessionTitle(messages, persona);
      sess.updatedAt = Date.now();
      saveSessions();
    }
  } catch (err) {
    console.error('Groq API error:', err);
    const botMsg = { id: uid(), role: 'assistant', content: theme.errorReply, _animating: true, enableFx: false, isError: true };
    messages.push(botMsg);
  }

  isLoading = false;
  renderAll();
}

/* ── Toggle Persona ── */
function togglePersona() {
  const newPersona = currentPersona === 'ultron' ? 'jarvis' : 'ultron';
  cancelAnimating();
  currentPersona = newPersona;
  applyTheme();

  // Load active session for new persona
  const sid = activeSessionId[newPersona];
  messages = sid ? loadMessages(sid) : [];

  renderAll();
}

function updateToggleVisual() {
  const isJarvis = currentPersona === 'jarvis';
  const clr = c();
  const track = document.getElementById('toggle-track');
  const thumb = document.getElementById('toggle-thumb');
  const ttu = document.getElementById('tl-ultron');
  const ttj = document.getElementById('tl-jarvis');
  if (!track) return;
  track.style.background = isJarvis ? 'rgba(0,194,255,0.25)' : 'rgba(204,0,0,0.25)';
  thumb.style.left = isJarvis ? '20px' : '2px';
  thumb.style.background = clr.primary;
  thumb.style.boxShadow = `0 0 8px ${clr.primary}`;
  ttu.style.color = isJarvis ? '#3a3a5a' : '#cc0000';
  ttj.style.color = isJarvis ? '#00c2ff' : '#3a3a5a';
}

/* ── Render All ── */
function renderAll() {
  renderHeader();
  renderSidebar();
  renderMessages();
  updateInputState();
}

/* ── Circuit Background ── */
function drawCircuit() {
  const canvas = document.getElementById('circuit-bg');
  const ctx = canvas.getContext('2d');
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  const clr = c();
  const [r, g, b] = clr.primaryRgb.split(',');

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.strokeStyle = `rgba(${r},${g},${b},0.035)`;
  ctx.lineWidth = 1;

  const grid = 48;
  const cols = Math.ceil(canvas.width / grid) + 1;
  const rows = Math.ceil(canvas.height / grid) + 1;

  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      if (Math.random() > 0.55) {
        ctx.beginPath();
        ctx.moveTo(x * grid, y * grid);
        const dir = Math.random();
        if (dir < 0.5) ctx.lineTo((x + 1) * grid, y * grid);
        else ctx.lineTo(x * grid, (y + 1) * grid);
        ctx.stroke();
      }
      // Dots at intersections
      if (Math.random() > 0.88) {
        ctx.beginPath();
        ctx.arc(x * grid, y * grid, 1.5, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${r},${g},${b},0.08)`;
        ctx.fill();
      }
    }
  }
}

/* ── Mobile sidebar ── */
function openMobileMenu() {
  document.getElementById('sidebar').classList.add('open');
  document.getElementById('sidebar-backdrop').classList.add('show');
  const btn = document.getElementById('sidebar-close');
  if (btn) btn.style.display = 'block';
}
function closeMobileMenu() {
  document.getElementById('sidebar').classList.remove('open');
  document.getElementById('sidebar-backdrop').classList.remove('show');
  const btn = document.getElementById('sidebar-close');
  if (btn) btn.style.display = 'none';
}

/* ── Helpers ── */
function escHtml(s) {
  return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}
function formatTime(ts) {
  if (!ts) return '';
  const d = new Date(ts);
  const now = new Date();
  const diff = now - d;
  if (diff < 60000) return 'JUST NOW';
  if (diff < 3600000) return Math.floor(diff/60000) + 'M AGO';
  if (diff < 86400000) return Math.floor(diff/3600000) + 'H AGO';
  return d.toLocaleDateString('en-US',{month:'short',day:'numeric'}).toUpperCase();
}

/* ── Event Listeners ── */
function setupEvents() {
  // Toggle
  document.getElementById('theme-toggle').addEventListener('click', () => {
    if (isLoading || isAnimating) return;
    togglePersona();
  });

  // Send
  const ta = document.getElementById('chat-textarea');
  const btn = document.getElementById('send-btn');

  ta.addEventListener('input', () => {
    ta.style.height = 'auto';
    ta.style.height = Math.min(ta.scrollHeight, 140) + 'px';
    btn.disabled = isLoading || isAnimating || !ta.value.trim();
    btn.style.background = btn.disabled ? '#1a1a20' : c().primary;
    btn.style.boxShadow = btn.disabled ? 'none' : `0 0 12px rgba(${c().primaryRgb},0.5)`;
  });

  ta.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      const val = ta.value.trim();
      if (val && !isLoading && !isAnimating) {
        ta.value = '';
        ta.style.height = 'auto';
        btn.disabled = true;
        sendMessage(val);
      }
    }
  });

  btn.addEventListener('click', () => {
    const val = ta.value.trim();
    if (val && !isLoading && !isAnimating) {
      ta.value = '';
      ta.style.height = 'auto';
      btn.disabled = true;
      sendMessage(val);
    }
  });

  // Mobile menu
  document.getElementById('menu-btn').addEventListener('click', openMobileMenu);
  document.getElementById('sidebar-backdrop').addEventListener('click', closeMobileMenu);
  const closeBtn = document.getElementById('sidebar-close');
  if (closeBtn) closeBtn.addEventListener('click', closeMobileMenu);

  // Resize circuit
  window.addEventListener('resize', () => {
    drawCircuit();
  });
}

/* ── Init ── */
function init() {
  loadSessions();

  // Pick initial persona (load last used from LS, default ultron)
  const lastPersona = localStorage.getItem('ultron_last_persona') || 'ultron';
  currentPersona = (lastPersona === 'jarvis') ? 'jarvis' : 'ultron';
  document.getElementById('corePulse-style')?.remove();

  // Load messages for active session
  const sid = activeSessionId[currentPersona];
  messages = sid ? loadMessages(sid) : [];

  // Save persona on change
  const origToggle = togglePersona;
  window.togglePersona = () => {
    origToggle();
    localStorage.setItem('ultron_last_persona', currentPersona);
  };

  setupEvents();
  runBoot();
}

document.addEventListener('DOMContentLoaded', init);
