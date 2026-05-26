#!/usr/bin/env node
/**
 * extract-skill-provenance.js
 *
 * Resolves missing source metadata for skills in a skills-lock.json file.
 * Uses a three-tier approach:
 *
 *   Tier 1 — Local SKILL.md frontmatter (fastest, most accurate)
 *   Tier 2 — Online registry lookups  (defined in skill-registries.json)
 *   Tier 3 — Name-pattern heuristics  (fallback, low confidence)
 *
 * Results are REPORTED ONLY — no changes are written to the lock file
 * unless you explicitly run with --apply.
 *
 * Usage:
 *   node extract-skill-provenance.js [options]
 *
 * Options:
 *   --skills-dir <path>       Skills directory to scan (default: auto-detects common paths)
 *   --lock-file <path>        Path to skills-lock.json (default: ./skills-lock.json)
 *   --registries <path>       Path to skill-registries.json (default: ./skill-registries.json)
 *   --output <path>           Output path for patched lock (default: ./skills-lock.patched.json)
 *   --apply                   Write the patched lock file (default: report only)
 *   --no-online               Skip online registry lookups
 *   --only <skill1,skill2>    Only process these skill names
 *   --verbose                 Print detailed per-skill info
 *
 * Environment:
 *   GITHUB_TOKEN              GitHub personal access token (raises API limit from 60 to 5000/hr)
 *
 * Examples:
 *   node extract-skill-provenance.js --lock-file skills-lock.json
 *   node extract-skill-provenance.js --skills-dir .claude/skills --verbose
 *   node extract-skill-provenance.js --no-online --apply
 *   GITHUB_TOKEN=ghp_xxx node extract-skill-provenance.js
 */

import fs from 'fs';
import path from 'path';
import os from 'os';

// ─── CLI ─────────────────────────────────────────────────────────────────────

const args = process.argv.slice(2);
const getArg = (flag) => { const i = args.indexOf(flag); return i !== -1 ? args[i + 1] : null; };
const hasFlag = (flag) => args.includes(flag);

const VERBOSE      = hasFlag('--verbose');
const APPLY        = hasFlag('--apply');
const NO_ONLINE    = hasFlag('--no-online');
const LOCK_PATH    = getArg('--lock-file')   || './skills-lock.json';
const OUTPUT_PATH  = getArg('--output')      || './skills-lock.patched.json';
const REG_PATH     = getArg('--registries')  || './skill-registries.json';
const CUSTOM_DIR   = getArg('--skills-dir');
const ONLY_SKILLS  = getArg('--only')?.split(',').map(s => s.trim()) || null;
const GITHUB_TOKEN = process.env.GITHUB_TOKEN || null;

const CANDIDATE_DIRS = CUSTOM_DIR ? [CUSTOM_DIR] : [
  '.claude/skills', '.github/skills', '.agents/skills',
  path.join(os.homedir(), '.copilot', 'skills'),
  path.join(os.homedir(), '.claude', 'skills'),
  path.join(os.homedir(), '.agents', 'skills'),
];

// ─── Logging ─────────────────────────────────────────────────────────────────

const log     = (...a) => console.log(...a);
const verbose = (...a) => { if (VERBOSE) console.log('    ·', ...a); };
const warn    = (...a) => console.warn('  ⚠', ...a);
const dim     = (s)    => `\x1b[2m${s}\x1b[0m`;
const bold    = (s)    => `\x1b[1m${s}\x1b[0m`;
const green   = (s)    => `\x1b[32m${s}\x1b[0m`;
const yellow  = (s)    => `\x1b[33m${s}\x1b[0m`;
const red     = (s)    => `\x1b[31m${s}\x1b[0m`;
const cyan    = (s)    => `\x1b[36m${s}\x1b[0m`;

// ─── HTTP helper ─────────────────────────────────────────────────────────────

