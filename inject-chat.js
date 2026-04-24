const fs = require('fs');
let content = fs.readFileSync('index.html', 'utf8');

// CSS to inject into <head> for the chat widget
const chatCSS = `
    <style>
      #ai-chat-container { position:fixed; bottom:24px; right:24px; z-index:9998; font-family:'Inter',sans-serif; }
      #chat-toggle { background:var(--accent); color:#0a0b0e; border:none; width:58px; height:58px; border-radius:50%; cursor:pointer; font-size:22px; box-shadow:0 4px 24px rgba(215,178,109,0.45); display:flex; align-items:center; justify-content:center; transition:transform 0.2s; }
      #chat-toggle:hover { transform:scale(1.08); }
      #chat-box { display:none; flex-direction:column; width:320px; height:440px; background:var(--card); border:1px solid var(--line); border-radius:16px; overflow:hidden; position:absolute; bottom:72px; right:0; box-shadow:0 16px 48px rgba(0,0,0,0.5); }
      .chat-header { background:linear-gradient(135deg,rgba(215,178,109,0.18),rgba(255,255,255,0.04)); border-bottom:1px solid var(--line); padding:14px 18px; display:flex; align-items:center; gap:10px; }
      .chat-avatar { width:36px; height:36px; border-radius:50%; background:var(--accent); display:flex; align-items:center; justify-content:center; font-size:16px; color:#0a0b0e; }
      .chat-name { font-weight:700; font-size:0.95rem; color:var(--text); }
      .chat-status { font-size:0.78rem; color:var(--accent); }
      .chat-close { margin-left:auto; cursor:pointer; color:var(--muted); font-size:1.3rem; line-height:1; background:none; border:none; }
      #chat-messages { flex:1; padding:14px; overflow-y:auto; display:flex; flex-direction:column; gap:10px; }
      .msg-ai { background:rgba(215,178,109,0.1); border:1px solid var(--line); border-radius:12px 12px 12px 3px; padding:10px 13px; max-width:85%; color:var(--muted); font-size:0.88rem; line-height:1.5; white-space:pre-wrap; align-self:flex-start; }
      .msg-user { background:rgba(215,178,109,0.22); border:1px solid var(--line); border-radius:12px 12px 3px 12px; padding:10px 13px; max-width:85%; color:var(--text); font-size:0.88rem; line-height:1.5; white-space:pre-wrap; align-self:flex-end; }
      .chat-input-row { padding:10px 12px; border-top:1px solid var(--line); display:flex; gap:8px; background:rgba(255,255,255,0.02); }
      #chat-input { flex:1; background:rgba(255,255,255,0.05); border:1px solid var(--line); border-radius:8px; padding:8px 12px; color:var(--text); font-size:0.88rem; outline:none; font-family:inherit; }
      #send-btn { background:var(--accent); color:#0a0b0e; border:none; border-radius:8px; padding:8px 14px; font-weight:700; font-size:0.85rem; cursor:pointer; }
      #send-btn:disabled { opacity:0.5; cursor:not-allowed; }
    </style>`;

// HTML widget to inject before </body>
const chatHTML = `
    <!-- AI Chat Widget -->
    <div id="ai-chat-container">
      <button id="chat-toggle" title="Chat with us">&#x1F4AC;</button>
      <div id="chat-box">
        <div class="chat-header">
          <div class="chat-avatar">&#x1F4F7;</div>
          <div>
            <div class="chat-name">William Dean Photography</div>
            <div class="chat-status">&#x25CF; AI Concierge</div>
          </div>
          <span class="chat-close" onclick="document.getElementById('chat-box').style.display='none'">&#xD7;</span>
        </div>
        <div id="chat-messages">
          <div class="msg-ai">Hi! I am the William Dean Photography AI Concierge. Ask me anything about our real estate shoots, pricing, or availability in Kern County.</div>
        </div>
        <div class="chat-input-row">
          <input type="text" id="chat-input" placeholder="Ask about a shoot...">
          <button id="send-btn">Send</button>
        </div>
      </div>
    </div>
    <script>
      (function() {
        var toggle = document.getElementById('chat-toggle');
        var box = document.getElementById('chat-box');
        var sendBtn = document.getElementById('send-btn');
        var input = document.getElementById('chat-input');
        var msgs = document.getElementById('chat-messages');
        toggle.onclick = function() {
          var hidden = box.style.display !== 'flex';
          box.style.display = hidden ? 'flex' : 'none';
          if (hidden) input.focus();
        };
        function appendMsg(role, text) {
          var div = document.createElement('div');
          div.className = role === 'user' ? 'msg-user' : 'msg-ai';
          div.textContent = text;
          msgs.appendChild(div);
          msgs.scrollTop = msgs.scrollHeight;
        }
        async function send() {
          var userMsg = input.value.trim();
          if (!userMsg) return;
          input.value = '';
          sendBtn.disabled = true;
          appendMsg('user', userMsg);
          var typing = document.createElement('div');
          typing.id = 'typing-indicator';
          typing.className = 'msg-ai';
          typing.textContent = 'Thinking...';
          msgs.appendChild(typing);
          msgs.scrollTop = msgs.scrollHeight;
          try {
            var res = await fetch('/.netlify/functions/chat', {
              method: 'POST',
              headers: {'Content-Type':'application/json'},
              body: JSON.stringify({ message: userMsg })
            });
            var data = await res.json();
            var t = document.getElementById('typing-indicator');
            if(t) t.remove();
            appendMsg('ai', data.reply || data.error || 'Something went wrong.');
          } catch(e) {
            var t = document.getElementById('typing-indicator');
            if(t) t.remove();
            appendMsg('ai', 'Network error. Please call or text us at 865-364-0099.');
          }
          sendBtn.disabled = false;
          input.focus();
        }
        sendBtn.onclick = send;
        input.addEventListener('keydown', function(e){ if(e.key==='Enter') send(); });
      })();
    </script>`;

// Inject CSS before </head>
if (content.includes('</head>')) {
  content = content.replace('</head>', chatCSS + '\n  </head>');
} else {
  console.error('</head> not found');
  process.exit(1);
}

// Inject widget before </body>
const placeholder = '    <!-- Custom Chatbot reserved -->';
if (content.includes(placeholder)) {
  content = content.replace(placeholder, chatHTML);
  console.log('Replaced placeholder with chat widget');
} else if (content.includes('</body>')) {
  content = content.replace('</body>', chatHTML + '\n</body>');
  console.log('Injected before </body>');
} else {
  console.error('Neither placeholder nor </body> found');
  process.exit(1);
}

fs.writeFileSync('index.html', content, 'utf8');
console.log('SUCCESS - index.html updated');
