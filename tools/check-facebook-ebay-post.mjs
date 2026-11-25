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
const unassigned={...card(15,'UNASSIGNED CARD',''),year:2003};
const third={...card(16,'THIRD OWNER CARD','Third'),year:2002};
a.cards=[vivi,unassigned,third,zoro,{...card(8,'Missing link','Yen'),ebay_url:'',on_ebay:true},
  {...card(9,'Sold card','Yen'),availability:'Sold'},
  {...card(10,'Draft card','Yen'),lifecycle_status:'draft'},
  {...card(11,'Invalid link','Yen'),ebay_url:'https://example.test/itm/11'}];
assert.deepEqual(a.facebookEbayListingEntries(a.cards).map(entry=>entry.card.id),[6,16,15,7]);
const undated={...card(12,'Undated','Yen'),year:null};
const range={...card(13,'Year range','Yen'),year:'2001 – 2003'};
const sameYear={...card(14,'Same year','Yen'),year:'1999'};
assert.deepEqual(
  a.facebookEbayListingEntries([undated,vivi,range,sameYear,zoro]).map(entry=>entry.card.id),
  [14,6,13,7,12]
);
assert.equal(a.buildFacebookEbayListingsPost([]),'');
assert.match(a.buildFacebookEbayListingsPost(a.facebookEbayListingEntries([vivi,zoro])),/Listings are sorted by year, oldest first\./);
a.currentHashParams=()=>new URLSearchParams('mode=facebook-ebay');
assert.equal(a.currentFacebookToolMode(),'facebook-ebay');
assert.match(a.facebookToolsHeaderHTML('facebook-ebay'),/Share eBay Listings on Facebook/);

const elements=new Map();
const element=selector=>{
  if(!elements.has(selector)) elements.set(selector,{value:'',addEventListener(event,fn){this[event]=fn;}});
  return elements.get(selector);
};
const owners=element('[data-owners]');
let checkedOwners=[];
owners.querySelectorAll=selector=>{
  assert.equal(selector,'input:checked');
  return checkedOwners.map(value=>({value}));
};
function selectOwners(...values){
  checkedOwners=values;
  owners.change();
}
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
assert.match(picker.innerHTML,/UNASSIGNED CARD/);
selectOwners('Zakwan','Yen');
assert.match(picker.innerHTML,/ZORO[\s\S]*VIVI/);
assert.doesNotMatch(picker.innerHTML,/UNASSIGNED CARD|THIRD OWNER CARD/);
selectOwners('Zakwan','');
assert.match(picker.innerHTML,/ZORO[\s\S]*UNASSIGNED CARD/);
assert.doesNotMatch(picker.innerHTML,/VIVI|THIRD OWNER CARD/);
selectOwners('Zakwan','Yen');
element('[data-era]').value='Modern';
element('[data-era]').change();
element('[data-select]').click();
assert.match(preview.value,/1\. VIVI C07/);
element('[data-era]').value='';
element('[data-era]').change();
selectOwners('Zakwan');
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
const labels=[];
const labelFonts=new Set();
let disposed=0;
a.loadImageForCollectionCollage=async url=>({img:{url,width:300,height:400},cleanup(){disposed++;}});
globalThis.document.createElement=tag=>tag==='canvas'
  ? {getContext:()=>({fillRect(){},drawImage(){},fillText(n){labels.push(Number(n));labelFonts.add(this.font);}}),
     toBlob(callback){callback(new Blob([],{type:'image/jpeg'}));}}
  : {click(){filename=this.download;},remove(){}};
const many=Array.from({length:154},(_,index)=>card(index+20,'Listing','Zakwan'));
many[5].images=[];
zipEntries.length=0;
const collages=await a.downloadCardListFirstImagesZip(many,null,{maxImages:25,reportMissing:true});
assert.equal(collages.added,153);
assert.equal(collages.imageCount,18);
assert.equal(zipEntries.length,18);
assert.match(zipEntries[0],/^01 - Listings 1-9\.jpg$/);
assert.match(zipEntries.at(-1),/^18 - Listings 154-154\.jpg$/);
assert.deepEqual(labels,Array.from({length:154},(_,index)=>index+1).filter(n=>n!==6));
assert.deepEqual([...labelFonts],['bold 54px sans-serif']);
assert.equal(disposed,153);
assert.equal(collages.failed.length,1);
element('[data-clear]').click();
assert.equal(preview.value,'');
assert.equal(element('[data-zip]').disabled,true);
selectOwners('Zakwan','Yen');
element('[data-era]').value='';
element('[data-era]').change();
element('[data-select]').click();
assert.match(preview.value,/1\. ZORO[\s\S]*2\. VIVI/);
assert.doesNotMatch(preview.value,/UNASSIGNED CARD|THIRD OWNER CARD/);
selectOwners();
assert.match(picker.innerHTML,/UNASSIGNED CARD/);
assert.match(picker.innerHTML,/THIRD OWNER CARD/);
console.log('Facebook eBay mode, Owner gate, eligibility, filters, selection, output, copy and ordered first-photo ZIP fixtures passed.');

