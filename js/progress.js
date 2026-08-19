window.Progress = (() => {
  const KEY="mlo_progress_v1";
  let cloudRows = {};
  const syncQueues = new Map();

  function localLoad(){try{return JSON.parse(localStorage.getItem(KEY)||"{}")}catch{return {}}}
  function localSave(x){localStorage.setItem(KEY,JSON.stringify(x)); document.dispatchEvent(new Event("progresschange"))}
  function userKey(){return window.Auth?.getUser()?.id||"guest"}

  function get(track){
    const uid=userKey();
    if(cloudRows[uid]?.[track]) return cloudRows[uid][track];
    const all=localLoad(); return all[uid]?.[track]||[];
  }

  function cache(track,ids){
    const uid=userKey(); cloudRows[uid]??={};
    cloudRows[uid][track]=[...new Set(ids)].sort((a,b)=>a-b);
    const all=localLoad(); all[uid]??={}; all[uid][track]=cloudRows[uid][track]; localSave(all);
  }

  async function loadFromCloud(){
    const client=window.Auth?.getClient?.(), uid=window.Auth?.getUser?.()?.id;
    if(!client||!uid) return;
    const {data,error}=await client.from("learning_progress").select("track,item_index,completed").eq("user_id",uid);
    if(error){console.error("Supabase progress load:",error);return;}
    cloudRows[uid]={};
    (data||[]).forEach(r=>{if(r.completed){cloudRows[uid][r.track]??=[];cloudRows[uid][r.track].push(Number(r.item_index));}});
    Object.keys(cloudRows[uid]).forEach(k=>cloudRows[uid][k]=[...new Set(cloudRows[uid][k])].sort((a,b)=>a-b));
    const all=localLoad(); all[uid]=cloudRows[uid]; localStorage.setItem(KEY,JSON.stringify(all));
    document.dispatchEvent(new Event("progresschange"));
  }

  async function sync(track,ids=get(track)){
    const client=window.Auth?.getClient?.(), uid=window.Auth?.getUser?.()?.id;
    if(!client||!uid) return;
    const rows=[...new Set(ids)].sort((a,b)=>a-b).map(item_index=>({user_id:uid,track,item_index,completed:true}));
    const del=await client.from("learning_progress").delete().eq("user_id",uid).eq("track",track);
    if(del.error){console.error("Supabase progress delete:",del.error);return;}
    if(rows.length){
      const ins=await client.from("learning_progress").insert(rows);
      if(ins.error) console.error("Supabase progress insert:",ins.error);
    }
  }

  function queueSync(track){
    const uid=userKey();
    if(uid==="guest") return;
    const key=`${uid}:${track}`;
    const next=(syncQueues.get(key)||Promise.resolve()).then(()=>sync(track,[...get(track)]));
    syncQueues.set(key,next.catch(()=>{}));
  }

  function set(track,ids){
    cache(track,ids);
    queueSync(track);
  }
  function toggle(track,id){
    const s=new Set(get(track)); s.has(id)?s.delete(id):s.add(id); set(track,[...s]); return s.has(id);
  }
  function clear(track){set(track,[])}
  function all(track,count){set(track,Array.from({length:count},(_,i)=>i))}

  async function resetAll(){
    const uid=userKey();
    if(uid!=="guest"){
      const client=window.Auth?.getClient?.();
      if(client){
        const tracks=Object.keys(cloudRows[uid]||{});
        for(const track of tracks){
          const result=await client.from("learning_progress").delete().eq("user_id",uid).eq("track",track);
          if(result.error){console.error("Supabase progress reset:",result.error);return false;}
        }
      }
      cloudRows[uid]={};
    }
    const allData=localLoad(); delete allData[uid]; localSave(allData);
    return true;
  }

  document.addEventListener("authchange",()=>{ if(window.Auth?.getUser?.()) loadFromCloud(); });
  return {get,set,toggle,clear,all,resetAll,load:loadFromCloud};
})();
