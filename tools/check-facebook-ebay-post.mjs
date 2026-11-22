import assert from 'node:assert/strict';
import {existsSync} from 'node:fs';

const source=existsSync(new URL('../dev/src',import.meta.url)) ? '../dev/src' : '../src';
const {registerFeatures}=await import(source+'/app/register-features.js');

const a={};
registerFeatures(a);
a.escapeHtml=value=>String(value??"");
const card=(id,name,owner,era='Vintage')=>({
  id,name,era,game:'One Piece Carddass Hyper Battle',year:1999,series:'1st Stage',card_code:'C0'+id,
  _owner_category:owner,ebay_url:'https://www.ebay.com/itm/12345'+id,
  images:['https://photos.test/first-'+id+'.jpg','https://photos.test/second-'+id+'.jpg']
});
const zoro=card(6,'ERROR ZORO','Zakwan');
const vivi={...card(7,'VIVI','Yen','Modern'),year:2024};
a.cards=[vivi,zoro,{...card(8,'Missing link','Yen'),ebay_url:'',on_ebay:true},
  {...card(9,'Sold card','Yen'),availability:'Sold'},
  {...card(10,'Draft card','Yen'),lifecycle_status:'draft'},
  {...card(11,'Invalid link','Yen'),ebay_url:'https://example.test/itm/11'}];
assert.deepEqual(a.facebookEbayListingEntries(a.cards).map(entry=>entry.card.id),[6,7]);
const undated={...card(12,'Undated','Yen'),year:null};
const range={...card(13,'Year range','Yen'),year:'2001 – 2003'};
const sameYear={...card(14,'Same year','Yen'),year:'1999'};
assert.deepEqual(
  a.facebookEbayListingEntries([undated,vivi,range,sameYear,zoro]).map(entry=>entry.card.id),
  [14,6,13,7,12]
);
assert.equal(a.buildFacebookEbayListingsPost([]),'');
a.currentHashParams=()=>new URLSearchParams('mode=facebook-ebay');
assert.equal(a.currentFacebookToolMode(),'facebook-ebay');
assert.match(a.facebookToolsHeaderHTML('facebook-ebay'),/Facebook Post · eBay Listings/);

const elements=new Map();
const element=selector=>{
  if(!elements.has(selector)) elements.set(selector,{value:'',addEventListener(event,fn){this[event]=fn;}});
  return elements.get(selector);
};
const root={querySelector:element};
a.view={innerHTML:'',querySelector:()=>root};
a.requireOwner=()=>false;
a.renderFacebookEbayListingsPage();
assert.equal(a.view.innerHTML,'');
a.requireOwner=()=>true;
a.renderFacebookEbayListingsPage();
const picker=element('[data-picker]');
const preview=element('[data-post]');
assert.equal(element('[data-copy]').disabled,true);
assert.match(picker.innerHTML,/ZORO[\s\S]*1999[\s\S]*VIVI[\s\S]*2024/);
element('[data-owner]').value='Yen';
element('[data-owner]').change();
element('[data-era]').value='Modern';
element('[data-era]').change();
element('[data-select]').click();
assert.match(preview.value,/1\. VIVI C07/);
element('[data-era]').value='';
element('[data-era]').change();
element('[data-owner]').value='Zakwan';
element('[data-owner]').change();
assert.match(picker.innerHTML,/ZORO/);
assert.doesNotMatch(picker.innerHTML,/VIVI|Missing link|Sold card|Draft card|Invalid link/);
element('[data-era]').value='Modern';
element('[data-era]').change();
assert.match(picker.innerHTML,/No available cards/);
element('[data-era]').value='Vintage';
element('[data-era]').change();
element('[data-select]').click();
assert.match(preview.value,/1\. ZORO C06 · 1st Stage · 1999 · ERROR\n🛒 https:\/\/www.ebay.com\/itm\/123456/);
assert.match(preview.value,/2\. VIVI C07/);
assert.match(element('[data-count]').textContent,/1 outside current filters/);
let copied;
a.copyTextToClipboard=async value=>{copied=value;return true;};
await element('[data-copy]').click();
assert.equal(copied,preview.value);

const fetched=[];
const zipEntries=[];
let filename;
a.ensureJsZip=async()=>class {
  file(name){zipEntries.push(name);}
  async generateAsync(){return new Blob();}
};
a.imageSourceToBlob=async url=>{fetched.push(url);return new Blob([],{type:'image/jpeg'});};
globalThis.document={
  createElement:()=>({click(){filename=this.download;},remove(){}}),
  body:{appendChild(){}}
};
await element('[data-zip]').click();
assert.deepEqual(fetched,[zoro.images[0],vivi.images[0]]);
assert.equal(zipEntries.length,2);
assert.match(zipEntries[0],/^001.*ZORO.*\.jpg$/);
assert.match(zipEntries[1],/^002.*VIVI.*\.jpg$/);
assert.match(filename,/^Collect-TCG-Facebook-eBay-Listings-.*\.zip$/);
const partial=await a.downloadCardListFirstImagesZip([{...zoro,images:[]},vivi],null,{reportMissing:true});
assert.equal(partial.added,1);
assert.equal(partial.failed[0].reason,'No first photo');
await assert.rejects(a.downloadCardListFirstImagesZip([{...zoro,images:[]}],null,{reportMissing:true}),/None of the 1 first images/);
element('[data-clear]').click();
assert.equal(preview.value,'');
assert.equal(element('[data-zip]').disabled,true);
console.log('Facebook eBay mode, Owner gate, eligibility, filters, selection, output, copy and ordered first-photo ZIP fixtures passed.');
