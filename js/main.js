// Portfólio "Planetário": abas por endereço com o traço azul que viaja, céu de estrelas em canvas,
// planetário dos projetos (área = testes), números que contam, copiar e-mail e o selo ao vivo do Vigil.
const reduzir = matchMedia("(prefers-reduced-motion: reduce)").matches;
const comMouse = matchMedia("(hover: hover)").matches;
const numero = new Intl.NumberFormat("pt-BR");
const contagens = new WeakMap(); // a contagem em andamento de cada número (para recomeçar sem duas juntas)
// A cor de destaque vem do CSS (usada no canvas do céu)
const estiloRaiz = getComputedStyle(document.documentElement);
const destaque = estiloRaiz.getPropertyValue("--destaque-rgb").trim();
const corEstrela = estiloRaiz.getPropertyValue("--estrela-rgb").trim();

// =========================================================
// DADOS DOS PROJETOS: lidos dos próprios cards (uma fonte só). Cada card ganha o disco de testes.
// =========================================================
const projetos = Array.from(document.querySelectorAll("#projetos .projeto")).map((card) => {
  const link = card.querySelector(".projeto__link");
  const nome = link.firstChild.textContent.trim();
  const spanTestes = Array.from(card.querySelectorAll(".projeto__meta > span")).find((s) => /testes$/.test(s.textContent));
  const testes = spanTestes ? Number(spanTestes.textContent.replace(/\D/g, "")) : 0;
  const noAr = card.hasAttribute("data-vigil");
  if (spanTestes) spanTestes.classList.add("testes");
  if (testes) {
    const disco = document.createElement("span");
    disco.className = "projeto__disco" + (noAr ? "" : " projeto__disco--codigo");
    disco.setAttribute("aria-hidden", "true");
    disco.style.setProperty("--d", `${(Math.sqrt(testes) * 1.45).toFixed(1)}px`);
    card.querySelector(".projeto__topo").prepend(disco);
  }
  return { nome, testes, noAr, card };
}).filter((p) => p.testes > 0);

// =========================================================
// ABAS: cada seção aparece sozinha, escolhida pelo endereço (#projetos...).
// Sem JavaScript, a classe js-abas não entra e todas as seções aparecem uma embaixo da outra.
// =========================================================
document.documentElement.classList.add("js-abas");
const secoes = Array.from(document.querySelectorAll("main > section[id]"));
const nav = document.querySelector(".abas");
const linksDasAbas = Array.from(nav.querySelectorAll("a"));
const traco = nav.querySelector(".abas__traco");
let abaAtual = null;
let focarAba = false; // a troca veio das setas com o foco no menu: o foco fica no menu

secoes.forEach((secao) => {
  secao.querySelectorAll(".item").forEach((item, i) => item.style.setProperty("--i", i));
  secao.querySelectorAll(".hab").forEach((hab, i) => hab.style.setProperty("--h", i));
});

function abrirAba(focar) {
  const id = location.hash.slice(1);
  const alvo = id && document.getElementById(id);
  const atual = (alvo && alvo.closest("main > section")) || secoes[0];
  const mudou = atual !== abaAtual;
  abaAtual = atual;

  secoes.forEach((secao) => secao.classList.toggle("aberta", secao === atual));
  let linkAtivo = null;
  linksDasAbas.forEach((link) => {
    if (link.getAttribute("href") === `#${atual.id}`) {
      link.setAttribute("aria-current", "page");
      linkAtivo = link;
      link.scrollIntoView({ block: "nearest", inline: "nearest" });
    } else link.removeAttribute("aria-current");
  });
  moverTraco(linkAtivo, mudou && focar !== null);
  document.title = atual === secoes[0] ? "André Lagos | Engenharia de Software"
    : `${atual.querySelector("h1, h2").textContent} | André Lagos`;

  atual.classList.remove("entrando");
  void atual.offsetWidth;
  atual.classList.add("entrando");

  atual.querySelectorAll("[data-contar]").forEach(contar);
  planetario?.alternar(atual.id === "inicio");
  // Mede agora e de novo quando os cards terminam de pousar (a entrada os desloca)
  medirCards();
  setTimeout(medirCards, 2000);
  window.scrollTo({ top: 0, behavior: "instant" });
  if (focarAba) { linkAtivo.focus({ preventScroll: true }); focarAba = false; }
  else if (focar) atual.querySelector("h1, h2").focus({ preventScroll: true });
}

