import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { register } from '../dev/src/features/media/images.js';

const png=readFileSync(new URL('../dev/assets/sold-download-ribbon.png',import.meta.url));
assert.equal(png.readUInt32BE(16),810);
assert.equal(png.readUInt32BE(20),1080);
assert.equal(png[25],6);
const context={canonicalAvailability:value=>value};
register(context);
const draws=[];
let loaded=0;
globalThis.Image=class {
  set src(value){
    loaded++;
    assert.match(value,/\/assets\/sold-download-ribbon\.png$/);
    queueMicrotask(()=>this.onload());
  }
};
const canvasContext={fillRect(){},drawImage(...args){draws.push(args);}};
globalThis.document={createElement:()=>({getContext:()=>canvasContext})};
context.loadImageElementFromSource=async()=>({img:{naturalWidth:1000,naturalHeight:1500}});
context.canvasToBlob=async()=>new Blob();
await context.renderSoldDownloadBlob('photo',{availability:'Available'});
await context.renderSoldDownloadBlob('photo',{availability:'Reserved'});
assert.equal(draws.length,2);
assert.equal(loaded,0);
await context.renderSoldDownloadBlob('photo',{availability:'Sold'});
await context.renderSoldDownloadBlob('photo',{availability:'Sold'});
assert.equal(loaded,1);
assert.equal(draws.length,6);
assert.deepEqual(draws[3].slice(1,7),[0,0,548,548,0,0]);
assert.equal(draws[3][7],578*548/412);
assert.deepEqual(draws[3],draws[5]);

for(const [width,height,size] of [[1800,1385,533],[960,1280,493],[1350,1800,693]]){
  await context.drawSoldDownloadWatermark(canvasContext,{width,height});
  assert.equal(draws.at(-1)[7],size*548/412);
}
assert.equal(loaded,1);
