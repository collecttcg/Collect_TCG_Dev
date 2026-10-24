import test from 'node:test';
import assert from 'node:assert/strict';
import {
  extractCardCode,
  extractPsaCert,
  extractGradingCompany,
  extractGrade,
  findExistingCardByCode,
  buildCardScanResult,
  buildInventoryPriceRecommendation
} from '../dev/src/features/owner/card-scanner.js';

test('card scanner extracts ONE PIECE card numbers from OCR variants',()=>{
  assert.equal(extractCardCode('ONE PIECE OP05-119 Monkey D. Luffy'),'OP05-119');
  assert.equal(extractCardCode('ST 01 - 001 Straw Hat Crew'),'ST01-001');
  assert.equal(extractCardCode('Promo P - 001'),'P-001');
  assert.equal(extractCardCode('ordinary listing without a card code'),'');
});

test('card scanner extracts PSA slab details without treating years as certs',()=>{
  const text='2024 ONE PIECE PSA GEM MT 10 CERT # 12345678 OP05-119';
  assert.equal(extractGradingCompany(text),'PSA');
  assert.equal(extractGrade(text),'10');
  assert.equal(extractPsaCert(text),'12345678');
  assert.equal(extractPsaCert('2024 ONE PIECE CARD GAME'),'');
});

test('PSA QR URL can supply cert even when OCR misses it',()=>{
  const qr=['https://www.psacard.com/cert/87654321'];
  assert.equal(extractPsaCert('PSA GEM MT 10',qr),'87654321');
  assert.equal(extractGradingCompany('',qr),'PSA');
});

test('scanner recommends an existing inventory card only on exact card-code match',()=>{
  const cards=[
    {id:'1',name:'MONKEY D. LUFFY',card_code:'OP05-119',game:'One Piece Card Game'},
    {id:'2',name:'NAMI',card_code:'OP01-016',game:'One Piece Card Game'}
  ];
  assert.equal(findExistingCardByCode(cards,'op05-119')?.id,'1');
  assert.equal(findExistingCardByCode(cards,'OP05-118'),null);
  const result=buildCardScanResult('PSA GEM MT 10 CERT 12345678 OP05-119',[],cards);
  assert.equal(result.company,'PSA');
  assert.equal(result.grade,'10');
  assert.equal(result.cert,'12345678');
  assert.equal(result.card_code,'OP05-119');
  assert.equal(result.matched_card?.name,'MONKEY D. LUFFY');
});

test('price recommendation prefers sold same-grade comparables and returns median MYR',()=>{
  const cards=[
    {card_code:'OP05-119',price_myr:1000,availability:'Available',grading:[{company:'PSA',grade:'10'}]},
    {card_code:'OP05-119',price_myr:1200,availability:'Sold',grading:[{company:'PSA',grade:'10'}]},
    {card_code:'OP05-119',price_myr:1400,availability:'Sold',grading:[{company:'PSA',grade:'10'}]},
    {card_code:'OP05-119',price_myr:700,availability:'Sold',grading:[{company:'PSA',grade:'9'}]},
    {card_code:'OP01-016',price_myr:9999,availability:'Sold',grading:[{company:'PSA',grade:'10'}]}
  ];
  const recommendation=buildInventoryPriceRecommendation(cards,{card_code:'OP05-119',company:'PSA',grade:'10'});
  assert.equal(recommendation.myr,1300);
  assert.equal(recommendation.min_myr,1200);
  assert.equal(recommendation.max_myr,1400);
  assert.equal(recommendation.count,2);
  assert.match(recommendation.basis,/sold inventory comparables/);
});

test('price recommendation falls back to exact card-code inventory and ignores missing prices',()=>{
  const cards=[
    {card_code:'P-001',price_myr:500,availability:'Available',grading:[]},
    {card_code:'P-001',price_myr:700,availability:'Available',grading:[]},
    {card_code:'P-001',price_myr:null,availability:'Sold',grading:[]}
  ];
  const recommendation=buildInventoryPriceRecommendation(cards,{card_code:'P-001'});
  assert.equal(recommendation.myr,600);
  assert.equal(recommendation.count,2);
  assert.equal(buildInventoryPriceRecommendation(cards,{card_code:'P-999'}),null);
});