// O traço: estica da aba antiga até cobrir as duas e depois encolhe na nova; a ponta "pulsa" ao chegar
let tracoX = 0;
let tracoL = 0;
function moverTraco(link, animar) {
  if (!link) return;
  const x = link.offsetLeft + 12;
  const l = link.offsetWidth - 24;
  const de = { x: tracoX, l: tracoL };
  tracoX = x; tracoL = l;
  traco.getAnimations().forEach((a) => a.cancel());
  traco.style.left = `${x}px`;
  traco.style.width = `${l}px`;
  if (!animar || reduzir || !de.l) return;
  const esq = Math.min(de.x, x);
  const dir = Math.max(de.x + de.l, x + l);
  traco.animate([
    { left: `${de.x}px`, width: `${de.l}px`, easing: "cubic-bezier(.5,0,.2,1)" },
    { left: `${esq}px`, width: `${dir - esq}px`, offset: .42, easing: "cubic-bezier(.22,1,.36,1)" },
    { left: `${x}px`, width: `${l}px` },
  ], { duration: 820 });
  traco.classList.remove("chegou");
  setTimeout(() => { traco.classList.add("chegou"); }, 560);
}

window.addEventListener("hashchange", () => abrirAba(true));
window.addEventListener("resize", () => {
  const ativo = nav.querySelector('[aria-current="page"]');
  moverTraco(ativo, false);
});
document.fonts?.ready.then(() => moverTraco(nav.querySelector('[aria-current="page"]'), false));

// Setas do teclado: esquerda e direita trocam de aba (no menu e fora de campos de texto)
document.addEventListener("keydown", (e) => {
  if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
  if (e.altKey || e.ctrlKey || e.metaKey || e.shiftKey) return;
  if (e.target.closest("input, textarea, select, [contenteditable]")) return;
  const i = secoes.indexOf(abaAtual);
  const n = secoes.length;
  const proxima = secoes[(i + (e.key === "ArrowRight" ? 1 : -1) + n) % n];
  e.preventDefault();
  focarAba = nav.contains(document.activeElement);
  location.hash = proxima.id;
});

document.querySelector(".pular").addEventListener("click", (e) => {
  e.preventDefault();
  document.querySelector("main > section.aberta").querySelector("h1, h2").focus();
});

// =========================================================
// NÚMEROS que contam até o valor, toda vez que a aba abre
// =========================================================
function contar(elemento) {
  const alvo = Number(elemento.dataset.contar);
  const sufixo = elemento.dataset.sufixo || "";
  if (reduzir) return; // o HTML já traz o valor final
  cancelAnimationFrame(contagens.get(elemento));
  elemento.textContent = "0" + sufixo;
  const bloco = elemento.closest(".item");
  const espera = 300 + Number(bloco?.style.getPropertyValue("--i") || 0) * 85;
  const duracao = 1800;
  let inicio = null;
  const passo = (agora) => {
    inicio ??= agora + espera;
    const t = Math.min(1, Math.max(0, (agora - inicio) / duracao));
    const suave = 1 - Math.pow(1 - t, 5);
    elemento.textContent = numero.format(Math.round(alvo * suave)) + sufixo;
    if (t < 1) contagens.set(elemento, requestAnimationFrame(passo));
  };
  contagens.set(elemento, requestAnimationFrame(passo));
}

// =========================================================
// CÉU: estrelas que cintilam devagar; perto do mouse elas acendem e o cursor deixa um rastro de
// luz que se apaga em menos de um segundo. Para quando a aba do navegador fica escondida.
// =========================================================
const canvas = document.getElementById("ceu");
const ctx = canvas.getContext("2d");
let estrelas = [];
let rastro = [];
let mouse = { x: -999, y: -999 };
let largura = 0;
let altura = 0;
let ceuRodando = false;

