import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Calendar, Clock, ArrowLeft, User, MessageSquare, Send, ShieldAlert } from "lucide-react";
import usePageTitle from "@/hooks/usePageTitle";
import { getBlogPostBySlug, getBlogPostComments, addBlogPostComment } from "@/lib/blogStorage";
import { useClientAuth } from "@/contexts/ClientAuthContext";
import { useUI } from "@/contexts/UIContext";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const renderMarkdownContent = (text) => {
  if (!text) return null;
  return text.split("\n\n").map((para, i) => {
    const trimmed = para.trim();
    if (trimmed.startsWith("###")) {
      return (
        <h3 key={i} className="text-xl font-bold mt-6 mb-3 text-foreground leading-snug">
          {trimmed.replace("###", "").trim()}
        </h3>
      );
    }
    if (trimmed.startsWith("##")) {
      return (
        <h2 key={i} className="text-2xl font-bold mt-8 mb-4 text-foreground leading-snug border-b border-border/40 pb-2">
          {trimmed.replace("##", "").trim()}
        </h2>
      );
    }
    if (trimmed.startsWith("---")) {
      return <hr key={i} className="border-border/60 my-6" />;
    }
    if (trimmed.startsWith("- [ ]") || trimmed.startsWith("- [x]")) {
      return (
        <ul key={i} className="list-none pl-2 my-4 space-y-2.5">
          {para.split("\n").map((line, li) => {
            const checked = line.includes("[x]");
            return (
              <li key={li} className="flex items-start gap-2.5 text-sm text-muted-foreground">
                <input
                  type="checkbox"
                  checked={checked}
                  readOnly
                  className="mt-1 rounded border-border text-primary focus:ring-primary h-4 w-4"
                />
                <span>{line.replace(/- \[[ x]\]/, "").trim()}</span>
              </li>
            );
          })}
        </ul>
      );
    }
    if (trimmed.startsWith("- ")) {
      return (
        <ul key={i} className="list-disc pl-6 my-4 space-y-1.5 text-muted-foreground text-sm sm:text-base">
          {para.split("\n").map((line, li) => (
            <li key={li}>{line.replace("- ", "").trim()}</li>
          ))}
        </ul>
      );
    }
    if (trimmed.startsWith("1. ")) {
      return (
        <ol key={i} className="list-decimal pl-6 my-4 space-y-1.5 text-muted-foreground text-sm sm:text-base">
          {para.split("\n").map((line, li) => (
            <li key={li}>{line.replace(/^\d+\.\s+/, "").trim()}</li>
          ))}
        </ol>
      );
    }
    return (
      <p key={i} className="text-muted-foreground leading-relaxed mb-4 text-sm sm:text-base">
        {trimmed}
      </p>
    );
  });
};

