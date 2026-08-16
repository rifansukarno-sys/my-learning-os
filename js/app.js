window.App = (() => {
  let active="analyst", query="", level="all";
  const $=id=>document.getElementById(id);
  const pct=(track)=> {
    const n=CURRICULUM[track].items.length, d=Progress.get(track).size;
    return n ? Math.round(d/n*100):0;
  };

  function renderTabs(){
    $("tracks").innerHTML=Object.entries(CURRICULUM).map(([k,t])=>
      `<button class="track ${k===active?"active":""}" data-track="${k}">${t.icon} ${t.title}<b>${pct(k)}%</b></button>`
    ).join("");
    document.querySelectorAll("[data-track]").forEach(b=>b.onclick=()=>{
      active=b.dataset.track; level="all"; render();
    });
  }

  function renderLevels(){
    const t=CURRICULUM[active];
    $("level").innerHTML=`<option value="all">Semua Level</option>`+
      t.levelMeta.map(x=>`<option value="${x.level}" ${String(level)===String(x.level)?"selected":""}>${x.title}</option>`).join("");
    $("level").onchange=()=>{level=$("level").value;renderList();};
  }

  function renderList(){
    const t=CURRICULUM[active], done=Progress.get(active);
    const groups={};
    t.items.filter(x=>(level==="all"||x.level===Number(level)) &&
      (!query || `${x.name} ${x.section} ${x.levelTitle}`.toLowerCase().includes(query.toLowerCase()))
    ).forEach(x=>(groups[x.level]??=[]).push(x));

    $("materials").innerHTML=Object.entries(groups).map(([lv,items])=>{
      const meta=t.levelMeta.find(x=>x.level===Number(lv));
      const total=t.items.filter(x=>x.level===Number(lv)).length;
      const d=t.items.filter(x=>x.level===Number(lv)&&done.has(x.index)).length;
      const p=total?Math.round(d/total*100):0;
      return `<details class="level" open>
        <summary><span><strong>${meta?.title||"LEVEL "+lv}</strong><small>${d}/${total} materi · ${p}%</small></span><i>${p}%</i></summary>
        <div class="items">${items.map(x=>`
          <label class="item ${done.has(x.index)?"done":""}">
            <input type="checkbox" data-index="${x.index}" ${done.has(x.index)?"checked":""}>
            <span>${x.name}</span>
          </label>`).join("")}</div>
      </details>`;
    }).join("") || `<div class="empty">Materi tidak ditemukan.</div>`;

    document.querySelectorAll("[data-index]").forEach(c=>c.onchange=async()=>{
      await Progress.set(active,Number(c.dataset.index),c.checked); render();
    });
  }

  function renderStats(){
    let total=0,done=0;
    Object.keys(CURRICULUM).forEach(k=>{total+=CURRICULUM[k].items.length;done+=Progress.get(k).size});
    const p=total?Math.round(done/total*100):0;
    $("overall").textContent=p+"%";
    $("overallBar").style.width=p+"%";
    $("currentTitle").textContent=`${CURRICULUM[active].icon} ${CURRICULUM[active].title}`;
    $("currentPct").textContent=pct(active)+"%";
    $("currentBar").style.width=pct(active)+"%";
  }

  function render(){
    renderTabs();renderLevels();renderList();renderStats();
  }

  function init(){
    $("search").oninput=e=>{query=e.target.value;renderList();};
    $("logout").onclick=()=>Auth.logout();
    $("resetTrack").onclick=()=>{
      if(confirm("Reset semua checklist track ini?")){Progress.reset(active);render();}
    };
    render();
  }
  return {init,render};
})();
document.addEventListener("DOMContentLoaded",()=>App.init());