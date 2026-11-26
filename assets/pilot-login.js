/* Pilot sign-in for the course websites. Signing in once on a device opens all five courses
   (they share one web address). This keeps casual visitors out; it is not real security on a public site.
   To change the login: set HASH to pilotLogin.hash('username|password') in the browser console. */
(function(){
  var HASH = '622dd0d', KEY = 'cud-pilot-login';
  function hash(s){var x=0x811c9dc5;for(var c of String(s)){x^=c.codePointAt(0);x=Math.imul(x,0x01000193)>>>0;}return x.toString(16);}
  window.pilotLogin = { hash: hash, signOut: function(){ try{localStorage.removeItem(KEY);}catch(e){} location.reload(); } };
  var ok = false; try { ok = localStorage.getItem(KEY) === HASH; } catch(e) {}
  if (ok) return;
  var html = document.documentElement;
  html.classList.add('pilot-locked');
  var st = document.createElement('style');
  st.textContent = 'html.pilot-locked body>*:not(#pilot-login){display:none!important}' +
    '#pilot-login{position:fixed;inset:0;display:grid;place-items:center;padding:24px;background:#F3F5F8;z-index:2147483647;font-family:"Schibsted Grotesk",system-ui,sans-serif;color:#16202B;line-height:1.45}' +
    '#pilot-login form{width:min(400px,100%);display:grid;gap:12px;background:#fff;border:1px solid #D6DDE5;border-radius:16px;padding:28px;box-sizing:border-box}' +
    '#pilot-login .pl-top{display:flex;align-items:center;gap:12px;margin-bottom:6px}' +
    '#pilot-login .pl-mark{width:40px;height:40px;border-radius:10px;background:#8C2B2B;color:#fff;display:grid;place-items:center;font-weight:800;font-size:.85rem;flex:none}' +
    '#pilot-login small{display:block;color:#5A6675;font-size:.82rem}#pilot-login strong{font-size:1rem}' +
    '#pilot-login h1{margin:0;font-size:1.4rem}#pilot-login p{margin:0 0 4px;color:#5A6675;font-size:.95rem}' +
    '#pilot-login label{font-size:.85rem;font-weight:600;display:grid;gap:4px}' +
    '#pilot-login input{font:inherit;padding:11px 12px;border:1px solid #D6DDE5;border-radius:9px;background:#fff;color:#16202B}' +
    '#pilot-login input:focus{outline:2px solid #8C2B2B;outline-offset:1px}' +
    '#pilot-login button{font:inherit;font-weight:700;padding:12px 14px;border:0;border-radius:9px;background:#8C2B2B;color:#fff;cursor:pointer}' +
    '#pilot-login .pl-err{color:#B4362F;min-height:1.2em;font-size:.9rem}';
  (document.head || html).appendChild(st);
  function show(){
    var course = (document.title || '').split(/[·|–-]/)[0].trim();
    var g = document.createElement('div'); g.id = 'pilot-login';
    g.innerHTML = '<form autocomplete="on"><div class="pl-top"><div class="pl-mark">CUD</div><div><small>Canadian University Dubai</small><strong>Interactive Course Support</strong></div></div>' +
      '<h1>Sign in</h1><p>' + (course ? course.replace(/[<>&]/g,'') + ' course website' : 'Course website') + '</p>' +
      '<label>Username<input id="pl-u" name="username" autocomplete="username" required></label>' +
      '<label>Password<input id="pl-p" name="password" type="password" autocomplete="current-password" required></label>' +
      '<button type="submit">Sign in</button><span class="pl-err" aria-live="polite"></span></form>';
    document.body.prepend(g);
    var f = g.querySelector('form'), u = g.querySelector('#pl-u'), p = g.querySelector('#pl-p'), err = g.querySelector('.pl-err');
    u.focus();
    f.addEventListener('submit', function(e){
      e.preventDefault();
      if (hash(u.value.trim().toLowerCase() + '|' + p.value) === HASH) {
        try { localStorage.setItem(KEY, HASH); } catch(e) {}
        g.remove(); html.classList.remove('pilot-locked');
        window.dispatchEvent(new Event('resize'));
      } else { err.textContent = 'Incorrect username or password.'; p.value = ''; p.focus(); }
    });
  }
  if (document.body) show(); else document.addEventListener('DOMContentLoaded', show);
})();
