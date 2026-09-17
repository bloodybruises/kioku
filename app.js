const SUPABASE_URL =
  "https://qadbabbfhrqcbmjrkuvw.supabase.co";

const SUPABASE_PUBLISHABLE_KEY =
  "sb_publishable_enmLwzFK9xOIZGLVe-3BdA_P6F7kmNn";


/* =========================================
   SUPABASE
========================================= */

let supabaseClient = null;

if (window.supabase) {
  supabaseClient = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_PUBLISHABLE_KEY
  );
}


/* =========================================
   DEFAULT PHOTOS
   These stay as backup photos so the gallery
   never looks empty while real posts are added.
========================================= */

const defaults = [
  {
    id: "001",
    src: "assets/clouds.jpg",
    title: "between weather",
    tags: ["sky", "clouds", "quiet"]
  },
  {
    id: "002",
    src: "assets/purple-glow.jpg",
    title: "violet static",
    tags: ["purple", "liminal", "light"]
  },
  {
    id: "003",
    src: "assets/purple-architecture.jpg",
    title: "afterimage",
    tags: ["purple", "night", "liminal"]
  },
  {
    id: "004",
    src: "assets/night-trails.jpg",
    title: "somewhere above",
    tags: ["night", "sky", "light"]
  },
  {
    id: "005",
    src: "assets/night-sky.jpg",
    title: "02:17",
    tags: ["night", "sky", "stars"]
  },
  {
    id: "006",
    src: "assets/night-blue.jpg",
    title: "blue hour",
    tags: ["night", "sky", "blue"]
  }
];


let posts = [...defaults];
let filteredPosts = [...posts];


/* =========================================
   HELPERS
========================================= */

const $ = (selector) =>
  document.querySelector(selector);

const escapeHTML = (value = "") =>
  String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");


/* =========================================
   LOAD REAL POSTS
========================================= */

async function loadRealPosts() {
  if (!supabaseClient) return;

  try {
    const { data, error } =
      await supabaseClient
        .from("posts")
        .select("*")
        .order("created_at", {
          ascending: false
        });

    if (error) {
      console.error("Could not load posts:", error);
      return;
    }

    if (!data || data.length === 0) {
      posts = [...defaults];
    } else {
      const realPosts = data.map((post) => ({
        id: post.id,
        src: post.image_url,
        title: post.title || "",
        description: post.description || "",
        tags: post.tags || [],
        userId: post.user_id,
        real: true
      }));

      posts = [
        ...realPosts,
        ...defaults
      ];
    }

    filteredPosts = [...posts];

    renderGallery();

  } catch (error) {
    console.error(error);
  }
}


/* =========================================
   GALLERY
========================================= */

function renderGallery() {
  const gallery = $("#gallery");
  const empty = $("#empty");

  if (!gallery) return;

  gallery.innerHTML = "";

  if (filteredPosts.length === 0) {
    if (empty) empty.style.display = "block";
    return;
  }

  if (empty) empty.style.display = "none";

  filteredPosts.forEach((post) => {

    const card = document.createElement("article");

    card.className = "photo-card";

    card.innerHTML = `
      <img
        src="${escapeHTML(post.src)}"
        alt="${escapeHTML(post.title || "kioku photo")}"
        loading="lazy"
      >

      <div class="photo-info">
        ${
          post.title
            ? `<div class="photo-title">${escapeHTML(post.title)}</div>`
            : ""
        }

        ${
          post.tags && post.tags.length
            ? `
              <div class="photo-tags">
                ${post.tags
                  .map(
                    tag =>
                      `<span>#${escapeHTML(tag)}</span>`
                  )
                  .join("")}
              </div>
            `
            : ""
        }
      </div>
    `;

    card.addEventListener("click", () => {
      openViewer(post);
    });

    gallery.appendChild(card);
  });
}


/* =========================================
   SEARCH
========================================= */

function setupSearch() {
  const search = $("#search");

  if (!search) return;

  search.addEventListener("input", () => {

    const query =
      search.value
        .trim()
        .toLowerCase();

    if (!query) {
      filteredPosts = [...posts];
      renderGallery();
      return;
    }

    filteredPosts = posts.filter((post) => {

      const title =
        (post.title || "")
          .toLowerCase();

      const description =
        (post.description || "")
          .toLowerCase();

      const tags =
        (post.tags || [])
          .join(" ")
          .toLowerCase();

      return (
        title.includes(query) ||
        description.includes(query) ||
        tags.includes(query)
      );
    });

    renderGallery();
  });
}


/* =========================================
   FAVORITES
========================================= */

