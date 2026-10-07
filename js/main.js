// =========================================================
// MENU: fundo ao rolar + abrir/fechar no celular
// =========================================================
const header = document.getElementById("header");
const navToggle = document.getElementById("nav-toggle");
const navLinks = document.getElementById("nav-links");

window.addEventListener("scroll", () => {
  header.classList.toggle("header--scrolled", window.scrollY > 40);
});

function setMenu(open) {
  navLinks.classList.toggle("nav__links--open", open);
  navToggle.classList.toggle("nav__toggle--open", open);
  navToggle.setAttribute("aria-expanded", open);
  navToggle.setAttribute("aria-label", open ? "Fechar menu" : "Abrir menu");
}

navToggle.addEventListener("click", () => {
  setMenu(!navLinks.classList.contains("nav__links--open"));
});

// Fecha o menu ao clicar em um link
navLinks.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", () => setMenu(false));
});

// =========================================================
// TEXTO DIGITANDO no topo
// =========================================================
const phrases = [
  "Estudante de Engenharia de Software",
  "Back-end com Java e Python",
  "APIs, bancos de dados e testes",
  "Projetos no ar com Docker e nuvem",
];

const typingEl = document.getElementById("typing");
let phraseIndex = 0;
let charIndex = 0;
let deleting = false;

function type() {
  // Array.from separa corretamente emojis (que ocupam 2 "caracteres" no JS)
  const chars = Array.from(phrases[phraseIndex]);

  charIndex += deleting ? -1 : 1;
  typingEl.textContent = chars.slice(0, charIndex).join("");

  let delay = deleting ? 40 : 80;

  if (!deleting && charIndex === chars.length) {
    delay = 1800; // pausa com a frase completa
    deleting = true;
  } else if (deleting && charIndex === 0) {
    deleting = false;
    phraseIndex = (phraseIndex + 1) % phrases.length;
    delay = 400;
  }

  setTimeout(type, delay);
}

if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
  typingEl.textContent = phrases[0];
} else {
  type();
}

// =========================================================
// FUNDO DO INÍCIO: faixas de pranchas sem emenda
// =========================================================
// Cada faixa anda de 0 a -50%: o trilho é uma metade repetida duas vezes, então o fim
// da volta é igual ao começo. Cada metade precisa passar da largura da tela (as 6
// pranchas somam uns 2.350 px), senão abre um vão em telas largas: o conjunto se
// repete quantas vezes for preciso, com folga de 50% para quem diminui o zoom ou leva a
// janela para um monitor maior depois. As cópias são só enfeite (alt="").
const largura = Math.max(screen.width, window.innerWidth);
const repeticoes = Math.max(1, Math.ceil((largura * 1.5) / 2200));
document.querySelectorAll(".faixa__trilho").forEach((trilho) => {
  const conjunto = Array.from(trilho.children);
  for (let i = 1; i < repeticoes; i++) {
    conjunto.forEach((prancha) => trilho.append(prancha.cloneNode()));
  }
  Array.from(trilho.children).forEach((prancha) => trilho.append(prancha.cloneNode()));
});

// Com a aba do navegador escondida, as faixas param (não gastam nada à toa)
document.addEventListener("visibilitychange", () => {
  document.documentElement.classList.toggle("pagina-escondida", document.hidden);
});

// =========================================================
// ABAS: cada seção aparece sozinha, escolhida pelo endereço (#projetos...)
// =========================================================
const tabs = Array.from(document.querySelectorAll("main > section[id]"));
const menuLinks = document.querySelectorAll(".nav__link");
const indicator = document.getElementById("nav-indicator");
const baseTitle = document.title;

document.documentElement.classList.add("js-tabs");

// Pílula do menu desliza até o link da aba ativa
function moveIndicator() {
  const active = document.querySelector(".nav__link--active");
  if (!active) {
    indicator.style.opacity = "0";
    return;
  }
  indicator.style.opacity = "1";
  indicator.style.width = `${active.offsetWidth}px`;
  indicator.style.transform = `translateX(${active.offsetLeft}px)`;
}

let started = false;
let switchId = 0; // ao clicar rápido em várias abas, só a última troca vale

