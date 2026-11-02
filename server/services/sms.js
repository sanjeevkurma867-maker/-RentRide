export async function sendSms(phone,text) {
  const body=String(text||'').slice(0,160),provider=process.env.SMS_PROVIDER||'none';
  if(provider==='none')return {skipped:true,reason:'sms disabled'};
  if(provider==='twilio'){const sid=process.env.TWILIO_ACCOUNT_SID,token=process.env.TWILIO_AUTH_TOKEN;if(!sid||!token||!process.env.TWILIO_FROM)return {skipped:true,reason:'SMS is not configured'};const form=new URLSearchParams({To:`+91${phone}`,From:process.env.TWILIO_FROM,Body:body});const r=await fetch(`https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`,{method:'POST',headers:{Authorization:`Basic ${Buffer.from(`${sid}:${token}`).toString('base64')}`,'Content-Type':'application/x-www-form-urlencoded'},body:form});if(!r.ok)throw new Error(`Twilio HTTP ${r.status}`);return {sent:true}}
  if(provider==='fast2sms'){if(!process.env.FAST2SMS_API_KEY)return {skipped:true,reason:'SMS is not configured'};const r=await fetch('https://www.fast2sms.com/dev/bulkV2',{method:'POST',headers:{authorization:process.env.FAST2SMS_API_KEY,'Content-Type':'application/json'},body:JSON.stringify({route:'q',message:body,numbers:phone})});if(!r.ok)throw new Error(`Fast2SMS HTTP ${r.status}`);return {sent:true}}
  return {skipped:true,reason:'unknown SMS provider'};
}
