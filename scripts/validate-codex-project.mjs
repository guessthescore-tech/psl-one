#!/usr/bin/env node
/**
 * validate-codex-project.mjs
 * Verifies the Codex project configuration is complete and internally consistent.
 * Run: pnpm codex:validate  or  node scripts/validate-codex-project.mjs
 */

import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = process.cwd();
const errors = [];
const warnings = [];

// ── helpers ───────────────────────────────────────────────────────────────────

function check(label, filePath) {
  const full = join(ROOT, filePath);
  if (!existsSync(full)) {
    errors.push(`MISSING: ${filePath}  (${label})`);
    return false;
  }
  return true;
}

function checkContent(label, filePath, requiredStrings) {
  const full = join(ROOT, filePath);
  if (!existsSync(full)) {
    errors.push(`MISSING: ${filePath}  (${label})`);
    return;
  }
  const content = readFileSync(full, 'utf8');
  for (const required of requiredStrings) {
    if (!content.includes(required)) {
      errors.push(`CONTENT: ${filePath} missing required text: "${required}"  (${label})`);
    }
  }
}

function checkForbiddenContent(label, filePath, forbiddenPatterns) {
  const full = join(ROOT, filePath);
  if (!existsSync(full)) return;
  const content = readFileSync(full, 'utf8');
  for (const { pattern, reason } of forbiddenPatterns) {
    if (content.includes(pattern)) {
      errors.push(`FORBIDDEN: ${filePath} contains "${pattern}" — ${reason}  (${label})`);
    }
  }
}

function checkSkillFrontmatter(skillId) {
  const filePath = `.agents/skills/${skillId}/SKILL.md`;
  const full = join(ROOT, filePath);
  if (!existsSync(full)) {
    errors.push(`MISSING: ${filePath}  (skill frontmatter check)`);
    return;
  }
  const content = readFileSync(full, 'utf8');
  const lines = content.split('\n');
  if (lines[0] !== '---') {
    errors.push(`FRONTMATTER: ${filePath} must begin with --- on line 1 (Codex requires YAML frontmatter)`);
    return;
  }
  const closingIdx = lines.indexOf('---', 1);
  if (closingIdx < 2) {
    errors.push(`FRONTMATTER: ${filePath} has no closing --- for frontmatter block`);
    return;
  }
  const frontmatter = lines.slice(1, closingIdx).join('\n');
  if (!frontmatter.match(/^name:\s*\S/m)) {
    errors.push(`FRONTMATTER: ${filePath} missing "name:" field in YAML frontmatter`);
  }
  if (!frontmatter.match(/^description:\s*\S/m)) {
    errors.push(`FRONTMATTER: ${filePath} missing "description:" field in YAML frontmatter`);
  }
}

function checkUniqueSkillNames(skillIds) {
  const names = [];
  for (const skillId of skillIds) {
    const filePath = join(ROOT, `.agents/skills/${skillId}/SKILL.md`);
    if (!existsSync(filePath)) continue;
    const content = readFileSync(filePath, 'utf8');
    const match = content.match(/^name:\s*(.+)$/m);
    if (match) names.push(match[1].trim());
  }
  const seen = new Set();
  for (const name of names) {
    if (seen.has(name)) {
      errors.push(`DUPLICATE: skill name "${name}" appears more than once`);
    }
    seen.add(name);
  }
}

// ── 1. Root adapter files ─────────────────────────────────────────────────────
console.log('1. Root adapter files');

checkContent('Codex instructions (AGENTS.md)', 'AGENTS.md', [
  'Non-Negotiable Rules',
  'Safety Constraints',
  'acceptance gate',
  'Never bypass RBAC',
  'Do not activate the PSL season',
]);

// AGENTS.md must not contain forbidden patterns
checkForbiddenContent('AGENTS.md safety', 'AGENTS.md', [
  { pattern: 'git push', reason: 'AGENTS.md must not instruct automatic git push' },
  { pattern: 'git commit -m', reason: 'AGENTS.md must not instruct automatic git commit' },
  { pattern: 'terraform apply', reason: 'AGENTS.md must not instruct Terraform deployment' },
  { pattern: 'aws ', reason: 'AGENTS.md must not invoke AWS CLI commands' },
]);

