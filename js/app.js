window.App = (() => {
  let active=Object.keys(CURRICULUM||{})[0]||"", query="";
  const $=id=>document.getElementById(id);
  const pct=k=>{const n=CURRICULUM[k].items.length,d=Progress.get(k).size;return n?Math.round(d/n*100):0};
  const esc=s=>String(s??"").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[m]));
  function renderTabs(){
    $("trackTabs").innerHTML=Object.entries(CURRICULUM).map(([k,t])=>`<button class="track ${k===active?"active":""}" data-track="${k}">${t.icon||""} ${t.title}<b>${pct(k)}%</b></button>`).join("");
    document.querySelectorAll("[data-track]").forEach(b=>b.onclick=()=>{active=b.dataset.track;render()});
  }
  function renderList(){
    const t=CURRICULUM[active],done=Progress.get(active);
    const items=t.items.filter(x=>!query||`${x.name} ${x.section} ${x.levelTitle} ${x.level}`.toLowerCase().includes(query.toLowerCase()));
    const groups={};items.forEach(x=>(groups[x.level]??=[]).push(x));
    $("levelList").innerHTML=Object.entries(groups).map(([lv,a])=>{
      const all=t.items.filter(x=>x.level===Number(lv)),d=all.filter(x=>done.has(x.index)).length,p=all.length?Math.round(d/all.length*100):0;
      return `<details class="level" open><summary><strong>LEVEL ${lv} — ${a[0]?.levelTitle||""}</strong><span>${d}/${all.length} · ${p}%</span></summary><div class="items">${a.map(x=>`<label class="item ${done.has(x.index)?"done":""}"><input type="checkbox" data-index="${x.index}" ${done.has(x.index)?"checked":""}><span>${esc(x.name).replace(/\n/g,"<br>")}</span></label>`).join("")}</div></details>`;
    }).join("")||`<div class="empty">Materi tidak ditemukan.</div>`;
    document.querySelectorAll("[data-index]").forEach(c=>c.onchange=async()=>{await Progress.set(active,+c.dataset.index,c.checked);render()});
  }
  function renderStats(){
    let total=0,done=0;Object.keys(CURRICULUM).forEach(k=>{total+=CURRICULUM[k].items.length;done+=Progress.get(k).size});
    const p=total?Math.round(done/total*100):0;
    if($("progressPct"))$("progressPct").textContent=p+"%"; if($("bar"))$("bar").style.width=p+"%";
    if($("trackTitle"))$("trackTitle").textContent=`${CURRICULUM[active].icon||""} ${CURRICULUM[active].title}`;
    if($("trackCount"))$("trackCount").textContent=`${Progress.get(active).size}/${CURRICULUM[active].items.length} checklist`;
    if($("doneCount"))$("doneCount").textContent=done;if($("remainCount"))$("remainCount").textContent=Math.max(total-done,0);
  }
  function render(){renderTabs();renderList();renderStats()}
  function init(){
    $("search")?.addEventListener("input",e=>{query=e.target.value;renderList()});
    $("checkAll")?.addEventListener("click",async()=>{for(const x of CURRICULUM[active].items)await Progress.set(active,x.index,true);render()});
    $("clearAll")?.addEventListener("click",async()=>{for(const x of CURRICULUM[active].items)await Progress.set(active,x.index,false);render()});
    $("resetAll")?.addEventListener("click",async()=>{if(confirm("Reset semua checklist track ini?")){await Progress.reset(active);render()}});
    render();
  }
  document.addEventListener("DOMContentLoaded",init); return {render};
})();