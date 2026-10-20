# -*- coding: utf-8 -*-
"""去背 chars_raw（白底→透明），輸出到 assets/chars（B=male, G=female）"""
from pathlib import Path
from PIL import Image

ROOT = Path(__file__).resolve().parent
SRC = ROOT / "newui" / "chars_raw"
DST = ROOT / "assets" / "chars"
DST.mkdir(parents=True, exist_ok=True)

# 檔名對應：武器類 + B/G
MAP = {
    "劍人B.PNG": "sword_male.png",
    "劍人G.PNG": "sword_female.png",
    "刀人B.PNG": "blade_male.png",
    "刀人G.PNG": "blade_female.png",
    "槍人B.PNG": "spear_male.png",
    "槍人G.PNG": "spear_female.png",
    "拳人B.PNG": "fist_male.png",
    "擷取G.PNG": "fist_female.png",  # 拳女截圖檔名
    "弓人B.PNG": "bow_male.png",
    "弓人G.PNG": "bow_female.png",
    "暗人B.PNG": "hidden_male.png",
    "暗人G.PNG": "hidden_female.png",
}


def remove_bg(im: Image.Image, thr: int = 245, soft: int = 28) -> Image.Image:
    """白色／近白背景轉透明，邊緣羽化。"""
    im = im.convert("RGBA")
    px = im.load()
    w, h = im.size
    for y in range(h):
        for x in range(w):
            r, g, b, a = px[x, y]
            # 近白且非深色線條
            if r >= thr and g >= thr and b >= thr:
                px[x, y] = (r, g, b, 0)
            elif r >= thr - soft and g >= thr - soft and b >= thr - soft:
                # 邊緣半透明
                brightness = (r + g + b) / 3
                alpha = max(0, min(255, int((thr - brightness) / soft * 255)))
                px[x, y] = (r, g, b, alpha)
    return im


def crop_transparent(im: Image.Image, pad: int = 4) -> Image.Image:
    bbox = im.getbbox()
    if not bbox:
        return im
    l, t, r, b = bbox
    l = max(0, l - pad)
    t = max(0, t - pad)
    r = min(im.width, r + pad)
    b = min(im.height, b + pad)
    return im.crop((l, t, r, b))


def main():
    for src_name, dst_name in MAP.items():
        src = SRC / src_name
        if not src.exists():
            print("MISSING", src_name)
            continue
        im = Image.open(src)
        out = crop_transparent(remove_bg(im))
        dst = DST / dst_name
        out.save(dst, "PNG")
        # 同步無性別後備圖（用男性）
        if dst_name.endswith("_male.png"):
            kind = dst_name.replace("_male.png", "")
            out.save(DST / f"{kind}.png", "PNG")
        print("OK", src_name, "->", dst_name, out.size)


if __name__ == "__main__":
    main()
