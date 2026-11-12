// Run after deployment: node tests/deployment/media.mjs https://www.apnacoding.com/
import assert from 'node:assert/strict';
const root=process.argv[2];assert.ok(root,'Supply the deployed site URL');
for(const file of ['8675541-hd_1920_1080_30fps.mp4','14630687_1920_1080_30fps.mp4','11387730-hd_1920_1080_30fps.mp4','7782667-hd_1080_1920_25fps.mp4']){
 const url=new URL(`videos/${file}`,root);const r=await fetch(url,{headers:{Range:'bytes=0-63'}});assert.ok(r.ok,`${url} HTTP ${r.status}`);assert.ok(r.headers.get('content-type')?.startsWith('video/'),`${url} must return video, not the SPA HTML fallback`);const bytes=Buffer.from(await r.arrayBuffer());assert.equal(bytes.toString('ascii',4,8),'ftyp');console.log('PASS original workflow asset',url.href,r.status,r.headers.get('content-type'));
}
