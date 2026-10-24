import test from 'node:test';
import assert from 'node:assert/strict';
import {
  extractCardCode, extractPsaCert, extractGradingCompany, extractGrade, extractYear, extractLanguage, extractGame, extractPsaLabelName,
  resolveCreateWorker, findExistingCardByCode, buildCardScanResult, buildInventoryPriceRecommendation, buildMarketSearches, normalizeAiScanResult, normalizeAiMarketPrice
} from '../dev/src/features/owner/card-scanner.js';

test('card scanner extracts ONE PIECE card numbers from OCR variants',()=>{
  assert.equal(extractCardCode('ONE PIECE OP05-119 Monkey D. Luffy'),'OP05-119');
  assert.equal(extractCardCode('ST 01 - 001 Straw Hat Crew'),'ST01-001');
  assert.equal(extractCardCode('Promo P - 001'),'P-001');
  assert.equal(extractCardCode('1999 ONE PIECE CHB #C01'),'C01');
  assert.equal(extractCardCode(`HYPER BATTLE\nG415`),'G415');
  assert.equal(extractCardCode('C410'),'C410');
  assert.equal(extractCardCode('C 410'),'C410');
  assert.equal(extractCardCode('OCR noise S 48 near artwork'),'');
  assert.equal(extractCardCode('OCR 8717-0041'),'ST17-004');
  assert.equal(extractCardCode('ordinary listing without a card code'),'');
});

test('card scanner extracts PSA slab details without treating years as certs',()=>{
  const text='2024 ONE PIECE PSA GEM MT 10 CERT # 12345678 OP05-119';
  assert.equal(extractGradingCompany(text),'PSA'); assert.equal(extractGrade(text),'10'); assert.equal(extractPsaCert(text),'12345678'); assert.equal(extractPsaCert('2024 ONE PIECE CARD GAME'),'');
});

test('PSA QR URL can supply cert even when OCR misses it',()=>{
  const qr=['https://www.psacard.com/cert/87654321']; assert.equal(extractPsaCert('PSA GEM MT 10',qr),'87654321'); assert.equal(extractGradingCompany('',qr),'PSA');
});

test('scanner recommends an existing inventory card only on exact card-code match',()=>{
  const cards=[{id:'1',name:'MONKEY D. LUFFY',card_code:'OP05-119',game:'One Piece Card Game'},{id:'2',name:'NAMI',card_code:'OP01-016',game:'One Piece Card Game'}];
  assert.equal(findExistingCardByCode(cards,'op05-119')?.id,'1'); assert.equal(findExistingCardByCode(cards,'OP05-118'),null);
  const result=buildCardScanResult('PSA GEM MT 10 CERT 12345678 OP05-119',[],cards);
  assert.equal(result.company,'PSA'); assert.equal(result.grade,'10'); assert.equal(result.cert,'12345678'); assert.equal(result.card_code,'OP05-119'); assert.equal(result.matched_card?.name,'MONKEY D. LUFFY');
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
  assert.equal(recommendation.myr,1300); assert.equal(recommendation.min_myr,1200); assert.equal(recommendation.max_myr,1400); assert.equal(recommendation.count,2); assert.match(recommendation.basis,/sold inventory comparables/);
});

test('raw recommendation excludes graded copies and prefers sold raw copies',()=>{
  const cards=[
    {card_code:'C410',price_myr:20,availability:'Available',format:'Raw',grading:[]},
    {card_code:'C410',price_myr:30,availability:'Sold',format:'Raw',grading:[]},
    {card_code:'C410',price_myr:40,availability:'Sold',format:'Raw',grading:[]},
    {card_code:'C410',price_myr:500,availability:'Sold',format:'Graded',grading:[{company:'PSA',grade:'10'}]}
  ];
  const recommendation=buildInventoryPriceRecommendation(cards,{card_code:'C410'}); assert.equal(recommendation.myr,35); assert.equal(recommendation.count,2); assert.match(recommendation.basis,/sold raw/);
});

test('raw recommendation never falls back to graded-only prices',()=>{
  const cards=[{card_code:'C410',price_myr:500,availability:'Sold',format:'Graded',grading:[{company:'PSA',grade:'10'}]}];
  assert.equal(buildInventoryPriceRecommendation(cards,{card_code:'C410',format:'Raw'}),null);
});

test('price recommendation falls back to exact raw card-code inventory and ignores missing prices',()=>{
  const cards=[{card_code:'P-001',price_myr:500,availability:'Available',grading:[]},{card_code:'P-001',price_myr:700,availability:'Available',grading:[]},{card_code:'P-001',price_myr:null,availability:'Sold',grading:[]}];
  const recommendation=buildInventoryPriceRecommendation(cards,{card_code:'P-001'}); assert.equal(recommendation.myr,600); assert.equal(recommendation.count,2); assert.equal(buildInventoryPriceRecommendation(cards,{card_code:'P-999'}),null);
});

