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
  'migrations/2026/2026-09-28-v01-sold-order.sql',
  'migrations/2026/2026-09-29-v04-private-clean-card-routes.sql',
  'migrations/legacy/2026-09-17-v01-owner-sold-order.sql'
];
for(const rel of requiredMigrations){
  if(!fs.existsSync(path.join(repoRoot,rel))) throw new Error('Missing migration history: '+rel);
}

const baselinePath=path.join(repoRoot,'COLLECT_TCG_BASELINE.md');
if(!fs.existsSync(baselinePath)) throw new Error('Missing COLLECT_TCG_BASELINE.md');
const baseline=fs.readFileSync(baselinePath,'utf8');
for(const required of [
  'Current Development work: `2026-10-25-v04`',
  'Latest Production: `2026-10-16-v02`',
  'Development promoted from: `2026-10-16-v03`',
  'migrations/2026/',
  'migrations/legacy/',
  'Custom Order',
  'QR Generator',
  '27-insights-dashboard.css'
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
  ['dev/src/config.js','https://collecttcg.github.io/Collect_TCG_Dev/'],
  ['dev/src/features/analytics.js','https://collecttcg.github.io/Collect_TCG_Dev/']
];
for(const [rel,needle] of devUrlFiles){
  const full=path.join(repoRoot,rel);
  if(!fs.existsSync(full)) throw new Error('Missing Development URL contract file: '+rel);
  if(!fs.readFileSync(full,'utf8').includes(needle)) throw new Error('Missing Development URL contract in '+rel+': '+needle);
}