function showTab(focus) {
  // Endereço pode ser uma aba (#projetos) ou algo dentro dela (#copy-email)
  // Os ids da página são simples (sem acento nem espaço): o hash é usado como veio,
  // sem decodeURIComponent, que quebraria a página com um endereço como "#%".
  const id = location.hash.slice(1);
  const target = id && document.getElementById(id);
  const current = (target && target.closest("main > section")) || tabs[0];

  menuLinks.forEach((link) => {
    const on = link.getAttribute("href") === `#${current.id}`;
    link.classList.toggle("nav__link--active", on);
    if (on) link.setAttribute("aria-current", "page");
    else link.removeAttribute("aria-current");
  });
  moveIndicator();

  const title = current.querySelector(".section__title");
  document.title = title
    ? `${title.lastChild.textContent.trim()} | André Lagos`
    : baseTitle;

  const previous = started && tabs.find((tab) => !tab.hidden && tab !== current);
  const thisSwitch = ++switchId;
  started = true;

  function enter() {
    if (thisSwitch !== switchId) return;

    tabs.forEach((tab) => {
      tab.hidden = tab !== current;
      tab.classList.remove("tab--leave");
    });

    // A aba entra em até 3 blocos, como no site do João: o título, depois o
    // conteúdo principal e por fim o resto. Tudo que está no mesmo bloco
    // (ex.: todos os cards de projeto) aparece junto.
    const container = current.querySelector(".container");
    current.querySelectorAll(".reveal").forEach((el) => {
      let group = el.dataset.grupo;
      if (group === undefined) {
        let block = el;
        while (block.parentElement && block.parentElement !== container) block = block.parentElement;
        group = Math.min([...container.children].indexOf(block), 2);
      }
      el.style.setProperty("--grupo", group);
    });
    current.classList.remove("tab--enter");
    void current.offsetWidth; // força o navegador a reiniciar a animação
    current.classList.add("tab--enter");

    window.scrollTo({ top: 0, behavior: "instant" });
    header.classList.remove("header--scrolled");

    if (focus && title) title.focus({ preventScroll: true });
  }

  // A aba anterior some rapidinho antes da nova entrar
  if (previous) {
    previous.classList.add("tab--leave");
    setTimeout(enter, 150);
  } else {
    enter();
  }
}

window.addEventListener("hashchange", () => showTab(true));
window.addEventListener("resize", moveIndicator);
document.fonts.ready.then(moveIndicator);

// Na primeira vez a pílula já nasce no lugar, sem deslizar a partir do canto
indicator.style.transition = "none";
showTab(false);
void indicator.offsetWidth;
indicator.style.transition = "";

// =========================================================
// BRILHO que segue o mouse nos cards (.spot)
// =========================================================
document.querySelectorAll(".spot").forEach((el) => {
  el.addEventListener("pointermove", (e) => {
    const box = el.getBoundingClientRect();
    el.style.setProperty("--mx", `${e.clientX - box.left}px`);
    el.style.setProperty("--my", `${e.clientY - box.top}px`);
  });
});

// =========================================================
// COPIAR E-MAIL
// =========================================================
const copyBtn = document.getElementById("copy-email");
const copyFeedback = document.getElementById("copy-feedback");

copyBtn.addEventListener("click", async () => {
  try {
    await navigator.clipboard.writeText(copyBtn.dataset.email);
    copyFeedback.textContent = "✓ copiado!";
    copyBtn.classList.add("contact__email--copied");
  } catch {
    copyFeedback.textContent = "não foi possível copiar — selecione o texto";
  }

  setTimeout(() => {
    copyFeedback.textContent = "clique para copiar";
    copyBtn.classList.remove("contact__email--copied");
  }, 2000);
});

// =========================================================
// SELO DO VIGIL: os projetos no ar mostram a situação ao vivo,
// lida da API do Vigil (o monitor de status que fiz em Java)
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
    const aviso = card.querySelector(".project__aviso");
    if (aviso && status?.situacao === "NO_AR") {
      aviso.hidden = true;
      card.querySelector(`[aria-describedby="${aviso.id}"]`)?.removeAttribute("aria-describedby");
    }
    // Pausado ou sem verificações ainda: melhor não mostrar nada do que um selo vazio
    if (!status || !["NO_AR", "FORA"].includes(status.situacao)) return;
    const noAr = status.situacao === "NO_AR";
    const trinta = status.ultimos30d.disponibilidade;
    colocarSelo(card, noAr, trinta, (trinta == null ? "" : "nos últimos 30 dias, ")
      + "segundo o Vigil; abre a página de status");
  });
}

// O texto visível vem primeiro (quem usa controle por voz fala o que vê); o resto fica só para o leitor de tela
function colocarSelo(card, noAr, trinta, complemento) {
  const selo = document.createElement("a");
  selo.className = "project__vigil" + (noAr ? "" : " project__vigil--fora");
  selo.href = VIGIL;
  selo.target = "_blank";
  selo.rel = "noopener";
  const ponto = document.createElement("span");
  ponto.className = "project__vigil-ponto";
  ponto.setAttribute("aria-hidden", "true");
  const texto = (noAr ? "no ar" : "fora do ar") + (trinta == null ? "" : " · " + porcento.format(trinta) + "%");
  const extra = document.createElement("span");
  extra.className = "so-leitor";
  extra.textContent = " (" + complemento + ")";
  selo.append(ponto, texto, extra);
  selo.title = texto + " " + complemento;
  // Depois do link do card: no Tab, primeiro o projeto, depois o selo (o CSS põe o selo antes na tela)
  card.querySelector(".project__top").append(selo);
}

seloDoVigil();

// =========================================================
// ANO ATUAL no rodapé
// =========================================================
document.getElementById("year").textContent = new Date().getFullYear();
