import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { stripTypeScriptTypes } from "node:module";
import { runInNewContext } from "node:vm";

const source = readFileSync(new URL("../supabase/functions/ebay-listing-check-dev/index.ts", import.meta.url), "utf8");
const notes = id => `Keep this note\neBay listing: https://www.ebay.com/itm/${id}\n`;
const card = (id, availability = "Available", lifecycle_status = "live") =>
  ({ id, availability, lifecycle_status, notes: notes(id) });
const cards = [
  card("123456789"), card("123456780", "Sold"), card("123456781", "Reserved"),
  card("123456782", "Collection (NFS)"), card("123456783", "Available", "draft"),
  card("123456784"),
];
const scanned = [];
let handler;
const db = {
  from(table) {
    assert.equal(table, "cards");
    const predicates = [];
    const matches = row => predicates.every(predicate => predicate(row));
    let updates;
    const query = {
      eq(key, value) { predicates.push(row => row[key] === value); return this; },
      ilike() { predicates.push(row => row.notes.includes("eBay listing:")); return this; },
      order() { return this; },
      range(start, end) { return { data: cards.filter(matches).slice(start, end + 1).map(row => ({ ...row })) }; },
      update(values) { updates = values; return this; },
      select() {
        if (!updates) return this;
        return { data: cards.filter(matches).map(row => Object.assign(row, updates)) };
      },
    };
    return query;
  },
};
runInNewContext(
  stripTypeScriptTypes(source.replace(/^import .*\n/, "")) +
  "\naccessToken = async () => 'test'; listingEnded = checkListing;",
  {
    Deno: { env: { get: () => "test" }, serve: fn => { handler = fn; } },
    createClient: () => db,
    Request, Response, console,
    checkListing(id) {
      scanned.push(id);
      if (id === "123456784") cards.at(-1).availability = "Sold";
      return true;
    },
  },
);
const request = (apply, authorization = "Bearer test") => new Request("https://example.invalid", {
  method: "POST", headers: { authorization }, body: JSON.stringify({ apply }),
});
assert.equal((await handler(request(true, "Bearer unauthorized"))).status, 403);
const result = await handler(request(true));
assert.equal(result.status, 200);
assert.equal((await result.json()).updated, 1);
assert.deepEqual(scanned, ["123456789", "123456784"]);
assert.equal(cards[0].notes, "Keep this note\n");
for (const row of cards.slice(1)) assert.equal(row.notes, notes(row.id));
const empty = await handler(request(false));
assert.equal((await empty.json()).checked, 0);