checkContent('Claude instructions (CLAUDE.md)', 'CLAUDE.md', [
  'Never bypass RBAC',
  'Always write tests',
]);

// ── 2. Codex config ───────────────────────────────────────────────────────────
console.log('2. Codex config');

// Active config.toml must NOT exist (project-local loading not confirmed for 0.139.0)
if (existsSync(join(ROOT, '.codex/config.toml'))) {
  warnings.push('CONFIG: .codex/config.toml exists — project-local config loading is not confirmed for codex-cli 0.139.0; users should copy settings to ~/.codex/config.toml');
}

// Reference template must exist
check('Codex config reference', '.codex/config.toml.example');

// If reference exists, verify it does not contain forbidden settings
checkForbiddenContent('config.toml.example safety', '.codex/config.toml.example', [
  { pattern: 'danger-full-access', reason: 'unrestricted filesystem access must not be the default' },
  { pattern: 'network-full-access', reason: 'unrestricted network access must not be the default' },
  { pattern: 'OPENAI_API_KEY', reason: 'credentials must not be in repository config' },
  { pattern: 'AWS_ACCESS_KEY', reason: 'credentials must not be in repository config' },
  { pattern: 'approval_policy = "never"', reason: 'automatic blanket approval must not be the default' },
]);

// Must not claim unsupported keys are active
checkForbiddenContent('config.toml.example accuracy', '.codex/config.toml.example', [
  { pattern: 'project_doc = "AGENTS.md"', reason: 'project_doc is not a confirmed valid key for 0.139.0; AGENTS.md is auto-discovered' },
]);

check('.codex README', '.codex/README.md');

// ── 3. Agent role prompt files (Markdown, not TOML) ───────────────────────────
console.log('3. Agent role prompt files (.md)');

const agents = [
  'independent-code-reviewer',
  'implementation-engineer',
  'test-and-quality-reviewer',
  'security-reviewer',
  'architecture-reviewer',
];

for (const agent of agents) {
  const mdPath = `.codex/agents/${agent}.md`;
  const tomlPath = `.codex/agents/${agent}.toml`;

  check(`Agent prompt: ${agent}`, mdPath);

  // TOML files must NOT exist (unsupported schema in 0.139.0)
  if (existsSync(join(ROOT, tomlPath))) {
    errors.push(`UNSUPPORTED: ${tomlPath} — codex-cli 0.139.0 does not support --agent <file>; use .md role prompts instead`);
  }

  // Agent .md files must not document unsupported commands
  checkForbiddenContent(`Agent ${agent} usage`, mdPath, [
    { pattern: '--agent ', reason: 'codex exec --agent <file> is not supported in CLI 0.139.0' },
    { pattern: '--prompt ', reason: 'codex review --prompt is not supported; use positional PROMPT argument' },
    { pattern: 'git commit', reason: 'agent role prompts must not instruct automatic commits' },
    { pattern: 'git push', reason: 'agent role prompts must not instruct automatic pushes' },
    { pattern: 'terraform', reason: 'agent role prompts must not invoke Terraform' },
  ]);

  // Acceptance gate in implementation-engineer must use pnpm, not npm
  if (agent === 'implementation-engineer') {
    checkForbiddenContent('Implementation engineer gate', mdPath, [
      { pattern: 'npm run', reason: 'gate commands must use pnpm, not npm run' },
      { pattern: 'npx prisma', reason: 'gate commands must use pnpm --filter @psl-one/api prisma, not npx' },
    ]);
  }
}

// ── 4. Review agent prompts ───────────────────────────────────────────────────
console.log('4. Review agent prompts');

check('Security review prompt', '.codex/review-agents/security-review.md');
check('Performance review prompt', '.codex/review-agents/performance-review.md');
check('TRB review prompt', '.codex/review-agents/technical-review-board.md');
check('Review agents README', '.codex/review-agents/README.md');

