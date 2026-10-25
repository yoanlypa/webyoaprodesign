/* Obras y Reformas Andújar — interacción */
(function(){
'use strict';
/* Vista previa local (file://): enlaza a index.html para que las carpetas abran bien */
if(location.protocol==='file:'){Array.prototype.forEach.call(document.querySelectorAll('a[href]'),function(a){var h=a.getAttribute('href');if(/^(https?:|mailto:|tel:|#)/.test(h))return;var m=h.match(/^([^?#]*)(.*)$/);if(m[1]===''||m[1].slice(-1)==='/'){a.setAttribute('href',(m[1]||'./')+'index.html'+m[2])}})}
var WA = '34630444773';          // CONFIRMAR: número con WhatsApp
var EMAIL = 'presupuestos@reformasandujar.com';

/* ---------- Calculadora: precios orientativos en € por m², IVA INCLUIDO ----------
   CONFIRMAR con el cliente antes de publicar. [mínimo €/m², máximo €/m²]       */
var PRECIOS = {
  integral: {min:550, max:900,  nombre:'Reforma integral',               m2:[30,300,80]},
  cocina:   {min:650, max:1100, nombre:'Reforma de cocina',              m2:[4,40,10]},
  bano:     {min:850, max:1350, nombre:'Reforma de baño',                m2:[2,20,5]},
  imper:    {min:35,  max:75,   nombre:'Impermeabilización',             m2:[10,600,60]},
  suelo:    {min:40,  max:85,   nombre:'Instalación de tarima o parquet',m2:[10,300,50]},
  fachada:  {min:30,  max:70,   nombre:'Rehabilitación de fachada',      m2:[50,3000,300]}
};
var CALIDAD = {'1':'estándar','1.35':'premium','1.8':'de alta gama'};

function $(s,c){return (c||document).querySelector(s)}
function $$(s,c){return Array.prototype.slice.call((c||document).querySelectorAll(s))}

/* Año */
$$('[data-year]').forEach(function(e){e.textContent=new Date().getFullYear()});

/* Marquesina: duplicar para bucle continuo */
var mq=$('#mq'); if(mq){var c=mq.cloneNode(true);$$('span',c).forEach(function(s){s.setAttribute('aria-hidden','true');mq.appendChild(s)})}

/* Navegación + barra de progreso */
var nav=$('#nav'),pr=$('#progress');
function onScroll(){var h=document.documentElement;if(nav)nav.classList.toggle('scrolled',window.scrollY>40);if(pr)pr.style.width=(window.scrollY/Math.max(1,h.scrollHeight-window.innerHeight)*100)+'%'}
window.addEventListener('scroll',onScroll,{passive:true});onScroll();

/* Desplegable de servicios (clic para táctil/teclado) */
$$('.dd>button').forEach(function(b){b.addEventListener('click',function(){var o=b.parentNode.classList.toggle('open');b.setAttribute('aria-expanded',o)})});
document.addEventListener('click',function(e){$$('.dd.open').forEach(function(d){if(!d.contains(e.target)){d.classList.remove('open');$('button',d).setAttribute('aria-expanded','false')}})});

/* Menú móvil */
var mm=$('#mmenu'),burger=$('#burger');
function closeMenu(){if(!mm)return;mm.classList.remove('open');burger.setAttribute('aria-expanded','false');document.body.style.overflow=''}
if(mm&&burger){
  burger.addEventListener('click',function(){mm.classList.add('open');burger.setAttribute('aria-expanded','true');document.body.style.overflow='hidden';setTimeout(function(){$('.close',mm).focus()},50)});
  $('.close',mm).addEventListener('click',function(){closeMenu();burger.focus()});
  $$('a',mm).forEach(function(a){a.addEventListener('click',closeMenu)});
}

/* Aparición al hacer scroll */
if('IntersectionObserver' in window){
  var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target)}})},{threshold:.12,rootMargin:'0px 0px -40px 0px'});
  $$('.rv').forEach(function(el){io.observe(el)});
}else{$$('.rv').forEach(function(el){el.classList.add('in')})}

/* Comparador antes / después (ratón, táctil y teclado) */
var cmp=$('#compare');
if(cmp){
  var bf=$('.before',cmp),hd=$('.handle',cmp),drag=false,pos=50;
  var set=function(p){pos=Math.max(0,Math.min(100,p));bf.style.clipPath='inset(0 '+(100-pos)+'% 0 0)';hd.style.left=pos+'%';cmp.setAttribute('aria-valuenow',Math.round(pos))};
  var fromX=function(x){var r=cmp.getBoundingClientRect();set((x-r.left)/r.width*100)};
  cmp.addEventListener('pointerdown',function(e){drag=true;cmp.setPointerCapture(e.pointerId);fromX(e.clientX)});
  cmp.addEventListener('pointermove',function(e){if(drag)fromX(e.clientX)});
  cmp.addEventListener('pointerup',function(){drag=false});
  cmp.addEventListener('keydown',function(e){var k=e.key;if(k==='ArrowLeft'||k==='ArrowDown'){set(pos-5);e.preventDefault()}else if(k==='ArrowRight'||k==='ArrowUp'){set(pos+5);e.preventDefault()}else if(k==='Home'){set(0);e.preventDefault()}else if(k==='End'){set(100);e.preventDefault()}});
  set(50);
}

/* Calculadora */
var calcEl=$('#calc');
if(calcEl){
  var tipo='integral',q='1',m2=$('#m2'),m2v=$('#m2v');
  var fmt=function(n){return (Math.round(n/100)*100).toLocaleString('es-ES')+' €'};
  var setTipo=function(t){tipo=t;var r=PRECIOS[t].m2;m2.min=r[0];m2.max=r[1];m2.value=r[2];
    $$('#types .opt').forEach(function(b){b.setAttribute('aria-pressed',b.dataset.k===t)})};
  var calc=function(){var a=+m2.value,p=PRECIOS[tipo];m2v.textContent=a;
    $('#price').textContent=fmt(p.min*a*+q)+' – '+fmt(p.max*a*+q);
    var d=p.nombre+' de '+a+' m² con acabados '+CALIDAD[q];$('#desc').textContent=d+'.';
    $('#calcWa').href='https://wa.me/'+WA+'?text='+encodeURIComponent('Hola, he usado la calculadora de vuestra web: '+d+'. Me gustaría pedir un presupuesto exacto.')};
  $$('#types .opt').forEach(function(b){b.addEventListener('click',function(){setTipo(b.dataset.k);calc()})});
  $$('#quality .opt').forEach(function(b){b.addEventListener('click',function(){q=b.dataset.q;$$('#quality .opt').forEach(function(x){x.setAttribute('aria-pressed',x===b)});calc()})});
  m2.addEventListener('input',calc);
  var pre=new URLSearchParams(location.search).get('tipo');
  setTipo(PRECIOS[pre]?pre:'integral');calc();
}

/* Galería: filtros + visor */
$$('.filters button').forEach(function(b){b.addEventListener('click',function(){
  $$('.filters button').forEach(function(x){x.setAttribute('aria-pressed',x===b)});
  var f=b.dataset.f;$$('.g').forEach(function(g){g.hidden=(f!=='all'&&g.dataset.c!==f)})})});
var lb=$('#lb'),lastFocus=null;
if(lb){
  var lbImg=$('img',lb),lbClose=$('button',lb);
  var closeLb=function(){lb.classList.remove('open');if(lastFocus)lastFocus.focus()};
  $$('.g').forEach(function(g){g.addEventListener('click',function(){var im=$('img',g);if(!im)return;lastFocus=g;
    lbImg.src=im.dataset.full||im.src;lbImg.alt=im.alt;lb.classList.add('open');lbClose.focus()})});
  lbClose.addEventListener('click',closeLb);
  lb.addEventListener('click',function(e){if(e.target===lb)closeLb()});
}
document.addEventListener('keydown',function(e){if(e.key==='Escape'){if(lb&&lb.classList.contains('open'))lb.classList.remove('open');closeMenu()}});

/* Formulario: envío por email (enviar.php) con alternativa WhatsApp */
var cf=$('#cf');
if(cf){
  var msg=$('.form-msg',cf);
  var texto=function(){var f=new FormData(cf);return 'Hola, soy '+f.get('nombre')+' ('+f.get('telefono')+'). Quiero presupuesto para: '+f.get('servicio')+(f.get('localidad')?' en '+f.get('localidad'):'')+'. '+(f.get('mensaje')||'')};
  $('#sendWa').addEventListener('click',function(){if(!cf.reportValidity())return;window.open('https://wa.me/'+WA+'?text='+encodeURIComponent(texto()),'_blank','noopener')});
  cf.addEventListener('submit',function(e){
    e.preventDefault();if(!cf.reportValidity())return;
    var btn=$('button[type=submit]',cf);btn.disabled=true;msg.className='form-msg';msg.textContent='Enviando…';
    fetch(cf.action,{method:'POST',body:new FormData(cf),headers:{'Accept':'application/json'}})
      .then(function(r){return r.json().catch(function(){return {ok:false}})})
      .then(function(j){if(!j.ok)throw 0;msg.className='form-msg ok';msg.textContent='¡Gracias! Hemos recibido tu solicitud y te llamaremos lo antes posible.';cf.reset()})
      .catch(function(){msg.className='form-msg err';msg.innerHTML='No se pudo enviar desde la web. Escríbenos a <a href="mailto:'+EMAIL+'?subject=Solicitud%20de%20presupuesto&body='+encodeURIComponent(texto())+'">'+EMAIL+'</a> o por WhatsApp.'})
      .then(function(){btn.disabled=false});
  });
}
})();
