import {build} from 'esbuild';
import {rm} from 'node:fs/promises';
await rm(new URL('./public/assets/chunks',import.meta.url),{recursive:true,force:true});
await build({entryPoints:['src/app.js','src/milo-lab.js'],bundle:true,minify:true,splitting:true,format:'esm',target:'es2022',outdir:'public/assets',chunkNames:'chunks/[name]-[hash]',logLevel:'info'});
