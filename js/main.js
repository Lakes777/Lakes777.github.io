// Portfólio: abas por endereço, fundo de rede em canvas, brilho que segue o mouse nos projetos,
// números que contam, copiar e-mail e o selo "no ar" ao vivo do Vigil.
const reduzir = matchMedia("(prefers-reduced-motion: reduce)").matches;

// =========================================================
// ABAS: cada seção aparece sozinha, escolhida pelo endereço (#projetos...).
// Sem JavaScript, a classe js-abas não entra e todas as seções aparecem uma embaixo da outra.
// =========================================================
document.documentElement.classList.add("js-abas");
const secoes = Array.from(document.querySelectorAll("main > section[id]"));
const linksDasAbas = Array.from(document.querySelectorAll(".abas a"));
const jaContou = new Set();

// Cada bloco da seção entra um pouco depois do anterior (o atraso vem de --i)
secoes.forEach((secao) => {
  secao.querySelectorAll(".item").forEach((item, i) => item.style.setProperty("--i", i));
});

function abrirAba(focar) {
  // Os ids são simples (sem acento nem espaço): o hash é usado como veio, sem decodeURIComponent,
  // que quebraria a página com um endereço como "#%"
  const id = location.hash.slice(1);
  const alvo = id && document.getElementById(id);
  const atual = (alvo && alvo.closest("main > section")) || secoes[0];

  secoes.forEach((secao) => secao.classList.toggle("aberta", secao === atual));
  linksDasAbas.forEach((link) => {
    if (link.getAttribute("href") === `#${atual.id}`) {
      link.setAttribute("aria-current", "page");
      // No celular as abas rolam de lado: a ativa (aberta por um link direto em #contato) fica à vista
      link.scrollIntoView({ block: "nearest", inline: "nearest" });
    } else link.removeAttribute("aria-current");
  });
  document.title = atual === secoes[0] ? "André Lagos | Engenharia de Software"
    : `${atual.querySelector("h1, h2").textContent} | André Lagos`;

  // Reinicia a entrada em sequência (tirar e pôr a classe, com um reflow no meio)
  atual.classList.remove("entrando");
  void atual.offsetWidth;
  atual.classList.add("entrando");

  if (!jaContou.has(atual.id)) {
    jaContou.add(atual.id);
    atual.querySelectorAll("[data-contar]").forEach(contar);
  }
  // Cada aba começa do topo: sem isso, abrir "#projetos" rolaria até a seção, como numa âncora comum.
  // Ao trocar pelo menu, o foco vai para o título (quem usa leitor de tela ouve onde está).
  window.scrollTo({ top: 0, behavior: "instant" });
  if (focar) atual.querySelector("h1, h2").focus({ preventScroll: true });
}
window.addEventListener("hashchange", () => abrirAba(true));

// "Pular para o conteúdo": vai para o título da aba aberta, sem mudar o endereço (o #conteudo
// abriria a aba Início, porque não é uma seção)
document.querySelector(".pular").addEventListener("click", (e) => {
  e.preventDefault();
  document.querySelector("main > section.aberta").querySelector("h1, h2").focus();
});
abrirAba(false);
// O navegador pula até a âncora do endereço depois que a página carrega (depois deste script):
// abrindo direto em "#projetos", a página ficaria rolada. Volta ao topo nessa hora também.
window.addEventListener("load", () => window.scrollTo({ top: 0, behavior: "instant" }), { once: true });

// =========================================================
// NÚMEROS que contam até o valor (só na primeira vez que a aba abre)
// =========================================================
const numero = new Intl.NumberFormat("pt-BR");
function contar(elemento) {
  const alvo = Number(elemento.dataset.contar);
  const sufixo = elemento.dataset.sufixo || "";
  if (reduzir) return; // o HTML já traz o valor final
  const inicio = performance.now();
  const duracao = 1100;
  const passo = (agora) => {
    const t = Math.min(1, (agora - inicio) / duracao);
    const suave = 1 - Math.pow(1 - t, 3);
    elemento.textContent = numero.format(Math.round(alvo * suave)) + sufixo;
    if (t < 1) requestAnimationFrame(passo);
  };
  requestAnimationFrame(passo);
}

// =========================================================
// FUNDO: pontos que andam devagar e se ligam quando ficam perto (como um mapa de serviços);
// perto do mouse, acendem. Para quando a aba do navegador fica escondida.
// =========================================================
const canvas = document.getElementById("rede");
const ctx = canvas.getContext("2d");
let pontos = [];
let mouse = { x: -999, y: -999 };
let rodando = false;

// A largura e a altura vêm do próprio canvas (sem a barra de rolagem do Windows, que o innerWidth inclui)
let largura = 0;
let altura = 0;
function ajustarRede() {
  const novaLargura = canvas.clientWidth;
  altura = canvas.clientHeight;
  const escala = window.devicePixelRatio || 1;
  canvas.width = novaLargura * escala;
  canvas.height = altura * escala;
  ctx.setTransform(escala, 0, 0, escala, 0, 0);
  // Só sorteia os pontos de novo quando a largura muda: no celular, a barra de endereço que some e
  // volta na rolagem muda só a altura, e a rede inteira "pularia" de lugar a cada rolagem
  if (novaLargura !== largura) {
    largura = novaLargura;
    // Menos pontos em tela pequena: cada par é conferido, e o custo cresce com o quadrado
    const quantos = Math.min(90, Math.round((largura * altura) / 16000));
    pontos = Array.from({ length: quantos }, () => ({
      x: Math.random() * largura, y: Math.random() * altura,
      vx: (Math.random() - 0.5) * 0.25, vy: (Math.random() - 0.5) * 0.25,
    }));
  }
  if (reduzir) desenharRede(); // parado: desenha uma vez só
}

