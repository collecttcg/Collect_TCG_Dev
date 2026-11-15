// Development-only read-only eBay feedback probe. Requires Supabase JWT at gateway.
// No feedback or tokens are stored, logged, or returned in raw form.
const sellers = ["collect_tcg_1","collect_tcg_2","collect_tcg_3","collect_tcg_4","collect_tcg_5"];
const response = (body: unknown, status = 200) => new Response(JSON.stringify(body), {status,headers:{"content-type":"application/json","cache-control":"no-store"}});
const xmlEscape = (s: string) => s.replace(/[<>&"']/g, c => ({"<":"&lt;",">":"&gt;","&":"&amp;",'"':"&quot;","'":"&apos;"}[c]!));
Deno.serve(async (req: Request) => {
  if(req.method !== "POST") return response({error:"POST required"},405);
  const token = Deno.env.get("EBAY_USER_ACCESS_TOKEN");
  if(!token) return response({error:"EBAY_USER_ACCESS_TOKEN not configured"},503);
  let body: { seller?: string };
  try { body = await req.json(); } catch { return response({error:"JSON required"},400); }
  const seller = body?.seller ?? "collect_tcg_1";
  if(!sellers.includes(seller)) return response({error:"Unknown seller"},400);
  const xml = `<?xml version="1.0" encoding="utf-8"?><GetFeedbackRequest xmlns="urn:ebay:apis:eBLBaseComponents"><UserID>${xmlEscape(seller)}</UserID><FeedbackType>FeedbackReceivedAsSeller</FeedbackType><DetailLevel>ReturnAll</DetailLevel><Pagination><EntriesPerPage>25</EntriesPerPage><PageNumber>1</PageNumber></Pagination><Version>1423</Version></GetFeedbackRequest>`;
  try {
    const res = await fetch("https://api.ebay.com/ws/api.dll", {method:"POST",headers:{"Content-Type":"text/xml","X-EBAY-API-CALL-NAME":"GetFeedback","X-EBAY-API-SITEID":"0","X-EBAY-API-COMPATIBILITY-LEVEL":"1423","X-EBAY-API-IAF-TOKEN":token},body:xml,signal:AbortSignal.timeout(12000)});
    const data = await res.text();
    const tag = (name: string) => data.match(new RegExp("<(?:\\w+:)?"+name+">([^<]*)</(?:\\w+:)?"+name+">"))?.[1] ?? null;
    const ack=tag("Ack"), count=tag("TotalNumberOfEntries"), pages=tag("TotalNumberOfPages");
    const blocks=data.split("<FeedbackDetail>").slice(1).map(part=>part.split("</FeedbackDetail>")[0]);
    const ratingCounts={positive:0,neutral:0,negative:0,other:0};
    for(const block of blocks){const type=block.split("<CommentType>")[1]?.split("</CommentType>")[0]?.toLowerCase(); if(type==="positive"||type==="neutral"||type==="negative") ratingCounts[type]++; else ratingCounts.other++;}
    return response({seller,http_status:res.status,ack,entries_page_1:count===null?null:Number(count),total_pages:pages===null?null:Number(pages),feedback_details_returned:blocks.length,rating_counts_page_1:ratingCounts,error_codes:[...data.matchAll(/<ErrorCode>([^<]+)<\/ErrorCode>/g)].map(m=>m[1]).slice(0,5)},res.ok?200:502);
  } catch {return response({error:"eBay request failed or timed out"},502);}
});