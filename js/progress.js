window.Progress = (() => {
  const KEY="mlo_progress_v1";
  function load(){try{return JSON.parse(localStorage.getItem(KEY)||"{}")}catch{return {}}}
  function save(x){localStorage.setItem(KEY,JSON.stringify(x)); document.dispatchEvent(new Event("progresschange"))}
  function userKey(){return window.Auth?.getUser()?.id||"guest"}
  function get(track){const all=load(); return all[userKey()]?.[track]||[]}
  function set(track,ids){const all=load(); all[userKey()]??={}; all[userKey()][track]=[...new Set(ids)].sort((a,b)=>a-b); save(all)}
  function toggle(track,id){
    const s=new Set(get(track)); s.has(id)?s.delete(id):s.add(id); set(track,[...s]); return s.has(id);
  }
  function clear(track){set(track,[])}
  function all(track,count){set(track,Array.from({length:count},(_,i)=>i))}
  function resetAll(){const all=load(); delete all[userKey()]; save(all)}
  return {get,set,toggle,clear,all,resetAll};
})();