test('AI result clears grading data for raw cards and keeps general TCG metadata',()=>{
  const raw=normalizeAiScanResult({name:'Laboon',card_code:'C410',year:'2001',game:'One Piece',language:'Japanese',series:'Hyper Battle',era:'Vintage',format:'Raw',condition:'NM',grading_company:'PSA',grade:'10',cert:'12345678',confidence:.91},[]);
  assert.equal(raw.name,'Laboon'); assert.equal(raw.card_code,'C410'); assert.equal(raw.language,'JP'); assert.equal(raw.format,'Raw'); assert.equal(raw.company,''); assert.equal(raw.grade,''); assert.equal(raw.cert,'');
  const pokemon=normalizeAiScanResult({name:'Charizard',card_code:'4/102',game:'Pokémon',language:'English',series:'Base Set',era:'Vintage',format:'Raw',condition:'LP',confidence:.8},[]);
  assert.equal(pokemon.game,'Pokémon'); assert.equal(pokemon.card_code,'4/102'); assert.equal(pokemon.language,'ENG');
});

test('AI web market price is normalized conservatively',()=>{
  const price=normalizeAiMarketPrice({myr:120,min_myr:100,max_myr:140,count:3,basis:'recent exact raw sales',confidence:.82,sources:[{title:'Market',url:'https://example.com/card'},{title:'bad',url:'javascript:alert(1)'}]});
  assert.equal(price.myr,120); assert.equal(price.min_myr,100); assert.equal(price.max_myr,140); assert.equal(price.count,3); assert.equal(price.sources.length,1); assert.equal(price.source,'ai_web');
  assert.equal(normalizeAiMarketPrice({myr:0,basis:'insufficient evidence'}),null);
});

test('market searches use detected identity without inventing a price',()=>{
  const searches=buildMarketSearches({card_code:'C410',name:'Laboon',year:'2001',game:'One Piece',language:'JP'}); assert.match(searches.query,/C410/); assert.match(searches.query,/Laboon/i); assert.match(searches.ebay,/ebay\.com\/sch/i); assert.match(searches.mercari,/jp\.mercari\.com\/search/i);
});

test('scanner parses the uploaded PSA examples into safe Add Card fields',()=>{
  const boa=`2024 ONE PIECE JP #004\nBOA HANCOCK GEM MT\nPB STORAGE BOX SET 10\n170896351\nST17-004`; const boaResult=buildCardScanResult(boa,[],[]);
  assert.equal(boaResult.name,'BOA HANCOCK'); assert.equal(boaResult.year,'2024'); assert.equal(boaResult.game,'One Piece'); assert.equal(boaResult.language,'JP'); assert.equal(boaResult.card_code,'ST17-004'); assert.equal(boaResult.grade,'10'); assert.equal(boaResult.cert,'170896351');
  const luffy=`1999 ONE PIECE CHB #C01\nLUFFY NM\nFIRST STAGE 7\n149834964`; const luffyResult=buildCardScanResult(luffy,[],[]);
  assert.equal(luffyResult.name,'LUFFY'); assert.equal(luffyResult.year,'1999'); assert.equal(luffyResult.card_code,'C01'); assert.equal(luffyResult.grade,'7'); assert.equal(luffyResult.cert,'149834964');
  const chineseBoa=`2025 ONE PIECE CS #066\nBOA HANCOCK GEM MT\nCHINESE NEW YEAR'S RED PACK 10\n108827378\nP-066`; const cnResult=buildCardScanResult(chineseBoa,[],[]);
  assert.equal(cnResult.name,'BOA HANCOCK'); assert.equal(cnResult.year,'2025'); assert.equal(cnResult.language,'CN'); assert.equal(cnResult.card_code,'P-066'); assert.equal(cnResult.grade,'10'); assert.equal(cnResult.cert,'108827378');
});

test('scanner metadata helpers stay conservative',()=>{
  assert.equal(extractYear('2024 ONE PIECE JP'),'2024'); assert.equal(extractYear('OCR noise 2000 without a label context'),''); assert.equal(extractLanguage('2025 ONE PIECE CHINESE NEW YEAR'),'CN'); assert.equal(extractLanguage('2024 ONE PIECE JP'),'JP'); assert.equal(extractGame('ONE PIECE CARD GAME'),'One Piece'); assert.equal(extractPsaLabelName('random raw card text'),'');
});

test('Tesseract createWorker resolver supports named and default ESM exports',()=>{
  const named=()=>{}; const fallback=()=>{}; assert.equal(resolveCreateWorker({createWorker:named}),named); assert.equal(resolveCreateWorker({default:{createWorker:fallback}}),fallback); assert.equal(resolveCreateWorker({default:{}}),null);
});