async function httpGet(url, { headers = {}, timeoutMs = 8000 } = {}) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: { 'User-Agent': 'skill-provenance-extractor/1.0', ...headers },
    });
    clearTimeout(timer);
    return { ok: res.ok, status: res.status, text: await res.text() };
  } catch (e) {
    clearTimeout(timer);
    return { ok: false, status: 0, text: '', error: e.message };
  }
}

function githubHeaders() {
  return GITHUB_TOKEN ? { Authorization: `Bearer ${GITHUB_TOKEN}` } : {};
}

// ─── Frontmatter parser ───────────────────────────────────────────────────────

function parseFrontmatter(content) {
  const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!match) return {};
  const meta = {};
  for (const line of match[1].split('\n')) {
    const ci = line.indexOf(':');
    if (ci === -1) continue;
    const key = line.slice(0, ci).trim();
    const val = line.slice(ci + 1).trim().replace(/^["']|["']$/g, '');
    if (key) meta[key] = val;
  }
  return meta;
}

const PROVENANCE_FIELDS = [
  'source', 'sourceType', 'source-repo', 'source-ref', 'source-tree',
  'author', 'license', 'registryVersion', 'installedVersion',
  'computedHash', 'homepage', 'repository', 'description',
];

function extractProvenance(meta) {
  const r = {};
  for (const f of PROVENANCE_FIELDS) if (meta[f]) r[f] = meta[f];
  if (meta['source-repo'] && !r.source) { r.source = meta['source-repo']; r.sourceType = 'github'; }
  if (meta['source-ref'])  r.sourceRef  = meta['source-ref'];
  if (meta['source-tree']) r.sourceTree = meta['source-tree'];
  if (r.source && !r.sourceType) {
    if (r.source.startsWith('https://skills.rest'))                          r.sourceType = 'skills-rest';
    else if (/^github\//i.test(r.source) || /github\.com/i.test(r.source))  r.sourceType = 'github';
  }
  return r;
}

// ─── Local SKILL.md scanner ───────────────────────────────────────────────────

function findSkillMdFiles(dir) {
  if (!fs.existsSync(dir)) return [];
  const results = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) results.push(...findSkillMdFiles(full));
    else if (entry.name === 'SKILL.md') results.push(full);
  }
  return results;
}

// ─── Registry lookup strategies ──────────────────────────────────────────────

/**
 * Each lookup function receives (skillName, registry) and returns either
 * a provenance object { source, sourceType, author, license, ... }
 * or null if not found.
 */

/** Skyll — aggregated REST API */
async function lookupSkyll(skillName, reg) {
  const url = reg.searchStrategy.searchUrl.replace('{skillName}', encodeURIComponent(skillName));
  verbose(`Trying ${reg.name}: ${url}`);
  const res = await httpGet(url);
  if (!res.ok) return null;
  try {
    const data = JSON.parse(res.text);
    const skills = data?.skills || data?.results || (Array.isArray(data) ? data : []);
    const match = skills.find(s => s.name?.toLowerCase() === skillName.toLowerCase());
    if (!match) return null;
    return {
      source: match.source || match.repository || match.url,
      sourceType: match.sourceType || (match.source?.includes('github') ? 'github' : undefined),
      author: match.author,
      license: match.license,
      description: match.description,
      _foundIn: reg.id,
    };
  } catch { return null; }
}

/** SkillsMP — keyword search REST API */
async function lookupSkillsMP(skillName, reg) {
  const url = reg.searchStrategy.searchUrl.replace('{skillName}', encodeURIComponent(skillName));
  verbose(`Trying ${reg.name}: ${url}`);
  const res = await httpGet(url);
  if (!res.ok) return null;
  try {
    const data = JSON.parse(res.text);
    const items = data?.data || data?.results || (Array.isArray(data) ? data : []);
    const match = items.find(s =>
      s.name?.toLowerCase() === skillName.toLowerCase() ||
      s.slug?.toLowerCase() === skillName.toLowerCase()
    );
    if (!match) return null;
    return {
      source: match.repository || match.source || match.github_url,
      sourceType: 'github',
      author: match.author,
      license: match.license,
      _foundIn: reg.id,
    };
  } catch { return null; }
}

