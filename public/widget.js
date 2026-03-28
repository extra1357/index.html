(function() {
  const style = document.createElement('style');
  style.textContent = `
    #sofia-launcher {
      position: fixed;
      bottom: 28px;
      right: 28px;
      z-index: 9999;
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      gap: 12px;
    }
    #sofia-toggle {
      width: 60px;
      height: 60px;
      border-radius: 50%;
      background: linear-gradient(135deg, #c9a84c, #b8913e);
      border: none;
      cursor: pointer;
      box-shadow: 0 4px 24px rgba(201,168,76,0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      animation: sofia-pulse 3s ease-in-out infinite;
      transition: transform 0.2s;
      position: relative;
    }
    #sofia-toggle:hover { transform: scale(1.1); }
    #sofia-badge {
      position: absolute;
      top: 2px;
      right: 2px;
      width: 13px;
      height: 13px;
      background: #22c55e;
      border-radius: 50%;
      border: 2px solid white;
    }
    .sofia-actions {
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      gap: 10px;
      opacity: 0;
      pointer-events: none;
      transform: translateY(10px);
      transition: all 0.3s ease;
    }
    .sofia-actions.open {
      opacity: 1;
      pointer-events: all;
      transform: translateY(0);
    }
    .sofia-action-btn {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 10px 18px;
      border-radius: 50px;
      border: none;
      cursor: pointer;
      font-family: Arial, sans-serif;
      font-size: 14px;
      font-weight: 500;
      white-space: nowrap;
      box-shadow: 0 4px 16px rgba(0,0,0,0.2);
      transition: transform 0.2s;
      color: white;
      text-decoration: none;
    }
    .sofia-action-btn:hover { transform: translateX(-4px); }
    .sofia-action-btn.sofia { background: linear-gradient(135deg, #1a2235, #0f172a); border: 1px solid #c9a84c; color: #e8c97a; }
    .sofia-action-btn.whats { background: linear-gradient(135deg, #25d366, #128c3e); }
    .sofia-action-btn.leads { background: linear-gradient(135deg, #3b82f6, #1d4ed8); }

    #sofia-frame, #sofia-lead-form {
      position: fixed;
      bottom: 104px;
      right: 28px;
      width: 420px;
      border-radius: 20px;
      border: none;
      box-shadow: 0 8px 48px rgba(0,0,0,0.35);
      z-index: 9998;
      display: none;
    }
    #sofia-frame { height: 600px; }
    #sofia-frame.open, #sofia-lead-form.open { display: block; }

    #sofia-lead-form {
      background: #0a0f1e;
      padding: 28px;
      font-family: Arial, sans-serif;
    }
    .lead-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
    }
    .lead-header h3 {
      color: #e8c97a;
      font-size: 18px;
      margin: 0;
    }
    .lead-close {
      background: none;
      border: none;
      color: #6b7280;
      font-size: 22px;
      cursor: pointer;
      line-height: 1;
    }
    .lead-close:hover { color: #e8c97a; }
    .lead-subtitle {
      color: #6b7280;
      font-size: 13px;
      margin-bottom: 20px;
      line-height: 1.5;
    }
    .lead-input {
      width: 100%;
      padding: 12px 16px;
      background: #111827;
      border: 1px solid rgba(201,168,76,0.2);
      border-radius: 10px;
      color: #f0ece4;
      font-family: Arial, sans-serif;
      font-size: 14px;
      margin-bottom: 12px;
      outline: none;
      box-sizing: border-box;
      transition: border-color 0.2s;
    }
    .lead-input:focus { border-color: #c9a84c; }
    .lead-input::placeholder { color: #6b7280; }
    .lead-submit {
      width: 100%;
      padding: 14px;
      background: linear-gradient(135deg, #c9a84c, #b8913e);
      color: #0a0f1e;
      border: none;
      border-radius: 10px;
      font-family: Arial, sans-serif;
      font-size: 15px;
      font-weight: 600;
      cursor: pointer;
      margin-top: 4px;
      transition: opacity 0.2s;
    }
    .lead-submit:hover { opacity: 0.9; }
    .lead-success {
      text-align: center;
      padding: 20px 0;
      display: none;
    }
    .lead-success .check { font-size: 48px; margin-bottom: 12px; }
    .lead-success h4 { color: #e8c97a; font-size: 18px; margin-bottom: 8px; }
    .lead-success p { color: #6b7280; font-size: 14px; line-height: 1.5; }

    @keyframes sofia-pulse {
      0%,100% { box-shadow: 0 4px 24px rgba(201,168,76,0.4); }
      50%      { box-shadow: 0 4px 36px rgba(201,168,76,0.7); }
    }
    @media (max-width: 480px) {
      #sofia-frame, #sofia-lead-form {
        width: 100vw; height: 100vh;
        bottom: 0; right: 0;
        border-radius: 0;
      }
      #sofia-launcher { bottom: 16px; right: 16px; }
    }
  `;
  document.head.appendChild(style);

  // Container
  const launcher = document.createElement('div');
  launcher.id = 'sofia-launcher';

  // Ações
  const actions = document.createElement('div');
  actions.className = 'sofia-actions';
  actions.innerHTML = `
    <button class="sofia-action-btn sofia" id="sofia-chat-btn">
      <span>🤖</span> Sofia — Buscar Imóvel
    </button>
    <a class="sofia-action-btn whats"
       href="https://wa.me/5511976661297?text=Olá! Vim pelo site ImobiliáriaPerto e gostaria de mais informações."
       target="_blank">
      <span>💬</span> WhatsApp
    </a>
    <button class="sofia-action-btn leads" id="sofia-lead-btn">
      <span>📋</span> Fale Conosco
    </button>
  `;

  // Botão toggle
  const toggle = document.createElement('button');
  toggle.id = 'sofia-toggle';
  toggle.title = 'Atendimento';
  toggle.innerHTML = sofiaFaceHTML() + '<div id="sofia-badge"></div>';

  // iframe chatbot
  const frame = document.createElement('iframe');
  frame.id = 'sofia-frame';
  frame.src = 'https://imobiliaria-agente2.vercel.app';

  // Formulário de lead
  const leadForm = document.createElement('div');
  leadForm.id = 'sofia-lead-form';
  leadForm.innerHTML = `
    <div class="lead-header">
      <h3>📋 Fale Conosco</h3>
      <button class="lead-close" id="lead-close-btn">✕</button>
    </div>
    <p class="lead-subtitle">Deixe seus dados e um de nossos consultores entrará em contato em breve.</p>
    <div id="lead-form-fields">
      <input class="lead-input" id="lead-nome" type="text" placeholder="Seu nome completo" />
      <input class="lead-input" id="lead-email" type="email" placeholder="Seu e-mail" />
      <input class="lead-input" id="lead-telefone" type="tel" placeholder="WhatsApp / Telefone" />
      <input class="lead-input" id="lead-interesse" type="text" placeholder="Qual imóvel te interessa? (opcional)" />
      <button class="lead-submit" id="lead-submit-btn">✦ Quero ser contactado</button>
    </div>
    <div class="lead-success" id="lead-success">
      <div class="check">✅</div>
      <h4>Recebemos seu contato!</h4>
      <p>Um de nossos consultores entrará em contato em breve pelo WhatsApp ou e-mail informado.</p>
    </div>
  `;

  launcher.appendChild(actions);
  launcher.appendChild(toggle);
  document.body.appendChild(launcher);
  document.body.appendChild(frame);
  document.body.appendChild(leadForm);

  // Estado
  let menuOpen = false;
  let chatOpen = false;
  let formOpen = false;

  function closeAll() {
    menuOpen = false; chatOpen = false; formOpen = false;
    actions.classList.remove('open');
    frame.classList.remove('open');
    leadForm.classList.remove('open');
    toggle.innerHTML = sofiaFaceHTML() + '<div id="sofia-badge"></div>';
  }

  // Toggle menu
  toggle.addEventListener('click', () => {
    if (chatOpen || formOpen) { closeAll(); return; }
    menuOpen = !menuOpen;
    actions.classList.toggle('open', menuOpen);
    toggle.innerHTML = menuOpen
      ? '<span style="font-size:22px;color:#0a0f1e">✕</span>'
      : sofiaFaceHTML() + '<div id="sofia-badge"></div>';
  });

  // Abre chat
  document.addEventListener('click', (e) => {
    if (e.target.id === 'sofia-chat-btn' || e.target.closest('#sofia-chat-btn')) {
      closeAll();
      chatOpen = true;
      frame.classList.add('open');
    }
  });

  // Abre formulário
  document.addEventListener('click', (e) => {
    if (e.target.id === 'sofia-lead-btn' || e.target.closest('#sofia-lead-btn')) {
      closeAll();
      formOpen = true;
      leadForm.classList.add('open');
      // Reset form
      document.getElementById('lead-form-fields').style.display = 'block';
      document.getElementById('lead-success').style.display = 'none';
      document.getElementById('lead-nome').value = '';
      document.getElementById('lead-email').value = '';
      document.getElementById('lead-telefone').value = '';
      document.getElementById('lead-interesse').value = '';
    }
  });

  // Fecha formulário
  document.addEventListener('click', (e) => {
    if (e.target.id === 'lead-close-btn') closeAll();
  });

  // Submete lead
  document.addEventListener('click', (e) => {
    if (e.target.id === 'lead-submit-btn') {
      const nome = document.getElementById('lead-nome').value.trim();
      const email = document.getElementById('lead-email').value.trim();
      const telefone = document.getElementById('lead-telefone').value.trim();
      const interesse = document.getElementById('lead-interesse').value.trim();

      if (!nome || !email || !telefone) {
        alert('Por favor preencha nome, e-mail e telefone.');
        return;
      }

      // Envia para a API de leads
      fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nome,
          email,
          telefone,
          mensagem: interesse || 'Contato via widget do site',
          origem: 'widget'
        })
      }).catch(() => {});

      // Mostra sucesso independente do resultado
      document.getElementById('lead-form-fields').style.display = 'none';
      document.getElementById('lead-success').style.display = 'block';

      // Fecha após 4 segundos
      setTimeout(() => closeAll(), 4000);
    }
  });

  // Fecha clicando fora
  document.addEventListener('click', (e) => {
    if (!launcher.contains(e.target) && !frame.contains(e.target) && !leadForm.contains(e.target)) {
      closeAll();
    }
  });

  function sofiaFaceHTML() {
    return `<svg viewBox="0 0 72 72" width="32" height="32" xmlns="http://www.w3.org/2000/svg">
      <defs><radialGradient id="sw" cx="50%" cy="35%" r="65%">
        <stop offset="0%" stop-color="#f7cfa0"/><stop offset="100%" stop-color="#d4915c"/>
      </radialGradient></defs>
      <ellipse cx="36" cy="70" rx="22" ry="14" fill="#1a2235"/>
      <rect x="31" y="50" width="10" height="10" rx="5" fill="url(#sw)"/>
      <ellipse cx="36" cy="33" rx="15" ry="17" fill="url(#sw)"/>
      <ellipse cx="36" cy="17" rx="17" ry="12" fill="#1e0d04"/>
      <ellipse cx="21" cy="33" rx="3" ry="5" fill="#d4a070"/>
      <ellipse cx="51" cy="33" rx="3" ry="5" fill="#d4a070"/>
      <ellipse cx="29" cy="33" rx="3.5" ry="4" fill="white"/>
      <ellipse cx="43" cy="33" rx="3.5" ry="4" fill="white"/>
      <circle cx="30" cy="33.5" r="2" fill="#5c3a1e"/>
      <circle cx="44" cy="33.5" r="2" fill="#5c3a1e"/>
      <path d="M29 43 Q36 48 43 43" stroke="#c04535" stroke-width="2" fill="none" stroke-linecap="round"/>
    </svg>`;
  }
})();
