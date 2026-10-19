import {spawn} from 'node:child_process';
const npmCli=process.env.npm_execpath;
if(!npmCli)throw new Error('无法定位 npm CLI，请使用 npm run dev 启动。');
const children=[spawn(process.execPath,['--env-file-if-exists=.env','server/index.mjs'],{stdio:'inherit'}),spawn(process.execPath,[npmCli,'run','dev:web'],{stdio:'inherit'})];
let closing=false;const close=code=>{if(closing)return;closing=true;for(const child of children)if(!child.killed)child.kill();process.exit(code);};
for(const child of children)child.on('exit',code=>{if(!closing&&code)close(code);});
process.on('SIGINT',()=>close(0));process.on('SIGTERM',()=>close(0));