/** GitHub raw SKILL.md fetch (works for awesome-copilot, obra/superpowers, anthropics/skills) */
async function lookupGithubRaw(skillName, reg) {
  // Strip common prefixes that registries don't use in their directory names
  const baseName = skillName
    .replace(/^superpowers-/, '')
    .replace(/^superpowers_/, '');

  const namesToTry = baseName === skillName ? [skillName] : [baseName, skillName];

  for (const name of namesToTry) {
    const url = reg.searchStrategy.directUrl.replace('{skillName}', name);
    verbose(`Trying ${reg.name}: ${url}`);
    const res = await httpGet(url, { headers: githubHeaders() });
    if (!res.ok) continue;

    // Got the SKILL.md — parse it
    const meta = parseFrontmatter(res.text);
    const provenance = extractProvenance(meta);

    // Build source from the URL if frontmatter doesn't have one
    const ghMatch = url.match(/raw\.githubusercontent\.com\/([^/]+\/[^/]+)/);
    const repoPath = ghMatch ? ghMatch[1] : null;

    return {
      source: provenance.source || (repoPath ? `github/${repoPath}` : url),
      sourceType: provenance.sourceType || 'github',
      author: provenance.author || reg.author,
      license: provenance.license || reg.license,
      description: provenance.description || meta.description,
      sourceRef: provenance.sourceRef,
      _foundIn: reg.id,
      _skillMdUrl: url,
    };
  }
  return null;
}

/** GitHub API directory listing — checks if skill exists in a repo */
async function lookupGithubApi(skillName, reg) {
  // First, list the skills directory
  const url = reg.searchStrategy.apiUrl;
  verbose(`Trying ${reg.name} (API listing): ${url}`);
  const res = await httpGet(url, { headers: { ...githubHeaders(), Accept: 'application/vnd.github.v3+json' } });
  if (!res.ok) return null;
  try {
    const items = JSON.parse(res.text);
    const baseName = skillName.replace(/^superpowers-/, '');
    const found = items.find(i =>
      i.type === 'dir' && (
        i.name.toLowerCase() === skillName.toLowerCase() ||
        i.name.toLowerCase() === baseName.toLowerCase()
      )
    );
    if (!found) return null;
    // Skill exists — now fetch its SKILL.md
    const rawUrl = reg.searchStrategy.directUrl.replace('{skillName}', found.name);
    return await lookupGithubRaw(found.name, { ...reg, searchStrategy: { ...reg.searchStrategy, directUrl: rawUrl.replace(found.name, '{skillName}') } });
  } catch { return null; }
}

/** Known-skills fast check — no network needed */
function lookupKnownSkills(skillName, reg) {
  if (!reg.knownSkills) return null;
  const baseName = skillName.replace(/^superpowers-/, '');
  const match = reg.knownSkills.find(k =>
    k.toLowerCase() === skillName.toLowerCase() ||
    k.toLowerCase() === baseName.toLowerCase()
  );
  if (!match) return null;
  return {
    source: reg.url,
    sourceType: reg.id === 'skills-rest' ? 'skills-rest' : 'github',
    author: reg.author,
    license: reg.license,
    _foundIn: reg.id,
    _knownSkill: true,
  };
}