const BlogPostDetailPage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useClientAuth();
  const { openAuthModal } = useUI();
  
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState("");
  const [loading, setLoading] = useState(true);
  const [submittingComment, setSubmittingComment] = useState(false);

  useEffect(() => {
    const loadPostAndComments = async () => {
      setLoading(true);
      const data = await getBlogPostBySlug(slug);
      if (!data) {
        toast.error("Article not found.");
        navigate("/blog");
        return;
      }
      setPost(data);
      
      const comms = await getBlogPostComments(slug);
      setComments(comms);
      setLoading(false);
    };
    loadPostAndComments();
  }, [slug, navigate]);

  usePageTitle({
    title: post ? `${post.title} - Atlanta TV Mount PRO` : "Loading Article...",
    description: post ? `${post.excerpt || post.title}. Read the full article on the Atlanta TV Mount PRO blog.` : "Read our professional TV mounting and handyman articles.",
    keywords: post ? `TV mounting, ${post.category || 'handyman'}, ${post.title}, Atlanta TV Mount PRO` : "TV mounting blog, handyman blog Atlanta",
    ogImage: post?.image || "/favicon.png",
    ogType: "article"
  });

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      toast.error("You must sign in to comment.");
      openAuthModal("login");
      return;
    }
    if (!commentText.trim()) {
      toast.error("Comment cannot be empty.");
      return;
    }

    setSubmittingComment(true);
    try {
      const added = await addBlogPostComment(slug, {
        name: user.name || user.email,
        email: user.email,
        text: commentText.trim()
      });
      setComments((prev) => [...prev, added]);
      setCommentText("");
      toast.success("Comment posted successfully!");
    } catch (err) {
      toast.error("Failed to post comment.");
    } finally {
      setSubmittingComment(false);
    }
  };

  if (loading || !post) {
    return (
      <div className="py-24 bg-background min-h-screen flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center space-y-4">
          <div className="w-12 h-12 rounded-full border-4 border-t-primary border-muted animate-spin" />
          <p className="text-muted-foreground text-sm font-semibold">Loading article...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="py-20 bg-background min-h-screen">
      <div className="max-w-[760px] mx-auto px-4 sm:px-6 lg:px-8 pt-10">
        
        {/* BACK TO BLOG LINK */}
        <Link
          to="/blog"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-primary transition-colors mb-8 group"
        >
          <ArrowLeft size={14} className="group-hover:-translate-x-0.5 transition-transform" />
          Back to Blog
        </Link>

        {/* METADATA & TITLE */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <span className="px-2.5 py-1 bg-primary/10 text-primary text-xs font-bold rounded-md uppercase tracking-wider">
            {post.category}
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-foreground mt-4 mb-6 leading-tight">
            {post.title}
          </h1>

          {/* Author Card */}
          <div className="flex items-center gap-4 mb-8 pb-6 border-b border-border/60">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
              {post.author.charAt(0)}
            </div>
            <div>
              <p className="text-sm font-bold text-foreground">{post.author}</p>
              <div className="flex items-center gap-4 text-xs text-muted-foreground mt-0.5">
                <span className="flex items-center gap-1">
                  <Calendar size={12} /> {post.date}
                </span>
                <span className="flex items-center gap-1">
                  <Clock size={12} /> {post.readTime}
                </span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* COVER IMAGE */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="rounded-2xl overflow-hidden mb-10 border border-border/50 shadow-md aspect-video"
        >
          <img
            src={post.coverImage}
            alt={post.title}
            className="w-full h-full object-cover"
          />
        </motion.div>

        {/* ARTICLE BODY */}
        <motion.article
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="prose prose-neutral dark:prose-invert max-w-none mb-16"
        >
          {renderMarkdownContent(post.content)}
        </motion.article>

        {/* BOOKING CALL-TO-ACTION CARD */}
        <div className="bg-primary/5 border border-primary/20 rounded-2xl p-6 sm:p-8 mb-16 text-center">
          <h3 className="text-lg sm:text-xl font-bold text-foreground mb-2">Need Professional Service?</h3>
          <p className="text-muted-foreground text-sm sm:text-base mb-6 max-w-md mx-auto">
            From wall mounting televisions to home repairs, our licensed specialists at Atlanta TV Mount Pro are ready to assist.
          </p>
          <div className="flex justify-center gap-4">
            <Link to="/contact">
              <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold">
                Get a Free Estimate
              </Button>
            </Link>
          </div>
        </div>

        {/* COMMENTS SECTION */}
        <div className="border-t border-border/85 pt-10">
          <div className="flex items-center gap-2 mb-8">
            <MessageSquare className="text-primary w-5 h-5" />
            <h2 className="text-xl font-bold text-foreground">Discussion ({comments.length})</h2>
          </div>

          {/* COMMENT SUBMISSION FORM OR AUTH BANNER */}
          <div className="mb-10">
            {isAuthenticated ? (
              <form onSubmit={handleCommentSubmit} className="space-y-4 bg-muted/20 p-5 rounded-2xl border border-border/55">
                <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
                  <span>Commenting as:</span>
                  <span className="text-foreground font-bold">{user.name || user.email}</span>
                </div>
                <div className="relative">
                  <textarea
                    rows={4}
                    placeholder="Join the conversation... Please share your thoughts or ask a question."
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    required
                    className="w-full p-4 rounded-xl bg-card border border-border focus:outline-none focus:ring-1 focus:ring-primary text-sm placeholder:text-muted-foreground resize-y"
                  />
                </div>
                <div className="flex justify-end">
                  <Button
                    type="submit"
                    disabled={submittingComment}
                    className="bg-primary hover:bg-primary/90 text-primary-foreground inline-flex items-center gap-1.5 text-xs font-bold"
                  >
                    {submittingComment ? "Posting..." : "Post Comment"}
                    <Send size={12} />
                  </Button>
                </div>
              </form>
            ) : (
              <div className="flex flex-col items-center text-center p-6 border border-border/85 bg-card/60 rounded-2xl shadow-sm">
                <ShieldAlert className="w-8 h-8 text-primary mb-3" />
                <h4 className="font-bold text-foreground text-sm sm:text-base mb-1">Sign in to leave a comment</h4>
                <p className="text-muted-foreground text-xs max-w-sm mb-4">
                  To keep our discussions constructive and safe, comments are restricted to registered clients.
                </p>
                <Button onClick={() => openAuthModal("login")} size="sm" className="bg-primary text-primary-foreground">
                  Sign In / Create Account
                </Button>
              </div>
            )}
          </div>

          {/* COMMENTS LIST */}
          <div className="space-y-6">
            {comments.length === 0 ? (
              <div className="text-center py-8 border border-dashed border-border/60 rounded-xl">
                <p className="text-sm text-muted-foreground">No comments yet. Be the first to start the discussion!</p>
              </div>
            ) : (
              comments.map((comm) => (
                <div key={comm.id} className="flex gap-4 p-4 rounded-xl bg-muted/15 border border-border/30">
                  <div className="w-9 h-9 rounded-full bg-primary/10 flex-shrink-0 flex items-center justify-center text-primary font-bold text-sm">
                    {comm.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between">
                      <h5 className="text-xs font-bold text-foreground">{comm.name}</h5>
                      <span className="text-[10px] text-muted-foreground">{comm.created}</span>
                    </div>
                    <p className="text-muted-foreground text-xs sm:text-sm whitespace-pre-wrap leading-relaxed">
                      {comm.text}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>

        </div>

      </div>
    </div>
  );
};

export default BlogPostDetailPage;
