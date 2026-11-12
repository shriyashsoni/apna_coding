// Run from the repository root after npm ci. No credentials or network required.
import { build } from 'esbuild';
import { mkdirSync, copyFileSync, existsSync, rmSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
const hadShell=existsSync('dist/index.html');
if(!hadShell){mkdirSync('dist',{recursive:true});copyFileSync('index.html','dist/index.html');}
try {
 await build({entryPoints:['tests/seo.test.ts'],bundle:true,platform:'node',format:'esm',outfile:'.seo-tests.mjs'});
 const result=spawnSync(process.execPath,['.seo-tests.mjs'],{stdio:'inherit'});
 process.exitCode=result.status || 0;
} finally {rmSync('.seo-tests.mjs',{force:true});if(!hadShell)rmSync('dist/index.html',{force:true});}
