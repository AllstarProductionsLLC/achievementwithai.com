export async function subscribeRequest({method,origin,contentType,body},env=process.env,fetcher=fetch) {
  if(method!=='POST')return {status:405,body:{error:'Use POST to subscribe.'}};
  const origins=new Set([env.SITE_URL||'https://achievementwithai.com']);
  if(env.VERCEL_URL)origins.add(`https://${env.VERCEL_URL}`);
  if(env.NODE_ENV!=='production')origins.add('http://localhost:4173');
  if(!origin||!origins.has(origin))return {status:403,body:{error:'Please subscribe from the website.'}};
  if(!contentType?.toLowerCase().startsWith('application/json'))return {status:415,body:{error:'Expected a JSON request.'}};
  if(!env.BUTTONDOWN_API_KEY||env.NEWSLETTER_ENABLED!=='true')return {status:503,body:{error:'Email updates are not open yet. Please use the RSS feed.'}};
  if(!body||typeof body!=='object'||Array.isArray(body))return {status:400,body:{error:'Please provide a valid email address.'}};
  if(body.website)return {status:400,body:{error:'Please leave the website field empty.'}};
  if(body.consent!==true)return {status:400,body:{error:'Please confirm you would like email updates.'}};
  const email=String(body.email||'').trim();
  if(email.length>254||!/^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/.test(email))return {status:400,body:{error:'Please provide a valid email address.'}};
  try {
    const response=await fetcher('https://api.buttondown.com/v1/subscribers',{method:'POST',headers:{'Authorization':`Token ${env.BUTTONDOWN_API_KEY}`,'Content-Type':'application/json'},body:JSON.stringify({email_address:email,type:'unactivated'}),signal:AbortSignal.timeout(12000)});
    // Never disclose whether an address already belongs to the publication.
    if(response.ok||response.status===409)return {status:200,body:{message:'If this address is eligible, a confirmation email will arrive shortly. Check your inbox and spam folder.'}};
    return {status:response.status===429?429:502,body:{error:response.status===429?'Too many attempts. Please try again later.':'Email signup is temporarily unavailable. Please try again later or follow the RSS feed.'}};
  }catch{return {status:502,body:{error:'The email service did not respond. Please try again later.'}};}
}
export default async function handler(req,res) {
  res.setHeader('Cache-Control','no-store');res.setHeader('Content-Type','application/json');res.setHeader('X-Content-Type-Options','nosniff');
  if(req.method!=='POST')res.setHeader('Allow','POST');
  if(Number(req.headers['content-length']||0)>4096){res.statusCode=413;return res.end(JSON.stringify({error:'Request is too large.'}));}
  let body;try{if(req.body!==undefined){body=typeof req.body==='string'?JSON.parse(req.body):req.body;if(Buffer.byteLength(JSON.stringify(body))>4096)throw new Error();}else{let raw='';for await(const chunk of req){raw+=chunk;if(Buffer.byteLength(raw)>4096){res.statusCode=413;return res.end(JSON.stringify({error:'Request is too large.'}));}}body=raw?JSON.parse(raw):{};}}catch{res.statusCode=400;return res.end(JSON.stringify({error:'Invalid request body.'}));}
  const result=await subscribeRequest({method:req.method,origin:req.headers.origin,contentType:req.headers['content-type'],body});res.statusCode=result.status;res.end(JSON.stringify(result.body));
}
