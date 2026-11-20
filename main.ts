// gta6-clipper-01 entry (Node 22, standard library only).
//
// The video itself is the entry: a public YouTube Short cut from Rockstar's
// Grand Theft Auto VI Trailer 2, carrying make.fun's pitch in the clip and
// the bounty's line plus this account's play code in its description. This
// program only hands the video's address to the gate: it reads VIDEO.json
// from the repository root, checks it is a real YouTube video address, and
// writes the canonical Shorts form to /output/VIDEO.json. The house
// reads the video's views from YouTube itself;
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

// The entry is a YouTube video: accept only a real YouTube address, so a
// typo or a wrong-site link fails loudly here instead of silently reaching
// the gate, where the house would have nothing to count views from.
function isYouTubeVideoUrl(value) {
  let parsedUrl;
  try {
    parsedUrl = new URL(value);
  } catch {
    return false;
  }
  if (parsedUrl.protocol !== 'https:') return false;
  const host = parsedUrl.hostname;
  if (host === 'youtu.be') return parsedUrl.pathname.split('/').filter(Boolean).length === 1;
  if (host === 'www.youtube.com' || host === 'youtube.com' || host === 'm.youtube.com') {
    if (parsedUrl.pathname.startsWith('/shorts/')) {
      return parsedUrl.pathname.split('/').filter(Boolean).length === 2;
    }
    if (parsedUrl.pathname === '/watch') return parsedUrl.searchParams.has('v');
  }
  return false;
}

if (!isYouTubeVideoUrl(parsed.url)) {
  console.error(
    'VIDEO.json "url" must be a YouTube video address: ' +
      'https://www.youtube.com/shorts/<id>, ' +
      'https://www.youtube.com/watch?v=<id>, or https://youtu.be/<id>. ' +
      `Got: ${parsed.url}`,
  );
  process.exit(1);
}

// Normalize every accepted form to the canonical Shorts address, so the
// gate always reads the same URL shape no matter which YouTube form the
// uploader pasted into VIDEO.json.
function toCanonicalShortsUrl(value) {
  const parsedUrl = new URL(value);
  let id = '';
  if (parsedUrl.hostname === 'youtu.be') {
    id = parsedUrl.pathname.split('/').filter(Boolean)[0];
  } else if (parsedUrl.pathname.startsWith('/shorts/')) {
    id = parsedUrl.pathname.split('/').filter(Boolean)[1];
  } else {
    id = parsedUrl.searchParams.get('v');
  }
  return `https://www.youtube.com/shorts/${id}`;
}

mkdirSync(OUTPUT_DIR, { recursive: true });
writeFileSync(targetPath, JSON.stringify({ url: toCanonicalShortsUrl(parsed.url) }, null, 2) + '\n');
