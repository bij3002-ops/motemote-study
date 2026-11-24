#!/usr/bin/env python3
"""앱 아이콘 생성 (PIL). public/icons 안에 PNG를 만든다."""
from pathlib import Path

from PIL import Image, ImageDraw

OUT = Path(__file__).resolve().parent.parent / "public" / "icons"
OUT.mkdir(parents=True, exist_ok=True)

BG = (251, 250, 246, 255)
COLORS = ["#FF6B6B", "#FFC93C", "#4D7CFE", "#4ECB71", "#B36BF5", "#16161A"]


def hex_to_rgb(value: str) -> tuple[int, int, int, int]:
    value = value.lstrip("#")
    return tuple(int(value[i : i + 2], 16) for i in (0, 2, 4)) + (255,)


def draw_icon(size: int, *, rounded: bool, pad_ratio: float) -> Image.Image:
    scale = 4  # 슈퍼샘플링
    s = size * scale
    img = Image.new("RGBA", (s, s), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)

    radius = int(s * 0.235) if rounded else 0
    d.rounded_rectangle([0, 0, s - 1, s - 1], radius=radius, fill=BG)

    pad = int(s * pad_ratio)
    gap = int(s * 0.045)
    inner = s - pad * 2
    cell = (inner - gap * 2) // 3
    corner = max(2, int(cell * 0.24))

    for row in range(2):
        for col in range(3):
            x0 = pad + col * (cell + gap)
            y0 = pad + int(inner * 0.08) + row * (cell + gap)
            d.rounded_rectangle(
                [x0, y0, x0 + cell, y0 + cell], radius=corner, fill=hex_to_rgb(COLORS[row * 3 + col])
            )

    return img.resize((size, size), Image.LANCZOS)


# 홈 화면 / 파비콘: 둥근 모서리 스스로 그림 (iOS가 다시 둥글게 깎지 않음)
draw_icon(180, rounded=True, pad_ratio=0.16).save(OUT / "apple-touch-icon-180.png")
draw_icon(192, rounded=True, pad_ratio=0.16).save(OUT / "icon-192.png")
draw_icon(512, rounded=True, pad_ratio=0.16).save(OUT / "icon-512.png")
# maskable: 안전 영역(80%) 안에 내용, 배경은 꽉 채움
draw_icon(512, rounded=False, pad_ratio=0.28).save(OUT / "icon-maskable-512.png")

print("icons written to", OUT)