function setupFavorites() {

  const fav = $("#fav");

  if (!fav) return;

  fav.addEventListener("click", () => {

    fav.classList.toggle("active");

    if (fav.classList.contains("active")) {
      filteredPosts = posts.filter(
        post => post.favorite
      );
    } else {
      filteredPosts = [...posts];
    }

    renderGallery();
  });
}


/* =========================================
   VIEWER
========================================= */

function openViewer(post) {

  const viewer =
    $("#viewer");

  if (!viewer) return;

  const viewerImage =
    viewer.querySelector("img");

  if (viewerImage) {
    viewerImage.src = post.src;
    viewerImage.alt =
      post.title || "kioku photo";
  }

  const title =
    viewer.querySelector(".viewer-title");

  if (title) {
    title.textContent =
      post.title || "";
  }

  viewer.classList.add("open");
  viewer.style.display = "flex";
}


function closeViewer() {

  const viewer =
    $("#viewer");

  if (!viewer) return;

  viewer.classList.remove("open");
  viewer.style.display = "none";
}


function setupViewer() {

  const viewer =
    $("#viewer");

  if (!viewer) return;

  const close =
    viewer.querySelector(
      "[data-close]"
    );

  if (close) {
    close.addEventListener(
      "click",
      closeViewer
    );
  }

  viewer.addEventListener(
    "click",
    (event) => {

      if (event.target === viewer) {
        closeViewer();
      }

    }
  );
}


/* =========================================
   AUTH / PROFILE BUTTON
========================================= */

async function checkAuth() {

  const profileButton =
    $("#profileBtn");

  if (!profileButton) return;

  if (!supabaseClient) {

    profileButton.textContent =
      "log in";

    profileButton.onclick = () => {
      window.location.href =
        "auth.html";
    };

    return;
  }

  const {
    data: { session }
  } =
    await supabaseClient.auth.getSession();

  if (session) {

    profileButton.textContent =
      "profile";

    profileButton.onclick = () => {
      window.location.href =
        "profile.html";
    };

  } else {

    profileButton.textContent =
      "log in";

    profileButton.onclick = () => {
      window.location.href =
        "auth.html";
    };
  }
}


/* =========================================
   ADD PHOTO MODAL
========================================= */

function setupAddButton() {

  const add =
    $("#add");

  if (!add) return;

  add.addEventListener(
    "click",
    async () => {

      if (!supabaseClient) {
        window.location.href =
          "auth.html";
        return;
      }

      const {
        data: { session }
      } =
        await supabaseClient.auth.getSession();

      if (!session) {
        window.location.href =
          "auth.html";
        return;
      }

      openAddModal();
    }
  );
}


/* =========================================
   ADD MODAL
========================================= */

function openAddModal() {

  const modal =
    $("#addModal");

  if (!modal) {
    createAddModal();
  }

  const realModal =
    $("#addModal");

  if (realModal) {
    realModal.style.display =
      "flex";
  }
}


function closeAddModal() {

  const modal =
    $("#addModal");

  if (modal) {
    modal.style.display =
      "none";
  }
}


/* =========================================
   CREATE ADD MODAL
========================================= */

function createAddModal() {

  if ($("#addModal")) return;

  const modal =
    document.createElement("div");

  modal.id =
    "addModal";

  modal.innerHTML = `
    <div class="add-box">

      <button
        class="add-close"
        id="addClose"
      >
        ×
      </button>

      <h2>new memory</h2>

      <input
        id="postImage"
        type="file"
        accept="image/*"
      >

      <div
        id="imagePreview"
        class="image-preview"
      ></div>

      <input
        id="postTitle"
        type="text"
        placeholder="title"
        maxlength="100"
      >

      <textarea
        id="postDescription"
        placeholder="description"
        maxlength="500"
      ></textarea>

      <input
        id="postTags"
        type="text"
        placeholder="tags, separated by commas"
      >

      <button
        id="publishPost"
        class="publish-button"
      >
        publish
      </button>

      <div
        id="uploadStatus"
        class="upload-status"
      ></div>

    </div>
  `;

  document.body.appendChild(modal);

  addModalStyles();

  $("#addClose")
    .addEventListener(
      "click",
      closeAddModal
    );

  modal.addEventListener(
    "click",
    (event) => {

      if (event.target === modal) {
        closeAddModal();
      }

    }
  );

  $("#postImage")
    .addEventListener(
      "change",
      previewPostImage
    );

  $("#publishPost")
    .addEventListener(
      "click",
      publishPost
    );
}


/* =========================================
   PHOTO PREVIEW
========================================= */

function previewPostImage(event) {

  const file =
    event.target.files[0];

  const preview =
    $("#imagePreview");

  if (!file || !preview) return;

  const url =
    URL.createObjectURL(file);

  preview.innerHTML = `
    <img src="${url}">
  `;
}


