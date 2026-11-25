import assert from 'node:assert/strict';
import {existsSync} from 'node:fs';

const site=existsSync(new URL('../dev/index.html',import.meta.url))?'../dev/':'../';
const {register:registerAuth}=await import(site+'src/services/auth.js');

function element(){
  const listeners=new Map();
  return {
    addEventListener:(type,callback)=>listeners.set(type,callback),
    fire:(type,event={})=>listeners.get(type)?.(event)
  };
}

let dialog;
let form;
let status;
let submit;
let cancel;
let mobile=false;
let attempts=0;
let signouts=0;
let routes=0;
let toast;
let outcome='invalid';
const location={hash:'#/home'};
globalThis.location=location;
globalThis.history={replaceState:(_state,_title,hash)=>{location.hash=hash;}};
globalThis.window={matchMedia:()=>({matches:mobile})};
globalThis.document={
  getElementById:()=>dialog,
  body:{append:node=>{dialog=node;}},
  createElement:()=>{
    form=element();
    status={hidden:true};
    submit=element();
    cancel=element();
    form.elements={email:{value:' owner@example.test '},password:{value:'fixture',focus(){}}};
    form.querySelector=selector=>selector.includes('submit')?submit:selector.includes('button')?cancel:status;
    const node=element();
    return Object.assign(node,{
      setAttribute(){},
      style:{},
      querySelector:()=>form,
      showModal(){this.open=true;},
      close(){this.open=false;this.fire('close');},
      remove(){dialog=undefined;}
    });
  }
};
const context={};
registerAuth(context);
Object.assign(context,{
  applyOwnerMode(){},
  clearOwnerOnlyClientState(){},
  writeOwnerBuyerPreviewPreference(){},
  showToast(message){toast=message;},
  loadCards:async()=>true,
  verifyOwnerSession:async()=>outcome==='owner',
  loadCollectionCardOrder:async()=>{},
  loadCollectionGameOrder:async()=>{},
  loadInventoryCardOrder:async()=>{},
  loadInventoryGameOrder:async()=>{},
  router:()=>{routes++;},
  supabaseClient:{auth:{
    async signInWithPassword(credentials){
      assert.deepEqual(credentials,{email:'owner@example.test',password:'fixture'});
      attempts++;
      return outcome==='invalid'?{error:'Invalid fixture'}:{data:{session:{user:{id:'fixture'}}}};
    },
    async signOut(){signouts++;}
  }}
});
function open(){
  location.hash='#/owner-login';
  context.openOwnerLoginFromUrl();
  assert.equal(location.hash,'#/home');
}
async function submitCredentials(){
  form.elements.password.value='fixture';
  await form.fire('submit',{preventDefault(){}});
}

context.openOwnerLoginFromUrl();
assert.equal(dialog,undefined);
open();
assert.equal(dialog.open,true);
assert.match(dialog.innerHTML,/type="password"/);
const first=dialog;
open();
assert.equal(dialog,first);
await submitCredentials();
assert.equal(status.textContent,'Login failed');
assert.equal(form.elements.password.value,'');
assert.equal(context.isOwnerMode(),false);
outcome='non-owner';
await submitCredentials();
assert.equal(status.textContent,'This account is not authorized as owner');
assert.equal(signouts,1);
assert.equal(context.isOwnerMode(),false);
cancel.fire('click');
assert.equal(dialog,undefined);
outcome='owner';
open();
await Promise.all([submitCredentials(),submitCredentials()]);
assert.equal(attempts,3);
assert.equal(dialog,undefined);
assert.equal(context.isOwnerMode(),true);
open();
assert.equal(dialog,undefined);
assert.equal(signouts,1);
assert.equal(routes,1);
context.ownerSession=null;
context.ownerVerified=false;
mobile=true;
open();
await submitCredentials();
assert.equal(context.canManageCollectionOrder(),true);
assert.equal(context.isOwnerMode(),false);
open();
assert.equal(dialog,undefined);
assert.equal(signouts,1);
context.ownerSession=null;
context.ownerVerified=false;
mobile=false;
let failLoad;
const loading=new Promise((_resolve,reject)=>{failLoad=reject;});
context.loadCards=()=>{
  assert.equal(dialog,undefined,"The dialog closes before loading Owner data");
  return loading;
};
open();
const submission=submitCredentials();
await new Promise(resolve=>setImmediate(resolve));
assert.equal(dialog,undefined);
assert.equal(context.isOwnerMode(),true);
failLoad(new Error('Owner data load fixture'));
await submission;
assert.match(toast,/^Signed in, but the Owner view could not load/);
assert.equal(context.isOwnerMode(),true);
assert.equal(signouts,1);
console.log('Owner sign-in URL, retry, cancellation, verification, and desktop/mobile permission fixtures passed.');