function ajustarCeu() {
  const novaLargura = canvas.clientWidth;
  altura = canvas.clientHeight;
  const escala = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = novaLargura * escala;
  canvas.height = altura * escala;
  ctx.setTransform(escala, 0, 0, escala, 0, 0);
  if (novaLargura !== largura) {
    largura = novaLargura;
    const quantas = Math.min(320, Math.round((largura * altura) / 4200));
    estrelas = Array.from({ length: quantas }, () => ({
      x: Math.random() * largura, y: Math.random() * altura,
      r: Math.random() < .08 ? 1.3 + Math.random() * .7 : .4 + Math.random() * .7,
      fase: Math.random() * Math.PI * 2, ritmo: .4 + Math.random() * 1.2,
      deriva: (Math.random() - .5) * .04,
    }));
  }
  if (reduzir) desenharCeu(0);
}

function desenharCeu(agora) {
  ctx.clearRect(0, 0, largura, altura);
  const t = agora / 1000;
  for (const e of estrelas) {
    if (atrasDeCard(e)) continue;
    if (!reduzir) { e.x += e.deriva; if (e.x < 0) e.x += largura; if (e.x > largura) e.x -= largura; }
    const d = Math.hypot(e.x - mouse.x, e.y - mouse.y);
    const perto = d < 180 ? 1 - d / 180 : 0;
    const brilho = (reduzir ? .55 : .35 + .3 * Math.sin(t * e.ritmo + e.fase)) + perto * .6;
    ctx.fillStyle = perto > .2 ? `rgba(${destaque},${Math.min(1, brilho)})` : `rgba(${corEstrela},${Math.min(1, brilho)})`;
    ctx.beginPath();
    ctx.arc(e.x, e.y, e.r + perto * 1.2, 0, Math.PI * 2);
    ctx.fill();
  }
  // O rastro: cada ponto vive 700 ms. É desenhado como uma fita só (um preenchimento, sem emendas que
  // se sobrepõem), com os pontos suavizados para tirar o tremido do mouse. A espessura depende só da
  // idade de cada ponto, então a fita afina até sumir sem nenhum salto quando um ponto sai ou o mouse para.
  rastro = rastro.filter((p) => agora - p.t < 700);
  if (rastro.length > 1) {
    let pts = rastro;
    for (let volta = 0; volta < 3; volta++) {
      pts = pts.map((p, i) => (i === 0 || i === pts.length - 1) ? p
        : { x: (pts[i - 1].x + p.x * 2 + pts[i + 1].x) / 4, y: (pts[i - 1].y + p.y * 2 + pts[i + 1].y) / 4, t: p.t });
    }
    // Entre cada par de pontos entram mais 4 numa curva Catmull-Rom, para a fita não ter trechos retos
    const curva = [];
    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = pts[Math.max(0, i - 1)], p1 = pts[i], p2 = pts[i + 1], p3 = pts[Math.min(pts.length - 1, i + 2)];
      for (let k = 0; k < 5; k++) {
        const u = k / 5, u2 = u * u, u3 = u2 * u;
        const c = (a, b, c, d) => .5 * (2 * b + (c - a) * u + (2 * a - 5 * b + 4 * c - d) * u2 + (3 * b - a - 3 * c + d) * u3);
        curva.push({ x: c(p0.x, p1.x, p2.x, p3.x), y: c(p0.y, p1.y, p2.y, p3.y), t: p1.t + (p2.t - p1.t) * u });
      }
    }
    curva.push(pts[pts.length - 1]);
    pts = curva;
    const esquerda = [];
    const direita = [];
    pts.forEach((p, i) => {
      const a = pts[Math.max(0, i - 1)];
      const b = pts[Math.min(pts.length - 1, i + 1)];
      const dx = b.x - a.x;
      const dy = b.y - a.y;
      const d = Math.hypot(dx, dy) || 1;
      const meia = Math.pow(Math.max(0, 1 - (agora - p.t) / 700), 1.5) * 1.5;
      esquerda.push([p.x - (dy / d) * meia, p.y + (dx / d) * meia]);
      direita.push([p.x + (dy / d) * meia, p.y - (dx / d) * meia]);
    });
    ctx.fillStyle = `rgba(${destaque},.55)`;
    ctx.beginPath();
    ctx.moveTo(...esquerda[0]);
    esquerda.forEach((p) => ctx.lineTo(...p));
    direita.reverse().forEach((p) => ctx.lineTo(...p));
    ctx.closePath();
    ctx.fill();
  }
}