/* =========================================
   PUBLISH POST
========================================= */

async function publishPost() {

  const status =
    $("#uploadStatus");

  const publishButton =
    $("#publishPost");

  const fileInput =
    $("#postImage");

  const titleInput =
    $("#postTitle");

  const descriptionInput =
    $("#postDescription");

  const tagsInput =
    $("#postTags");

  if (!supabaseClient) {
    if (status)
      status.textContent =
        "Supabase is not connected.";

    return;
  }

  const {
    data: { session }
  } =
    await supabaseClient.auth.getSession();

  if (!session) {

    window.location.href =
      "auth.html";

    return;
  }

  const file =
    fileInput.files[0];

  if (!file) {

    status.textContent =
      "choose a photo first.";

    return;
  }

  publishButton.disabled = true;

  status.textContent =
    "uploading...";

  try {

    const extension =
      file.name
        .split(".")
        .pop()
        .toLowerCase();

    const filePath =
      `photos/${session.user.id}-${Date.now()}.${extension}`;


    /* Upload image */

    const {
      error: uploadError
    } =
      await supabaseClient
        .storage
        .from("avatars")
        .upload(
          filePath,
          file,
          {
            contentType:
              file.type,
            upsert: false
          }
        );

    if (uploadError) {
      throw uploadError;
    }


    /* Get public URL */

    const {
      data: publicData
    } =
      supabaseClient
        .storage
        .from("avatars")
        .getPublicUrl(
          filePath
        );

    const imageUrl =
      publicData.publicUrl;


    /* Tags */

    const tags =
      tagsInput.value
        .split(",")
        .map(tag => tag.trim())
        .filter(Boolean);


    /* Create post */

    const {
      error: postError
    } =
      await supabaseClient
        .from("posts")
        .insert({
          user_id:
            session.user.id,

          image_url:
            imageUrl,

          title:
            titleInput.value.trim(),

          description:
            descriptionInput.value.trim(),

          tags
        });

    if (postError) {
      throw postError;
    }


    status.textContent =
      "published.";

    fileInput.value = "";

    titleInput.value = "";

    descriptionInput.value = "";

    tagsInput.value = "";

    $("#imagePreview").innerHTML = "";


    await loadRealPosts();


    setTimeout(
      closeAddModal,
      700
    );

  } catch (error) {

    console.error(
      "Publish error:",
      error
    );

    status.textContent =
      "upload failed: " +
      (
        error.message ||
        "unknown error"
      );

  } finally {

    publishButton.disabled =
      false;
  }
}


/* =========================================
   MODAL STYLES
========================================= */

function addModalStyles() {

  if ($("#kiokuAddStyles"))
    return;

  const style =
    document.createElement("style");

  style.id =
    "kiokuAddStyles";

  style.textContent = `

    #addModal {
      position:fixed;
      inset:0;
      z-index:9999;
      display:none;
      align-items:center;
      justify-content:center;
      background:rgba(0,0,0,.45);
      padding:20px;
      box-sizing:border-box;
    }

    .add-box {
      width:min(480px,100%);
      max-height:90vh;
      overflow:auto;
      background:#fff;
      border:1px solid #222;
      padding:24px;
      box-sizing:border-box;
      position:relative;
      box-shadow:0 15px 50px rgba(0,0,0,.2);
    }

    .add-box h2 {
      margin:0 0 20px;
      font-weight:400;
    }

    .add-box input,
    .add-box textarea {
      width:100%;
      box-sizing:border-box;
      border:1px solid #ccc;
      padding:12px;
      margin-bottom:12px;
      font:inherit;
      background:#fff;
    }

    .add-box textarea {
      min-height:100px;
      resize:vertical;
    }

    .add-close {
      position:absolute;
      right:14px;
      top:10px;
      border:0;
      background:none;
      font-size:28px;
      cursor:pointer;
    }

    .image-preview {
      width:100%;
      margin-bottom:12px;
    }

    .image-preview img {
      display:block;
      width:100%;
      max-height:280px;
      object-fit:contain;
      background:#f3f3f3;
    }

    .publish-button {
      width:100%;
      padding:13px;
      border:1px solid #222;
      background:#222;
      color:#fff;
      cursor:pointer;
      font:inherit;
    }

    .publish-button:disabled {
      opacity:.5;
      cursor:wait;
    }

    .upload-status {
      min-height:20px;
      margin-top:12px;
      font-size:13px;
      text-align:center;
    }

  `;

  document.head.appendChild(style);
}


/* =========================================
   START
========================================= */

setupSearch();

setupFavorites();

setupViewer();

setupAddButton();

checkAuth();

loadRealPosts();
