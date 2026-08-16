window.Progress = (() => {
  const KEY = "my_learning_os_v2";
  let state = {};

  function blank() {
    const o={};
    Object.keys(CURRICULUM).forEach(k=>o[k]=[]);
    return o;
  }
  function loadLocal() {
    try {
      const x=JSON.parse(localStorage.getItem(KEY)||"{}");
      state=Object.assign(blank(),x);
    } catch { state=blank(); }
  }
  function saveLocal(){ localStorage.setItem(KEY,JSON.stringify(state)); }

  async function load(userId) {
    loadLocal();
    try {
      const sb=Auth.getClient();
      const {data,error}=await sb.from("learning_progress")
        .select("track,item_index,completed").eq("user_id",userId);
      if(!error && data) {
        state=blank();
        data.forEach(r=>{
          if(r.completed && state[r.track]) state[r.track].push(Number(r.item_index));
        });
        saveLocal();
      }
    } catch(e){ console.warn("Cloud progress unavailable:",e); }
    window.App?.render();
  }

  async function set(track,index,checked) {
    const arr=new Set(state[track]||[]);
    checked ? arr.add(index) : arr.delete(index);
    state[track]=[...arr].sort((a,b)=>a-b);
    saveLocal();
    const user=Auth.getUser();
    if(!user) return;
    try {
      const sb=Auth.getClient();
      await sb.from("learning_progress").upsert({
        user_id:user.id, track, item_index:index, completed:checked
      },{onConflict:"user_id,track,item_index"});
    } catch(e){ console.warn("Cloud save failed:",e); }
  }

  function get(track){return new Set(state[track]||[]);}
  function reset(track){
    state[track]=[];
    saveLocal();
  }
  return {load,set,get,reset};
})();