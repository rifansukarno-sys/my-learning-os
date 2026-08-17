window.Progress = (() => {
  let state={}, currentUserId=null;
  function blank(){const o={};Object.keys(CURRICULUM||{}).forEach(k=>o[k]=[]);return o;}
  async function load(userId){
    currentUserId=userId; state=blank();
    try{
      const {data,error}=await Auth.getClient().from("learning_progress")
        .select("track,item_index,completed").eq("user_id",userId);
      if(error) throw error;
      (data||[]).forEach(r=>{if(r.completed&&state[r.track])state[r.track].push(Number(r.item_index));});
    }catch(e){console.error("Cloud load failed:",e);}
    window.App?.render();
  }
  async function set(track,index,checked){
    if(!currentUserId)return;
    state[track]=state[track]||[];
    const s=new Set(state[track]); checked?s.add(index):s.delete(index);
    state[track]=[...s].sort((a,b)=>a-b);
    try{
      const sb=Auth.getClient();
      if(checked){
        let r=await sb.from("learning_progress").upsert(
          {user_id:currentUserId,track,item_index:index,completed:true},
          {onConflict:"user_id,track,item_index"});
        if(r.error){
          const d=await sb.from("learning_progress").delete().eq("user_id",currentUserId).eq("track",track).eq("item_index",index);
          if(d.error)throw r.error;
          const i=await sb.from("learning_progress").insert({user_id:currentUserId,track,item_index:index,completed:true});
          if(i.error)throw i.error;
        }
      }else{
        const r=await sb.from("learning_progress").delete().eq("user_id",currentUserId).eq("track",track).eq("item_index",index);
        if(r.error)throw r.error;
      }
    }catch(e){console.error("Cloud save failed:",e);alert("Checklist gagal disimpan ke cloud.");}
  }
  async function reset(track){
    if(!currentUserId)return; state[track]=[];
    const r=await Auth.getClient().from("learning_progress").delete().eq("user_id",currentUserId).eq("track",track);
    if(r.error){console.error(r.error);alert("Reset cloud gagal.");}
  }
  function get(track){return new Set(state[track]||[])}
  return {load,set,get,reset};
})();