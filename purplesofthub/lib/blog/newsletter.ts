import 'server-only'
/** Capability check only: HEAD returns no subscriber data. Never fake a working signup. */
export async function newsletterAvailable():Promise<boolean> {
 const base=process.env.NEXT_PUBLIC_SUPABASE_URL
 const key=process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
 if(!base||!key)return false
 try {const response=await fetch(base+'/rest/v1/newsletter_subscribers?select=id&limit=1',{method:'HEAD',cache:'no-store',headers:{apikey:key,Authorization:'Bearer '+key},signal:AbortSignal.timeout(5000)});return response.ok}catch{return false}
}
