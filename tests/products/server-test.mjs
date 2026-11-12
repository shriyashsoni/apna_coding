import assert from 'node:assert/strict';
import {build} from 'esbuild';
import fs from 'node:fs';
fs.mkdirSync('scratch/product-tests',{recursive:true});
for(const [source,name] of [['api/utils/metadata-engine.ts','metadata'],['api/sitemap.ts','sitemap']]) {
  await build({entryPoints:[source],bundle:true,platform:'node',format:'esm',outfile:`scratch/product-tests/${name}.mjs`});
}
const rows=[{id:'held',slug:'held',name:'Held uncorrected prototype',description:'Do not disclose',created_at:'2026-11-12T00:00:00Z',status:'approved',is_approved:false},{id:'public',slug:'public',name:'Published prototype',description:'Third-party hackathon prototype. Source credits.',created_at:'2026-11-12T00:00:00Z',status:'approved',is_approved:true}];
let requests=[];
globalThis.fetch=async input=>{
 const u=new URL(typeof input==='string'?input:input.url);requests.push(u);
 assert.equal(u.pathname,'/rest/v1/products');
 let data=rows.filter(row=>[...u.searchParams].every(([key,value])=>!['status','is_approved'].includes(key)||String(row[key])===value.replace('eq.','')));
 const or=u.searchParams.get('or');if(or)data=data.filter(row=>or.includes(`"${row.slug}"`));
 return new Response(JSON.stringify(or?data[0]:data),{status:200,headers:{'content-type':'application/json'}});
};
const {getMetadataForPath}=await import('../../scratch/product-tests/metadata.mjs');
const hidden=await getMetadataForPath('/products/held');assert.equal(hidden.title.includes('Held'),false);assert.equal(hidden.description.includes('Do not disclose'),false);
const shown=await getMetadataForPath('/products/public');assert.ok(shown.title.includes('Published prototype'));console.log('PASS share metadata withholds held product, preserves published metadata');
const {default:handler}=await import('../../scratch/product-tests/sitemap.mjs');let body='',status;
await handler({method:'GET',query:{type:'products'}},{setHeader(){},status(value){status=value;return this;},send(value){body=value;return this;}});
assert.equal(status,200);assert.ok(body.includes('/products/public'));assert.equal(body.includes('/products/held'),false);const query=requests.at(-1);assert.equal(query.searchParams.get('status'),'eq.approved');assert.equal(query.searchParams.get('is_approved'),'eq.true');assert.equal(query.searchParams.get('select'),'slug,created_at');console.log('PASS products sitemap filters both review fields and uses live created_at column');
console.log('ALL PRODUCT SERVER TESTS PASSED. Mocked fetch only; no network reads or writes.');
