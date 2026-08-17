window.Auth = (() => {
  const KEY = "mlo_local_user";
  let supabase = null;

  async function init(){
    const cfg=window.SUPABASE_CONFIG||{};
    if(cfg.url && cfg.anonKey && window.supabase?.createClient){
      supabase=window.supabase.createClient(cfg.url,cfg.anonKey);
      const {data}=await supabase.auth.getSession();
      if(data.session) setUser(data.session.user);
      supabase.auth.onAuthStateChange((_e,s)=>setUser(s?.user||null));
    } else {
      const raw=localStorage.getItem(KEY);
      if(raw) setUser(JSON.parse(raw));
    }
    return getUser();
  }
  function setUser(u){ window.__MLO_USER=u||null; localStorage.setItem(KEY,u?JSON.stringify(u):""); document.dispatchEvent(new Event("authchange")); }
  function getUser(){ return window.__MLO_USER||null; }

  async function login(email,password){
    email=email.trim().toLowerCase();
    if(!email||!password) throw new Error("Email dan password wajib diisi.");
    if(supabase){
      const {data,error}=await supabase.auth.signInWithPassword({email,password});
      if(error) throw error;
      setUser(data.user); return data.user;
    }
    const users=JSON.parse(localStorage.getItem("mlo_users")||"{}");
    if(!users[email] || users[email].password!==password) throw new Error("Akun lokal tidak ditemukan atau password salah.");
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
    const users=JSON.parse(localStorage.getItem("mlo_users")||"{}");
    if(users[email]) throw new Error("Email sudah terdaftar.");
    users[email]={password}; localStorage.setItem("mlo_users",JSON.stringify(users));
    const u={id:"local-"+btoa(email).replace(/=/g,""),email}; setUser(u); return u;
  }
  async function logout(){
    if(supabase) await supabase.auth.signOut();
    setUser(null);
  }
  return {init,getUser,login,register,logout,isSupabase:()=>!!supabase};
})();