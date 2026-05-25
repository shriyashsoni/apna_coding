import { motion } from "framer-motion";
import { Calendar, Eye, User, ArrowLeft, MessageCircle, Trash2, Newspaper } from "lucide-react";
import { Link, useParams, useNavigate } from "react-router";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/hooks/use-auth";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { SEO } from "@/components/SEO";
import { ShareButtons } from "@/components/ShareButtons";
import { supabase } from "@/lib/supabase";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export default function NewsDetail() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { user, isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const address = user?.wallet_address;
  const isConnected = isAuthenticated;
  const [comment, setComment] = useState("");
  const [post, setPost] = useState<any>(null);
  const [comments, setComments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (slug) {
      fetchPostAndComments();
    }
  }, [slug]);

  const fetchPostAndComments = async () => {
    setLoading(true);
    try {
      const { data: postData, error: postError } = await supabase
        .from("news")
        .select("*")
        .eq("slug", slug)
        .single();
      
      if (postError) throw postError;
      setPost(postData);

      if (postData) {
        // Increment views
        await supabase.rpc('increment_news_views', { post_id: postData.id });

        // Fetch comments
        const { data: commentsData, error: commentsError } = await supabase
          .from("news_comments")
          .select("*")
          .eq("news_id", postData.id)
          .order("created_at", { ascending: false });
        
        if (commentsError) throw commentsError;
        setComments(commentsData || []);
      }
    } catch (error) {
      console.error("Error fetching post:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCommentSubmit = async () => {
    if (!isAuthenticated && !isConnected) {
      toast.error("Please connect your wallet or login to comment");
      return;
    }

    if (!comment.trim()) {
      toast.error("Please write a comment");
      return;
    }

    if (!post?.id) {
      toast.error("Post not found");
      return;
    }

    try {
      const { data, error } = await supabase
        .from("news_comments")
        .insert({
          news_id: post.id,
          content: comment,
          author_id: user?.id,
          author_name: user?.name || (address ? `${address.slice(0, 6)}...` : "Anonymous"),
          wallet_address: address
        })
        .select()
        .single();

      if (error) throw error;

      setComments([data, ...comments]);
      setComment("");
      toast.success("Comment added successfully!");
    } catch (error) {
      toast.error("Failed to add comment");
      console.error(error);
    }
  };

  const handleDeleteNews = async () => {
    if (!post?.id) return;

    try {
      const { error } = await supabase
        .from("news")
        .delete()
        .eq("id", post.id);

      if (error) throw error;

      toast.success("News post deleted successfully!");
      navigate("/news");
    } catch (error: any) {
      toast.error(error?.message || "Failed to delete news post");
      console.error(error);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    try {
      const { error } = await supabase
        .from("news_comments")
        .delete()
        .eq("id", commentId);

      if (error) throw error;

      setComments(comments.filter(c => c.id !== commentId));
      toast.success("Comment deleted!");
    } catch (error: any) {
      toast.error(error?.message || "Failed to delete comment");
      console.error(error);
    }
  };

  const canDeleteNews = () => {
    if (!user) return false;
    if (user?.role === "admin") return true;
    if (user?.id && post?.author_id === user.id) return true;
    return false;
  };

  const canDeleteComment = (comment: any) => {
    if (!user) return false;
    if (user?.role === "admin") return true;
    if (user?.id && comment.author_id === user.id) return true;
    return false;
  };

  if (!slug) {
    navigate("/news");
    return null;
  }

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-background text-foreground pt-24">
        <Navbar />
        <main className="flex-1 pt-24 pb-16">
          <div className="container mx-auto px-4">
            <div className="text-center">
              <p className="text-muted-foreground">Loading...</p>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen flex flex-col bg-background text-foreground pt-24">
        <Navbar />
        <main className="flex-1 pt-24 pb-16">
          <div className="container mx-auto px-4">
            <div className="text-center">
              <h1 className="text-3xl font-bold mb-4">Post Not Found</h1>
              <p className="text-muted-foreground mb-6">
                The news post you're looking for doesn't exist.
              </p>
              <Link to="/news">
                <Button>
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to News
                </Button>
              </Link>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground pt-24">
      <SEO
        title={post.title}
        description={post.excerpt || post.content?.substring(0, 160) || ""}
        image={post.cover_image || undefined}
        url={`/news/${post.slug}`}
        type="article"
        keywords={post.tags || []}
        author="Apna Coding"
        publishedTime={new Date(post.created_at || Date.now()).toISOString()}
        section={post.category}
        tags={post.tags || []}
      />
      <Navbar />
      <main className="flex-1 pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-4xl">
        {/* Back Button */}
        <Link to="/news">
          <Button variant="ghost" size="sm" className="mb-6">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to News
          </Button>
        </Link>

        {/* Article */}
        <motion.article
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          {/* Cover Image */}
          {post.cover_image && (
            <div className="relative h-96 rounded-lg overflow-hidden mb-8 border border-primary/20">
              <img
                src={post.cover_image}
                alt={post.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            </div>
          )}

          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <Badge className="text-base px-4 py-1">{post.category}</Badge>

              {/* Delete Button (Author or Admin only) */}
              {canDeleteNews() && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" size="sm">
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete Post
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete News Post?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete the news post and all its comments.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={handleDeleteNews} className="bg-destructive text-destructive-foreground">
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
            </div>

            <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              {post.title}
            </h1>

            {/* Excerpt */}
            {post.excerpt && (
              <p className="text-lg text-muted-foreground mb-6 italic">
                {post.excerpt}
              </p>
            )}

            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4" />
                <span>{post.author_name}</span>
              </div>
              <span>•</span>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span>{new Date(post.created_at).toLocaleDateString()}</span>
              </div>
              <span>•</span>
              <div className="flex items-center gap-2">
                <Eye className="h-4 w-4" />
                <span>{post.views || 0} views</span>
              </div>
              {post.is_featured && (
                <>
                  <span>•</span>
                  <Badge variant="secondary" className="text-xs">
                    <Newspaper className="mr-1 h-3 w-3" />
                    Featured
                  </Badge>
                </>
              )}
            </div>

            {/* Tags */}
            {post.tags && post.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-4">
                {post.tags.map((tag: string, i: number) => (
                  <Badge key={i} variant="outline" className="text-xs">
                    #{tag}
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Content */}
          <Card className="border-primary/20 mb-8">
            <CardContent className="pt-6">
              <div className="prose prose-lg prose-invert max-w-none">
                <div
                  className="text-foreground leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: post.content }}
                />
              </div>
            </CardContent>
          </Card>

          {/* Share & Metadata Card */}
          <Card className="border-primary/20 mb-8 bg-card/30">
            <CardContent className="pt-6">
              <div className="flex flex-wrap items-center gap-4 justify-between">
                <div className="flex items-center gap-4">
                  <div className="text-sm">
                    <p className="text-muted-foreground mb-1">Published by</p>
                    <p className="font-semibold">{post.author_name}</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <ShareButtons
                    url={`/news/${slug}`}
                    title={post.title}
                    description={post.excerpt || post.content?.substring(0, 160) || ""}
                    hashtags={['web3', 'news', 'blockchain', 'apnacoding']}
                  />
                  <Button variant="outline" size="sm" onClick={() => navigate("/news")}>
                    View All News
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.article>

        {/* Comments Section */}
        <Card className="border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5" />
              Comments ({comments?.length || 0})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Add Comment */}
            <div className="space-y-4">
              <Textarea
                placeholder={
                  isAuthenticated || isConnected
                    ? "Share your thoughts..."
                    : "Connect wallet or login to comment"
                }
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                disabled={!isAuthenticated && !isConnected}
                className="min-h-[100px]"
              />
              <Button
                onClick={handleCommentSubmit}
                disabled={(!isAuthenticated && !isConnected) || !comment.trim()}
              >
                Post Comment
              </Button>
            </div>

            {/* Comments List */}
            <div className="space-y-4">
              {comments && comments.length > 0 ? (
                comments.map((c: any) => (
                  <motion.div
                    key={c.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="border border-primary/10 rounded-lg p-4 bg-card/50"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-primary" />
                        <span className="font-semibold text-sm">
                          {c.author_name || "Anonymous"}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {new Date(c.created_at).toLocaleString()}
                        </span>
                      </div>

                      {/* Delete Comment Button (Author or Admin only) */}
                      {canDeleteComment(c) && (
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-6 w-6 p-0 text-destructive hover:text-destructive">
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Comment?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This action cannot be undone. This will permanently delete this comment.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDeleteComment(c.id)}
                                className="bg-destructive text-destructive-foreground"
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      )}
                    </div>
                    <p className="text-sm text-foreground/90">{c.content}</p>
                  </motion.div>
                ))
              ) : (
                <p className="text-center text-muted-foreground py-8">
                  No comments yet. Be the first to share your thoughts!
                </p>
              )}
            </div>
          </CardContent>
        </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
}
