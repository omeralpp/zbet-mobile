"use strict";

const fs = require("node:fs");
const path = require("node:path");

const sampleRate = 44100;
const durationSeconds = 1;
const sampleCount = sampleRate * durationSeconds;
const samples = new Float64Array(sampleCount);

function addTone(frequency, startSeconds, toneDuration, gain) {
  const start = Math.floor(startSeconds * sampleRate);
  const length = Math.floor(toneDuration * sampleRate);

  for (let index = 0; index < length && start + index < sampleCount; index += 1) {
    const phase = index / length;
    const envelope = Math.sin(Math.PI * phase) ** 1.35;
    const time = index / sampleRate;
    const fundamental = Math.sin(2 * Math.PI * frequency * time);
    const shimmer = 0.18 * Math.sin(2 * Math.PI * frequency * 2 * time);

    samples[start + index] += gain * envelope * (fundamental + shimmer);
  }
}

addTone(659.25, 0.04, 0.34, 0.48);
addTone(987.77, 0.27, 0.55, 0.52);

let peak = 0;
for (const sample of samples) {
  peak = Math.max(peak, Math.abs(sample));
}

const scale = peak > 0 ? 0.82 / peak : 0;
const dataSize = sampleCount * 2;
const output = Buffer.alloc(44 + dataSize);

output.write("RIFF", 0);
output.writeUInt32LE(36 + dataSize, 4);
output.write("WAVE", 8);
output.write("fmt ", 12);
output.writeUInt32LE(16, 16);
output.writeUInt16LE(1, 20);
output.writeUInt16LE(1, 22);
output.writeUInt32LE(sampleRate, 24);
output.writeUInt32LE(sampleRate * 2, 28);
output.writeUInt16LE(2, 32);
output.writeUInt16LE(16, 34);
output.write("data", 36);
output.writeUInt32LE(dataSize, 40);

for (let index = 0; index < sampleCount; index += 1) {
  const value = Math.max(-1, Math.min(1, samples[index] * scale));
  output.writeInt16LE(Math.round(value * 32767), 44 + index * 2);
}

const outputPath = path.join(
  __dirname,
  "..",
  "res",
  "notification",
  "btb_alert.wav"
);

fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, output);
console.log(`Generated ${outputPath} (${durationSeconds.toFixed(1)}s, ${sampleRate} Hz mono)`);
