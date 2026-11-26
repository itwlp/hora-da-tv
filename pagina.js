// Momento TV: script comum a index.html e pais.html.
// Cada página diz no <body> o que é dela: data-plano (arquivo do plano), data-titulo (texto antes do dia),
// data-meta (minutos por dia, se o plano não disser), data-rodape (texto do rodapé; sem ele, vale a faixa do plano) e
// data-avaliar (endereço do painel: cada vídeo do dia ganha "gostaram" / "não funcionou", que abre o painel para confirmar).
(function(){
  const $ = s => document.querySelector(s);
  const cfg = document.body.dataset;
  const esc = s => String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const chave = d => d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');
  const nome = iso => { const p = iso.split('-').map(Number); return new Date(p[0], p[1]-1, p[2]).toLocaleDateString('pt-BR', {weekday:'long'}); };
  const dm = iso => iso.slice(8) + '/' + iso.slice(5,7);
  // Links e números saem do id validado e de Number(), nunca direto do plano: mesmo um plano.json alterado não muda
  // o destino dos links nem injeta marcação (revisão de 26/11/2026).
  const ID = /^[A-Za-z0-9_-]{11}$/;
  const idOk = v => ID.test(String(v.id));
  const yt = v => idOk(v) ? 'https://www.youtube.com/watch?v=' + v.id : '#';
  const num = x => Number.isFinite(Number(x)) ? Number(x) : 0;
  const pacote = d => 'https://www.youtube.com/watch_videos?video_ids=' + d.videos.filter(idOk).map(v => v.id).join(',');
  const titulo = t => String(t);
  // Papel do vídeo no dia (campo "papel" do plano): o encerramento fecha todo dia; a âncora repete na semana de propósito
  const PAPEL = {encerramento:'Tchau', ancora:'Da semana'};
  const papel = v => PAPEL[v.papel] ? ` <span class="tag">${PAPEL[v.papel]}</span>` : '';
  // Entrada ao rolar
  const io = 'IntersectionObserver' in window ? new IntersectionObserver(es => es.forEach(e => { if(e.isIntersecting && !e.target.classList.contains('carregando')){ e.target.classList.add('in'); io.unobserve(e.target); } }), {threshold:.12}) : null;
  document.querySelectorAll('.reveal').forEach(el => io ? io.observe(el) : el.classList.add('in'));
  // Inclinação 3D dos cartões (só com mouse; no toque fica estático)
  if(matchMedia('(hover:hover) and (prefers-reduced-motion:no-preference)').matches){
    document.querySelectorAll('.tcard').forEach(c => {
      c.classList.add('tilt');
      c.addEventListener('mousemove', e => { const r = c.getBoundingClientRect(); const x = (e.clientX-r.left)/r.width-.5, y = (e.clientY-r.top)/r.height-.5; c.style.transform = `perspective(900px) rotateY(${x*7}deg) rotateX(${-y*7}deg)`; });
      c.addEventListener('mouseleave', () => { c.style.transform = ''; });
    });
  }
  // Formas do fundo acompanham a rolagem
  const formas = document.querySelectorAll('.bg i');
  if(matchMedia('(prefers-reduced-motion:no-preference)').matches){
    addEventListener('scroll', () => { const y = scrollY; formas.forEach((f, k) => { f.style.marginTop = (y * (k+1) * -.06) + 'px'; }); }, {passive:true});
  }
  const CORES = ['var(--red)','var(--blue)','var(--green)','var(--yellow)'];
  // Brinquedo (só na página dos meninos): gira, troca de forma e de cor a cada toque
  const brinq = $('#brinq');
  if(brinq){
    const FORMAS = ['polygon(50% 0,61% 35%,98% 35%,68% 57%,79% 91%,50% 70%,21% 91%,32% 57%,2% 35%,39% 35%)','circle(50%)','inset(0 round 30px)','polygon(50% 0,100% 100%,0 100%)'];
    let brinqIdx = 0;
    brinq.addEventListener('click', () => {
      if(brinq.classList.contains('gira')) return;
      brinq.classList.add('gira');
      setTimeout(() => { brinqIdx++; brinq.style.clipPath = FORMAS[brinqIdx % 4]; brinq.style.background = CORES[(brinqIdx + 3) % 4]; }, 320);
      setTimeout(() => brinq.classList.remove('gira'), 700);
    });
  }
  // Roda 3D dos vídeos do dia (carrossel do Noa Vale)
  const minutos = s => s.split(':').reverse().reduce((t, x, k) => t + Number(x) * Math.pow(60, k), 0) / 60;
  let rodaIdx = 0, rodaTimer = null, rodaN = 0, rodaR = 0;
  const movimento = !matchMedia('(prefers-reduced-motion:reduce)').matches;
  function rodaMostra(i, vids){
    rodaIdx = (i + rodaN) % rodaN;
    $('#ring').style.transform = `translateZ(${-rodaR}px) rotateY(${-rodaIdx * 360 / rodaN}deg)`;
    $('#cur-index').textContent = rodaIdx + 1;
    $('#cur-title').textContent = titulo(vids[rodaIdx].title);
    document.querySelectorAll('#steps button').forEach((b, k) => b.classList.toggle('active', k === rodaIdx));
  }
  function montaRoda(vids){
    rodaN = vids.length;
    const roda = $('#roda');
    roda.hidden = false;
    roda.classList.remove('carregando');
    roda.removeAttribute('aria-busy');
    // Volta a observar: a primeira leitura do observador dispara a entrada animada, como quando o carrossel saía do hidden.
    if(io){ io.unobserve(roda); io.observe(roda); } else roda.classList.add('in');
    const larg = $('#ring').offsetWidth || 220;
    rodaR = Math.max(110, (larg / 2) / Math.tan(Math.PI / rodaN)) + 36;
    $('#cur-total').textContent = rodaN;
    $('#ring').innerHTML = vids.map((v, k) => {
      const amarelo = k % 4 === 3;
      return `<a class="vcard${amarelo ? ' y' : ''}" href="${esc(yt(v))}" target="_blank" rel="noopener" style="--c:${CORES[k % 4]};--a:${k * 360 / rodaN}deg;--r:${rodaR}px"><span class="go" aria-hidden="true">▶</span><span class="n">${k + 1}</span><span><h3>${esc(titulo(v.title))}</h3><span class="d">${esc(v.duracao)}${v.tema ? ' · ' + esc(v.tema) : ''}${papel(v)}</span></span></a>`;
    }).join('');
    $('#steps').innerHTML = vids.map((v, k) => `<button type="button" style="--c:${CORES[k % 4]};--w:${minutos(v.duracao).toFixed(2)}" aria-label="Ir ao vídeo ${k + 1}"><i></i>${esc(v.duracao)}</button>`).join('');
    document.querySelectorAll('#steps button').forEach((b, k) => b.addEventListener('click', () => { rodaMostra(k, vids); rodaAuto(vids); }));
    $('#prev').onclick = () => { rodaMostra(rodaIdx - 1, vids); rodaAuto(vids); };
    $('#next').onclick = () => { rodaMostra(rodaIdx + 1, vids); rodaAuto(vids); };
    $('#ring').onmouseenter = () => clearInterval(rodaTimer);
    $('#ring').onmouseleave = () => rodaAuto(vids);
    rodaMostra(0, vids);
    rodaAuto(vids);
  }
  function rodaAuto(vids){ clearInterval(rodaTimer); if(movimento) rodaTimer = setInterval(() => rodaMostra(rodaIdx + 1, vids), 4200); }
  fetch((cfg.plano || 'plano.json') + '?v=' + Date.now(), {cache:'no-store'}).then(r => r.json()).then(p => {
    const dias = (p.dias || []).filter(d => d.videos && d.videos.length);
    if(!dias.length){ $('#roda').hidden = true; $('#sub').textContent = 'O plano está vazio. Peça para atualizar.'; return; }
    const hoje = chave(new Date());
    const futuros = dias.filter(d => d.data >= hoje);
    const d0 = futuros[0] || dias[dias.length-1];
    const ehHoje = d0.data === hoje;
    $('#titulo').innerHTML = esc(cfg.titulo || 'Momento TV de ') + '<em>' + (ehHoje ? 'hoje' : esc(nome(d0.data))) + '</em>';
    $('#sub').textContent = nome(d0.data) + ', ' + dm(d0.data) + ' · ' + d0.videos.length + ' vídeos · ' + num(d0.total_min) + ' min';
    $('#data-pill').textContent = dm(d0.data) + ' · ' + num(d0.total_min) + ' MIN';
    $('#data-pill').hidden = false;
    $('#tocar').href = pacote(d0);
    $('#tocar-txt').textContent = 'Tocar o pacote de ' + (ehHoje ? 'hoje' : nome(d0.data));
    const info = v => { const t = [v.tema, v.canal].filter(Boolean).map(esc).join(' · '); return t ? `<span class="meta">${t}</span>` : ''; };
    const avaliar = (v, voto) => cfg.avaliar + '#avaliar?id=' + encodeURIComponent(v.id) + '&voto=' + voto + '&t=' + encodeURIComponent(titulo(v.title));
    const votos = v => cfg.avaliar ? `<span class="votos"><a href="${esc(avaliar(v, 'gostou'))}" target="_blank" rel="noopener">gostaram</a> · <a href="${esc(avaliar(v, 'nao'))}" target="_blank" rel="noopener">não funcionou</a></span>` : '';
    $('#lista').innerHTML = d0.videos.map((v, i) => `<li style="--i:${i}"><span class="li-txt"><span><a href="${esc(yt(v))}" target="_blank" rel="noopener">${esc(titulo(v.title))}</a>${papel(v)}</span>${info(v)}${votos(v)}</span><span class="dur">${esc(v.duracao)}</span></li>`).join('');
    const notas = [];
    if(d0.videos.some(v => v.papel === 'ancora')) notas.push('O vídeo "da semana" volta em alguns dias de propósito: rever o mesmo vídeo ajuda a criança a aprender as palavras.');
    if(d0.videos.some(v => v.papel === 'encerramento')) notas.push('O último vídeo é sempre o mesmo: é o sinal de que a TV acabou.');
    if(notas.length && $('#notas')){ $('#notas').textContent = notas.join(' '); $('#notas').hidden = false; }
    $('#hoje').hidden = false;
    montaRoda(d0.videos);
    const resto = futuros.slice(1);
    if(resto.length){
      $('#dias').innerHTML = resto.map(d => `<div class="dia"><a class="p" href="${esc(pacote(d))}" target="_blank" rel="noopener">▶ Pacote de ${esc(nome(d.data))} (${esc(dm(d.data))}) · ${num(d.total_min)} min</a><p class="meta">${d.videos.map(v => esc(titulo(v.title))).join(' · ')}</p></div>`).join('');
      $('#proximos').hidden = false;
    }
    const ultimo = dias[dias.length-1].data;
    if(ultimo < hoje){ $('#aviso').textContent = 'O plano acabou em ' + dm(ultimo) + '. Ele é renovado toda semana; se ficou parado, o notebook estava desligado.'; $('#aviso').hidden = false; }
    $('#rodape').textContent = 'Plano gerado em ' + String(p.geradoEm || '').replace('T', ' ').slice(0, 16) + ' · meta ' + (p.metaMin || Number(cfg.meta) || 60) + ' min por dia · ' + (cfg.rodape || p.faixa || 'catálogo escolhido à mão');
  }).catch(() => { $('#roda').hidden = true; $('#sub').textContent = 'Não consegui carregar o plano. Confira a internet e recarregue.'; });
})();
