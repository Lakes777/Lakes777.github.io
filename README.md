<div align="center">

# Portfólio — André Lagos

Meu site pessoal, feito do zero com **HTML, CSS e JavaScript puros** e publicado com **GitHub Pages**.

[![Ver site](https://img.shields.io/badge/Ver_site-andrelagos.dev-4FC3F7?style=for-the-badge&labelColor=16171a&logo=googlechrome&logoColor=4FC3F7)](https://andrelagos.dev)

![HTML](https://img.shields.io/badge/HTML5-16171a?style=flat-square&logo=html5&logoColor=4FC3F7)
![CSS](https://img.shields.io/badge/CSS-16171a?style=flat-square&logo=css&logoColor=4FC3F7)
![JavaScript](https://img.shields.io/badge/JavaScript-16171a?style=flat-square&logo=javascript&logoColor=4FC3F7)

<img src="assets/preview.png" alt="Início do portfólio: título, números e o planetário dos projetos com o total de testes no centro" width="85%"/>

<img src="assets/projetos.png" alt="Aba Projetos do portfólio: cards só com borda do Vigil, Pursuit, Beacon e outros, com o anel de testes, o selo do Vigil, as tecnologias e os links" width="85%"/>

</div>

## Funcionalidades

- **Seções em abas**: cada seção (Início, Sobre, Formação, Projetos...) aparece sozinha, escolhida pelo
  endereço (`#projetos`), então o botão Voltar do navegador e links diretos funcionam. As setas do teclado
  trocam de aba. Sem JavaScript, todas aparecem uma embaixo da outra
- **Barra de abas no topo**: na aba ativa, um traço azul com um pequeno astro na ponta estica da aba antiga
  até a nova e encolhe nela. No celular, o nome rola junto e só as abas ficam presas, numa barra que rola de lado
- **Planetário no início**: cada projeto é um anel numa órbita própria, com a área proporcional aos testes
  dele; no centro, o total de testes de todos. Azul tem site no ar, prata é só código. Os dados saem dos
  próprios cards da aba Projetos (uma fonte só). As órbitas se desenham de dentro para fora e cada projeto
  sai do sol em espiral; as de fora andam mais devagar, como em Kepler. Com o mouse, o desenho inclina, e
  sobre um corpo aparece o nome e a órbita acende
- **Céu em `<canvas>`**: estrelas que cintilam e derivam devagar e acendem perto do mouse. O cursor deixa
  um rastro azul: uma fita só, suavizada com Catmull-Rom, que afina pela idade de cada ponto e some em
  700 ms. A animação para quando a aba do navegador fica escondida
- **Faixa do Vigil no início**: quantos serviços estão no ar agora, lidos da API do
  [Vigil](https://github.com/Lakes777/vigil), com uma linha de batimento animada. Enquanto o Vigil não
  responde, o ponto fica cinza (verde pulsando só quando a API confirma)
- **Cards de projeto só com borda**: sem fundo, também no hover, quando a borda acende, o card sobe e o
  anel de testes cresce. O card inteiro leva ao site do projeto (ou ao código, quando não há site), e o
  ícone do GitHub leva ao repositório
- **Botões com traço**: o traço antes do texto cresce e fica azul no hover, sem mudar a largura do botão;
  github e linkedin são invisíveis até o mouse chegar, quando aparece o contorno
- **Habilidades ligadas aos projetos**: cada uma mostra onde foi usada (Go no Pursuit, Redis no Beacon...)
- **Números que contam** e blocos que entram em sequência ao abrir cada aba
- **Selo "no ar" ao vivo** nos projetos publicados: a página lê a API do Vigil (o monitor de status que
  fiz em Java) e mostra a situação e a disponibilidade em 30 dias; se o Vigil não responder, os cards só
  ficam sem o selo. O Vigil só libera a leitura para o endereço publicado, então rodando localmente o selo
  não aparece. Com o Hanami no ar, o aviso de "servidor gratuito demora para acordar" some, porque as
  visitas do Vigil a cada 5 minutos o mantêm acordado
- **Copiar e-mail** com um clique
- **Acessível**: respeita a preferência de "reduzir movimento" do sistema (aí nada se mexe: o céu é
  desenhado uma vez e o planetário fica parado), tem link para pular para o conteúdo, usa HTML semântico,
  leva o foco para o título da seção ao trocar de aba e todo o texto passa de 4,5:1 de contraste
- **Sem frameworks nem dependências**: HTML, CSS e JavaScript, sem build
- **Design system** em [`docs/design-system.html`](https://andrelagos.dev/docs/design-system.html): cores,
  tipografia, movimento e os componentes vivos, usando o mesmo CSS do site

## Estrutura

```
├── index.html      # estrutura e conteúdo do site
├── css/
│   └── style.css   # estilos (cores ficam em variáveis no topo)
├── js/
│   └── main.js     # abas, céu, planetário, contadores, selo e faixa do Vigil
├── assets/
│   ├── preview.png  # aba Início (imagem deste README)
│   └── projetos.png # aba Projetos (imagem deste README)
└── docs/
    ├── design-system.html   # a identidade visual, com os componentes reais
    └── referencias/         # capa de compartilhamento e as etapas do visual anterior ("Sistemas")
```

O visual atual ("Planetário") nasceu de um teste da skill [Impeccable](https://github.com/pbakaus/impeccable)
com requisitos fixos (escuro, uma seção por aba, animação) e foi ajustado em rodadas: azul no lugar do latão,
corpos em anel, cards só com borda e o rastro do mouse. O visual anterior ("Sistemas", com a ilustração
isométrica) foi feito em etapas a partir de uma imagem gerada por IA; essas etapas continuam em `docs/referencias/`.

## Como rodar localmente

```bash
git clone https://github.com/Lakes777/Lakes777.github.io.git
cd Lakes777.github.io
```

Depois é só abrir o `index.html` no navegador. Não precisa instalar nada.

## Personalizando

As cores do site ficam em variáveis CSS no começo de `css/style.css`:

```css
:root {
  --fundo: #090a10;      /* fundo */
  --destaque: #6cc4ff;   /* cor de destaque */
  --destaque-rgb: 108, 196, 255;
  ...
}
```

Troque os valores e o site inteiro muda junto, inclusive o céu e o rastro do mouse, que leem `--destaque-rgb`.

## Créditos

Fontes [Newsreader](https://fonts.google.com/specimen/Newsreader), [Instrument Sans](https://fonts.google.com/specimen/Instrument+Sans)
e [DM Mono](https://fonts.google.com/specimen/DM+Mono) (licença OFL), pelo Google Fonts.

## Contato

[![LinkedIn](https://img.shields.io/badge/LinkedIn-0A66C2?style=for-the-badge&logo=linkedin&logoColor=white)](https://www.linkedin.com/in/andre-lagos)
[![Gmail](https://img.shields.io/badge/Gmail-EA4335?style=for-the-badge&logo=gmail&logoColor=white)](https://mail.google.com/mail/?view=cm&fs=1&to=andreplagoscontato@gmail.com)
