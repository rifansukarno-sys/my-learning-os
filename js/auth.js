window.Auth = (() => {
  const KEY = "mlo_local_user";
  let supabase = null;

  async function init(){
    const cfg=window.SUPABASE_CONFIG||{};
    if(cfg.url && cfg.anonKey && window.supabase?.createClient){
      supabase=window.supabase.createClient(cfg.url,cfg.anonKey,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}});
      const {data}=await supabase.auth.getSession();
      setUser(data.session?.user||null);
      supabase.auth.onAuthStateChange((_e,s)=>setUser(s?.user||null));
    } else {
      const raw=localStorage.getItem(KEY);
      if(raw) setUser(JSON.parse(raw));
    }
    return getUser();
  }

  function setUser(u){
    window.__MLO_USER=u||null;
    if(u) localStorage.setItem(KEY,JSON.stringify(u));
    else localStorage.removeItem(KEY);
    document.dispatchEvent(new Event("authchange"));
  }
  function getUser(){ return window.__MLO_USER||null; }
  function getClient(){ return supabase; }

  async function login(email,password){
    email=email.trim().toLowerCase();
    if(!email||!password) throw new Error("Email dan password wajib diisi.");
    if(supabase){
      const {data,error}=await supabase.auth.signInWithPassword({email,password});
      if(error) throw error;
      setUser(data.user); return data.user;
    }
    const users=JSON.parse(localStorage.getItem("mlo_users")||"{}");
    if(!users[email] || users[email].password!==password) throw new Error("Supabase belum dikonfigurasi. Isi js/config.js terlebih dahulu.");
    const u={id:"local-"+btoa(email).replace(/=/g,""),email};
    setUser(u); return u;
  }

  async function register(email,password){
    email=email.trim().toLowerCase();
    if(!email||password.length<6) throw new Error("Email wajib dan password minimal 6 karakter.");
    if(supabase){
      const {data,error}=await supabase.auth.signUp({email,password});
      if(error) throw error;
      if(data.user) setUser(data.user);
      return data.user;
    }
    throw new Error("Supabase belum dikonfigurasi. Isi js/config.js terlebih dahulu.");
  }

  async function logout(){
    if(supabase) await supabase.auth.signOut();
    setUser(null);
  }

  return {init,getUser,getClient,login,register,logout,isSupabase:()=>!!supabase};
})();