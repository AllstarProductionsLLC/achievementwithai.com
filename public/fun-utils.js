export function dailyFunIndex(date, count) {
  if(!Number.isInteger(count)||count<1)throw new Error('Daily fun needs a non-empty collection');
  if(!/^\d{4}-\d{2}-\d{2}$/.test(date)||!Number.isFinite(Date.parse(date))||new Date(date).toISOString().slice(0,10)!==date)throw new Error('Expected a real ISO calendar date');
  return ((Math.floor(Date.parse(date)/86400000)%count)+count)%count;
}
export function localCalendarDate(now=new Date()) {
  return `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')}`;
}
