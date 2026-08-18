"""Derives the two canonical BTB brand exports from the generated master.

The generation step produces one artwork on whatever canvas the tool feels like
using. The repository needs two files with different geometry: the in-app mark
nearly fills its box, and the adaptive launcher foreground has to sit inside the
inner region Android guarantees on every device shape. Neither is a design
decision, so neither is made by hand.

This does exactly three things and nothing else: crop to the visible artwork,
scale it down, and centre it on a transparent square canvas. It never
recolours, never redraws, never touches alpha values, and never scales up — if
the master is smaller than the target span, that is reported rather than
invented.

    python scripts/derive-brand-exports.py <raw-master.png>

Requires Pillow, for its resampling quality. This is a one-shot tool run when a
new master arrives, not part of the test gate; `npm run check:brand` is what
verifies the result.
"""

import hashlib
import sys
from pathlib import Path

from PIL import Image

CANVAS = 1024

# Alpha at or below this is glow falloff the eye cannot find, so it does not
# count as artwork when the bounds are measured. Same threshold the validator
# uses, deliberately: the two must agree on what "content" means.
VISIBLE_ALPHA = 12

EXPORTS = [
    # The product draws this one at a size it chooses, so it nearly fills the
    # canvas. The remaining margin is breathing room, not a safe zone.
    ("assets/brand/btb-mark.png", 0.92),
    # Android masks this one and only guarantees the inner 66%. 62% keeps the
    # shield's own edges — and the signal arcs, which are the widest part —
    # inside the mask on a circular launcher.
    ("assets/brand/btb-adaptive-foreground.png", 0.62),
]


def sha256(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest().upper()


def visible_bounds(image: Image.Image) -> tuple[int, int, int, int]:
    alpha = image.getchannel("A")
    mask = alpha.point(lambda value: 255 if value > VISIBLE_ALPHA else 0)
    box = mask.getbbox()
    if box is None:
        raise SystemExit("master has no visible artwork")
    return box


def main() -> None:
    if len(sys.argv) != 2:
        raise SystemExit(__doc__)

    root = Path(__file__).resolve().parent.parent
    source = Path(sys.argv[1])
    master = Image.open(source).convert("RGBA")

    print(f"master  {source}")
    print(f"        {master.size[0]}x{master.size[1]}  sha256 {sha256(source)}")

    box = visible_bounds(master)
    artwork = master.crop(box)
    print(f"artwork {artwork.size[0]}x{artwork.size[1]} at {box}")

    for relative, span in EXPORTS:
        target = round(CANVAS * span)
        longest = max(artwork.size)
        if longest < target:
            raise SystemExit(
                f"{relative}: artwork is {longest}px and the target span is "
                f"{target}px — this tool does not scale artwork up"
            )
        scale = target / longest
        size = (round(artwork.size[0] * scale), round(artwork.size[1] * scale))
        resized = artwork.resize(size, Image.LANCZOS)

        canvas = Image.new("RGBA", (CANVAS, CANVAS), (0, 0, 0, 0))
        canvas.paste(
            resized,
            ((CANVAS - size[0]) // 2, (CANVAS - size[1]) // 2),
        )

        destination = root / relative
        destination.parent.mkdir(parents=True, exist_ok=True)
        canvas.save(destination, format="PNG", optimize=True)
        print(
            f"wrote   {relative}  {CANVAS}x{CANVAS}  artwork {size[0]}x{size[1]} "
            f"({span:.0%})  sha256 {sha256(destination)}"
        )


if __name__ == "__main__":
    main()
