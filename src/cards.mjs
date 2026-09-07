import {topicById} from './config.mjs';
export const esc = value => String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export const dateLabel = value => new Date(value).toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric',timeZone:'UTC'});
export const arrow = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><path d="M5 12h14M12 5l7 7-7 7"/></svg>';
export const bookmark = '<svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><path d="M6 4h12v17l-6-4-6 4z"/></svg>';
export function newsCard(item,index=0) {
  const t=topicById(item.topic);
  return `<article class="news-card" style="--topic:${t.color}"><div class="card-top"><a class="topic-tag" href="/topics/${t.id}/">${esc(t.short)}</a><button class="save-button icon-button" data-save="${esc(item.id)}" aria-label="Save ${esc(item.title)}" aria-pressed="false">${bookmark}</button></div><div class="card-copy"><p class="source-name">${esc(item.source)}</p><h3><a href="/stories/${esc(item.id)}/">${esc(item.title)}</a></h3><p class="card-summary">${esc(item.summary || 'Explore the announcement and details at the original source.')}</p></div><div class="card-bottom"><time datetime="${esc(item.publishedAt)}">${dateLabel(item.publishedAt)}</time><a class="circle-link" href="/stories/${esc(item.id)}/" aria-label="Read ${esc(item.title)}">${arrow}</a></div></article>`;
}
export function projectCard(item) {
  const t=topicById(item.topic);
  return `<article class="project-card" style="--topic:${t.color}"><div class="project-top"><span class="project-symbol" aria-hidden="true">${t.symbol}</span><span class="small-label">${esc(item.format)}</span></div><div><p class="source-name">${esc(item.name)}</p><h3><a href="/projects/${esc(item.id)}/">${esc(item.title)}</a></h3><p>${esc(item.summary)}</p></div><div class="card-bottom"><span>${esc(t.short)} / ${esc(item.level)}</span><a class="circle-link" href="/projects/${esc(item.id)}/" aria-label="Explore ${esc(item.name)}">${arrow}</a></div></article>`;
}
