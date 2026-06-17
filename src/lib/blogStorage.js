import pb from "@/lib/pocketbaseClient";
import { INITIAL_BLOG_POSTS } from "@/data/initialBlogPosts";

const BLOG_POSTS_KEY = "atltv_local_blog_posts";
const BLOG_COMMENTS_KEY = "atltv_local_blog_comments";

// --- HELPERS ---

function getLocalPosts() {
  try {
    return JSON.parse(localStorage.getItem(BLOG_POSTS_KEY)) || [];
  } catch {
    return [];
  }
}

function saveLocalPosts(posts) {
  localStorage.setItem(BLOG_POSTS_KEY, JSON.stringify(posts));
}

function getLocalComments() {
  try {
    return JSON.parse(localStorage.getItem(BLOG_COMMENTS_KEY)) || [];
  } catch {
    return [];
  }
}

function saveLocalComments(comments) {
  localStorage.setItem(BLOG_COMMENTS_KEY, JSON.stringify(comments));
}

// --- BLOG POSTS MANAGEMENT ---

export async function getBlogPosts() {
  try {
    // Attempt to load custom blog posts from PocketBase
    const pbPosts = await pb.collection("blog_posts").getFullList({
      sort: "-created",
    });

    const parsedPb = pbPosts.map((record) => ({
      id: record.id,
      slug: record.slug,
      title: record.title,
      category: record.category,
      description: record.description,
      coverImage: record.coverImage || record.cover_image,
      author: record.author,
      date: new Date(record.created).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      }),
      readTime: record.readTime || record.read_time || "5 min read",
      content: record.content,
      isCustom: true,
    }));

    // Merge static initial posts with PocketBase custom posts
    return [...parsedPb, ...INITIAL_BLOG_POSTS];
  } catch (err) {
    console.warn("PocketBase getBlogPosts failed, falling back to localStorage:", err);
    const localCustom = getLocalPosts();
    return [...localCustom, ...INITIAL_BLOG_POSTS];
  }
}

export async function getBlogPostBySlug(slug) {
  const allPosts = await getBlogPosts();
  return allPosts.find((p) => p.slug === slug) || null;
}

export async function createBlogPost(postData) {
  const { title, category, description, coverImage, author, readTime, content } = postData;
  const slug = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

  const newPost = {
    title,
    slug,
    category,
    description,
    coverImage,
    author,
    readTime,
    content,
  };

  try {
    const record = await pb.collection("blog_posts").create(newPost);
    return {
      ...record,
      id: record.id,
      date: new Date(record.created).toLocaleDateString(),
      isCustom: true,
    };
  } catch (err) {
    console.warn("PocketBase createBlogPost failed, saving locally:", err);
    const local = getLocalPosts();
    const mockPost = {
      ...newPost,
      id: "local_blog_" + Math.random().toString(36).substr(2, 9),
      date: new Date().toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      }),
      isCustom: true,
    };
    local.unshift(mockPost);
    saveLocalPosts(local);
    return mockPost;
  }
}

export async function updateBlogPost(id, postData) {
  const { title, category, description, coverImage, author, readTime, content } = postData;
  const slug = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

  const updates = {
    title,
    slug,
    category,
    description,
    coverImage,
    author,
    readTime,
    content,
  };

  try {
    const record = await pb.collection("blog_posts").update(id, updates);
    return { ...record, id: record.id, isCustom: true };
  } catch (err) {
    console.warn("PocketBase updateBlogPost failed, updating locally:", err);
    const local = getLocalPosts();
    const idx = local.findIndex((p) => p.id === id);
    if (idx !== -1) {
      local[idx] = { ...local[idx], ...updates };
      saveLocalPosts(local);
      return local[idx];
    }
    throw new Error("Post not found to update.");
  }
}

export async function deleteBlogPost(id) {
  try {
    await pb.collection("blog_posts").delete(id);
    return true;
  } catch (err) {
    console.warn("PocketBase deleteBlogPost failed, deleting locally:", err);
    const local = getLocalPosts();
    const filtered = local.filter((p) => p.id !== id);
    saveLocalPosts(filtered);
    return true;
  }
}

// --- COMMENTS MANAGEMENT ---

export async function getBlogPostComments(postSlug) {
  try {
    const records = await pb.collection("blog_comments").getFullList({
      filter: `postSlug="${postSlug}"`,
      sort: "+created",
    });
    return records.map((r) => ({
      id: r.id,
      postSlug: r.postSlug,
      name: r.name,
      email: r.email,
      text: r.text,
      created: new Date(r.created).toLocaleString(),
    }));
  } catch (err) {
    console.warn("PocketBase getBlogPostComments failed, falling back to localStorage:", err);
    const local = getLocalComments();
    return local
      .filter((c) => c.postSlug === postSlug)
      .sort((a, b) => new Date(a.created) - new Date(b.created));
  }
}

export async function addBlogPostComment(postSlug, commentData) {
  const { name, email, text } = commentData;
  const newComment = {
    postSlug,
    name,
    email,
    text,
  };

  try {
    const record = await pb.collection("blog_comments").create(newComment);
    return {
      id: record.id,
      postSlug: record.postSlug,
      name: record.name,
      email: record.email,
      text: record.text,
      created: new Date(record.created).toLocaleString(),
    };
  } catch (err) {
    console.warn("PocketBase addBlogPostComment failed, saving locally:", err);
    const local = getLocalComments();
    const mockComment = {
      id: "local_comm_" + Math.random().toString(36).substr(2, 9),
      postSlug,
      name,
      email,
      text,
      created: new Date().toLocaleString(),
    };
    local.push(mockComment);
    saveLocalComments(local);
    return mockComment;
  }
}

export async function deleteBlogComment(id) {
  try {
    await pb.collection("blog_comments").delete(id);
    return true;
  } catch (err) {
    console.warn("PocketBase deleteBlogComment failed, deleting locally:", err);
    const local = getLocalComments();
    const filtered = local.filter((c) => c.id !== id);
    saveLocalComments(filtered);
    return true;
  }
}

export async function getAllBlogComments() {
  try {
    const records = await pb.collection("blog_comments").getFullList({
      sort: "-created",
    });
    return records.map((r) => ({
      id: r.id,
      postSlug: r.postSlug,
      name: r.name,
      email: r.email,
      text: r.text,
      created: new Date(r.created).toLocaleString(),
    }));
  } catch (err) {
    console.warn("PocketBase getAllBlogComments failed, using localStorage:", err);
    return getLocalComments().sort((a, b) => new Date(b.created) - new Date(a.created));
  }
}
