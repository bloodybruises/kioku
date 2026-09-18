const SUPABASE_URL =
  "https://qadbabbfhrqcbmjrkuvw.supabase.co";

const SUPABASE_PUBLISHABLE_KEY =
  "sb_publishable_enmLwzFK9xOIZGLVe-3BdA_P6F7kmNn";

let supabaseClient = null;

if(window.supabase){
  supabaseClient =
    window.supabase.createClient(
      SUPABASE_URL,
      SUPABASE_PUBLISHABLE_KEY
    );
}


/* --------------------------------------------------
   DEFAULT KIoku POSTS
-------------------------------------------------- */

const defaults = [
  {
    id:"001",
    src:"assets/clouds.jpg",
    title:"between weather",
    description:"",
    tags:["sky","clouds","quiet"]
  },
  {
    id:"002",
    src:"assets/purple-glow.jpg",
    title:"violet static",
    description:"",
    tags:["purple","liminal","light"]
  },
  {
    id:"003",
    src:"assets/purple-architecture.jpg",
    title:"afterimage",
    description:"",
    tags:["purple","night","liminal"]
  },
  {
    id:"004",
    src:"assets/night-trails.jpg",
    title:"somewhere above",
    description:"",
    tags:["night","sky","light"]
  },
  {
    id:"005",
    src:"assets/night-sky.jpg",
    title:"02:17",
    description:"",
    tags:["night","sky","stars"]
  },
  {
    id:"006",
    src:"assets/night-blue.jpg",
    title:"blue hour",
    description:"",
    tags:["night","sky","blue"]
  }
];

let allPosts = [];
let filteredPosts = [];


/* --------------------------------------------------
   LOAD REAL POSTS
-------------------------------------------------- */

async function loadRealPosts(){

  let realPosts = [];

  if(supabaseClient){

    const {
      data,
      error
    } = await supabaseClient
      .from("posts")
      .select("*")
      .order(
        "created_at",
        {ascending:false}
      );

    if(error){

      console.error(
        "Could not load posts:",
        error
      );

    }else{

      realPosts = (data || []).map(post => ({
        id:post.id,
        src:post.image_url,
        title:post.title || "untitled",
        description:post.description || "",
        tags:Array.isArray(post.tags)
          ? post.tags
          : []
      }));
    }
  }

  /*
    Real posts appear first.
    Default kioku images remain underneath them.
  */

  allPosts = [
    ...realPosts,
    ...defaults
  ];

  filteredPosts = [...allPosts];

  renderGallery();
}


/* --------------------------------------------------
   GALLERY
-------------------------------------------------- */

function renderGallery(){

  const gallery =
    document.getElementById("gallery");

  const empty =
    document.getElementById("empty");

  if(!gallery){
    return;
  }

  gallery.innerHTML = "";

  if(!filteredPosts.length){

    if(empty){
      empty.hidden = false;
    }

    return;
  }

  if(empty){
    empty.hidden = true;
  }

  filteredPosts.forEach(post => {

    const card =
      document.createElement("article");

    /*
      The homepage uses .card.
      Keeping this class consistent lets
      the inline viewer code recognize cards.
    */

    card.className = "card";

    card.dataset.id =
      String(post.id);

    const image =
      document.createElement("img");

    image.src =
      post.src;

    image.alt =
      post.title || "kioku photo";

    image.loading =
      "lazy";

    image.onerror = () => {
      card.remove();

      if(!gallery.children.length &&
         empty){
        empty.hidden = false;
      }
    };

    const info =
      document.createElement("div");

    info.className =
      "info";

    const title =
      document.createElement("div");

    title.className =
      "title";

    title.textContent =
      post.title || "untitled";

    const tags =
      document.createElement("div");

    tags.className =
      "tags";

    tags.textContent =
      Array.isArray(post.tags)
        ? post.tags
            .map(tag => "#" + tag)
            .join(" ")
        : "";

    const save =
      document.createElement("button");

    save.className =
      "save";

    save.type =
      "button";

    save.setAttribute(
      "aria-label",
      "save post"
    );

    save.textContent =
      "♡";

    save.addEventListener(
      "click",
      event => {

        event.preventDefault();
        event.stopPropagation();

        toggleFavorite(
          String(post.id),
          card,
          save
        );
      }
    );

    info.append(
      title,
      tags
    );

    card.append(
      image,
      info,
      save
    );

    /*
      The inline index.html viewer listens
      for clicks on .card elements.
    */

    gallery.appendChild(card);
  });

  restoreFavorites();
}


/* --------------------------------------------------
   SEARCH
-------------------------------------------------- */

