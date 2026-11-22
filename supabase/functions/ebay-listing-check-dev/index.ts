import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const listingLine = /^\s*eBay listing:[ \t]+https:\/\/(?:www\.)?ebay\.(?:com|co\.uk|com\.au|com\.sg|com\.my|ca|de|fr|it|es)\/itm\/(?:[^/?#\s]+\/)?(\d{9,15})\/?(?:[?#]\S*)?[ \t]*$/i;

function itemId(line: string) {
  return listingLine.exec(line)?.[1];
}

function removeEndedLinks(notes: string, ended: Set<string>) {
  return notes.split(/(?<=\n)/).filter(line => {
    const id = itemId(line.replace(/\r?\n$/, ""));
    return !id || !ended.has(id);
  }).join("");
}

const tag = (xml: string, name: string) =>
  xml.split("<" + name + ">")[1]?.split("</" + name + ">")[0] ?? "";

function isEnded(xml: string, id: string) {
  const item = tag(xml, "Item");
  return ["Success", "Warning"].includes(tag(xml, "Ack")) &&
    tag(item, "ItemID") === id &&
    ["Ended", "Completed"].includes(tag(tag(item, "SellingStatus"), "ListingStatus"));
}

async function accessToken(seller:string,db:ReturnType<typeof createClient>):Promise<string>{
  const {data:connection,error}=await db.from("ebay_oauth_connections_dev").select("refresh_token_ciphertext").eq("ebay_account",seller).maybeSingle();
  if(error)throw Error("Unable to load eBay account connection");
  if(connection){
    const raw=Deno.env.get("EBAY_TOKEN_ENCRYPTION_KEY")||"";
    const bytes=Uint8Array.from(atob(raw),c=>c.charCodeAt(0));
    if(bytes.length!==32)throw Error("eBay token encryption key unavailable");
    const [ivText,cipherText]=connection.refresh_token_ciphertext.split(".");
    const iv=Uint8Array.from(atob(ivText),c=>c.charCodeAt(0));
    const cipher=Uint8Array.from(atob(cipherText),c=>c.charCodeAt(0));
    const key=await crypto.subtle.importKey("raw",bytes,"AES-GCM",false,["decrypt"]);
    const refresh=new TextDecoder().decode(await crypto.subtle.decrypt({name:"AES-GCM",iv},key,cipher));
    const id=Deno.env.get("EBAY_CLIENT_ID"),secret=Deno.env.get("EBAY_CLIENT_SECRET");
    if(!id||!secret)throw Error("eBay application credentials unavailable");
    const res=await fetch("https://api.ebay.com/identity/v1/oauth2/token",{method:"POST",headers:{"authorization":"Basic "+btoa(id+":"+secret),"content-type":"application/x-www-form-urlencoded"},body:new URLSearchParams({grant_type:"refresh_token",refresh_token:refresh,scope:"https://api.ebay.com/oauth/api_scope"}),signal:AbortSignal.timeout(20000)});
    if(!res.ok)throw Error("eBay token refresh failed: HTTP "+res.status);
    const result=await res.json();
    if(!result.access_token)throw Error("eBay token refresh returned no access token");
    return result.access_token;
  }
  // Preserve the existing manually configured first-account token during migration.
  if(seller==="collect_tcg_1"){
    const token=Deno.env.get("EBAY_USER_ACCESS_TOKEN");
    if(token)return token;
  }
  throw Error("eBay account not connected");
}

async function listingEnded(id: string, token: string) {
  const body = `<?xml version="1.0" encoding="utf-8"?><GetItemRequest xmlns="urn:ebay:apis:eBLBaseComponents"><ItemID>${id}</ItemID><OutputSelector>Ack</OutputSelector><OutputSelector>Errors</OutputSelector><OutputSelector>Item.ItemID</OutputSelector><OutputSelector>Item.SellingStatus.ListingStatus</OutputSelector><Version>1423</Version></GetItemRequest>`;
  const response = await fetch("https://api.ebay.com/ws/api.dll", {
    method: "POST",
    headers: {
      "content-type": "text/xml",
      "X-EBAY-API-CALL-NAME": "GetItem",
      "X-EBAY-API-SITEID": "0",
      "X-EBAY-API-COMPATIBILITY-LEVEL": "1423",
      "X-EBAY-API-IAF-TOKEN": token,
    },
    body,
    signal: AbortSignal.timeout(8000),
  });
  if (!response.ok) throw Error("HTTP_" + response.status);
  const xml = await response.text();
  if (!["Success", "Warning"].includes(tag(xml, "Ack")) || tag(tag(xml, "Item"), "ItemID") !== id) {
    throw Error("EBAY_" + (tag(xml, "ErrorCode").match(/^\d+$/)?.[0] ?? (tag(xml, "Ack") ? "ITEM_MISSING" : "ACK_MISSING")));
  }
  return isEnded(xml, id);
}

Deno.serve(async request => {
  const key = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  const url = Deno.env.get("SUPABASE_URL");
  if (!key || !url) return new Response(null, { status: 503 });
  if (request.method !== "POST") return new Response(null, { status: 405 });
  const db = createClient(url, key, { auth: { persistSession: false } });
  if (request.headers.get("authorization") !== `Bearer ${key}`) {
    const secret = request.headers.get("x-inventory-schedule-key");
    if (!secret) return new Response(null, { status: 403 });
    const { data, error } = await db.rpc("verify_ebay_inventory_schedule_key", { candidate: secret });
    if (error || data !== true) return new Response(null, { status: 403 });
  }
  const input = await request.json().catch(() => null);
  if (!input || typeof input !== "object" || Array.isArray(input) ||
      (input.apply !== undefined && typeof input.apply !== "boolean")) {
    return new Response(null, { status: 400 });
  }

  try {
    const rows: { id: string; notes: string }[] = [];
    for (let offset = 0;; offset += 250) {
      const { data, error } = await db.from("cards").select("id,notes")
        .eq("availability", "Available").eq("lifecycle_status", "live")
        .ilike("notes", "%eBay listing:%").order("id").range(offset, offset + 249);
      if (error) throw Error("Inventory read failed");
      rows.push(...data);
      if (data.length < 250) break;
    }
    const ids = [...new Set(rows.flatMap(row => row.notes.split(/\r?\n/).flatMap(line => {
      const id = itemId(line);
      return id ? [id] : [];
    })))];
    const ended = new Set<string>();
    let lookupErrors = 0;
    const reasons: Record<string, number> = {};
    if (ids.length) {
      const token = await accessToken("collect_tcg_1", db);
      let cursor = 0;
      await Promise.all(Array.from({ length: 12 }, async () => {
        while (cursor < ids.length) {
          const id = ids[cursor++];
          try {
            if (await listingEnded(id, token)) ended.add(id);
          } catch (error) {
            lookupErrors++;
            const reason = error instanceof Error && /^(?:HTTP_\d+|EBAY_[A-Z_\d]+)$/.test(error.message) ? error.message : "REQUEST_FAILED";
            reasons[reason] = (reasons[reason] ?? 0) + 1;
          }
        }
      }));
    }

    let matchingCards = 0;
    let updated = 0;
    let writeErrors = 0;
    for (const row of rows) {
      const notes = removeEndedLinks(row.notes, ended);
      if (notes === row.notes) continue;
      matchingCards++;
      if (input.apply !== true) continue;
      // Skip cards that left Inventory or whose notes changed during the scan.
      const { data, error } = await db.from("cards").update({ notes })
        .eq("id", row.id).eq("notes", row.notes)
        .eq("availability", "Available").eq("lifecycle_status", "live").select("id");
      if (error) writeErrors++;
      else updated += data.length;
    }
    return Response.json({ checked: ids.length, ended: ended.size, matchingCards, updated, lookupErrors, reasons, writeErrors },
      { status: writeErrors ? 502 : 200 });
  } catch (error) {
    console.error(error instanceof Error ? error.message : "eBay listing check failed");
    return Response.json({ error: "eBay listing check failed" }, { status: 502 });
  }
});
