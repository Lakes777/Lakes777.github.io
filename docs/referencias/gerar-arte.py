"""Gera a ilustração isométrica do início (os sistemas ligados) e a coloca no index.html, entre os
marcadores <!-- arte:inicio --> e <!-- /arte:inicio -->. Roda de qualquer pasta:

    python3 docs/referencias/gerar-arte.py

As posições ficam no "chão" isométrico (x, y) e na altura (z); a função tela() converte para o SVG.
As cores e as animações ficam no css/style.css (seção "ilustração do início")."""
import math
import re
from pathlib import Path

OX, OY = 320, 230          # onde o centro do chão (0, 0) cai no SVG
C30, S30 = math.cos(math.pi / 6), 0.5


def tela(x, y, z=0):
    return OX + (x - y) * C30, OY + (x + y) * S30 - z


def pts(*pontos):
    return " ".join(f"{a:.1f},{b:.1f}" for a, b in (tela(*p) for p in pontos))


def caixa(x, y, z, w, d, h, classe, unidades=0, leds=0):
    """Caixa isométrica: topo e as duas faces da frente (x máximo e y máximo). Com unidades, vira um
    rack: linhas dividindo as gavetas e, na face da direita, os LEDs que piscam."""
    x0, x1, y0, y1, z1 = x - w / 2, x + w / 2, y - d / 2, y + d / 2, z + h
    partes = [
        f'<polygon class="{classe}__esq" points="{pts((x1, y0, z), (x1, y1, z), (x1, y1, z1), (x1, y0, z1))}"/>',
        f'<polygon class="{classe}__dir" points="{pts((x0, y1, z), (x1, y1, z), (x1, y1, z1), (x0, y1, z1))}"/>',
        f'<polygon class="{classe}__topo" points="{pts((x0, y0, z1), (x1, y0, z1), (x1, y1, z1), (x0, y1, z1))}"/>',
    ]
    for i in range(1, unidades):
        zi = z + h * i / unidades
        partes.append(f'<polyline class="arte__fenda" points="{pts((x1, y0, zi), (x1, y1, zi), (x0, y1, zi))}"/>')
    n = 0
    for i in range(unidades):
        zc = z + h * (i + .5) / unidades
        # As ranhuras de ventilação na face da direita, e os LEDs na ponta
        for k in range(3):
            xa = x0 + w * (.42 + k * .17)
            partes.append(f'<polyline class="arte__grade" points="{pts((xa, y1, zc - 4), (xa, y1, zc + 4))}"/>')
        for k in range(leds):
            cx, cy = tela(x0 + 8 + k * 7, y1, zc)
            partes.append(f'<circle class="arte__led" style="--d:{(n * 0.37) % 2.4:.2f}s" cx="{cx:.1f}" cy="{cy:.1f}" r="1.6"/>')
            n += 1
    return "\n      ".join(partes)


def cilindro(cx, cy, r, z0, z1, extra=""):
    rx, ry = r * math.sqrt(1.5), r * math.sqrt(.5)
    a, b = cy - z0, cy - z1
    lado = (f'M{cx - rx:.1f},{b:.1f} L{cx - rx:.1f},{a:.1f} A{rx:.1f},{ry:.1f} 0 0 0 {cx + rx:.1f},{a:.1f} '
            f'L{cx + rx:.1f},{b:.1f} A{rx:.1f},{ry:.1f} 0 0 1 {cx - rx:.1f},{b:.1f}Z')
    return (f'<path class="arte__disco" d="{lado}"/>\n      '
            f'<ellipse class="arte__disco-topo{extra}" cx="{cx}" cy="{b:.1f}" rx="{rx:.1f}" ry="{ry:.1f}"/>')


