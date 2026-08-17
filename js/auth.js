window.Auth = (() => {
  let client = null, user = null;
  const $ = id => document.getElementById(id);
  const msg = t => { if ($("authError")) $("authError").textContent = t || ""; };

  function open(mode="login") {
    const m=$("authModal"); if(!m) return;
    $("authTitle").textContent = mode==="signup" ? "Daftar" : "Login";
    $("authSubmit").textContent = mode==="signup" ? "Daftar" : "Login";
    $("authSwitch").textContent = mode==="signup" ? "Sudah punya akun? Login" : "Belum punya akun? Daftar";
    $("authForm").dataset.mode=mode; msg(""); m.showModal();
  }
  function setUser(u) {
    user=u||null;
    if($("userEmail")) $("userEmail").textContent=user?.email||"Belum login";
    if($("loginBtn")) $("loginBtn").hidden=!!user;
    if($("logoutBtn")) $("logoutBtn").hidden=!user;
    if(user){ $("authModal")?.close(); window.Progress?.load(user.id); }
  }
  async function init(){
    const c=window.SUPABASE_CONFIG||{};
    if(!c.url || !c.anonKey || c.anonKey.includes("PASTE_YOUR")) {
      msg("Isi anon key di js/config.js terlebih dahulu."); return;
    }
    client=window.supabase.createClient(c.url,c.anonKey,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}});
    const {data}=await client.auth.getSession(); setUser(data.session?.user||null);
    client.auth.onAuthStateChange((e,s)=>setUser(s?.user||null));
  }
  async function submit(){
    if(!client) return msg("Supabase belum dikonfigurasi.");
    const email=$("email").value.trim(), password=$("password").value;
    if(!email||!password) return msg("Masukkan email dan password.");
    const signup=$("authForm").dataset.mode==="signup";
    msg(signup?"Membuat akun...":"Login...");
    const r=signup ? await client.auth.signUp({email,password}) : await client.auth.signInWithPassword({email,password});
    if(r.error) return msg(r.error.message);
    if(signup&&!r.data.session) return msg("Akun dibuat. Cek email untuk konfirmasi.");
    setUser(r.data.user);
  }
  async function logout(){ if(client) await client.auth.signOut(); setUser(null); }
  function getClient(){return client} function getUser(){return user}

  document.addEventListener("DOMContentLoaded",()=>{
    $("loginBtn")?.addEventListener("click",()=>open("login"));
    $("logoutBtn")?.addEventListener("click",logout);
    $("authSwitch")?.addEventListener("click",()=>open($("authForm").dataset.mode==="signup"?"login":"signup"));
    $("authForm")?.addEventListener("submit",e=>{e.preventDefault();submit()});
    init();
  });
  return {init,getClient,getUser,logout};
})();