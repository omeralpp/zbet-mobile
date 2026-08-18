/**
 * Validates a supplied BTB brand asset against the contract in
 * `src/theme/brand.ts` before it is allowed anywhere near a build.
 *
 * It exists because the defect this milestone fixes was invisible in a file
 * listing and obvious in the pixels: the mark carried its own dark square, so
 * every surface that promised a transparent logo drew a navy tile instead. A
 * replacement asset that repeats that mistake would look correct in a preview
 * and wrong on the device, so the alpha channel is checked rather than trusted.
 *
 * No dependencies: it decodes 8-bit non-interlaced RGBA PNG with `node:zlib`
 * only. That is not a limitation to work around — it is the required export
 * format, so anything this cannot read is already off contract.
 *
 * Run: npm run check:brand
 *
 * Not part of `npm run check` yet. It reports the current asset as
 * non-compliant, which is the true state until the generated asset lands; it
 * joins the gate in the same change that lands it.
 */
import { readFileSync } from "node:fs";
import { inflateSync } from "node:zlib";
import {
  btbAdaptiveIconForegroundPath,
  btbBrandMarkPath
} from "../src/theme/brand.ts";

const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

function decodePng(file) {
  const buffer = readFileSync(new URL(`../${file.replace("./", "")}`, import.meta.url));
  if (!buffer.subarray(0, 8).equals(signature)) {
    throw new Error("PNG değil");
  }

  let offset = 8;
  let header;
  const data = [];
  while (offset < buffer.length) {
    const length = buffer.readUInt32BE(offset);
    const type = buffer.toString("ascii", offset + 4, offset + 8);
    const body = buffer.subarray(offset + 8, offset + 8 + length);
    if (type === "IHDR") {
      header = {
        width: body.readUInt32BE(0),
        height: body.readUInt32BE(4),
        bitDepth: body[8],
        colorType: body[9],
        interlace: body[12]
      };
    } else if (type === "IDAT") {
      data.push(body);
    } else if (type === "IEND") {
      break;
    }
    offset += length + 12;
  }

  if (!header) {
    throw new Error("IHDR yok");
  }
  if (header.bitDepth !== 8 || header.colorType !== 6) {
    throw new Error(
      `8-bit RGBA bekleniyordu, bitDepth=${header.bitDepth} colorType=${header.colorType} geldi`
    );
  }
  if (header.interlace !== 0) {
    throw new Error("interlaced PNG desteklenmiyor ve sözleşme dışıdır");
  }

  const { width, height } = header;
  const raw = inflateSync(Buffer.concat(data));
  const stride = width * 4;
  const pixels = Buffer.alloc(stride * height);

  // Standard PNG scanline reconstruction. Each row is prefixed with its filter
  // type and refers back to the row above, so the rows have to be walked in
  // order rather than sampled.
  for (let row = 0; row < height; row += 1) {
    const filter = raw[row * (stride + 1)];
    const source = raw.subarray(row * (stride + 1) + 1, (row + 1) * (stride + 1));
    const target = pixels.subarray(row * stride, (row + 1) * stride);
    const above = row === 0 ? null : pixels.subarray((row - 1) * stride, row * stride);
    for (let index = 0; index < stride; index += 1) {
      const left = index < 4 ? 0 : target[index - 4];
      const up = above ? above[index] : 0;
      const upLeft = above && index >= 4 ? above[index - 4] : 0;
      let value = source[index];
      if (filter === 1) {
        value += left;
      } else if (filter === 2) {
        value += up;
      } else if (filter === 3) {
        value += (left + up) >> 1;
      } else if (filter === 4) {
        const p = left + up - upLeft;
        const dLeft = Math.abs(p - left);
        const dUp = Math.abs(p - up);
        const dUpLeft = Math.abs(p - upLeft);
        value +=
          dLeft <= dUp && dLeft <= dUpLeft ? left : dUp <= dUpLeft ? up : upLeft;
      } else if (filter !== 0) {
        throw new Error(`bilinmeyen satır filtresi ${filter}`);
      }
      target[index] = value & 0xff;
    }
  }

  return { width, height, pixels };
}

