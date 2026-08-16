window.Auth = (() => {
  let client = null;
  let user = null;

  const $ = id => document.getElementById(id);
  const message = text => { if ($("authMessage")) $("authMessage").textContent = text || ""; };

  async function init() {
    client = window.supabase.createClient(APP_CONFIG.supabaseUrl, APP_CONFIG.supabaseKey, {
      auth: { persistSession:true, autoRefreshToken:true, detectSessionInUrl:true }
    });
    const {data} = await client.auth.getSession();
    if (data.session) setUser(data.session.user);
    else showLogin();
    client.auth.onAuthStateChange((event, session) => {
      if (event === "PASSWORD_RECOVERY") showRecovery();
      else if (session) setUser(session.user);
    });
  }

  function setUser(u) {
    user = u;
    if ($("userEmail")) $("userEmail").textContent = u.email || "";
    $("authScreen")?.classList.add("hidden");
    $("appScreen")?.classList.remove("hidden");
    window.Progress?.load(u.id);
  }

  function showLogin() {
    $("authScreen")?.classList.remove("hidden");
    $("appScreen")?.classList.add("hidden");
    $("recoveryBox")?.classList.add("hidden");
  }

  function showRecovery() {
    $("authScreen")?.classList.remove("hidden");
    $("appScreen")?.classList.add("hidden");
    $("loginFields")?.classList.add("hidden");
    $("recoveryBox")?.classList.remove("hidden");
    message("Buat password baru.");
  }

  async function login() {
    const email = $("email").value.trim(), password = $("password").value;
    if (!email || !password) return message("Masukkan email dan password.");
    message("Login...");
    const {data,error} = await client.auth.signInWithPassword({email,password});
    if (error) return message(error.message);
    setUser(data.user);
  }

  async function signup() {
    const email = $("email").value.trim(), password = $("password").value;
    if (!email || !password) return message("Masukkan email dan password.");
    if (password.length < 6) return message("Password minimal 6 karakter.");
    message("Membuat akun...");
    const {data,error} = await client.auth.signUp({
      email,password,options:{emailRedirectTo:APP_CONFIG.redirectUrl}
    });
    if (error) return message(error.message);
    if (data.session) setUser(data.user);
    else message("Akun dibuat. Cek email untuk konfirmasi.");
  }

  async function reset() {
    const email = $("email").value.trim();
    if (!email) return message("Masukkan email terlebih dahulu.");
    message("Mengirim link reset...");
    const {error} = await client.auth.resetPasswordForEmail(email,{redirectTo:APP_CONFIG.redirectUrl});
    message(error ? error.message : "Link reset sudah dikirim. Cek email.");
  }

  async function updatePassword() {
    const a=$("newPassword").value,b=$("newPassword2").value;
    if (a.length<6) return message("Password minimal 6 karakter.");
    if (a!==b) return message("Password tidak sama.");
    const {error}=await client.auth.updateUser({password:a});
    if(error) return message(error.message);
    message("Password berhasil diubah.");
    await client.auth.signOut();
    setTimeout(showLogin,700);
  }

  async function logout() { await client.auth.signOut(); user=null; showLogin(); }

  function getClient(){ return client; }
  function getUser(){ return user; }

  return {init,login,signup,reset,updatePassword,logout,getClient,getUser,message};
})();