// Review prompts must not document --prompt flag
for (const prompt of ['security-review.md', 'performance-review.md', 'technical-review-board.md', 'README.md']) {
  checkForbiddenContent(`review-agents/${prompt}`, `.codex/review-agents/${prompt}`, [
    { pattern: '--prompt ', reason: 'codex review --prompt is not supported; use positional PROMPT argument' },
  ]);
}

// ── 5. Skill directories ──────────────────────────────────────────────────────
console.log('5. Skills');

const skills = [
  { id: 'psl-one-project-context', refs: ['source-of-truth-map.md'] },
  { id: 'psl-one-independent-review', refs: ['review-checklist.md', 'severity-model.md', 'review-report-template.md'] },
  { id: 'psl-one-story-implementation', refs: ['story-workflow.md', 'acceptance-gate.md'] },
  { id: 'psl-one-database-change', refs: ['prisma-migration-checklist.md'] },
  { id: 'psl-one-security-review', refs: ['security-review-checklist.md'] },
  { id: 'psl-one-release-readiness', refs: ['release-readiness-checklist.md'] },
];

for (const skill of skills) {
  checkSkillFrontmatter(skill.id);
  for (const ref of skill.refs) {
    check(`Skill ref: ${skill.id}/${ref}`, `.agents/skills/${skill.id}/references/${ref}`);
  }
}

checkUniqueSkillNames(skills.map(s => s.id));

// Acceptance gate in skills must use pnpm, not npx prisma
checkForbiddenContent('acceptance-gate.md', '.agents/skills/psl-one-story-implementation/references/acceptance-gate.md', [
  { pattern: 'npm run', reason: 'gate commands must use pnpm' },
  { pattern: 'npx prisma', reason: 'gate commands must use pnpm --filter @psl-one/api prisma' },
]);

// ── 6. Engineering docs ───────────────────────────────────────────────────────
console.log('6. Engineering docs');

check('AI agent workflow doc', 'docs/engineering/AI-AGENT-WORKFLOW.md');

// AI-AGENT-WORKFLOW.md must not document unsupported commands
checkForbiddenContent('AI-AGENT-WORKFLOW.md accuracy', 'docs/engineering/AI-AGENT-WORKFLOW.md', [
  { pattern: '--agent ', reason: '--agent flag is not supported in codex-cli 0.139.0' },
  { pattern: '--prompt ', reason: '--prompt flag is not supported in codex review 0.139.0' },
]);

// ── 6b. Absolute path check ───────────────────────────────────────────────────
// Agent prompts and AGENTS.md must not hardcode local absolute paths
const absolutePathCheck = [
  { pattern: '/Users/', reason: 'hardcoded absolute paths are machine-specific and must not appear in agent files' },
];
checkForbiddenContent('AGENTS.md absolute paths', 'AGENTS.md', absolutePathCheck);
for (const agent of agents) {
  checkForbiddenContent(`Agent ${agent} absolute paths`, `.codex/agents/${agent}.md`, absolutePathCheck);
}

