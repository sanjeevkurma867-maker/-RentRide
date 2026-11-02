export async function sendEmail({to,subject,html,text}) {
  if (process.env.NOTIFY_EMAIL_ENABLED !== 'true' || !process.env.SMTP_USER || !process.env.SMTP_PASS) return { skipped:true, reason:'email disabled' };
  const redirect=process.env.NOTIFY_TEST_REDIRECT;
  const headersubject=`${redirect?`[to: ${to}] `:''}${String(subject).replace(/[\r\n]/g,' ')}`;
  const {default:nodemailer}=await import('nodemailer');
  const transport=nodemailer.createTransport({host:process.env.SMTP_HOST||'smtp.gmail.com',port:Number(process.env.SMTP_PORT)||465,secure:process.env.SMTP_SECURE!=='false',auth:{user:process.env.SMTP_USER,pass:process.env.SMTP_PASS},connectionTimeout:10000,greetingTimeout:10000,socketTimeout:10000});
  await transport.sendMail({from:process.env.MAIL_FROM||process.env.SMTP_USER,to:redirect||to,subject:headersubject,html,text});
  return {sent:true};
}
