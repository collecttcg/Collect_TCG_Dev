// Development-only eBay OAuth connection manager. Never returns OAuth tokens.
import {createClient} from "https://esm.sh/@supabase/supabase-js@2";
const accounts=["collect_tcg_1","collect_tcg_2","collect_tcg_3","collect_tcg_4","collect_tcg_5"];
const scope="https://api.ebay.com/oauth/api_scope";
const cors={"Access-Control-Allow-Origin":"https://collecttcg.github.io","Access-Control-Allow-Headers":"authorization,apikey,content-type,x-client-info","Access-Control-Allow-Methods":"POST,OPTIONS"};
const respond=(body:unknown,status=200)=>new Response(JSON.stringify(body),{status,headers:{"content-type":"application/json","cache-control":"no-store",...cors}});
const env=(name:string)=>Deno.env.get(name)||"";
const db=()=>createClient(env("SUPABASE_URL"),env("SUPABASE_SERVICE_ROLE_KEY"),{auth:{persistSession:false}});
const encode=(bytes:Uint8Array)=>btoa(String.fromCharCode(...bytes));
const hash=async(s:string)=>Array.from(new Uint8Array(await crypto.subtle.digest("SHA-256",new TextEncoder().encode(s)))).map(x=>x.toString(16).padStart(2,"0")).join("");
async function key(){
 const raw=env("EBAY_TOKEN_ENCRYPTION_KEY");
 let bytes:Uint8Array;
 try{bytes=Uint8Array.from(atob(raw),x=>x.charCodeAt(0));}catch{throw Error("Encryption key not configured");}
 if(bytes.length!==32)throw Error("Encryption key not configured");
 return crypto.subtle.importKey("raw",bytes,"AES-GCM",false,["encrypt"]);
}
async function encrypt(value:string){
 const iv=crypto.getRandomValues(new Uint8Array(12));
 const encrypted=new Uint8Array(await crypto.subtle.encrypt({name:"AES-GCM",iv},await key(),new TextEncoder().encode(value)));
 return encode(iv)+"."+encode(encrypted);
}
async function owner(req:Request){
 const bearer=req.headers.get("authorization")?.replace(/^Bearer /,"")||"";
 if(!bearer)return null;
 const auth=createClient(env("SUPABASE_URL"),env("SUPABASE_ANON_KEY"),{auth:{persistSession:false}});
 const {data:{user},error}=await auth.auth.getUser(bearer);
 if(error||!user)return null;
 const {data:row,error:lookup}=await db().from("app_owners").select("user_id").eq("user_id",user.id).maybeSingle();
 return !lookup&&row?user.id:null;
}
const developmentLanding="https://collecttcg.github.io/Collect_TCG_Dev/";
const productionLanding="https://collecttcg.github.io/Collect_TCG/";
const redirect=(result:string,landing=developmentLanding)=>Response.redirect(landing+"?ebay_connection="+encodeURIComponent(result)+"#/reviews",302);
async function callback(url:URL){
 const state=url.searchParams.get("state")||"", code=url.searchParams.get("code")||"";
 if(!state)return redirect("cancelled");
 const stateHash=await hash(state);
 const client=db();
 const {data:record,error}=await client.from("ebay_oauth_states_dev").delete().eq("state_hash",stateHash).select("ebay_account,expires_at").maybeSingle();
 if(error||!record||Date.parse(record.expires_at)<Date.now())return redirect("invalid_state");
 const landing=state.startsWith("prod.")?productionLanding:developmentLanding;
 const finish=(result:string)=>redirect(result,landing);
 if(!code||url.searchParams.get("error"))return finish("cancelled");
 const id=env("EBAY_CLIENT_ID"),secret=env("EBAY_CLIENT_SECRET"),runame=env("EBAY_RUNAME");
 if(!id||!secret||!runame)return finish("configuration_missing");
 try{
  const response=await fetch("https://api.ebay.com/identity/v1/oauth2/token",{method:"POST",headers:{"authorization":"Basic "+btoa(id+":"+secret),"content-type":"application/x-www-form-urlencoded"},body:new URLSearchParams({grant_type:"authorization_code",code,redirect_uri:runame}),signal:AbortSignal.timeout(20000)});
  if(!response.ok)return finish("exchange_failed");
  const tokens=await response.json();
  if(!tokens.refresh_token||!tokens.access_token)return finish("refresh_missing");
  const xml='<?xml version="1.0" encoding="utf-8"?><GetUserRequest xmlns="urn:ebay:apis:eBLBaseComponents"><Version>1423</Version></GetUserRequest>';
  const check=await fetch("https://api.ebay.com/ws/api.dll",{method:"POST",headers:{"content-type":"text/xml","X-EBAY-API-CALL-NAME":"GetUser","X-EBAY-API-SITEID":"0","X-EBAY-API-COMPATIBILITY-LEVEL":"1423","X-EBAY-API-IAF-TOKEN":tokens.access_token},body:xml,signal:AbortSignal.timeout(20000)});
  const result=await check.text();
  const actual=result.split("<UserID>")[1]?.split("</UserID>")[0]||"";
  if(!check.ok||actual.toLowerCase()!==record.ebay_account.toLowerCase())return finish("account_mismatch");
  const encrypted=await encrypt(tokens.refresh_token);
  const {error:saveError}=await client.from("ebay_oauth_connections_dev").upsert({ebay_account:record.ebay_account,refresh_token_ciphertext:encrypted,updated_at:new Date().toISOString()},{onConflict:"ebay_account"});
  if(saveError)return finish("save_failed");
  await client.from("ebay_feedback_sync_accounts_dev").update({enabled:true,last_error:null}).eq("ebay_account",record.ebay_account);
  return finish("connected_"+record.ebay_account);
 }catch{return finish("connection_failed");}
}
Deno.serve(async req=>{
 if(req.method==="OPTIONS")return new Response(null,{status:204,headers:cors});
 const url=new URL(req.url);
 if(req.method==="GET"&&url.searchParams.has("state"))return callback(url);
 if(req.method!=="POST")return respond({error:"Method not allowed"},405);
 const userId=await owner(req);
 if(!userId)return respond({error:"Owner authorization required"},403);
 let input:{action?:string,account?:string,site?:string};
 try{input=await req.json();}catch{return respond({error:"Invalid JSON"},400);}
 if(input.action==="status"){
  const {data,error}=await db().from("ebay_oauth_connections_dev").select("ebay_account,connected_at,updated_at");
  if(error)return respond({error:"Unable to load connection status"},500);
  return respond({accounts:accounts.map(account=>({account,connected:!!data?.some(x=>x.ebay_account===account),connected_at:data?.find(x=>x.ebay_account===account)?.connected_at||null}))});
 }
 if(input.action!=="connect"||!accounts.includes(input.account||""))return respond({error:"Invalid action or account"},400);
 if(!env("EBAY_CLIENT_ID")||!env("EBAY_RUNAME"))return respond({error:"EBAY_RUNAME must be configured in Supabase"},503);
 try{await key();}catch{return respond({error:"EBAY_TOKEN_ENCRYPTION_KEY must be configured in Supabase"},503);}
 if(input.site!==undefined&&input.site!=="production"&&input.site!=="development")return respond({error:"Invalid site"},400);
 const randomState=encode(crypto.getRandomValues(new Uint8Array(32))).replaceAll("+","-").replaceAll("/","_").replaceAll("=","");
 const state=input.site==="production"?"prod."+randomState:randomState;
 const {error}=await db().from("ebay_oauth_states_dev").insert({state_hash:await hash(state),ebay_account:input.account,owner_id:userId,expires_at:new Date(Date.now()+10*60*1000).toISOString()});
 if(error)return respond({error:"Unable to initiate connection"},500);
 const authUrl=new URL("https://auth.ebay.com/oauth2/authorize");
 for(const [k,v] of Object.entries({client_id:env("EBAY_CLIENT_ID"),redirect_uri:env("EBAY_RUNAME"),response_type:"code",scope,state}))authUrl.searchParams.set(k,v);
 return respond({authorization_url:authUrl.toString()});
});
