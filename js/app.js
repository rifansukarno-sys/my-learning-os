(() => {
  const $=s=>document.querySelector(s);
  let active="network", query="";
  const modal=$("#authModal"), authForm=$("#authForm"), authTitle=$("#authTitle"), authSubmit=$("#authSubmit"), authSwitch=$("#authSwitch");
  let mode="login";

  function esc(s){return s.replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[c]))}
  function render(){
    const user=Auth.getUser();
    $("#userEmail").textContent=user?.email||"Belum login";
    $("#logoutBtn").hidden=!user;
    $("#loginBtn").hidden=!!user;
    const t=CURRICULUM[active], done=Progress.get(active), items=t.items.filter(x=>x.name.toLowerCase().includes(query));
    $("#trackTabs").innerHTML=Object.entries(CURRICULUM).map(([k,v])=>`<button class="tab ${k===active?"active":""}" data-track="${k}">${v.icon} ${esc(v.title)}</button>`).join("");
    const total=t.items.length, completed=done.length, pct=total?Math.round(completed/total*100):0;
    $("#progressPct").textContent=pct+"%"; $("#doneCount").textContent=completed; $("#remainCount").textContent=total-completed;
    $("#bar").style.width=pct+"%";
    $("#levelList").innerHTML=items.map(x=>`<label class="level ${done.includes(x.id)?"done":""}">
      <input type="checkbox" data-id="${x.id}" ${done.includes(x.id)?"checked":""}>
      <span>${esc(x.name)}</span>
    </label>`).join("") || `<div class="empty">Tidak ada level yang cocok.</div>`;
    $("#trackTitle").textContent=`${t.icon} ${t.title}`;
    $("#trackCount").textContent=`${total} checklist`;
  }

  function openAuth(m){mode=m; authTitle.textContent=m==="login"?"Login":"Daftar"; authSubmit.textContent=m==="login"?"Login":"Buat akun"; authSwitch.textContent=m==="login"?"Belum punya akun? Daftar":"Sudah punya akun? Login"; $("#authError").textContent=""; authForm.reset(); modal.showModal(); }
  function closeAuth(){modal.close()}
  authForm.addEventListener("submit",async e=>{
    e.preventDefault(); $("#authError").textContent=""; authSubmit.disabled=true;
    try{
      const email=$("#email").value,password=$("#password").value;
      if(mode==="login") await Auth.login(email,password); else await Auth.register(email,password);
      closeAuth(); render();
    }catch(err){$("#authError").textContent=err.message||"Gagal memproses akun."}
    finally{authSubmit.disabled=false}
  });
  authSwitch.addEventListener("click",()=>openAuth(mode==="login"?"register":"login"));
  $("#loginBtn").onclick=()=>openAuth("login");
  $("#logoutBtn").onclick=()=>Auth.logout().then(render);

  document.addEventListener("click",e=>{
    const tab=e.target.closest("[data-track]"); if(tab){active=tab.dataset.track; query=""; $("#search").value=""; render();}
  });
  $("#levelList").addEventListener("change",e=>{
    if(!e.target.matches("input[data-id]"))return;
    Progress.toggle(active,Number(e.target.dataset.id)); render();
  });
  $("#search").addEventListener("input",e=>{query=e.target.value.toLowerCase();render()});
  $("#checkAll").onclick=()=>{Progress.all(active,CURRICULUM[active].items.length);render()};
  $("#clearAll").onclick=()=>{Progress.clear(active);render()};
  $("#resetAll").onclick=()=>{if(confirm("Reset semua checklist track ini?")){Progress.clear(active);render()}};
  document.addEventListener("authchange",render);
  document.addEventListener("progresschange",render);

  Auth.init().then(render);
})();