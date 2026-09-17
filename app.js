const SUPABASE_URL = "https://qadbabbfhrqcbmjrkuvw.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_enmLwzFK9xOIZGLVe-3BdA_P6F7kmNn";

const supabaseClient = window.supabase.createClient(
  SUPABASE_URL,
  SUPABASE_PUBLISHABLE_KEY
);
const defaults=[
{id:'001',src:'assets/clouds.jpg',title:'between weather',tags:['sky','clouds','quiet']},
{id:'002',src:'assets/purple-glow.jpg',title:'violet static',tags:['purple','liminal','light']},
{id:'003',src:'assets/purple-architecture.jpg',title:'afterimage',tags:['purple','night','liminal']},
{id:'004',src:'assets/night-trails.jpg',title:'somewhere above',tags:['night','sky','light']},
{id:'005',src:'assets/night-sky.jpg',title:'02:17',tags:['night','sky','stars']},
{id:'006',src:'assets/night-blue.jpg',title:'blue hour',tags:['night','sky','blue']}];
let added=JSON.parse(localStorage.getItem('kioku-added')||'[]');
let favs=JSON.parse(localStorage.getItem('kioku-favs')||'[]');
let profile=JSON.parse(localStorage.getItem('kioku-profile')||'{}');
let filter='all',favoritesOnly=false,current=null;
const $=s=>document.querySelector(s),all=()=>[...defaults,...added];
function persist(){localStorage.setItem('kioku-added',JSON.stringify(added));localStorage.setItem('kioku-favs',JSON.stringify(favs));localStorage.setItem('kioku-profile',JSON.stringify(profile));$('#fav span').textContent=favs.length}
function render(){
 let q=$('#search').value.toLowerCase().trim();
 let items=all().filter(p=>(filter==='all'||p.tags.includes(filter))&&(!q||p.title.toLowerCase().includes(q)||p.tags.some(t=>t.includes(q)))&&(!favoritesOnly||favs.includes(p.id)));
 $('#count').textContent=`${favoritesOnly?'saved':filter==='all'?'all photographs':filter} / ${items.length}`;
 $('#empty').hidden=items.length>0;$('#gallery').innerHTML='';
 items.forEach(p=>{let c=document.createElement('article');c.className='card '+(favs.includes(p.id)?'saved':'');c.innerHTML=`<img src="${p.src}" alt="${escapeHtml(p.title)}" loading="lazy"><button class="save">${favs.includes(p.id)?'♥':'♡'}</button><div class="info"><div class="title">${escapeHtml(p.title)}</div><div class="tags">${p.tags.map(t=>'#'+escapeHtml(t)).join('  ')}</div></div>`;c.onclick=e=>{if(e.target.classList.contains('save')){toggle(p.id);return}openViewer(p)};$('#gallery').append(c)});persist()
}
function escapeHtml(s){return String(s).replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]))}
function toggle(id){favs=favs.includes(id)?favs.filter(x=>x!==id):[...favs,id];render();if(current&&current.id===id)updateViewer()}
function openViewer(p){current=p;$('#vimg').src=p.src;$('#vimg').alt=p.title;$('#vnum').textContent='archive / '+p.id;$('#vtitle').textContent=p.title;$('#vmeta').textContent=p.tags.map(t=>'#'+t).join('   ');updateViewer();$('#viewer').hidden=false;document.body.style.overflow='hidden'}
function updateViewer(){$('#vsave').textContent=favs.includes(current.id)?'♥ saved':'♡ save'}
function closeViewer(){$('#viewer').hidden=true;current=null;document.body.style.overflow=''}
document.querySelectorAll('nav button').forEach(b=>b.onclick=()=>{document.querySelectorAll('nav button').forEach(x=>x.classList.remove('active'));b.classList.add('active');filter=b.dataset.filter;favoritesOnly=false;render()});
$('.logo').onclick=e=>{e.preventDefault();filter='all';favoritesOnly=false;$('#search').value='';document.querySelectorAll('nav button').forEach(x=>x.classList.toggle('active',x.dataset.filter==='all'));render()};
$('#search').oninput=render;$('#fav').onclick=()=>{favoritesOnly=!favoritesOnly;render()};$('#close').onclick=closeViewer;$('#viewer').onclick=e=>{if(e.target.id==='viewer')closeViewer()};$('#vsave').onclick=()=>current&&toggle(current.id);
$('#add').onclick=()=>{$('#addModal').hidden=false;document.body.style.overflow='hidden'};$('#closeAdd').onclick=closeAdd;
function closeAdd(){$('#addModal').hidden=true;if($('#viewer').hidden&&$('#profileModal').hidden)document.body.style.overflow=''}
$('#photo').onchange=e=>{$('.upload').firstChild.textContent=e.target.files[0]?' '+e.target.files[0].name:'＋ choose a photo'};
$('#form').onsubmit=e=>{e.preventDefault();let file=$('#photo').files[0];if(!file)return;let r=new FileReader();r.onload=()=>{added.unshift({id:'local-'+Date.now(),src:r.result,title:$('#title').value.trim()||'untitled',tags:($('#tags').value||'personal').split(',').map(x=>x.trim().toLowerCase()).filter(Boolean)});$('#form').reset();$('.upload').firstChild.textContent='＋ choose a photo';closeAdd();render()};r.readAsDataURL(file)};
function openProfile(){
 $('#profileName').value=profile.name||'';$('#profileUsername').value=profile.username||'';$('#profileBio').value=profile.bio||'';updateProfilePreview();$('#profileModal').hidden=false;document.body.style.overflow='hidden'
}
function updateProfilePreview(){
 $('#previewName').textContent=profile.name||'kioku user';$('#previewUsername').textContent=profile.username?('@'+profile.username.replace(/^@/,'')):'@you';
 $('#previewAvatar').textContent=(profile.name||'k').trim().charAt(0).toLowerCase()||'k';
 if(profile.avatar){$('#previewAvatar').style.backgroundImage=`url(${profile.avatar})`;$('#previewAvatar').textContent=''}else $('#previewAvatar').style.backgroundImage='';
 if(profile.background)$('#profileModal .modal-card').style.backgroundImage=`linear-gradient(#17171ae8,#17171ae8),url(${profile.background})`;else $('#profileModal .modal-card').style.backgroundImage='';
}
$('#profileBtn').onclick=openProfile;$('#closeProfile').onclick=()=>{$('#profileModal').hidden=true;if($('#viewer').hidden&&$('#addModal').hidden)document.body.style.overflow=''};
$('#profileName').oninput=()=>{profile.name=$('#profileName').value;updateProfilePreview()};$('#profileUsername').oninput=()=>{profile.username=$('#profileUsername').value;updateProfilePreview()};
$('#profileBg').onchange=e=>{let f=e.target.files[0];if(!f)return;let r=new FileReader();r.onload=()=>{profile.background=r.result;updateProfilePreview()};r.readAsDataURL(f)};
$('#profileAvatar').onchange=e=>{let f=e.target.files[0];if(!f)return;let r=new FileReader();r.onload=()=>{profile.avatar=r.result;updateProfilePreview()};r.readAsDataURL(f)};
$('#profileForm').onsubmit=e=>{e.preventDefault();profile.name=$('#profileName').value.trim();profile.username=$('#profileUsername').value.trim().replace(/^@/,'');profile.bio=$('#profileBio').value.trim();persist();$('#profileModal').hidden=true;document.body.style.overflow=''};
render();