# ---------- os ramos: caminho no chão (do pátio central até o destino) e o rótulo ----------
# Cada ramo: id, pontos do traço no chão, rótulo, ícone (path 16x16), stacks que aparecem no hover,
# onde fica o rótulo (na tela) e se o pacote corre de ida (1) ou de volta (-1)
ICONES = {
    "api": "M5 4 1 8l4 4M11 4l4 4-4 4M9.5 2 6.5 14",
    "apps": "M8 1.5 14.5 5 8 8.5 1.5 5Z M1.5 8 8 11.5 14.5 8 M1.5 11 8 14.5 14.5 11",
    "filas": "M2 3.5h12M2 8h12M2 12.5h7",
    "deploy": "M4.6 13h7.2a3 3 0 0 0 .5-5.9 4.4 4.4 0 0 0-8.5 1.2A2.4 2.4 0 0 0 4.6 13Z",
    "sql": "M2.5 3.5c0-1.1 2.5-2 5.5-2s5.5.9 5.5 2-2.5 2-5.5 2-5.5-.9-5.5-2Zm0 0v9c0 1.1 2.5 2 5.5 2s5.5-.9 5.5-2v-9M2.5 8c0 1.1 2.5 2 5.5 2s5.5-.9 5.5-2",
}
RAMOS = [
    ("api", [(-85, -30), (-118, -30), (-118, -41), (-151, -41)], "API", "Spring · Go · .NET · Nest", (186, 34), 1),
    ("apps", [(-29, -85), (-29, -169)], "APPS", "React · TypeScript", (474, 36), -1),
    ("servidores", [(-60, 85), (-60, 104), (-123, 104), (-123, 121)], None, None, None, 1),
    ("docker", [(85, -60), (130, -60), (130, -116)], None, None, None, -1),
    ("filas", [(20, 85), (20, 168)], "FILAS", "Kafka · RabbitMQ · BullMQ", None, 1),
    ("deploy", [(85, 30), (151, 30)], None, None, None, 1),
    ("deploy2", [(207, 35), (262, 35)], "DEPLOY", "Docker · Oracle · Vercel", None, -1),
]
RACKS = [  # x, y, largura, profundidade, altura, gavetas
    (-29, -191, 56, 44, 58, 3),   # apps (fundo à direita)
    (138, -138, 56, 44, 62, 3),   # docker (direita)
    (-179, -41, 56, 44, 58, 3),   # api (fundo à esquerda)
    (-123, 143, 56, 44, 62, 3),   # servidores (esquerda)
    (179, 41, 60, 46, 54, 2),     # deploy (frente)
]


def rotulo(ident, texto, stacks, x, y, largura):
    return f'''<g class="arte__no" data-ramo="{ident}" transform="translate({x:.0f} {y:.0f})">
        <rect x="{-largura / 2:.0f}" y="-15" width="{largura}" height="30" rx="6"/>
        <path class="arte__icone" transform="translate({-largura / 2 + 12:.0f} -8)" d="{ICONES[ident]}"/>
        <text x="{-largura / 2 + 36:.0f}" y="4.5">{texto}</text>
        <text class="arte__stacks" x="0" y="33" text-anchor="middle">{stacks}</text>
      </g>'''