function animarCeu(agora) {
  if (document.hidden) { ceuRodando = false; return; }
  desenharCeu(agora);
  requestAnimationFrame(animarCeu);
}
function ligarCeu() {
  if (reduzir || ceuRodando || document.hidden) return;
  ceuRodando = true;
  requestAnimationFrame(animarCeu);
}
// Os cards de projeto não têm fundo: o céu pula as estrelas que cairiam atrás deles. As caixas são
// guardadas e só recalculadas ao trocar de aba, rolar ou redimensionar (não a cada quadro).
let caixasDosCards = [];
function medirCards() {
  caixasDosCards = Array.from(document.querySelectorAll("section.aberta .projeto"), (card) => card.getBoundingClientRect());
  if (reduzir) desenharCeu(0);
}
function atrasDeCard(e) {
  return caixasDosCards.some((c) => e.x > c.left && e.x < c.right && e.y > c.top && e.y < c.bottom);
}
window.addEventListener("scroll", medirCards, { passive: true });
window.addEventListener("resize", medirCards);
window.addEventListener("resize", ajustarCeu);
window.addEventListener("pointermove", (e) => {
  mouse = { x: e.clientX, y: e.clientY };
  if (reduzir || e.pointerType !== "mouse") return;
  // O navegador junta vários movimentos num evento só; os eventos agrupados dão os pontos do meio
  const agrupados = e.getCoalescedEvents?.();
  for (const m of agrupados?.length ? agrupados : [e]) {
    // Pontos a menos de 2 px do anterior só fariam a fita tremer
    const antes = rastro[rastro.length - 1];
    if (antes && Math.hypot(m.clientX - antes.x, m.clientY - antes.y) < 2) continue;
    rastro.push({ x: m.clientX, y: m.clientY, t: performance.now() });
  }
}, { passive: true });
document.addEventListener("visibilitychange", ligarCeu);
ajustarCeu();
ligarCeu();