/** Route a registry entry to the correct lookup function */
async function lookupRegistry(skillName, reg) {
  // Fast path: knownSkills list
  const known = lookupKnownSkills(skillName, reg);
  if (known) return known;

  const strategy = reg.searchStrategy?.type;
  if (strategy === 'rest-api') {
    if (reg.id === 'skyll')    return lookupSkyll(skillName, reg);
    if (reg.id === 'skillsmp') return lookupSkillsMP(skillName, reg);
  }
  if (strategy === 'github-raw')  return lookupGithubRaw(skillName, reg);
  if (strategy === 'github-api')  return lookupGithubApi(skillName, reg);
  if (strategy === 'structured-url') {
    // Try fetching the direct URL and see if it returns anything useful
    const url = reg.searchStrategy.directUrl?.replace('{skillName}', skillName);
    if (!url) return null;
    verbose(`Trying ${reg.name}: ${url}`);
    const res = await httpGet(url);
    if (!res.ok) return null;
    // If it's markdown, try parsing frontmatter
    if (res.text.startsWith('---')) {
      const meta = parseFrontmatter(res.text);
      return { source: url, sourceType: 'skills-rest', author: meta.author, license: meta.license, _foundIn: reg.id };
    }
    return { source: url, _foundIn: reg.id };
  }
  return null;
}

/** Try all registries in order, return first hit */
async function lookupOnline(skillName, registries) {
  for (const reg of registries) {
    try {
      const result = await lookupRegistry(skillName, reg);
      if (result) {
        verbose(`✓ Found in ${reg.name}`);
        return { ...result, _registry: reg.name };
      }
    } catch (e) {
      verbose(`Error querying ${reg.name}: ${e.message}`);
    }
  }
  return null;
}

// ─── Heuristics (Tier 3 fallback) ────────────────────────────────────────────

const HEURISTICS = [
  { pattern: /^(brainstorming|superpowers|writing-plans|superpowers-writing-plans|executing-plans|superpowers-executing-plans|subagent|systematic-debugging|test-driven|using-git-worktrees|code-review|verification)/i,
    source: 'github/obra/superpowers', sourceType: 'github', author: 'Jesse Vincent (obra)', license: 'MIT' },
  { pattern: /^(git-commit|git-commit-push)$/i,
    source: 'github/awesome-copilot', sourceType: 'github', license: 'MIT' },
  { pattern: /^snyk/i,
    source: 'https://skills.rest/skill/snyk-fix', sourceType: 'skills-rest', author: 'Snyk', license: 'Apache-2.0' },
  { pattern: /^(scanning-docker|trivy|container-security)/i,
    source: 'https://skills.rest/skill/scanning-docker-images-with-trivy', sourceType: 'skills-rest', author: 'mahipal', license: 'Apache-2.0' },
  { pattern: /.*/,
    source: 'github/awesome-copilot', sourceType: 'github', _lowConfidence: true },
];

