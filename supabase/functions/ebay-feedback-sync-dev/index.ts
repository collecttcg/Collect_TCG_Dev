// Dev-only eBay feedback synchronization. Invoke with verified Owner JWT or service-role Authorization bearer.
// This function writes only to ebay_feedback_dev and its Dev sync status table.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
const accounts = ["collect_tcg_1","collect_tcg_2","collect_tcg_3","collect_tcg_4","collect_tcg_5"] as const;
const corsHeaders = {"Access-Control-Allow-Origin":"*","Access-Control-Allow-Headers":"authorization, x-client-info, apikey, content-type","Access-Control-Allow-Methods":"POST, OPTIONS"};
const reply = (data: unknown, status=200) => new Response(JSON.stringify(data),{status,headers:{"content-type":"application/json","cache-control":"no-store",...corsHeaders}});
const tag = (xml:string,name:string) => xml.split("<"+name+">")[1]?.split("</"+name+">")[0] ?? "";
const decode = (s:string) => s.replace(/&#(x[0-9a-f]+|\d+);|&(?:amp|lt|gt|quot|apos);/gi,(m,n)=>n ? String.fromCodePoint(n[0].toLowerCase()==="x"?parseInt(n.slice(1),16):Number(n)) : ({"&amp;":"&","&lt;":"<","&gt;":">","&quot;":'"',"&apos;":"'"}[m]??m));
async function accessToken():Promise<string>{
  const id=Deno.env.get("EBAY_CLIENT_ID"), secret=Deno.env.get("EBAY_CLIENT_SECRET"), refresh=Deno.env.get("EBAY_USER_REFRESH_TOKEN");
  if(id && secret && refresh){
    const credentials=btoa(id+":"+secret);
    const res=await fetch("https://api.ebay.com/identity/v1/oauth2/token",{method:"POST",headers:{"authorization":"Basic "+credentials,"content-type":"application/x-www-form-urlencoded"},body:new URLSearchParams({grant_type:"refresh_token",refresh_token:refresh,scope:"https://api.ebay.com/oauth/api_scope"})});
    const result=await res.json();
    if(!res.ok || !result.access_token) throw Error("eBay refresh failed: HTTP "+res.status);
    return result.access_token;
  }
  const token=Deno.env.get("EBAY_USER_ACCESS_TOKEN");
  if(!token) throw Error("No eBay user token configured");
  return token;
}
async function fetchPage(seller:string,page:number,token:string){
  const xml=`<?xml version="1.0" encoding="utf-8"?><GetFeedbackRequest xmlns="urn:ebay:apis:eBLBaseComponents"><UserID>${seller}</UserID><FeedbackType>FeedbackReceivedAsSeller</FeedbackType><DetailLevel>ReturnAll</DetailLevel><Pagination><EntriesPerPage>100</EntriesPerPage><PageNumber>${page}</PageNumber></Pagination><Version>1423</Version></GetFeedbackRequest>`;
  const res=await fetch("https://api.ebay.com/ws/api.dll",{method:"POST",headers:{"content-type":"text/xml","X-EBAY-API-CALL-NAME":"GetFeedback","X-EBAY-API-SITEID":"0","X-EBAY-API-COMPATIBILITY-LEVEL":"1423","X-EBAY-API-IAF-TOKEN":token},body:xml,signal:AbortSignal.timeout(20000)});
  const data=await res.text();
  if(!res.ok || !["Success","Warning"].includes(tag(data,"Ack"))) throw Error("eBay feedback API failed: HTTP "+res.status+" / "+tag(data,"Ack")+" / "+tag(data,"ErrorCode"));
  const pages=Math.max(1,Number(tag(data,"TotalNumberOfPages"))||1);
  const records=data.split("<FeedbackDetail>").slice(1).map(s=>s.split("</FeedbackDetail>")[0]).map(block=>{
    const type=tag(block,"CommentType").toLowerCase();
    const id=tag(block,"FeedbackID");
    const date=tag(block,"CommentTime");
    const comment=decode(tag(block,"CommentText")).trim();
    if(!id || !["positive","neutral","negative"].includes(type) || !date || !Number.isFinite(Date.parse(date))) return null;
    return {ebay_account:seller,feedback_id:id,feedback_type:type,comment:comment.slice(0,2000),feedback_at:date};
  }).filter((v):v is NonNullable<typeof v>=>v!==null);
  return {pages,records};
}
Deno.serve(async req=>{
  if(req.method==="OPTIONS") return new Response(null,{status:204,headers:corsHeaders});
  if(req.method!=="POST") return reply({error:"POST required"},405);
  const serviceKey=Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if(!serviceKey) return reply({error:"Server configuration unavailable"},503);
  const authorization=req.headers.get("authorization")||"";
  const bearer=authorization.startsWith("Bearer ")?authorization.slice(7):"";
  let authorized=bearer===serviceKey;
  if(!authorized && bearer){
    const publicKey=Deno.env.get("SUPABASE_ANON_KEY");
    if(publicKey){
      const userClient=createClient(Deno.env.get("SUPABASE_URL")!,publicKey,{auth:{persistSession:false}});
      const {data:{user},error:authError}=await userClient.auth.getUser(bearer);
      if(!authError && user){
        const adminClient=createClient(Deno.env.get("SUPABASE_URL")!,serviceKey,{auth:{persistSession:false}});
        const {data:owner,error:ownerError}=await adminClient.from("app_owners").select("user_id").eq("user_id",user.id).maybeSingle();
        authorized=!ownerError && Boolean(owner);
      }
    }
  }
  if(!authorized) return reply({error:"Owner authorization required"},403);
  const db=createClient(Deno.env.get("SUPABASE_URL")!,serviceKey,{auth:{persistSession:false}});
  let input:{seller?:string}={};
  try { input=await req.json(); } catch {return reply({error:"JSON body required"},400);}
  if(input.seller && !accounts.includes(input.seller as typeof accounts[number])) return reply({error:"Invalid seller"},400);
  const selected=input.seller?[input.seller]:[...accounts];
  const results=[];
  let token:string;
  try {token=await accessToken();} catch {return reply({error:"eBay authorization unavailable; check refresh/access token"},503);}
  for(const seller of selected){
    let imported=0;
    try {
      const first=await fetchPage(seller,1,token);
      if(first.pages>100) throw Error("Too many pages; manual review required");
      for(let page=1;page<=first.pages;page++){
        const result=page===1?first:await fetchPage(seller,page,token);
        if(result.records.length){
          const {error}=await db.from("ebay_feedback_dev").upsert(result.records,{onConflict:"ebay_account,feedback_id"});
          if(error) throw Error("Feedback database upsert failed");
          imported+=result.records.length;
        }
      }
      const {error}=await db.from("ebay_feedback_sync_accounts_dev").update({last_attempt_at:new Date().toISOString(),last_success_at:new Date().toISOString(),last_error:null}).eq("ebay_account",seller);
      if(error) throw Error("Sync status update failed");
      results.push({seller,status:"success",records:imported});
    }catch(err){
      const reason=err instanceof Error?err.message:"Unknown sync error";
      await db.from("ebay_feedback_sync_accounts_dev").update({last_attempt_at:new Date().toISOString(),last_error:reason.slice(0,200)}).eq("ebay_account",seller);
      results.push({seller,status:"failed",error:reason});
    }
  }
  return reply({results},results.some(r=>r.status==="failed")?207:200);
});