// ── 6c. H1 heading check ─────────────────────────────────────────────────────
function checkH1(label, filePath) {
  const full = join(ROOT, filePath);
  if (!existsSync(full)) return;
  const content = readFileSync(full, 'utf8');
  // Skip YAML frontmatter (---...---) if present
  let body = content;
  if (content.startsWith('---\n')) {
    const close = content.indexOf('\n---\n', 4);
    if (close !== -1) body = content.slice(close + 5);
  }
  if (!body.match(/^# \S/m)) {
    errors.push(`H1: ${filePath} must contain a valid H1 heading (# Title) after any frontmatter  (${label})`);
  }
}

checkH1('AGENTS.md heading', 'AGENTS.md');
checkH1('AI agent workflow heading', 'docs/engineering/AI-AGENT-WORKFLOW.md');
for (const agent of agents) {
  checkH1(`Agent ${agent} heading`, `.codex/agents/${agent}.md`);
}
for (const skill of skills) {
  checkH1(`Skill ${skill.id} heading`, `.agents/skills/${skill.id}/SKILL.md`);
}

// ── 7. Scripts ────────────────────────────────────────────────────────────────
console.log('7. Scripts');

check('This validation script', 'scripts/validate-codex-project.mjs');

// Validator must use node: protocol imports
checkContent('Validator imports', 'scripts/validate-codex-project.mjs', [
  "from 'node:fs'",
  "from 'node:path'",
  '#!/usr/bin/env node',
]);

// ── 8. Package.json script ────────────────────────────────────────────────────
console.log('8. Package.json script');

const pkgPath = join(ROOT, 'package.json');
let pkg;
try {
  pkg = JSON.parse(readFileSync(pkgPath, 'utf8'));
} catch (e) {
  errors.push(`INVALID JSON: package.json — ${e.message}`);
}

if (pkg) {
  for (const scriptName of ['codex:validate', 'docs:validate']) {
    if (!pkg.scripts || !pkg.scripts[scriptName]) {
      errors.push(`MISSING: package.json "${scriptName}" script`);
    }
    const scriptCount = Object.keys(pkg.scripts || {}).filter(k => k === scriptName).length;
    if (scriptCount > 1) {
      errors.push(`DUPLICATE: package.json has more than one "${scriptName}" entry`);
    }
  }
}

// ── 9. Safety alignment ───────────────────────────────────────────────────────
console.log('9. Safety constraint alignment');

const agentsMd = existsSync(join(ROOT, 'AGENTS.md'))
  ? readFileSync(join(ROOT, 'AGENTS.md'), 'utf8') : '';
const claudeMd = existsSync(join(ROOT, 'CLAUDE.md'))
  ? readFileSync(join(ROOT, 'CLAUDE.md'), 'utf8') : '';

const sharedRules = [
  'Never bypass RBAC',
  'Never bypass audit logs',
  'Never store business logic in frontend',
  'Always write tests',
  'Always use domain boundaries',
];
for (const rule of sharedRules) {
  if (agentsMd && !agentsMd.includes(rule)) {
    warnings.push(`ALIGNMENT: AGENTS.md missing rule: "${rule}"`);
  }
  if (claudeMd && !claudeMd.includes(rule)) {
    warnings.push(`ALIGNMENT: CLAUDE.md missing rule: "${rule}"`);
  }
}

// AGENTS.md must not instruct modification of CLAUDE.md — check for "edit/modify/update CLAUDE.md" patterns
if (agentsMd && agentsMd.match(/(?:edit|modify|update)\s+CLAUDE\.md/i)) {
  warnings.push('ALIGNMENT: AGENTS.md appears to instruct modification of CLAUDE.md — agents must not edit adapter configuration');
}

// ── 10. Scope check — protected files must not be listed as targets ────────────
console.log('10. Protected scope check');

const protectedPaths = ['apps/', 'services/', 'packages/', 'infra/', 'CLAUDE.md', '.claude/'];
// We cannot check git diff in the validator, but we can warn if agent prompts reference editing protected dirs
for (const agent of agents) {
  const mdPath = join(ROOT, `.codex/agents/${agent}.md`);
  if (!existsSync(mdPath)) continue;
  const content = readFileSync(mdPath, 'utf8');
  if (content.match(/edit.*CLAUDE\.md|modify.*CLAUDE\.md/i)) {
    errors.push(`FORBIDDEN: .codex/agents/${agent}.md instructs editing CLAUDE.md`);
  }
}

// ── Report ────────────────────────────────────────────────────────────────────
console.log('\n── Results ─────────────────────────────────────────────────────\n');

if (warnings.length > 0) {
  console.log('Warnings:');
  for (const w of warnings) console.log('  !  ' + w);
  console.log('');
}

if (errors.length > 0) {
  console.log('Errors:');
  for (const e of errors) console.log('  x  ' + e);
  console.log('');
  console.log(`FAIL -- ${errors.length} error(s), ${warnings.length} warning(s)`);
  process.exit(1);
} else {
  console.log(`PASS -- 0 errors, ${warnings.length} warning(s)`);
  console.log('');
  console.log('Codex project configuration is complete and consistent.');
}
