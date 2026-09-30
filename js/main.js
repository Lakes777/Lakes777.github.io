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
  "Desenvolvedor Web",
  "Entusiasta de IoT com ESP32",
  "Sempre aprendendo algo novo",
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

const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
let started = false;
let switchId = 0; // ao clicar rápido em várias abas, só a última troca vale

function showTab(focus) {
  // Endereço pode ser uma aba (#projetos) ou algo dentro dela (#copy-email)
  const id = decodeURIComponent(location.hash.slice(1));
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
  if (previous && !reduceMotion.matches) {
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
// ANO ATUAL no rodapé
// =========================================================
document.getElementById("year").textContent = new Date().getFullYear();
