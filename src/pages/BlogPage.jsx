import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Search, Calendar, Clock, ArrowRight, User } from "lucide-react";
import usePageTitle from "@/hooks/usePageTitle";
import PageHero from "@/components/PageHero";
import { getBlogPosts } from "@/lib/blogStorage";
import { Button } from "@/components/ui/button";

const categories = [
  "All",
  "TV Mounting",
  "Drywall Repair",
  "Painting",
  "Carpentry",
  "Flooring",
  "Plumbing",
  "Light Electrical"
];

const BlogPage = () => {
  usePageTitle({
    title: "Blog - Atlanta TV Mount PRO",
    description: "Read the Atlanta TV Mount PRO blog for professional guides on TV sizing, mounting heights, cable management, drywall repairs, and local handyman tips.",
    keywords: "TV mounting blog, TV mounting height guide, cable management tips, handyman advice Atlanta"
  });
  
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  useEffect(() => {
    const loadPosts = async () => {
      setLoading(true);
      const data = await getBlogPosts();
      setPosts(data);
      setLoading(false);
    };
    loadPosts();
  }, []);

  const filteredPosts = posts.filter((post) => {
    const matchesSearch = 
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = 
      selectedCategory === "All" || post.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  const featuredPost = filteredPosts.length > 0 ? filteredPosts[0] : null;
  const recentPosts = filteredPosts.length > 1 ? filteredPosts.slice(1) : [];

  return (
    <>
      <PageHero
        eyebrow="Info Hub"
        title="Expert Home Improvement Tips & Guides"
        subtitle="Professional advice on TV mounting, smart home setup, and handyman services from the team at Atlanta TV Mount Pro."
        image="https://images.unsplash.com/photo-1593305841991-05c297ba4575?w=1200&q=80"
        alt="Atlanta TV Mount PRO blog header"
      />

      <div className="py-16 bg-background min-h-screen">
        <div className="max-w-[1140px] mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* SEARCH & FILTER CONTROLS */}
          <div className="flex flex-col md:flex-row gap-6 justify-between items-center mb-12 border-b border-border/60 pb-8">
            {/* Search Input */}
            <div className="relative w-full md:max-w-xs">
              <Search className="absolute left-3.5 top-[11px] h-4.5 w-4.5 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search articles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-sm bg-muted/50 border border-border rounded-xl focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all"
              />
            </div>

            {/* Category Tags scrollable on mobile */}
            <div className="flex gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 scrollbar-none snap-x">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all snap-start cursor-pointer ${
                    selectedCategory === cat
                      ? "bg-primary text-primary-foreground shadow"
                      : "bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* LOADING STATE */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[1, 2, 3].map((n) => (
                <div key={n} className="animate-pulse space-y-4">
                  <div className="h-56 bg-muted rounded-2xl" />
                  <div className="h-4 bg-muted rounded w-1/4" />
                  <div className="h-6 bg-muted rounded w-3/4" />
                  <div className="h-4 bg-muted rounded w-full" />
                </div>
              ))}
            </div>
          ) : filteredPosts.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-lg text-muted-foreground mb-4">No articles found matching your criteria.</p>
              <Button onClick={() => { setSearchQuery(""); setSelectedCategory("All"); }} variant="outline">
                Clear Filters
              </Button>
            </div>
          ) : (
            <>
              {/* FEATURED POST */}
              {featuredPost && searchQuery === "" && selectedCategory === "All" && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  className="mb-16 group"
                >
                  <Link to={`/blog/${featuredPost.slug}`}>
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center bg-muted/30 border border-border/80 rounded-3xl overflow-hidden hover:shadow-lg transition-all duration-300">
                      <div className="lg:col-span-7 overflow-hidden h-72 lg:h-[400px]">
                        <img
                          src={featuredPost.coverImage}
                          alt={featuredPost.title}
                          className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-700 ease-out"
                        />
                      </div>
                      <div className="lg:col-span-5 p-6 lg:p-8 flex flex-col justify-center h-full">
                        <span className="px-3 py-1 bg-primary/10 text-primary text-xs font-semibold rounded-full w-fit mb-4">
                          Featured · {featuredPost.category}
                        </span>
                        <h2 className="text-2xl lg:text-3xl font-bold mb-4 text-foreground group-hover:text-primary transition-colors duration-250 leading-tight">
                          {featuredPost.title}
                        </h2>
                        <p className="text-muted-foreground text-sm mb-6 line-clamp-3">
                          {featuredPost.description}
                        </p>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground mb-6">
                          <span className="flex items-center gap-1">
                            <Calendar size={13} /> {featuredPost.date}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock size={13} /> {featuredPost.readTime}
                          </span>
                          <span className="flex items-center gap-1">
                            <User size={13} /> {featuredPost.author.split(",")[0]}
                          </span>
                        </div>
                        <span className="inline-flex items-center gap-1 text-sm font-semibold text-primary group-hover:gap-2 transition-all">
                          Read Full Article <ArrowRight size={15} />
                        </span>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              )}

              {/* POSTS GRID */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {(searchQuery !== "" || selectedCategory !== "All" ? filteredPosts : recentPosts).map((post, index) => (
                  <motion.article
                    key={post.id}
                    initial={{ opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.05 }}
                    className="flex flex-col bg-card border border-border/80 rounded-2xl overflow-hidden hover:shadow-md hover:border-border transition-all group"
                  >
                    <Link to={`/blog/${post.slug}`} className="flex flex-col h-full">
                      <div className="overflow-hidden h-48 sm:h-52 relative">
                        <img
                          src={post.coverImage}
                          alt={post.title}
                          className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-500"
                        />
                        <span className="absolute top-4 left-4 px-2.5 py-1 bg-background/90 backdrop-blur-sm text-foreground text-[10px] font-bold rounded-md uppercase tracking-wider border border-border/30">
                          {post.category}
                        </span>
                      </div>
                      <div className="p-6 flex-1 flex flex-col justify-between">
                        <div>
                          <div className="flex items-center gap-3 text-[11px] text-muted-foreground mb-3">
                            <span className="flex items-center gap-1">
                              <Calendar size={11} /> {post.date}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock size={11} /> {post.readTime}
                            </span>
                          </div>
                          <h3 className="text-lg font-bold text-foreground mb-3 group-hover:text-primary transition-colors leading-snug line-clamp-2">
                            {post.title}
                          </h3>
                          <p className="text-muted-foreground text-xs leading-relaxed mb-4 line-clamp-3">
                            {post.description}
                          </p>
                        </div>
                        <span className="inline-flex items-center gap-1 text-xs font-bold text-primary group-hover:gap-1.5 transition-all mt-2 pt-2 border-t border-border/40">
                          Read More <ArrowRight size={13} />
                        </span>
                      </div>
                    </Link>
                  </motion.article>
                ))}
              </div>
            </>
          )}

        </div>
      </div>
    </>
  );
};

export default BlogPage;
