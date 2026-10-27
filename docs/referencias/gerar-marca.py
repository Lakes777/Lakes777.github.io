"""Gera a marca do portfólio em assets/marca/: AL dentro de uma órbita inclinada, no visual do Planetário.

A órbita envolve as letras sem encostar nelas: a altura da elipse (ry) é calculada a partir do contorno
das letras, com uma folga fixa. Três arquivos:
  logo.svg            grande, com fundo: capa de compartilhamento e ícone da tela inicial
  logo-sem-fundo.svg  o mesmo desenho sem o quadrado: topo do site
  favicon.svg         aba do navegador: letras maiores e traço mais grosso, para ler em 16 px
As letras viram contorno porque o ícone, aberto como imagem, não carrega fontes. Precisa do fonttools e
da Newsreader 500:

    cd /tmp && npm pack -q @fontsource/newsreader@5.2.6 && tar xzf fontsource-newsreader-5.2.6.tgz
    python3 docs/referencias/gerar-marca.py /tmp/package/files/newsreader-latin-500-normal.woff

Os PNGs (favicon-32.png e apple-touch-icon.png, este sem os cantos arredondados, que o iPhone já arredonda)
saem destes SVGs por um navegador sem janela, em 32 e 180 px.
"""
import math
import sys
from pathlib import Path
from fontTools.ttLib import TTFont
from fontTools.pens.basePen import BasePen
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen
from fontTools.pens.boundsPen import BoundsPen

FONTE = TTFont(sys.argv[1])
UPM = FONTE["head"].unitsPerEm
CREME, AZUL, FUNDO = "#ece7dc", "#6cc4ff", "#090a10"
INCLINACAO = -24  # graus


class Pontos(BasePen):
    """Pontos ao longo do contorno (retas e curvas divididas em pedaços), para medir a folga da órbita."""
    def __init__(self, glifos):
        super().__init__(glifos)
        self.pontos = []

    def _moveTo(self, p):
        self.pontos.append(p)
        self.atual = p

    def _lineTo(self, p):
        self._curva(lambda t, a=self.atual: (a[0] + (p[0] - a[0]) * t, a[1] + (p[1] - a[1]) * t), p)

    def _curveToOne(self, b, c, d):
        a = self.atual
        self._curva(lambda t: tuple((1 - t) ** 3 * a[i] + 3 * (1 - t) ** 2 * t * b[i] + 3 * (1 - t) * t * t * c[i] + t ** 3 * d[i]
                                    for i in (0, 1)), d)

    def _qCurveToOne(self, b, c):
        a = self.atual
        self._curva(lambda t: tuple((1 - t) ** 2 * a[i] + 2 * (1 - t) * t * b[i] + t * t * c[i] for i in (0, 1)), c)

    def _curva(self, f, fim):
        self.pontos += [f(i / 12) for i in range(1, 13)]
        self.atual = fim


def desenhar(caneta, tam, x, y, espaco=-.5):
    glifos, cmap, k = FONTE.getGlyphSet(), FONTE.getBestCmap(), tam / UPM
    for c in "AL":
        nome = cmap[ord(c)]
        glifos[nome].draw(TransformPen(caneta, (k, 0, 0, -k, x, y)))
        x += FONTE["hmtx"][nome][0] * k + espaco


def letras(tam):
    """Caminho SVG do AL e os pontos do contorno, centrado pela tinta no meio do quadro (32, 32)."""
    glifos = FONTE.getGlyphSet()
    medida = BoundsPen(glifos)
    desenhar(medida, tam, 0, 0)
    x0, y0, x1, y1 = medida.bounds
    x, y = 32 - (x0 + x1) / 2, 32 - (y0 + y1) / 2
    caminho = SVGPathPen(glifos, ntos=lambda v: f"{v:.2f}".rstrip("0").rstrip("."))
    pontos = Pontos(glifos)
    desenhar(caminho, tam, x, y)
    desenhar(pontos, tam, x, y)
    return caminho.getCommands(), pontos.pontos


def altura_da_orbita(pontos, rx, folga):
    """Menor ry para que nenhum ponto das letras chegue a menos de 'folga' da órbita."""
    t = math.radians(-INCLINACAO)
    ry = 0
    for px, py in pontos:
        u = (px - 32) * math.cos(t) - (py - 32) * math.sin(t)
        v = (px - 32) * math.sin(t) + (py - 32) * math.cos(t)
        assert abs(u) < rx - folga, "as letras não cabem na largura da órbita"
        ry = max(ry, abs(v) / math.sqrt(1 - (u / (rx - folga)) ** 2) + folga)
    return round(ry, 2)


def marca(tam, rx, folga, traco, planeta_r, fundo="arredondado"):
    d, pontos = letras(tam)
    ry = altura_da_orbita(pontos, rx, folga)
    a = math.radians(-40)  # o planeta fica no alto, à direita
    px, py = 32 + rx * math.cos(a), 32 + ry * math.sin(a)
    quadro = {"arredondado": f'<rect width="64" height="64" rx="14" fill="{FUNDO}"/>',
              "quadrado": f'<rect width="64" height="64" fill="{FUNDO}"/>', None: ""}[fundo]
    return (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">{quadro}'
            f'<g transform="rotate({INCLINACAO} 32 32)">'
            f'<ellipse cx="32" cy="32" rx="{rx}" ry="{ry}" fill="none" stroke="{AZUL}" stroke-width="{traco}"/>'
            f'<circle cx="{px:.2f}" cy="{py:.2f}" r="{planeta_r}" fill="{AZUL}"/></g>'
            f'<path d="{d}" fill="{CREME}"/></svg>\n')


if __name__ == "__main__":
    saida = Path(__file__).resolve().parents[2] / "assets" / "marca"
    arquivos = {
        "logo.svg": marca(26, 30, 3.2, 2.6, 4),
        "logo-sem-fundo.svg": marca(26, 30, 3.2, 2.6, 4, fundo=None),
        "logo-quadrado.svg": marca(26, 30, 3.2, 2.6, 4, fundo="quadrado"),  # só para gerar o apple-touch-icon.png
        "favicon.svg": marca(30, 31, 2.7, 3.4, 4.6),
    }
    for nome, svg in arquivos.items():
        (saida / nome).write_text(svg)
        print(nome, len(svg), "bytes")