def gerar():
    linhas = []
    # Chão: grade isométrica que some nas bordas (máscara radial)
    chao = []
    for k in range(-300, 301, 30):
        chao.append(f'<polyline points="{pts((k, -300), (k, 300))}"/>')
        chao.append(f'<polyline points="{pts((-300, k), (300, k))}"/>')
    linhas.append('<g class="arte__chao" mask="url(#arte-sumir)">\n      ' + "\n      ".join(chao) + "\n    </g>")

    # Traços (com os nós nas curvas) e os pacotes que correm por eles
    tracos, pacotes = [], []
    for i, (ident, caminho, *_rest, sentido) in enumerate(RAMOS):
        d = "M" + " L".join(f"{a:.1f},{b:.1f}" for a, b in (tela(*p) for p in caminho))
        ramo = ident.rstrip("2")
        tracos.append(f'<path class="arte__traco" id="tr-{ident}" data-ramo="{ramo}" pathLength="100" d="{d}"/>')
        for p in caminho[1:-1]:
            cx, cy = tela(*p)
            tracos.append(f'<circle class="arte__nodo" data-ramo="{ramo}" cx="{cx:.1f}" cy="{cy:.1f}" r="2.4"/>')
        cx, cy = tela(*caminho[-1])
        tracos.append(f'<circle class="arte__nodo arte__nodo--fim" data-ramo="{ramo}" cx="{cx:.1f}" cy="{cy:.1f}" r="3"/>')
        pontas = "1;0" if sentido < 0 else "0;1"
        # O início negativo faz cada pacote já nascer andando (com início positivo, ele esperaria parado no canto do SVG)
        for j in range(2):
            dur = 2.6 + (i % 3) * .5
            pacotes.append(f'<circle class="arte__pacote" r="2.6"><animateMotion dur="{dur:.1f}s" begin="{-(i * .45 + j * dur / 2):.2f}s" '
                           f'repeatCount="indefinite" keyPoints="{pontas}" keyTimes="0;1" calcMode="linear"><mpath href="#tr-{ident}"/></animateMotion></circle>')
    linhas.append('<g class="arte__tracos">\n      ' + "\n      ".join(tracos) + "\n    </g>")
    linhas.append('<g class="arte__pacotes">\n      ' + "\n      ".join(pacotes) + "\n    </g>")

    # Objetos: do fundo para a frente (quem tem x + y menor fica atrás). O pátio e o banco no meio.
    objetos = [(x + y, caixa(x, y, 0, w, d, h, "arte__rack", u, 2)) for x, y, w, d, h, u in RACKS]
    cx, cy = tela(0, 0)
    banco = [caixa(0, 0, 0, 170, 170, 12, "arte__patio")]
    for z0, z1 in ((12, 36), (42, 66), (72, 96)):
        banco.append(cilindro(cx, cy, 36, z0, z1, " arte__disco-topo--ultimo" if z1 == 96 else ""))
    # O anel de luz que sobe pelo banco (as consultas)
    rx, ry = 36 * math.sqrt(1.5), 36 * math.sqrt(.5)
    banco.append(f'<ellipse class="arte__consulta" cx="{cx}" cy="{cy - 12:.1f}" rx="{rx:.1f}" ry="{ry:.1f}"/>')
    objetos.append((0, "\n      ".join(banco)))
    objetos.sort(key=lambda o: o[0])
    linhas.append('<g class="arte__objetos">\n      ' + "\n      ".join(o for _, o in objetos) + "\n    </g>")

    # Rótulos: acima dos racks, ou na ponta do traço
    nos = []
    for ident, caminho, texto, stacks, pos, _ in RAMOS:
        if not texto:
            continue
        x, y = pos if pos else tela(*caminho[-1])
        if not pos:
            y += 4
        nos.append(rotulo(ident.rstrip("2"), texto, stacks, x, y, 34 + len(texto) * 9 + 16))
    nos.append(rotulo("sql", "SQL", "PostgreSQL · SQL à mão", cx, cy - 46, 34 + 27 + 16))
    linhas.append('<g class="arte__nos">\n      ' + "\n      ".join(nos) + "\n    </g>")

    return f'''<!-- arte:inicio (gerada por docs/referencias/gerar-arte.py: mude lá e rode de novo) -->
        <svg class="arte" viewBox="0 0 640 430" role="presentation">
    <defs>
      <radialGradient id="arte-luz"><stop offset="0" stop-color="#fff"/><stop offset=".55" stop-color="#fff" stop-opacity=".5"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient>
      <mask id="arte-sumir"><rect width="640" height="430" fill="url(#arte-luz)"/></mask>
    </defs>
    {chr(10).join("    " + l for l in linhas).lstrip()}
        </svg>
        <!-- /arte:inicio -->'''


if __name__ == "__main__":
    html = Path(__file__).resolve().parents[2] / "index.html"
    texto = html.read_text(encoding="utf-8")
    novo, quantos = re.subn(r"<!-- arte:inicio.*?<!-- /arte:inicio -->", lambda _: gerar(), texto, flags=re.S)
    if quantos != 1:
        raise SystemExit("marcadores <!-- arte:inicio --> não encontrados (ou repetidos) no index.html")
    html.write_text(novo, encoding="utf-8")
    print("ilustração atualizada no index.html")
