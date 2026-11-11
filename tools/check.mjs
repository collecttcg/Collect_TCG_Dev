import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const devRoot=path.join(repoRoot,'dev');
let count=0;
const walk=(dir)=>{
  for(const entry of fs.readdirSync(dir,{withFileTypes:true})){
    const full=path.join(dir,entry.name);
    if(entry.isDirectory())walk(full);
    else if(entry.isFile()&&entry.name.endsWith('.js'))count++;
  }
};
walk(devRoot);

const requiredMigrations=[
  'migrations/2026/2026-09-28-v02-PUBLIC-SOLD-ORDER.sql',
  'migrations/2026/2026-09-28-v04-PRIVATE-CARD-ROUTES.sql',
  'migrations/2026/2026-10-25-v07-EBAY-BANLIST.sql',
  'migrations/legacy/V208-GIVEAWAY-FACEBOOK-GROUP-BONUS.sql'
];
for(const rel of requiredMigrations){
  if(!fs.existsSync(path.join(repoRoot,rel))) throw new Error('Missing migration history: '+rel);
}

const baselinePath=path.join(repoRoot,'COLLECT_TCG_BASELINE.md');
if(!fs.existsSync(baselinePath)) throw new Error('Missing COLLECT_TCG_BASELINE.md');
const baseline=fs.readFileSync(baselinePath,'utf8');
const currentSection=baseline.split('## Current reconciled state')[1]?.split('## Historical Development release record')[0]||baseline;
const hasVersion=(text,label)=>text.split('\n').some(line=>line.startsWith('- '+label+': `') && /`\d{4}-\d{2}-\d{2}-v\d{2}`/.test(line));
if(!(hasVersion(currentSection,'Development')||/Latest validated Development release: `\d{4}-\d{2}-\d{2}-v\d{2}`/.test(baseline))) throw new Error('Baseline missing valid latest Development release marker.');
if(!(hasVersion(currentSection,'Production')||/Latest Production: `\d{4}-\d{2}-\d{2}-v\d{2}`/.test(baseline))) throw new Error('Baseline missing valid latest Production release marker.');
if(!baseline.split('\n').some(line=>line.includes('previous `')||line.startsWith('Previous Production: `'))) throw new Error('Baseline missing previous Production marker.');
if(!currentSection.split('\n').some(line=>line.startsWith('- Production:')&&line.includes('manifest `release-manifests/')) && !baseline.includes('Production release manifest: `release-manifests/')) throw new Error('Baseline missing Production manifest marker.');
for(const required of [
  'migrations/2026/',
  'QR Generator',
  'Owner-only AI Card Scanner',
  'Owner Inventory Tools'
]){
  if(!baseline.includes(required)) throw new Error('Baseline missing required retained-behavior marker: '+required);
}

const styleOrder=JSON.parse(fs.readFileSync(path.join(repoRoot,'docs/style-order.json'),'utf8'));
for(const row of styleOrder){
  const file=path.join(devRoot,row.file);
  if(!fs.existsSync(file)) throw new Error('Missing documented stylesheet: '+row.file);
}

console.log(`Checked ${count} JavaScript files, imports, HTML assets, migrations and repository structure.`);

const devUrlFiles=[
  ['dev/index.html','https://collecttcg.github.io/Collect_TCG_Dev/'],
  ['dev/src/config.js','https://collecttcg.github.io/Collect_TCG_Dev/']
];
for(const [rel,expected] of devUrlFiles){
  const file=path.join(repoRoot,rel);
  if(!fs.existsSync(file)) continue;
  const src=fs.readFileSync(file,'utf8');
  if(!src.includes(expected)) throw new Error(`${rel} missing Development base URL`);
}