// =========================================================
// PLANETÁRIO: o sol mostra o total de testes; cada corpo é um projeto, numa órbita própria, com a área proporcional
// aos testes. Azul = tem site no ar; prata = só código. As órbitas de fora andam mais devagar
// (como em Kepler). Passar o mouse num corpo mostra o nome e acende a órbita (os corpos não são clicáveis).
// =========================================================
const planetario = (() => {
  const svg = document.getElementById("planetario");
  if (!svg || !projetos.length) return null;
  const dica = document.getElementById("planetario-dica");
  const NS = "http://www.w3.org/2000/svg";
  const el = (nome, attrs = {}, pai = svg) => {
    const n = document.createElementNS(NS, nome);
    for (const [k, v] of Object.entries(attrs)) n.setAttribute(k, v);
    pai.append(n);
    return n;
  };

  const R0 = 78;
  const PASSO = 21;
  const ultimoRaio = R0 + PASSO * (projetos.length - 1);

  // Escala gravada por fora da última órbita, como num instrumento antigo
  const escala = el("g", { class: "escala" });
  for (let k = 0; k < 120; k++) {
    const a = (k / 120) * Math.PI * 2;
    const maior = k % 10 === 0;
    const r1 = ultimoRaio + 14;
    const r2 = r1 + (maior ? 12 : 5);
    el("line", { x1: (Math.cos(a) * r1).toFixed(1), y1: (Math.sin(a) * r1).toFixed(1), x2: (Math.cos(a) * r2).toFixed(1), y2: (Math.sin(a) * r2).toFixed(1), class: maior ? "maior" : "" }, escala);
  }

  const orbitas = projetos.map((_, i) => el("circle", { class: "orbita", r: R0 + PASSO * i, pathLength: 1 }));
  // O sol mostra a soma dos testes de todos os projetos
  el("circle", { class: "sol__anel", r: 34 });
  const total = projetos.reduce((s, p) => s + p.testes, 0);
  el("text", { class: "sol__total", x: 0, y: -3 }).textContent = numero.format(total);
  el("text", { class: "sol__rotulo", x: 0, y: 12 }).textContent = "testes";
  const legenda = svg.closest(".planetario").querySelector(".planetario__legenda");
  legenda.textContent = legenda.textContent.replace(/^\d+ projetos/, `${projetos.length} projetos`);

  const corpos = projetos.map((p, i) => {
    const g = el("g", { class: `corpo ${p.noAr ? "corpo--no-ar" : "corpo--codigo"}` });
    const raio = Math.sqrt(p.testes) * .62;
    el("circle", { class: "corpo__alvo", r: Math.max(raio + 6, 12) }, g);
    // Cada corpo é um anel com um ponto no centro
    el("circle", { class: "corpo__anel", r: raio.toFixed(1) }, g);
    el("circle", { class: "corpo__ponto", r: 1 }, g);
    const orbita = R0 + PASSO * i;
    const corpo = { g, orbita, angulo: i * 2.39996 - Math.PI / 2, velocidade: .00022 * Math.pow(R0 / orbita, 1.5), p };
    g.addEventListener("pointerenter", () => {
      orbitas[i].classList.add("acesa");
      dica.innerHTML = "";
      const b = document.createElement("b");
      b.textContent = p.nome;
      dica.append(b, ` · ${numero.format(p.testes)} testes`);
      dica.classList.add("visivel");
      corpo.focado = true;
      // Com movimento reduzido não há quadros rodando: posiciona a dica agora
      if (reduzir) posicionar(performance.now());
    });
    g.addEventListener("pointerleave", () => {
      orbitas[i].classList.remove("acesa");
      dica.classList.remove("visivel");
      corpo.focado = false;
    });
    return corpo;
  });

  const caixaCeu = svg.parentElement;
  let inicio = null;
  let anterior = null;
  let rodando = false;
  let visivel = false;

  function posicionar(agora) {
    const decorrido = inicio == null ? Infinity : agora - inicio;
    const passo = anterior == null ? 0 : Math.min(64, agora - anterior);
    anterior = agora;
    corpos.forEach((c, i) => {
      if (!reduzir && !c.focado) c.angulo += c.velocidade * passo;
      // Na entrada, cada corpo sai do sol e espirala até a própria órbita
      const t = reduzir ? 1 : Math.min(1, Math.max(0, (decorrido - 200 - i * 70) / 1500));
      const e = 1 - Math.pow(1 - t, 4);
      const r = c.orbita * e;
      const a = c.angulo - (1 - e) * 2.2;
      c.g.setAttribute("transform", `translate(${(Math.cos(a) * r).toFixed(2)} ${(Math.sin(a) * r).toFixed(2)})`);
      c.g.style.opacity = t === 0 ? 0 : 1;
      if (c.focado) {
        const caixa = c.g.getBoundingClientRect();
        const base = caixaCeu.getBoundingClientRect();
        dica.style.left = `${caixa.left - base.left + caixa.width / 2}px`;
        dica.style.top = `${caixa.top - base.top}px`;
      }
    });
    // As órbitas se desenham de dentro para fora
    if (!reduzir && decorrido < 2600) {
      orbitas.forEach((o, i) => {
        const t = Math.min(1, Math.max(0, (decorrido - i * 60) / 1200));
        o.style.strokeDasharray = "1";
        o.style.strokeDashoffset = String(1 - (1 - Math.pow(1 - t, 3)));
      });
    } else orbitas.forEach((o) => { o.style.strokeDashoffset = "0"; });
  }

  function quadro(agora) {
    if (!visivel || document.hidden) { rodando = false; return; }
    posicionar(agora);
    requestAnimationFrame(quadro);
  }
  function ligar() {
    if (reduzir) { posicionar(performance.now()); return; }
    if (rodando || !visivel || document.hidden) return;
    rodando = true;
    anterior = null;
    requestAnimationFrame(quadro);
  }
  document.addEventListener("visibilitychange", ligar);

  // Inclinação que acompanha o mouse sobre o desenho
  if (!reduzir && comMouse) {
    const area = svg.closest(".planetario");
    area.addEventListener("pointermove", (e) => {
      const caixa = caixaCeu.getBoundingClientRect();
      const px = ((e.clientX - caixa.left) / caixa.width - .5) * 2;
      const py = ((e.clientY - caixa.top) / caixa.height - .5) * 2;
      svg.style.setProperty("--px", Math.max(-1, Math.min(1, px)).toFixed(3));
      svg.style.setProperty("--py", Math.max(-1, Math.min(1, py)).toFixed(3));
    }, { passive: true });
    area.addEventListener("pointerleave", () => { svg.style.setProperty("--px", 0); svg.style.setProperty("--py", 0); });
  }

  return {
    alternar(aberto) {
      visivel = aberto;
      if (aberto) { inicio = performance.now(); ligar(); }
    },
  };
})();

