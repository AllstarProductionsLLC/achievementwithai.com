const hook=process.env.VERCEL_DEPLOY_HOOK;
if(!hook){console.log('No deploy hook configured. The edition is saved in GitHub; connect Vercel or add VERCEL_DEPLOY_HOOK to publish it.');process.exit(0);}
const url=new URL(hook);
if(url.protocol!=='https:'||url.hostname!=='api.vercel.com'||!url.pathname.startsWith('/v1/integrations/deploy/'))throw new Error('Expected a Vercel deploy hook URL.');
const response=await fetch(url,{method:'POST',signal:AbortSignal.timeout(20000)});
if(!response.ok)throw new Error(`Vercel deploy hook returned ${response.status}`);
console.log('Vercel deployment requested.');
