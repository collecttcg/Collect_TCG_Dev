import fs from 'node:fs';

const workflow=fs.readFileSync('.github/workflows/dev-seo.yml','utf8');
const forbidden=[
  'RELEASE_VERSION',
  'PREVIOUS_VERSION',
  'release-manifests/',
  'Create Development release packages',
  'Upload Development release packages',
  'tools/release-contracts.sh'
];
for(const marker of forbidden){
  if(workflow.includes(marker)) throw new Error(`SEO workflow is coupled to release state: ${marker}`);
}
if(/grep[^\n]*\?v=20\d{2}-/.test(workflow)){
  throw new Error('SEO workflow contains a release-specific cache-version assertion.');
}
if(/git diff --check/.test(workflow)){
  throw new Error('SEO workflow must not fail on generated-file whitespace; repository diff validation belongs to the release gate.');
}
console.log('SEO workflow is release-agnostic.');
