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
// ANIMAÇÃO AO ROLAR: elementos .reveal aparecem na tela
// =========================================================
const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("reveal--visible");
        revealObserver.unobserve(entry.target); // anima só uma vez
      }
    });
  },
  { threshold: 0.15 }
);

document.querySelectorAll(".reveal").forEach((el, i) => {
  // pequeno atraso entre itens vizinhos para um efeito "cascata"
  el.style.transitionDelay = `${(i % 4) * 80}ms`;
  revealObserver.observe(el);
});

// =========================================================
// MENU ATIVO: destaca a seção que está na tela
// =========================================================
const sections = document.querySelectorAll("main section[id]");
const menuLinks = document.querySelectorAll(".nav__link");

const sectionObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      menuLinks.forEach((link) => {
        link.classList.toggle(
          "nav__link--active",
          link.getAttribute("href") === `#${entry.target.id}`
        );
      });
    });
  },
  { rootMargin: "-45% 0px -50% 0px" }
);

sections.forEach((section) => sectionObserver.observe(section));

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
