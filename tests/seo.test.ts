import assert from 'node:assert/strict';
import { readFileSync, writeFileSync } from 'node:fs';
import { schemaDate, canonicalUrl, contentSchema, jsonLd, PUBLIC_PAGES } from '../src/lib/seo';
import sitemap from '../api/sitemap';
import page from '../api/seo-page';
import { fetchPublicRecord, fetchPublicRecords } from '../api/utils/metadata-engine';
const counts:any = { events:1,jobs:1,hackathons:1,news:1,communities:1,products:1 };
const tables:any = Object.fromEntries(Object.keys(counts).map(type=>[type,[{
  id:'11111111-1111-4111-8111-111111111111',slug:'public-listing',title:'Public listing',name:'Public listing',
  description:'Public listing description',content:'Public article body',company:'Example Co',location:'Paris',
  is_published:true,is_approved:true,is_cancelled:false,status:'approved',created_at:'2026-11-01T00:00:00Z',
  date:1893456000000,timezone:'TBA',image_url:'https://example.com/image.png',
},{id:'22222222-2222-4222-8222-222222222222',slug:'private-listing',title:'PRIVATE_SENTINEL',name:'PRIVATE_SENTINEL',description:'PRIVATE_SENTINEL',is_published:false,is_approved:false,status:'pending'}]]));
const originalFetch = globalThis.fetch;
let offline = false;
globalThis.fetch = (async (raw:any) => {
  if(offline) return new Response('offline',{status:503});
  const url = new URL(String(raw)); const table=url.pathname.split('/').pop()!;
  assert.ok(tables[table], `Unknown or private table fetched: ${table}`);
  let rows=tables[table];
  for(const [key,value] of url.searchParams) {
    if(value==='eq.true') rows=rows.filter((r:any)=>r[key]===true);
    if(value==='not.eq.true') rows=rows.filter((r:any)=>r[key]!==true);
    if(value==='eq.approved') rows=rows.filter((r:any)=>r[key]==='approved');
    if(['id','slug'].includes(key)) rows=rows.filter((r:any)=>r[key]===decodeURIComponent(value.slice(3)));
  }
  return new Response(JSON.stringify(rows),{status:200});
}) as typeof fetch;
function response(){ const out:any={statusCode:200,headers:{}};out.setHeader=(k:string,v:string)=>out.headers[k]=v;out.status=(n:number)=>(out.statusCode=n,out);out.send=(b:string)=>(out.body=b,out);out.end=()=>out;return out; }
assert.equal(canonicalUrl('https://apnacoding.com/hackathons/hello?utm_source=test'),'https://www.apnacoding.com/hackathons/hello');
assert.equal(schemaDate('1893456000000',true),'2030-01-01');
assert.equal(schemaDate('bad'),undefined);
assert.equal(contentSchema('jobs',{company:'OtherCo'},'/','A job','D')['@type'],'WebPage');
assert.equal(contentSchema('events',{date:'1893456000000',timezone:'TBA',location:'Paris'},'/','Event','D').startDate,'2030-01-01');
assert.equal(contentSchema('events',{location:'Online'},'/','Event','D')['@type'],'WebPage');
assert.ok(!jsonLd({name:'</script><script>alert(1)</script>'}).includes('</script>'));
for(const type of Object.keys(counts)) {
  const category=type==='communities'?'community':type;
  const records=await fetchPublicRecords(category); assert.ok(records.length>0);
  const res=response();await sitemap({query:{type}},res);assert.equal(res.statusCode,200);
  assert.equal((res.body.match(/<url>/g)||[]).length,records.length);
  assert.ok(!res.body.includes('null</loc>'));
  const first=records[0]; const path=`${category}/${first.slug||first.id}`;
  const out=response();await page({query:{path}},out);assert.equal(out.statusCode,200);
  assert.ok(out.body.includes('<div id="root"><main'));
  assert.ok(out.body.includes(first.title || first.name));
  assert.equal((out.body.match(/rel="canonical"/g)||[]).length,1);
  assert.equal((out.body.match(/name="description"/g)||[]).length,1);
  assert.ok(!out.body.includes('https://apnacoding.comhttps://'));
  const listing=response();await page({query:{path:type}},listing);assert.equal(listing.statusCode,200);
  if(type==='news')writeFileSync('/tmp/seo-news-rendered.html',out.body);
  if(type==='jobs')writeFileSync('/tmp/seo-job-rendered.html',out.body);
  console.log(`${type}: ${records.length} sitemap URLs, listing/detail HTML passed`);
  // Changing a known record to draft must exclude it from every public surface.
  const original=tables[type].find((r:any)=>r.id===first.id);
  if(type!=='products')original.is_published=false;else original.status='pending';
  const gone=await fetchPublicRecord(category,first.slug||first.id);assert.equal(gone,null);
  const hidden=response();await page({query:{path}},hidden);assert.equal(hidden.statusCode,404);assert.ok(!hidden.body.includes(first.description || 'PRIVATE_SENTINEL'));
  if(type!=='products')original.is_published=true;else original.status='approved';
}
for(const path of ['admin','verify/PRIVATE_SENTINEL','profile','user/PRIVATE_SENTINEL','does-not-exist']){
  const out=response();await page({query:{path}},out);assert.equal(out.headers['X-Robots-Tag'],'noindex, follow');assert.ok(!out.body.includes('PRIVATE_SENTINEL</h1>'));
}
const root=response();await page({query:{path:''}},root);assert.equal(root.statusCode,200);
const stat=response();await sitemap({query:{type:'static'}},stat);assert.equal((stat.body.match(/<url>/g)||[]).length,Object.keys(PUBLIC_PAGES).length);assert.ok(!stat.body.includes('/leaderboard'));
offline=true;const error=response();await sitemap({query:{type:'news'}},error);assert.equal(error.statusCode,503);assert.equal(error.headers['Cache-Control'],'no-store');
globalThis.fetch=originalFetch;
console.log('SEO tests passed: drafts, privacy, unknown routes, canonical, date-only, safe JSON, source failure');
