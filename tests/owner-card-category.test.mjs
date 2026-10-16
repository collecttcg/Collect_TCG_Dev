import test from 'node:test';
import assert from 'node:assert/strict';
import { register } from '../dev/src/features/owner/card-owner-category.js';

test('owner card categories stay private while Add/Edit and owner filters can use them', async ()=>{
  const elements={};
  const cards=[{id:'1',name:'A'},{id:'2',name:'B'}];
  let ownerMode=true;

  const appContext={
    escapeHtml:value=>String(value),
    sanitizeOwnerTags:value=>{
      const list=Array.isArray(value)?value:String(value||'').split(',');
      return list.map(item=>String(item).trim()).filter(Boolean).slice(0,12);
    },
    sanitizeOwnerPrivateNotes:value=>String(value||''),
    fieldsTemplate:prefix=>`<div class="owner-private-fields"><div class="field">\n          <label for="${prefix}OwnerTags">Private owner tags</label><input id="${prefix}OwnerTags"></div></div>`,
    populateFields:()=>{},
    collectFields:()=>({_owner_tags:['Priority'],_owner_notes:''}),
    fetchOwnerPrivateMeta:async()=>({tags:['__owner_category__:Yen','Priority'],notes:'private'}),
    loadCards:async()=>true,
    getFiltered:()=>cards.slice(),
    inventoryPageHTML:()=>'<div class="filter-row"><div class="overview-select" id="sortByWrap"></div></div>',
    renderInventoryPage:()=>{},
    renderHiddenListingsPage:()=>{},
    isOwnerMode:()=>ownerMode,
    ownerPrivateSupported:true,
    cards,
    safeCardId:value=>String(value||''),
    getCardById:id=>cards.find(card=>card.id===id),
    $:id=>elements[id]||null,
    supabaseClient:{
      from:()=>({
        select:async()=>({
          data:[
            {card_id:'1',tags:['__owner_category__:Zakwan']},
            {card_id:'2',tags:[]}
          ],
          error:null
        }),
        upsert:rows=>({rows})
      })
    },
    view:null
  };

  register(appContext);

  const addHtml=appContext.fieldsTemplate('add');
  for(const owner of ['Zakwan','Yen','Daniel','Jack']) assert.match(addHtml,new RegExp(`>${owner}<`));
  assert.match(addHtml,/id="addOwnerCategory" required/);
  assert.match(addHtml,/Select owner/);

  elements.addOwnerCategory={value:'Daniel'};
  const collected=appContext.collectFields('add',null,{});
  assert.equal(collected._owner_category,'Daniel');
  assert.equal(collected._owner_tags[0],'__owner_category__:Daniel');

  const privateMeta=await appContext.fetchOwnerPrivateMeta('2');
  assert.equal(privateMeta.owner_category,'Yen');
  assert.deepEqual(privateMeta.tags,['Priority']);

  await appContext.loadCards();
  assert.equal(cards[0]._owner_category,'Zakwan');
  assert.equal(cards[1]._owner_category,'');

  appContext.ownerCategoryFilter='Zakwan';
  assert.deepEqual(appContext.getFiltered().map(card=>card.id),['1']);
  assert.match(appContext.inventoryPageHTML(),/filterOwnerCategory/);

  cards[0]._owner_category='Zakwan';
  const bulkLikeSave=appContext.supabaseClient
    .from('card_owner_private')
    .upsert([{card_id:'1',tags:[]}]);
  assert.equal(bulkLikeSave.rows[0].tags[0],'__owner_category__:Zakwan');

  ownerMode=false;
  assert.doesNotMatch(appContext.inventoryPageHTML(),/filterOwnerCategory/);
  assert.deepEqual(appContext.getFiltered().map(card=>card.id),['1','2']);
});
