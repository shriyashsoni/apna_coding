import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import assert from 'node:assert/strict';
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE || 'playwright');
const root=path.resolve('scratch/news-tests/dist');
const shots=process.env.SCREENSHOT_DIR || path.resolve('scratch/news-tests');fs.mkdirSync(shots,{recursive:true});
const server=http.createServer((req,res)=>{const name=req.url.split('?')[0];let file=path.join(root,name);if(!fs.existsSync(file)||fs.statSync(file).isDirectory())file=path.join(root,'tests/news/index.html');res.setHeader('Content-Type',file.endsWith('.js')?'text/javascript':file.endsWith('.css')?'text/css':'text/html');res.end(fs.readFileSync(file));});
await new Promise(r=>server.listen(4173,'127.0.0.1',r));
const browser=await chromium.launch({executablePath:process.env.CHROME_PATH || '/usr/bin/google-chrome',headless:true,args:['--no-sandbox']});
try{
 const page=await browser.newPage({viewport:{width:1280,height:900}});
 let rows=Array.from({length:14},(_,i)=>({id:`post-${i}`,title:i<4?`Draft Story ${i}`:`Published Story ${i}`,slug:`story-${i}`,content:`<p>Content ${i}</p>`,category:'announcement',cover_image:null,is_published:i>=4,is_featured:i<3,created_at:`2026-11-${String(28-i).padStart(2,'0')}T12:00:00Z`}));
 let requests=[],failure=null,wrongPublish=false;
 const pageErrors=[];page.on('pageerror',e=>pageErrors.push(e.message));
 await page.route('**/*',async route=>{
  const req=route.request(),u=new URL(req.url());if(u.host==='127.0.0.1:4173')return route.continue();
  if(!u.host.endsWith('supabase.co'))return route.abort();
  requests.push({method:req.method(),url:req.url(),body:req.postDataJSON()});
  const table=u.pathname.split('/')[3];const method=req.method();
  const headers={'content-type':'application/json','access-control-allow-origin':'*','access-control-expose-headers':'content-range','content-range':`0-${rows.length-1}/${rows.length}`};
  if(method==='HEAD')return route.fulfill({status:200,headers,body:''});
  if(method==='OPTIONS')return route.fulfill({status:200,headers});
  if(method==='POST'&&u.pathname.includes('/rpc/'))return route.fulfill({status:200,headers,body:'null'});
  if(table!=='news')return route.fulfill({status:200,headers,body:'[]'});
  if(method!=='GET'&&failure)return route.fulfill({status:failure.status,headers,body:JSON.stringify({message:failure.message,code:'TEST'})});
  if(method==='POST'){
   const data=req.postDataJSON();rows.unshift({...data,id:`new-${rows.length}`,created_at:'2026-12-01T00:00:00Z'});
   return route.fulfill({status:201,headers,body:''});
  }
  if(method==='PATCH'){
   const id=u.searchParams.get('id')?.replace('eq.','');const row=rows.find(r=>r.id===id);const data=req.postDataJSON();
   if(!wrongPublish)Object.assign(row,data);
   return route.fulfill({status:200,headers,body:JSON.stringify(row)});
  }
  let data=rows.filter(row=>[...u.searchParams].every(([key,value])=>!['slug','id','is_published'].includes(key)||String(row[key])===value.replace('eq.','')));
  if(u.searchParams.has('order'))data.sort((a,b)=>b.created_at.localeCompare(a.created_at)||b.id.localeCompare(a.id));
  const offset=Number(u.searchParams.get('offset')||0),limit=Number(u.searchParams.get('limit')||999);data=data.slice(offset,offset+limit);
  const single=req.headers()['accept']?.includes('vnd.pgrst.object');
  if(single&&data.length!==1)return route.fulfill({status:406,headers,body:JSON.stringify({message:'No rows',code:'PGRST116'})});
  return route.fulfill({status:200,headers,body:JSON.stringify(single?data[0]:data)});
 });
 const admin=async()=>{await page.goto('http://127.0.0.1:4173/admin');await page.getByRole('tab',{name:'News & Articles',exact:true}).click();await page.locator('[data-news-id]').first().waitFor();};
 await admin();
 assert.equal(await page.getByRole('checkbox',{name:'Published',exact:true}).isChecked(),true);
 assert.equal(await page.locator('[data-news-id="post-0"]').getByText('Draft',{exact:true}).count(),1);
 assert.equal(await page.locator('[data-news-id="post-4"] [data-slot=badge]').getByText('Published',{exact:true}).count(),1);
 await page.getByPlaceholder('Post Title',{exact:true}).fill('Create published');await page.getByPlaceholder('URL Slug (e.g., my-first-post)').fill('create-published');await page.getByPlaceholder('Post Content (HTML supported)').fill('<p>Created</p>');
 await page.getByRole('button',{name:'Create News Post',exact:true}).click();
 await page.waitForFunction(()=>document.querySelector('[data-news-id="new-14"]'));
 assert.equal(rows[0].is_published,true);assert.equal(rows[0].category,'announcement');assert.equal(Object.hasOwn(rows[0],'excerpt'),false);assert.equal(Object.hasOwn(rows[0],'tags'),false);
 console.log('PASS native create defaults to published; category retained; no excerpt/tags');
 await page.getByPlaceholder('Post Title',{exact:true}).fill('Create draft');await page.getByPlaceholder('URL Slug (e.g., my-first-post)').fill('create-draft');await page.getByPlaceholder('Post Content (HTML supported)').fill('<p>Draft</p>');await page.getByRole('checkbox',{name:'Published',exact:true}).uncheck();await page.getByRole('button',{name:'Create News Post',exact:true}).click();await page.locator('[data-news-id="new-15"]').waitFor();assert.equal(rows[0].is_published,false);
 console.log('PASS native explicit unchecked create persists draft');
 const row=page.locator('[data-news-id="post-0"]');const toggle=row.getByRole('switch',{name:'Published',exact:true});
 await toggle.click();await page.waitForFunction(()=>document.querySelector('#news-published-post-0')?.getAttribute('aria-checked')==='true');assert.equal(rows.find(r=>r.id==='post-0').is_published,true);
 await admin();assert.equal(await page.locator('#news-published-post-0').getAttribute('aria-checked'),'true');
 console.log('PASS publish PATCH correct ID and persisted re-read');
 failure={status:403,message:'Permission denied test'};await page.locator('#news-published-post-0').click();await page.getByRole('alert').filter({hasText:'Permission denied test'}).waitFor();assert.equal(await page.locator('#news-published-post-0').getAttribute('aria-checked'),'true');failure=null;
 console.log('PASS publish rejected write shows persistent error and retains state');
 wrongPublish=true;await page.locator('#news-published-post-0').click();await page.getByRole('alert').filter({hasText:'server did not confirm'}).waitFor();assert.equal(await page.locator('#news-published-post-0').getAttribute('aria-checked'),'true');wrongPublish=false;
 console.log('PASS publish mismatched server return refused');
 await row.getByRole('button',{name:'Edit Draft Story 0',exact:true}).click();await page.getByLabel('Title',{exact:true}).fill('Corrected headline without date');
 await page.screenshot({animations:'disabled',path:path.join(shots,'news-editor-desktop.png')});
 failure={status:409,message:'Duplicate slug test'};await page.getByRole('button',{name:'Save Changes'}).click();await page.getByRole('alert').filter({hasText:'Duplicate slug test'}).waitFor();assert.equal(await page.getByLabel('Title',{exact:true}).inputValue(),'Corrected headline without date');assert.equal(rows.find(r=>r.id==='post-0').title,'Draft Story 0');failure=null;
 console.log('PASS edit failure retains input and no false success');
 await page.getByRole('button',{name:'Save Changes'}).click();await page.getByRole('dialog').waitFor({state:'hidden'});assert.equal(rows.find(r=>r.id==='post-0').title,'Corrected headline without date');assert.equal(rows.find(r=>r.id==='post-0').slug,'story-0');assert.equal(rows.find(r=>r.id==='post-0').id,'post-0');assert.equal(rows.find(r=>r.id==='post-0').category,'announcement');
 await admin();await page.locator('[data-news-id="post-0"]').getByText('Corrected headline without date',{exact:true}).waitFor();
 console.log('PASS edit PATCH in place, preserved ID/slug/category; survives reload');
 await page.locator('[data-news-id="post-0"]').screenshot({path:path.join(shots,'news-publish-controls.png')});
 await page.setViewportSize({width:390,height:844});await page.locator('[data-news-id="post-0"]').getByRole('button',{name:'Edit Corrected headline without date'}).click();await page.getByLabel('Title',{exact:true}).waitFor();await page.screenshot({animations:'disabled',path:path.join(shots,'news-editor-mobile.png')});const beforeCancel=requests.filter(r=>r.method==='PATCH').length;await page.getByRole('button',{name:'Cancel',exact:true}).click();assert.equal(requests.filter(r=>r.method==='PATCH').length,beforeCancel);await page.setViewportSize({width:1280,height:900});
 console.log('PASS mobile editor opens and Cancel closes without write');
 await page.getByRole('button',{name:'Load More News',exact:true}).click();await page.locator('[data-news-id="post-13"]').waitFor();assert.equal(await page.locator('[data-news-id]').count(),16);console.log('PASS ordered load more reaches all 16 rows without duplicates');
 const beforeFeatureWrites=requests.filter(r=>r.method==='POST').length;
 await page.locator('#news-featured-post-13').click();await page.waitForFunction(()=>document.querySelector('#news-featured-post-13')?.getAttribute('aria-checked')==='true');
 assert.equal(await page.locator('[data-news-id]').count(),16);assert.equal(rows.find(r=>r.id==='post-13').is_featured,true);
 assert.equal(requests.filter(r=>r.method==='POST').length,beforeFeatureWrites);
 console.log('PASS Featured toggle updates its label/state without losing loaded rows or creating a post');
 await page.locator('#news-published-post-0').click();await page.waitForFunction(()=>document.querySelector('#news-published-post-0')?.getAttribute('aria-checked')==='false');assert.equal(rows.find(r=>r.id==='post-0').is_published,false);
 await page.locator('#news-published-post-0').click();await page.waitForFunction(()=>document.querySelector('#news-published-post-0')?.getAttribute('aria-checked')==='true');
 console.log('PASS successful unpublish and republish persist independently of Featured');

 requests=[];await page.goto('http://127.0.0.1:4173/news');await page.getByText('Latest News & Updates',{exact:true}).waitFor();await page.getByText('Corrected headline without date',{exact:true}).waitFor();assert.equal(await page.getByText('Draft Story 1',{exact:true}).count(),0);assert.ok(requests.some(r=>r.url.includes('is_published=eq.true')));console.log('PASS public news listing excludes drafts, includes published');
 requests=[];await page.goto('http://127.0.0.1:4173/news/story-1');await page.getByText('Post Not Found',{exact:true}).waitFor();assert.equal(requests.some(r=>r.url.includes('/rpc/')||r.url.includes('news_comments')),false);console.log('PASS draft deep-link not found; no view/comment calls');
 await page.goto('http://127.0.0.1:4173/news/story-4');await page.getByRole('heading',{name:'Published Story 4',exact:true}).waitFor();console.log('PASS published deep-link remains readable');
 requests=[];await page.goto('http://127.0.0.1:4173/');await page.getByText('Corrected headline without date',{exact:true}).waitFor();assert.ok(requests.some(r=>r.url.includes('news?')&&r.url.includes('is_published=eq.true')));assert.equal(await page.getByText('Draft Story 1',{exact:true}).count(),0);console.log('PASS homepage teaser excludes drafts even when featured');
 assert.deepEqual(pageErrors,[]);
 console.log('ALL CONTROLLED TESTS PASSED. API intercepted in local harness only; no production writes.');
}finally{await browser.close();server.close();}