// Abre a aba do endereço (precisa do planetário já criado)
abrirAba(null);
window.addEventListener("load", () => window.scrollTo({ top: 0, behavior: "instant" }), { once: true });

// =========================================================
// COPIAR E-MAIL
// =========================================================
const botaoCopiar = document.getElementById("copiar-email");
const avisoCopiado = document.getElementById("copiado");
let apagarAviso = null;
botaoCopiar.addEventListener("click", async () => {
  try {
    await navigator.clipboard.writeText(botaoCopiar.dataset.email);
    avisoCopiado.textContent = "e-mail copiado";
  } catch {
    avisoCopiado.textContent = "não foi possível copiar: selecione o e-mail acima";
  }
  clearTimeout(apagarAviso);
  apagarAviso = setTimeout(() => { avisoCopiado.textContent = ""; }, 2500);
});

// =========================================================
// SELO DO VIGIL: os projetos no ar mostram a situação ao vivo, lida da API do Vigil. O Vigil só libera
// a leitura para o endereço publicado: rodando localmente, os cards ficam sem o selo.
// =========================================================
const VIGIL = "https://vigil.andrelagos.dev";
const porcento = new Intl.NumberFormat("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

async function seloDoVigil() {
  const cards = document.querySelectorAll("[data-vigil]");
  if (!cards.length) return;
  let lista;
  try {
    const resposta = await fetch(VIGIL + "/api/status", { signal: AbortSignal.timeout(8000) });
    if (!resposta.ok) return;
    lista = await resposta.json();
    if (!Array.isArray(lista)) return;
  } catch {
    return;
  }
  resumoDoVigil(lista);
  const porNome = new Map(lista.map((s) => [s.nome, s]));
  cards.forEach((card) => {
    if (card.dataset.vigil === "Vigil") {
      colocarSelo(card, true, null, "o Vigil respondeu agora; abre a página de status");
      return;
    }
    const status = porNome.get(card.dataset.vigil);
    const aviso = card.querySelector(".projeto__aviso");
    if (aviso && status?.situacao === "NO_AR") {
      aviso.hidden = true;
      card.querySelector(`[aria-describedby="${aviso.id}"]`)?.removeAttribute("aria-describedby");
    }
    if (!status || !["NO_AR", "FORA"].includes(status.situacao)) return;
    const noAr = status.situacao === "NO_AR";
    const trinta = status.ultimos30d?.disponibilidade;
    colocarSelo(card, noAr, trinta, (trinta == null ? "" : "nos últimos 30 dias, ")
      + "segundo o Vigil; abre a página de status");
  });
}

function resumoDoVigil(lista) {
  const vigiados = lista.filter((s) => ["NO_AR", "FORA"].includes(s.situacao));
  if (!vigiados.length) return;
  const noAr = vigiados.filter((s) => s.situacao === "NO_AR").length;
  document.getElementById("vigil-resumo").textContent =
    `${noAr}/${vigiados.length} serviços no ar agora · verificados pelo Vigil a cada 5 min`;
  const faixa = document.querySelector(".vigil-faixa");
  faixa.classList.toggle("vigil-faixa--ok", noAr === vigiados.length);
  faixa.classList.toggle("vigil-faixa--fora", noAr < vigiados.length);
}

function colocarSelo(card, noAr, trinta, complemento) {
  const selo = document.createElement("a");
  selo.className = "selo" + (noAr ? "" : " selo--fora");
  selo.href = VIGIL;
  selo.target = "_blank";
  selo.rel = "noopener";
  const ponto = document.createElement("span");
  ponto.className = "selo__ponto";
  ponto.setAttribute("aria-hidden", "true");
  const texto = (noAr ? "no ar" : "fora do ar") + (trinta == null ? "" : " · " + porcento.format(trinta) + "%");
  const extra = document.createElement("span");
  extra.className = "so-leitor";
  extra.textContent = " (" + complemento + ")";
  selo.append(ponto, texto, extra);
  selo.title = texto + " " + complemento;
  card.querySelector(".projeto__topo").append(selo);
}

seloDoVigil();

document.getElementById("ano").textContent = new Date().getFullYear();
