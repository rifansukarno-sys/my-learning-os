const BINUS_VAPID_PUBLIC_KEY='BHKKo_OAyp0cz2aH-CPxycNYcpaiRBiVIYxQdDgHlVU75zcGUuF_q2FCopPEXPruj-QhdroXR2om_sN-SnO3tSU';
function urlBase64ToUint8Array(base64String){const padding='='.repeat((4-base64String.length%4)%4);const base64=(base64String+padding).replace(/-/g,'+').replace(/_/g,'/');const raw=atob(base64);return Uint8Array.from([...raw].map(c=>c.charCodeAt(0)));}
async function setupPush(){
  const status=document.getElementById('pushStatus');
  const button=document.getElementById('enablePushBtn');
  if(!('serviceWorker' in navigator)&&!('Notification' in window)){if(status)status.textContent='Browser ini belum mendukung notifikasi.';return;}
  if(!window.bxSupabase){if(status)status.textContent='Silakan login terlebih dahulu.';return;}
  try{
    const {data:{user}}=await window.bxSupabase.auth.getUser();
    if(!user){document.getElementById('loginBtn')?.click();return;}
    const permission=await Notification.requestPermission();
    if(permission!=='granted'){if(status)status.textContent='Izin notifikasi belum diberikan.';return;}
    const registration=await navigator.serviceWorker.register('./sw.js',{scope:'./'});
    const subscription=await registration.pushManager.subscribe({userVisibleOnly:true,applicationServerKey:urlBase64ToUint8Array(BINUS_VAPID_PUBLIC_KEY)});
    const json=subscription.toJSON();
    const payload={user_id:user.id,endpoint:json.endpoint,p256dh:json.keys?.p256dh,auth:json.keys?.auth,user_agent:navigator.userAgent};
    const {error}=await window.bxSupabase.from('binus_push_subscriptions').upsert(payload,{onConflict:'user_id,endpoint'});
    if(error)throw error;
    const {error:settingError}=await window.bxSupabase.from('binus_notification_settings').upsert({user_id:user.id,push_enabled:true,timezone:'Asia/Jakarta'},{onConflict:'user_id'});
    if(settingError)throw settingError;
    if(status)status.textContent='✅ Notifikasi HP aktif. Kalender akan menjadi sumber pengingat.';
    if(button){button.textContent='✅ Notifikasi Aktif';button.disabled=true;}
  }catch(error){console.error(error);if(status)status.textContent='Gagal mengaktifkan notifikasi: '+(error.message||error);}
}
window.addEventListener('DOMContentLoaded',()=>{document.getElementById('enablePushBtn')?.addEventListener('click',setupPush);});
