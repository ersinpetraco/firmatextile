(function(){
 function id(x){return document.getElementById(x);}
 function txt(x,v){var el=id(x); if(el&&v!=null) el.textContent=v;}
 function multiline(x,v){var el=id(x); if(!el||v==null)return; el.textContent=''; String(v).split('\n').forEach(function(line,i){ if(i)el.appendChild(document.createElement('br')); el.appendChild(document.createTextNode(line)); });}

 function applyTheme(t){ if(!t)return; var r=document.documentElement;
  var m={gold:'--gold',goldHover:'--gold-hover',goldLight:'--gold-light',ivory:'--ivory',brown:'--brown',ink:'--ink',parchment:'--parchment',taupe:'--taupe'};
  Object.keys(m).forEach(function(k){ if(t[k]) r.style.setProperty(m[k], t[k]); });
 }

 function render(d){
  if(!d) return;
  applyTheme(d.theme);
  if(d.hero){ txt('h-line1',d.hero.line1); txt('h-line2',d.hero.line2); txt('h-lede',d.hero.lede); txt('h-cta',d.hero.ctaLabel);
   var box=id('hero-slides');
   if(box && d.hero.images && d.hero.images.length){ box.innerHTML='';
    d.hero.images.forEach(function(src,i){ var s=document.createElement('div'); s.className='slide'+(i===0?' on':''); s.style.backgroundImage="url('"+src+"')"; s.setAttribute('aria-hidden','true'); box.appendChild(s); }); }
   window.__rotate=(parseFloat(d.hero.rotateSeconds)||7.5)*1000;
  }
  if(d.trust){ var tr=id('trust-row'); if(tr){ tr.innerHTML=''; d.trust.forEach(function(x,i){ if(i){var f=document.createElement('span');f.className='fleur';tr.appendChild(f);} var s=document.createElement('span'); s.textContent=x; tr.appendChild(s); }); } }
  if(d.about){ txt('a-eyebrow',d.about.eyebrow); txt('a-line1',d.about.line1); txt('a-line2',d.about.line2); txt('a-p1',d.about.p1); txt('a-p2',d.about.p2); txt('a-link',d.about.linkLabel); var ai=id('a-img'); if(ai&&d.about.image) ai.src=d.about.image; }
  if(d.collections){ var c=d.collections; txt('c-eyebrow',c.eyebrow); txt('c-heading',c.heading); txt('c-sub',c.sub); txt('c-cta',c.ctaLabel); txt('c-micro',c.micro);
   var g=id('coll-grid'); if(g && c.items && c.items.length){ g.innerHTML=''; c.items.forEach(function(it){ var card=document.createElement('div'); card.className='card'; var fig=document.createElement('figure'); var im=document.createElement('img'); im.src=it.image; im.alt=(it.title||'')+' pattern fabric'; fig.appendChild(im); var cap=document.createElement('figcaption'); cap.textContent=it.title||''; card.appendChild(fig); card.appendChild(cap); g.appendChild(card); }); } }
  if(d.contact){ var ct=d.contact; txt('ct-eyebrow',ct.eyebrow); txt('ct-heading',ct.heading); txt('ct-intro',ct.intro);
   var em=id('ct-email'); if(em&&ct.email){ em.textContent=ct.email; em.href='mailto:'+ct.email; }
   var ph=id('ct-phone'); if(ph&&ct.phone){ ph.textContent=ct.phone; ph.href='tel:'+ct.phone.replace(/[^0-9+]/g,''); }
   multiline('ct-addr',ct.address); txt('ct-agent',ct.agent); window.__email=ct.email||'hello@firmatextile.com';
  }
  if(d.footer){ txt('ft-copy',d.footer.copyright); }
 }

 function wire(){
  var slides=[].slice.call(document.querySelectorAll('.hero .slide'));
  var hero=document.querySelector('.hero');
  var rm=window.matchMedia&&matchMedia('(prefers-reduced-motion:reduce)').matches;
  var i=0,timer=null,ms=window.__rotate||7500;
  function go(n){slides[i].classList.remove('on');i=n;slides[i].classList.add('on');}
  function start(){if(rm||slides.length<2||timer)return;timer=setInterval(function(){go((i+1)%slides.length);},ms);}
  function stop(){if(timer){clearInterval(timer);timer=null;}}
  start();
  if(hero){hero.addEventListener('mouseenter',stop);hero.addEventListener('mouseleave',start);}

  [].slice.call(document.querySelectorAll('[data-go]')).forEach(function(a){
   a.addEventListener('click',function(e){ e.preventDefault();
    var c=id('contact'); if(c)c.scrollIntoView({behavior:'smooth'});
    setTimeout(function(){var n=id('f-name'); if(n)n.focus();},520); });
  });
  function val(x){var el=id(x);return el?el.value.trim():'';}
  var form=id('cform');
  if(form){form.addEventListener('submit',function(e){ e.preventDefault();
   var name=val('f-name'),email=val('f-email'),company=val('f-company'),msg=val('f-msg');
   var consent=id('f-consent').checked, note=id('formnote');
   if(!name||!email||!msg||!consent){note.textContent='Please add your name, email, a short message, and tick consent.';note.className='formnote err';return;}
   var to=window.__email||'hello@firmatextile.com';
   var subj='Sample request'+(company?(' \u2014 '+company):'');
   var body='Name: '+name+'\nCompany: '+company+'\nEmail: '+email+'\n\n'+msg;
   note.textContent='Opening your email app\u2026';note.className='formnote ok';
   window.location.href='mailto:'+to+'?subject='+encodeURIComponent(subj)+'&body='+encodeURIComponent(body);
  });}
 }

 fetch('/content/site.json',{cache:'no-store'})
  .then(function(r){return r.json();})
  .then(function(d){ render(d); wire(); })
  .catch(function(){ wire(); });
})();