function desenharRede() {
  ctx.clearRect(0, 0, largura, altura);
  for (const p of pontos) {
    if (!reduzir) { p.x += p.vx; p.y += p.vy; }
    if (p.x < 0 || p.x > largura) p.vx *= -1;
    if (p.y < 0 || p.y > altura) p.vy *= -1;
  }
  for (let i = 0; i < pontos.length; i++) {
    const a = pontos[i];
    const distMouse = Math.hypot(a.x - mouse.x, a.y - mouse.y);
    const perto = distMouse < 160 ? 1 - distMouse / 160 : 0;
    ctx.fillStyle = `rgba(108,196,255,${0.25 + perto * 0.6})`;
    ctx.beginPath();
    ctx.arc(a.x, a.y, 1.6 + perto * 1.4, 0, Math.PI * 2);
    ctx.fill();
    for (let j = i + 1; j < pontos.length; j++) {
      const b = pontos[j];
      const d = Math.hypot(a.x - b.x, a.y - b.y);
      if (d < 130) {
        ctx.strokeStyle = `rgba(108,196,255,${(1 - d / 130) * (0.12 + perto * 0.35)})`;
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.stroke();
      }
    }
  }
}

function animarRede() {
  if (document.hidden) { rodando = false; return; }
  desenharRede();
  requestAnimationFrame(animarRede);
}
function ligarRede() {
  if (reduzir || rodando) return;
  rodando = true;
  requestAnimationFrame(animarRede);
}
window.addEventListener("resize", ajustarRede);
window.addEventListener("pointermove", (e) => { mouse = { x: e.clientX, y: e.clientY }; }, { passive: true });
document.addEventListener("visibilitychange", ligarRede);
ajustarRede();
ligarRede();

// =========================================================
// BRILHO QUE SEGUE O MOUSE dentro de cada projeto (só no que está embaixo do mouse,
// no máximo uma vez por quadro)
// =========================================================
let pendente = null;
document.querySelector(".projetos").addEventListener("pointermove", (e) => {
  const card = e.target.closest(".projeto");
  if (!card) return;
  if (pendente) cancelAnimationFrame(pendente);
  pendente = requestAnimationFrame(() => {
    const r = card.getBoundingClientRect();
    card.style.setProperty("--mx", `${e.clientX - r.left}px`);
    card.style.setProperty("--my", `${e.clientY - r.top}px`);
  });
}, { passive: true });

// =========================================================
// COPIAR E-MAIL
// =========================================================
const botaoCopiar = document.getElementById("copiar-email");
const avisoCopiado = document.getElementById("copiado");
let apagarAviso = null;
botaoCopiar.addEventListener("click", async () => {
  try {
    await navigator.clipboard.writeText(botaoCopiar.dataset.email);
    avisoCopiado.textContent = "e-mail copiado ✓";
  } catch {
    avisoCopiado.textContent = "não foi possível copiar: selecione o e-mail acima";
  }
  // Dois cliques seguidos: o prazo do primeiro não apaga a mensagem do segundo antes da hora
  clearTimeout(apagarAviso);
  apagarAviso = setTimeout(() => { avisoCopiado.textContent = ""; }, 2500);
});

// =========================================================
// SELO DO VIGIL: os projetos no ar mostram a situação ao vivo, lida da API do Vigil (o monitor
// de status que fiz em Java). O Vigil só libera a leitura para o endereço publicado: rodando
// localmente, os cards ficam sem o selo.
// =========================================================
const VIGIL = "https://147-15-40-173.sslip.io";
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
    return; // Vigil fora do ar ou lento: os cards ficam como sempre, só sem o selo
  }
  const porNome = new Map(lista.map((s) => [s.nome, s]));
  cards.forEach((card) => {
    // O card do próprio Vigil: se a API respondeu, ele está no ar
    if (card.dataset.vigil === "Vigil") {
      colocarSelo(card, true, null, "o Vigil respondeu agora; abre a página de status");
      return;
    }
    const status = porNome.get(card.dataset.vigil);
    // O Vigil visita o site a cada 5 min, e isso mantém acordado o servidor gratuito do Hanami:
    // estando no ar, o aviso de "demora para acordar" não vale. Se o Vigil não responder, ele fica.
    const aviso = card.querySelector(".projeto__aviso");
    if (aviso && status?.situacao === "NO_AR") {
      aviso.hidden = true;
      card.querySelector(`[aria-describedby="${aviso.id}"]`)?.removeAttribute("aria-describedby");
    }
    // Pausado ou sem verificações ainda: melhor não mostrar nada do que um selo vazio
    if (!status || !["NO_AR", "FORA"].includes(status.situacao)) return;
    const noAr = status.situacao === "NO_AR";
    const trinta = status.ultimos30d?.disponibilidade;
    colocarSelo(card, noAr, trinta, (trinta == null ? "" : "nos últimos 30 dias, ")
      + "segundo o Vigil; abre a página de status");
  });
}

// O texto visível vem primeiro (quem usa controle por voz fala o que vê); o resto fica só para o leitor de tela
function colocarSelo(card, noAr, trinta, complemento) {
  const selo = document.createElement("a");
  selo.className = "selo mono" + (noAr ? "" : " selo--fora");
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
