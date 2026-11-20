// gta6-clipper-01 entry (Node 22, standard library only).
//
// The video itself is the entry: a public YouTube Short cut from Rockstar's
// Grand Theft Auto VI Trailer 2, carrying make.fun's pitch in the clip and
// the bounty's line plus this account's play code in its description. This
// program only hands the video's address to the gate: it reads VIDEO.json
// from the repository root and writes it, byte for byte, to
// /output/VIDEO.json. The house reads the video's views from YouTube itself;
// nothing this program writes about the video counts.
//
// Run locally the way the grader does:
//   mkdir -p out && MAKEFUN_BOT_DIR=. MAKEFUN_OUTPUT_DIR=out node main.ts

import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const BOT_DIR = process.env.MAKEFUN_BOT_DIR ?? '/bot';
const OUTPUT_DIR = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

const sourcePath = join(BOT_DIR, 'VIDEO.json');
const targetPath = join(OUTPUT_DIR, 'VIDEO.json');

const contents = readFileSync(sourcePath, 'utf8');
const parsed = JSON.parse(contents);
if (typeof parsed !== 'object' || parsed === null || typeof parsed.url !== 'string') {
  console.error('VIDEO.json must be a JSON object with a string "url" field');
  process.exit(1);
}

mkdirSync(OUTPUT_DIR, { recursive: true });
writeFileSync(targetPath, contents);