function measure(image) {
  const { width, height, pixels } = image;
  const alphaAt = (x, y) => pixels[(y * width + x) * 4 + 3];
  let transparent = 0;
  let opaque = 0;
  let minX = width;
  let minY = height;
  let maxX = -1;
  let maxY = -1;

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const alpha = alphaAt(x, y);
      if (alpha === 0) {
        transparent += 1;
        continue;
      }
      if (alpha === 255) {
        opaque += 1;
      }
      // Anything the eye can see counts as content. A wash of alpha 1-10 across
      // a whole canvas is a halo, not artwork, and is caught separately below.
      if (alpha > 12) {
        minX = Math.min(minX, x);
        minY = Math.min(minY, y);
        maxX = Math.max(maxX, x);
        maxY = Math.max(maxY, y);
      }
    }
  }

  const corners = [
    alphaAt(0, 0),
    alphaAt(width - 1, 0),
    alphaAt(0, height - 1),
    alphaAt(width - 1, height - 1)
  ];

  return {
    width,
    height,
    transparent,
    opaque,
    total: width * height,
    corners,
    bounds: maxX < 0 ? null : { minX, minY, maxX, maxY }
  };
}

/**
 * `fill` is how much of the canvas the artwork is allowed to occupy.
 *
 * The mark is drawn by the product at a size the product chooses, so it should
 * nearly fill its box. The launcher foreground is masked by Android, which only
 * guarantees the inner 66% of the canvas survives on every device shape, so its
 * artwork has to stay inside that circle or lose its own edges — which is
 * exactly what happens today.
 */
const roles = [
  {
    name: "marka işareti",
    path: btbBrandMarkPath,
    minimumCanvas: 1024,
    fill: { min: 0.8, max: 1 }
  },
  {
    name: "adaptive launcher foreground",
    path: btbAdaptiveIconForegroundPath,
    minimumCanvas: 1024,
    fill: { min: 0.5, max: 0.66 }
  }
];

let failed = false;
const seen = new Set();

for (const role of roles) {
  console.log(`\n${role.name} — ${role.path}`);
  if (seen.has(role.path)) {
    console.log("  ! bu rol hâlâ marka işaretiyle aynı dosyayı paylaşıyor");
  }
  seen.add(role.path);

  let report;
  try {
    report = measure(decodePng(role.path));
  } catch (error) {
    console.log(`  FAIL okunamadı: ${error.message}`);
    failed = true;
    continue;
  }

  const checks = [];
  checks.push([
    `kare tuval ${report.width}x${report.height}`,
    report.width === report.height
  ]);
  checks.push([
    `en az ${role.minimumCanvas}px`,
    report.width >= role.minimumCanvas
  ]);
  checks.push([
    `gerçek saydamlık (${report.transparent} tam saydam piksel)`,
    report.transparent > 0
  ]);
  checks.push([
    `köşeler saydam (α ${report.corners.join(", ")})`,
    report.corners.every((alpha) => alpha === 0)
  ]);

  if (report.bounds) {
    const { minX, minY, maxX, maxY } = report.bounds;
    const span = Math.max(maxX - minX + 1, maxY - minY + 1) / report.width;
    checks.push([
      `içerik tuvalin %${Math.round(span * 100)}'ini kaplıyor ` +
        `(hedef %${Math.round(role.fill.min * 100)}-%${Math.round(role.fill.max * 100)})`,
      span >= role.fill.min && span <= role.fill.max
    ]);
    const centreX = (minX + maxX + 1) / 2 / report.width;
    const centreY = (minY + maxY + 1) / 2 / report.height;
    checks.push([
      `optik merkez (${centreX.toFixed(3)}, ${centreY.toFixed(3)})`,
      Math.abs(centreX - 0.5) <= 0.02 && Math.abs(centreY - 0.5) <= 0.02
    ]);
  } else {
    checks.push(["içerik bulunamadı", false]);
  }

  // A generated cutout often leaves a faint rectangle of alpha 1-12 where the
  // old ground used to be. It is invisible on white and a grey box on the
  // launch gradient, so it is a failure, not a rounding error.
  const halo = report.total - report.transparent - report.opaque;
  checks.push([
    `yarı saydam piksel oranı %${((halo / report.total) * 100).toFixed(1)} (kenar yumuşatma payı)`,
    halo / report.total < 0.25
  ]);

  for (const [label, passed] of checks) {
    console.log(`  ${passed ? "PASS" : "FAIL"} ${label}`);
    if (!passed) {
      failed = true;
    }
  }
}

console.log(
  failed
    ? "\nSonuç: marka varlığı sözleşmeyi karşılamıyor.\n"
    : "\nSonuç: marka varlığı sözleşmeyi karşılıyor.\n"
);
process.exit(failed ? 1 : 0);