const nfs={...zoro,id:'nfs-card',availability:'Collection (NFS)'};
const sale={...zoro,id:'sale-card',availability:'Available'};
const fields=new Map();
const field=id=>{
  if(!fields.has(id)) fields.set(id,{value:'',addEventListener(event,fn){this[event]=fn;}});
  return fields.get(id);
};
const singleApp={};
delete globalThis.document;
registerFeatures(singleApp);
Object.assign(singleApp,{
  requireOwner:()=>true,
  escapeHtml:a.escapeHtml,
  localStorage:{getItem:()=>null},
  cards:[nfs,sale],
  view:{},
  $:field,
  currentHashParams:()=>new URLSearchParams('mode=single&card=nfs-card'),
  safeCardId:id=>id||"",
  getCardById:id=>singleApp.cards.find(item=>item.id===id),
  getImages:()=>[],
  FB_POST_DEFAULTS:{},
});
globalThis.location=new URL('https://example.test/dev/#/fb-tools');
singleApp.renderFbPostGeneratorPage();
assert.match(field('fbPostTitle').value,/COLLECTION SHOWCASE/);
assert.match(field('fbPostOutput').value,/NOT FOR SALE — PERSONAL COLLECTION/);
assert.match(field('fbPostOutput').value,/#\/collection/);
assert.equal(field('fbPostTemplateMode').disabled,true);
const panel={};
const tabs=['giveaway','winner'].map(mode=>({
  dataset:{giveawayPostMode:mode},
  classList:{toggle(){}},
  addEventListener(_event,fn){this.click=fn;},
  getAttribute:()=>"#/fb-tools?mode="+mode,
  setAttribute(_key,value){this.current=value;},
  removeAttribute(){delete this.current;}
}));
let mode='giveaway';
let shellRenders=0;
Object.assign(singleApp.view,{
  querySelector:selector=>selector==="[data-giveaway-post-panel]" && shellRenders ? panel : null,
  querySelectorAll:()=>tabs,
  insertAdjacentHTML(_position,html){this.header=html;}
});
Object.defineProperty(singleApp.view,"innerHTML",{set(html){this.header=html;shellRenders++;}});
singleApp.currentHashParams=()=>new URLSearchParams('mode='+mode);
globalThis.history={pushState(_state,_title,hash){mode=hash.split('mode=')[1];}};
singleApp.renderFbGiveawayPostGeneratorPage=mount=>{assert.equal(mount,panel);mount.rendered='giveaway';};
singleApp.sortedPastGiveawayWinners=()=>[];
field('winnerPostSelectionList').querySelectorAll=()=>[];
singleApp.renderFacebookToolsPage();
assert.equal(panel.rendered,'giveaway');
assert.equal((singleApp.view.header.match(/role="tab"/g)||[]).length,6);
assert.match(singleApp.view.header,/Announce Giveaway/);
assert.match(singleApp.view.header,/Announce Winners/);
tabs[1].click({button:0,preventDefault(){}});
assert.equal(mode,'winner');
assert.equal(shellRenders,1);
assert.equal(tabs[1].current,'page');
assert.match(panel.innerHTML,/Winner Announcement/);
assert.match(field('winnerPostSelectionList').innerHTML,/No Past Winners/);
tabs[0].click({button:0,preventDefault(){}});
assert.equal(mode,'giveaway');
assert.equal(shellRenders,1);
assert.equal(tabs[0].current,'page');
delete globalThis.history;
singleApp.currentHashParams=()=>new URLSearchParams('mode=nfs');
singleApp.renderFacebookToolsPage();
assert.equal(field('fbPostStatusFilter').value,'Collection (NFS)');
assert.match(singleApp.view.header,/class="fb-tools-switch active"[\s\S]*?<strong>Single Card Post/);
delete globalThis.location;
