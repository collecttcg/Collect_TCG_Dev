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
for(const required of [
  'Latest validated Development release: `2026-10-30-v04`',
  'Latest Production: `2026-10-30-v03`',
  'Development promoted from: `2026-10-30-v04`',
  'migrations/2026/',
  'QR Generator',
  'Owner-only AI Card Scanner',
  'established compact Owner Inventory Tools',
  'eBay Post Generator import-duty notice'
]){
  if(!baseline.includes(required)) throw new Error('Baseline missing required marker: '+required);
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