function setupSearch(){

  const search =
    document.getElementById("search");

  if(!search){
    return;
  }

  search.addEventListener(
    "input",
    () => {

      const query =
        search.value
          .trim()
          .toLowerCase();

      if(!query){

        filteredPosts =
          [...allPosts];

      }else{

        filteredPosts =
          allPosts.filter(post => {

            const title =
              post.title || "";

            const description =
              post.description || "";

            const tags =
              Array.isArray(post.tags)
                ? post.tags.join(" ")
                : "";

            const searchable =
              [
                title,
                description,
                tags
              ]
                .join(" ")
                .toLowerCase();

            return searchable.includes(query);
          });
      }

      renderGallery();
    }
  );
}


/* --------------------------------------------------
   FAVORITES
-------------------------------------------------- */

function getFavorites(){

  try{

    return JSON.parse(
      localStorage.getItem(
        "kioku-favorites"
      ) || "[]"
    );

  }catch{

    return [];
  }
}

function saveFavorites(favorites){

  localStorage.setItem(
    "kioku-favorites",
    JSON.stringify(favorites)
  );
}

function toggleFavorite(
  id,
  card,
  button
){

  let favorites =
    getFavorites();

  if(favorites.includes(id)){

    favorites =
      favorites.filter(
        favorite => favorite !== id
      );

    card.classList.remove(
      "saved"
    );

    button.textContent =
      "♡";

  }else{

    favorites.push(id);

    card.classList.add(
      "saved"
    );

    button.textContent =
      "♥";
  }

  saveFavorites(
    favorites
  );
}

function restoreFavorites(){

  const favorites =
    getFavorites();

  document
    .querySelectorAll(".card")
    .forEach(card => {

      const id =
        card.dataset.id;

      const button =
        card.querySelector(".save");

      if(
        id &&
        favorites.includes(id)
      ){

        card.classList.add(
          "saved"
        );

        if(button){
          button.textContent =
            "♥";
        }
      }
    });
}

function setupFavorites(){
  /*
    Favorites are attached directly
    when gallery cards are created.
  */
}


/* --------------------------------------------------
   AUTH BUTTON
-------------------------------------------------- */

async function checkAuth(){

  const authButton =
    document.getElementById("authBtn");

  if(!authButton){
    return;
  }

  if(!supabaseClient){

    authButton.textContent =
      "log in";

    return;
  }

  const {
    data:{session}
  } =
    await supabaseClient.auth.getSession();

  if(session){

    authButton.textContent =
      "profile";

    authButton.onclick =
      () => {
        window.location.href =
          "profile.html";
      };

  }else{

    authButton.textContent =
      "log in";

    authButton.onclick =
      () => {
        window.location.href =
          "auth.html";
      };
  }
}


/* --------------------------------------------------
   ADD BUTTON
-------------------------------------------------- */

function setupAddButton(){

  const addButton =
    document.getElementById("add");

  if(!addButton){
    return;
  }

  /*
    The actual upload modal is handled by
    index.html so there is only one uploader.
  */

  addButton.addEventListener(
    "click",
    async event => {

      /*
        Stop this handler from doing anything
        if the page already has its own modal
        handler.
      */

      if(
        document.getElementById(
          "addModal"
        )
      ){
        return;
      }

      event.preventDefault();

      if(!supabaseClient){
        window.location.href =
          "auth.html";
        return;
      }

      const {
        data:{session}
      } =
        await supabaseClient.auth.getSession();

      if(!session){

        window.location.href =
          "auth.html";

        return;
      }

      /*
        Fallback for older homepage versions.
      */

      if(typeof openAddModal === "function"){
        openAddModal();
      }
    }
  );
}


/* --------------------------------------------------
   PUBLIC PROFILE HELPER
-------------------------------------------------- */

function openPublicProfile(
  username
){

  if(!username){
    return;
  }

  window.location.href =
    "public.html?username=" +
    encodeURIComponent(username);
}


/* --------------------------------------------------
   AUTH STATE CHANGES
-------------------------------------------------- */

function setupAuthListener(){

  if(!supabaseClient){
    return;
  }

  supabaseClient.auth.onAuthStateChange(
    (_event, session) => {

      const authButton =
        document.getElementById(
          "authBtn"
        );

      if(!authButton){
        return;
      }

      if(session){

        authButton.textContent =
          "profile";

        authButton.onclick =
          () => {
            window.location.href =
              "profile.html";
          };

      }else{

        authButton.textContent =
          "log in";

        authButton.onclick =
          () => {
            window.location.href =
              "auth.html";
          };
      }
    }
  );
}


/* --------------------------------------------------
   START
-------------------------------------------------- */

setupSearch();
setupFavorites();
setupAddButton();
setupAuthListener();
checkAuth();
loadRealPosts();
