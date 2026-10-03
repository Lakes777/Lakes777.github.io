<div align="center">

# Portfólio — André Lagos

Meu site pessoal, feito do zero com **HTML, CSS e JavaScript puros** e publicado com **GitHub Pages**.

[![Ver site](https://img.shields.io/badge/Ver_site-lakes777.github.io-4FC3F7?style=for-the-badge&labelColor=16171a&logo=googlechrome&logoColor=4FC3F7)](https://lakes777.github.io)

![HTML](https://img.shields.io/badge/HTML5-16171a?style=flat-square&logo=html5&logoColor=4FC3F7)
![CSS](https://img.shields.io/badge/CSS-16171a?style=flat-square&logo=css&logoColor=4FC3F7)
![JavaScript](https://img.shields.io/badge/JavaScript-16171a?style=flat-square&logo=javascript&logoColor=4FC3F7)

<img src="assets/preview.png" alt="Prévia do portfólio" width="85%"/>

<img src="assets/projetos.png" alt="Seção Projetos do portfólio: cards do Coursebook, Spendwise, Encore, Tidy, Sidekick e Hanami" width="85%"/>

</div>

## Funcionalidades

- **Seções em abas**: cada seção (Sobre, Formação, Projetos...) aparece sozinha, escolhida pelo endereço
  (`#projetos`), então o botão Voltar do navegador e links diretos funcionam
- **Menu com indicador deslizante**: um fundo desliza até a aba ativa
- **Texto entrando em sequência**: ao abrir uma aba, cada bloco sobe e aparece, um depois do outro
- **Cards com brilho que segue o mouse** e ícones, selos e setas que se movem de leve no hover
- **Responsivo**: se adapta a computador, tablet e celular, com menu hambúrguer no mobile
- **Texto digitando** na apresentação
- **Fundo animado no início**: três faixas de desenhos próprios em SVG (terminal, navegador, ESP32,
  protoboard, microfone e cerejeira) deslizando de lado, bem apagadas, como nos lobbies dos projetos
- **Copiar e-mail** com um clique
- **Acessível**: respeita a preferência de "reduzir movimento" do sistema (aí as abas só fazem fade, sem deslocamento, e as faixas do fundo ficam paradas), usa HTML semântico e, ao trocar de aba, leva o foco para o título da seção
- **Sem frameworks nem dependências**, só três arquivos

## Estrutura

```
├── index.html      # estrutura e conteúdo do site
├── css/
│   └── style.css   # estilos (cores ficam em variáveis no topo)
├── js/
│   └── main.js     # interatividade
└── assets/
    ├── pranchas/    # desenhos SVG das faixas do fundo do início
    ├── preview.png  # abertura do site (imagem deste README)
    └── projetos.png # seção Projetos (imagem deste README)
```

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
  --bg: #0d0e10;       /* fundo */
  --accent: #4fc3f7;   /* cor de destaque */
  ...
}
```

Troque os valores e o site inteiro muda junto.

## Créditos

Ícones do [Lucide](https://lucide.dev) (licença ISC) e logos do [Simple Icons](https://simpleicons.org) (CC0), embutidos como SVG e pintados com a cor de destaque do site.

## Contato

[![LinkedIn](https://img.shields.io/badge/LinkedIn-0A66C2?style=for-the-badge&logo=linkedin&logoColor=white)](https://www.linkedin.com/in/andre-lagos)
[![Gmail](https://img.shields.io/badge/Gmail-EA4335?style=for-the-badge&logo=gmail&logoColor=white)](https://mail.google.com/mail/?view=cm&fs=1&to=andreplagoscontato@gmail.com)
