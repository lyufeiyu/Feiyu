// script.js

const contentArea = document.getElementById("content-area");
const navLinks = document.querySelectorAll(".nav-link");

function renderMarkdown(mdText) {
    return window.marked ? marked.parse(mdText) : mdText;
}

async function loadMarkdownFile(url) {
    const res = await fetch(url);
    const md = await res.text();
    return renderMarkdown(md);
}

function fadeOutIn(callback) {
    contentArea.classList.add("fade-out");
    setTimeout(async () => {
        await callback();
        contentArea.classList.remove("fade-out");
    }, 300);
}

const pages = {
    home: () => fadeOutIn(() => renderPostList()),
    about: async () => {
        fadeOutIn(async () => {
            const content = await loadMarkdownFile("content/about.md");
            contentArea.innerHTML = `
        <section class="about-section">
          <h2>Before Master's Degree</h2>
          ${content}
        </section>
      `;
        });
    },
    contact: async () => {
        fadeOutIn(async () => {
            const content = await loadMarkdownFile("content/contact.md");
            contentArea.innerHTML = `
        <section class="contact-section">
          <h2>Contact Me</h2>
          ${content}
        </section>
      `;
        });
    },
    post: async (postId) => {
        const post = posts.find(p => p.id === postId);
        if (!post) return;

        fadeOutIn(async () => {
            let content = post.content;
            if (post.contentFile) {
                content = await loadMarkdownFile(post.contentFile);
            } else {
                content = renderMarkdown(content);
            }

            contentArea.innerHTML = `
        <article class="post-card" style="box-shadow: none;">
          <img src="${post.image}" alt="${post.title}" style="border-radius: 10px;">
          <div class="post-content">
            <h2>${post.title}</h2>
            <p class="meta">${post.date} | ${post.category}</p>
            ${content}
            <a href="#home" class="back-button" style="display:inline-block;margin-top:2rem;color:#0066cc;font-weight:bold">← Return Homepage</a>
          </div>
        </article>
      `;
        });
    }
};

const posts = [
    {
        id: "post1",
        title: "A Comprehensive Survey on Multi-Objective Optimization: Algorithms, Challenges, and Emerging Trends across Diverse Domains  ",
        date: "April 4, 2025",
        category: "Research",
        excerpt: "Not yet online, please stay tuned. Thanks!",
        contentFile: "content/post1.md",
        image: "images/MO.jpg"
    },
    {
        id: "post2",
        title: "我的本科生涯总结",
        date: "April 4, 2025",
        category: "Life",
        excerpt: "落笔写下最伤感的文学，回忆最杀伤的青春，释怀最苦难的字文，不谈未来，不谈梦想，只关于本科过往，我叫吕飞雨，我就是我......",
        contentFile: "content/post2.md",
        image: "images/sixP.jpg"
    }
];

function renderPostList() {
    const sortedPosts = [...posts].sort((a, b) => new Date(b.date) - new Date(a.date));
    contentArea.innerHTML = sortedPosts.map(post => `
    <article class="post-card">
      <img src="${post.image}" alt="${post.title}">
      <div class="post-content">
        <h2><a href="#post-${post.id}" class="post-link" data-id="${post.id}">${post.title}</a></h2>
        <p class="meta">${post.date} | ${post.category}</p>
        <p class="excerpt">${post.excerpt}</p>
        <a href="#post-${post.id}" class="read-more post-link" data-id="${post.id}">Read more...</a>
      </div>
    </article>
  `).join("");

    bindPostLinks();
}

function bindPostLinks() {
    const postLinks = document.querySelectorAll(".post-link");
    postLinks.forEach(link => {
        link.addEventListener("click", async (e) => {
            e.preventDefault();
            const postId = link.dataset.id;
            window.location.hash = `#post-${postId}`;
            await pages.post(postId);
        });
    });
}

navLinks.forEach(link => {
    link.addEventListener("click", e => {
        e.preventDefault();
        const page = link.dataset.page;
        window.location.hash = page;
        renderPageFromHash();
    });
});

async function renderPageFromHash() {
    const hash = window.location.hash.replace('#', '');
    if (hash.startsWith("post-")) {
        const postId = hash.replace("post-", "");
        await pages.post(postId);
    } else if (pages[hash]) {
        await pages[hash]();
        navLinks.forEach(l => l.classList.remove("active"));
        document.querySelector(`.nav-link[data-page="${hash}"]`)?.classList.add("active");
    } else {
        await pages.home();
        navLinks.forEach(l => l.classList.remove("active"));
        document.querySelector(`.nav-link[data-page="home"]`)?.classList.add("active");
    }
}

// 初始化
renderPageFromHash();
window.addEventListener("hashchange", renderPageFromHash);