function applyHeuristic(skillName) {
  for (const { pattern, ...fields } of HEURISTICS) {
    if (pattern.test(skillName)) return fields;
  }
  return null;
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  log('');
  log(bold('🔍 Skills Provenance Extractor'));
  log('─'.repeat(56));

  // Load registries
  let registries = [];
  if (fs.existsSync(REG_PATH)) {
    try {
      const reg = JSON.parse(fs.readFileSync(REG_PATH, 'utf8'));
      registries = reg.registries || [];
      log(`📋 Loaded ${registries.length} registries from ${dim(REG_PATH)}`);
      if (VERBOSE) registries.forEach(r => log(`   ${cyan(r.id.padEnd(28))} ${dim(r.name)}`));
    } catch (e) { warn(`Could not parse ${REG_PATH}: ${e.message}`); }
  } else {
    warn(`Registry file not found at ${REG_PATH} — online lookups disabled.`);
  }

  if (GITHUB_TOKEN) log(`🔑 GitHub token detected — API rate limit raised to 5000/hr`);
  else              log(dim(`   Tip: set GITHUB_TOKEN env var to increase GitHub API rate limit`));

  // Load lock file
  let lockData = { version: 1, skills: {} };
  if (fs.existsSync(LOCK_PATH)) {
    try {
      lockData = JSON.parse(fs.readFileSync(LOCK_PATH, 'utf8'));
      log(`📄 Loaded lock file: ${dim(LOCK_PATH)}`);
      log(`   Skills in lock: ${Object.keys(lockData.skills).length}`);
    } catch (e) { warn(`Could not parse ${LOCK_PATH}: ${e.message}`); }
  } else {
    warn(`Lock file not found at ${LOCK_PATH}`);
  }

  // Determine which skills need resolution
  let skillsToProcess = Object.entries(lockData.skills)
    .filter(([, v]) => !v.source || v.source === 'unknown');

  if (ONLY_SKILLS) {
    skillsToProcess = skillsToProcess.filter(([name]) => ONLY_SKILLS.includes(name));
  }

  const alreadyResolved = Object.entries(lockData.skills)
    .filter(([, v]) => v.source && v.source !== 'unknown')
    .map(([name]) => name);

  log(`\n   Already resolved: ${alreadyResolved.length}`);
  log(`   Need resolution:  ${skillsToProcess.length}`);

  if (skillsToProcess.length === 0) {
    log('\n✅ All skills already have source metadata. Nothing to do.');
    return;
  }

  // ── Tier 1: Local SKILL.md scan ─────────────────────────────────────────
  log('\n' + bold('── Tier 1: Local SKILL.md scan') + ' ' + '─'.repeat(25));

  const foundDirs = CANDIDATE_DIRS.filter(d => fs.existsSync(d));
  const localProvenance = {}; // skillName → provenance

  if (foundDirs.length === 0) {
    log(dim('   No local skills directories found. Skipping.'));
    log(dim('   Tried: ' + CANDIDATE_DIRS.join(', ')));
    log(dim('   Use --skills-dir <path> to specify one.'));
  } else {
    log(`   Scanning: ${foundDirs.join(', ')}`);
    const skillFiles = foundDirs.flatMap(findSkillMdFiles);
    log(`   Found ${skillFiles.length} SKILL.md file(s)`);

    for (const filePath of skillFiles) {
      const skillName = path.basename(path.dirname(filePath));
      try {
        const content = fs.readFileSync(filePath, 'utf8');
        const meta = parseFrontmatter(content);
        const prov = extractProvenance(meta);
        if (prov.source) {
          localProvenance[skillName] = prov;
          verbose(`${skillName}: ✓ source=${prov.source}`);
        } else {
          verbose(`${skillName}: no source in frontmatter`);
        }
      } catch (e) { verbose(`${skillName}: read error — ${e.message}`); }
    }
    log(`   Provenance found in frontmatter: ${Object.keys(localProvenance).length}`);
  }

  // ── Resolution loop ──────────────────────────────────────────────────────
  log('\n' + bold('── Resolution Results') + ' ' + '─'.repeat(35));

  const results = {}; // skillName → { tier, provenance, note }
  const summary = { tier1: [], tier2: [], tier3: [], unresolved: [] };

  for (const [skillName, lockEntry] of skillsToProcess) {
    log(`\n  ${bold(skillName)}`);

    // Tier 1: local frontmatter
    if (localProvenance[skillName]) {
      const prov = localProvenance[skillName];
      log(`  ${green('✅ Tier 1')} — local SKILL.md frontmatter`);
      log(`     source:     ${prov.source}`);
      if (prov.author)  log(`     author:     ${prov.author}`);
      if (prov.license) log(`     license:    ${prov.license}`);
      results[skillName] = { tier: 1, provenance: prov };
      summary.tier1.push(skillName);
      continue;
    }

    // Tier 2: online registries
    if (!NO_ONLINE && registries.length > 0) {
      log(`  ${cyan('🌐 Tier 2')} — querying ${registries.length} registries...`);
      const online = await lookupOnline(skillName, registries);
      if (online) {
        const { _registry, _skillMdUrl, _knownSkill, _foundIn, ...prov } = online;
        log(`  ${green('✅ Tier 2')} — found in ${bold(_registry || _foundIn)}`);
        log(`     source:     ${prov.source}`);
        if (prov.author)     log(`     author:     ${prov.author}`);
        if (prov.license)    log(`     license:    ${prov.license}`);
        if (_skillMdUrl)     log(`     skill-url:  ${dim(_skillMdUrl)}`);
        if (_knownSkill)     log(`     ${dim('(matched known-skills list — no network request)')}`);
        results[skillName] = { tier: 2, provenance: prov, registry: _registry || _foundIn };
        summary.tier2.push(skillName);
        continue;
      }
      log(`     ${dim('Not found in any registry.')}`);
    } else if (NO_ONLINE) {
      log(`  ${dim('(online lookup skipped — --no-online flag set)')}`);
    }

    // Tier 3: heuristics
    const guess = applyHeuristic(skillName);
    if (guess) {
      const { _lowConfidence, ...prov } = guess;
      const confidence = _lowConfidence ? 'low confidence' : 'pattern match';
      log(`  ${yellow('🟡 Tier 3')} — heuristic (${confidence})`);
      log(`     source:     ${prov.source}  ${dim('[unverified]')}`);
      if (prov.author)  log(`     author:     ${prov.author}`);
      if (prov.license) log(`     license:    ${prov.license}`);
      if (_lowConfidence) log(`     ${yellow('⚠  Low confidence — manual verification recommended')}`);
      results[skillName] = { tier: 3, provenance: prov, lowConfidence: !!_lowConfidence };
      summary.tier3.push(skillName);
      continue;
    }

    log(`  ${red('❌ Unresolved')} — no source found`);
    results[skillName] = { tier: 0, provenance: {} };
    summary.unresolved.push(skillName);
  }

  // ── Summary ──────────────────────────────────────────────────────────────
  log('\n');
  log('─'.repeat(56));
  log(bold('📊 Summary'));
  log('');
  log(`  Already resolved (skipped):  ${alreadyResolved.length}`);
  log(`  ${green('✅ Tier 1 — local frontmatter:')}  ${summary.tier1.length}`);
  log(`  ${cyan('🌐 Tier 2 — online registries:')}  ${summary.tier2.length}`);
  log(`  ${yellow('🟡 Tier 3 — heuristics:        ')} ${summary.tier3.length}`);
  log(`  ${red('❌ Unresolved:                 ')} ${summary.unresolved.length}`);

  if (summary.tier3.length > 0) {
    log('');
    log(yellow('  Tier 3 heuristic results need manual verification:'));
    summary.tier3.forEach(n => {
      const r = results[n];
      log(`    ${n}  →  ${r.provenance.source}`);
    });
  }

  if (summary.unresolved.length > 0) {
    log('');
    log(red('  Unresolved skills (no source found anywhere):'));
    summary.unresolved.forEach(n => log(`    ${n}`));
    log(dim('  Tip: check if these are private/local skills, or try --verbose to see all lookup attempts.'));
  }

  // ── Write output ─────────────────────────────────────────────────────────
  log('');
  log('─'.repeat(56));

  const patchedSkills = { ...lockData.skills };
  for (const [skillName, result] of Object.entries(results)) {
    if (result.tier > 0) {
      patchedSkills[skillName] = { ...patchedSkills[skillName], ...result.provenance };
    }
  }

  const outputData = { ...lockData, skills: patchedSkills };
  const outputJson = JSON.stringify(outputData, null, 2);

  if (APPLY) {
    fs.writeFileSync(OUTPUT_PATH, outputJson, 'utf8');
    log(`💾 Patched lock file written to: ${bold(OUTPUT_PATH)}`);
    log(dim('   Review the file before replacing your original skills-lock.json.'));
  } else {
    log(`📋 Report complete. ${bold('No files were modified.')} (run with --apply to write ${OUTPUT_PATH})`);
    log('');
    log(dim('  Proposed changes preview:'));
    for (const [name, result] of Object.entries(results)) {
      if (result.tier > 0 && result.provenance.source) {
        log(dim(`    ${name}: source → "${result.provenance.source}"`));
      }
    }
  }

  log('');
}

main().catch(e => { console.error('Fatal error:', e); process.exit(1); });
