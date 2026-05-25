import { motion } from "framer-motion";
import { Calendar, Eye, User, ArrowLeft, MessageCircle, Heart, ExternalLink, Github, FileText, Package, Trash2 } from "lucide-react";
import { Link, useParams, useNavigate } from "react-router";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { SEO } from "@/components/SEO";
import { useAuth } from "@/hooks/use-auth";
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

export default function ProductDetail() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { user, isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const address = user?.wallet_address;
  const isConnected = isAuthenticated;
  const [comment, setComment] = useState("");
  const [product, setProduct] = useState<any>(undefined);
  const [comments, setComments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (slug) {
      fetchProduct();
    }
  }, [slug]);

  const fetchProduct = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("products")
        .select(`
          *,
          author:users!author_id(*)
        `)
        .eq("slug", slug)
        .single();
      
      if (error) throw error;
      setProduct(data);
      
      if (data) {
        fetchComments(data.id);
        incrementViews(data.id);
      }
    } catch (error) {
      console.error("Error fetching product:", error);
      setProduct(null);
    } finally {
      setLoading(false);
    }
  };

  const fetchComments = async (productId: string) => {
    try {
      const { data, error } = await supabase
        .from("product_comments")
        .select(`
          *,
          author:users!author_id(*)
        `)
        .eq("product_id", productId)
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      setComments(data || []);
    } catch (error) {
      console.error("Error fetching comments:", error);
    }
  };

  const incrementViews = async (productId: string) => {
    try {
      await supabase.rpc('increment_product_views', { product_id: productId });
    } catch (error) {
      console.error("Error incrementing views:", error);
    }
  };

  const handleCommentSubmit = async () => {
    if (!isConnected || !address) {
      toast.error("Please connect your wallet to comment");
      return;
    }

    if (!comment.trim()) {
      toast.error("Please write a comment");
      return;
    }

    if (!product?.id) {
      toast.error("Product not found");
      return;
    }

    try {
      const { error } = await supabase
        .from("product_comments")
        .insert({
          product_id: product.id,
          content: comment,
          author_id: user?.id,
          wallet_address: address
        });

      if (error) throw error;
      
      setComment("");
      toast.success("Comment added successfully!");
      fetchComments(product.id);
    } catch (error) {
      toast.error("Failed to add comment");
      console.error(error);
    }
  };

  const handleLike = async () => {
    if (!product?.id) return;

    try {
      const { error } = await supabase.rpc('like_product', { product_id: product.id });
      if (error) throw error;
      
      setProduct((prev: any) => ({ ...prev, likes: (prev.likes || 0) + 1 }));
      toast.success("Product liked!");
    } catch (error) {
      console.error(error);
    }
  };

  const handleDeleteProduct = async () => {
    if (!product?.id) return;

    try {
      const { error } = await supabase
        .from("products")
        .delete()
        .eq("id", product.id);

      if (error) throw error;
      
      toast.success("Product deleted successfully!");
      navigate("/products");
    } catch (error: any) {
      toast.error(error?.message || "Failed to delete product");
      console.error(error);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    try {
      const { error } = await supabase
        .from("product_comments")
        .delete()
        .eq("id", commentId);

      if (error) throw error;
      
      toast.success("Comment deleted!");
      fetchComments(product.id);
    } catch (error: any) {
      toast.error(error?.message || "Failed to delete comment");
      console.error(error);
    }
  };

  const canDeleteProduct = () => {
    if (!user && !address) return false;
    if (user?.role === "admin") return true;
    if (address && product?.wallet_address === address) return true;
    if (user?.id && product?.author_id === user.id) return true;
    return false;
  };

  const canDeleteComment = (comment: any) => {
    if (!user && !address) return false;
    if (user?.role === "admin") return true;
    if (user?.id && comment.author_id === user.id) return true;
    if (address && comment.wallet_address === address) return true;
    return false;
  };

  if (!slug) {
    navigate("/products");
    return null;
  }

  if (product === undefined) {
    return (
      <div className="min-h-screen flex flex-col bg-background text-foreground pt-24">
        <Navbar />
        <main className="flex-1 pt-24 pb-16">
          <div className="container mx-auto px-4 text-center">
            <p className="text-muted-foreground">Loading...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (product === null) {
    return (
      <div className="min-h-screen flex flex-col bg-background text-foreground pt-24">
        <Navbar />
        <main className="flex-1 pt-24 pb-16">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-3xl font-bold mb-4">Product Not Found</h1>
            <p className="text-muted-foreground mb-6">
              The product you're looking for doesn't exist.
            </p>
            <Link to="/products">
              <Button>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Products
              </Button>
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground pt-24">
      <SEO
        title={product.name}
        description={product.description}
        image={product.image_url || undefined}
        url={`/products/${product.slug}`}
        type="product"
        keywords={product.tags || []}
        publishedTime={new Date(product.created_at || Date.now()).toISOString()}
      />
      <Navbar />
      <main className="flex-1 pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-4xl">
          <Link to="/products">
            <Button variant="ghost" size="sm" className="mb-6">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Products
            </Button>
          </Link>

          <motion.article
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-12"
          >
            {product.image_url && (
              <div className="relative h-96 rounded-lg overflow-hidden mb-8 border border-primary/20">
                <img
                  src={product.image_url}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              </div>
            )}

            <div className="mb-8">
              <Badge className="mb-4">{product.category}</Badge>

              <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                {product.name}
              </h1>

              <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-6">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  <span>{product.author?.name || product.wallet_address?.slice(0, 6) + "..." || "Anonymous"}</span>
                </div>
                <span>•</span>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <span>{new Date(product.created_at).toLocaleDateString()}</span>
                </div>
                <span>•</span>
                <div className="flex items-center gap-2">
                  <Eye className="h-4 w-4" />
                  <span>{product.views || 0} views</span>
                </div>
                <span>•</span>
                <div className="flex items-center gap-2">
                  <Heart className="h-4 w-4" />
                  <span>{product.likes || 0} likes</span>
                </div>
              </div>

              {product.tags && product.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-6">
                  {product.tags.map((tag: string, i: number) => (
                    <Badge key={i} variant="outline">
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}

              <div className="flex flex-wrap gap-3">
                <Button onClick={handleLike} className="bg-primary/10 text-primary hover:bg-primary/20">
                  <Heart className="mr-2 h-4 w-4" />
                  Like Product
                </Button>

                <ShareButtons
                  url={`/products/${slug}`}
                  title={product.name}
                  description={product.description}
                  hashtags={['web3', 'product', 'blockchain', 'apnacoding']}
                />

                {product.website_url && (
                  <a href={product.website_url} target="_blank" rel="noopener noreferrer">
                    <Button variant="outline">
                      <ExternalLink className="mr-2 h-4 w-4" />
                      Visit Website
                    </Button>
                  </a>
                )}

                {product.github_url && (
                  <a href={product.github_url} target="_blank" rel="noopener noreferrer">
                    <Button variant="outline">
                      <Github className="mr-2 h-4 w-4" />
                      View on GitHub
                    </Button>
                  </a>
                )}

                {product.pdf_url && (
                  <a href={product.pdf_url} target="_blank" rel="noopener noreferrer">
                    <Button variant="outline">
                      <FileText className="mr-2 h-4 w-4" />
                      View PDF
                    </Button>
                  </a>
                )}

                {canDeleteProduct() && (
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive">
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete Product
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Product?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This action cannot be undone. This will permanently delete the product and all its comments.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDeleteProduct} className="bg-destructive text-destructive-foreground">
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                )}
              </div>
            </div>

            <Card className="mb-8 border-primary/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  About this Product
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-foreground/90 leading-relaxed whitespace-pre-wrap">
                  {product.description}
                </p>
              </CardContent>
            </Card>

            {product.content && (
              <Card className="mb-8 border-primary/20">
                <CardHeader>
                  <CardTitle>Details</CardTitle>
                </CardHeader>
                <CardContent>
                  <div
                    className="prose prose-invert max-w-none text-foreground/90 leading-relaxed whitespace-pre-wrap"
                    dangerouslySetInnerHTML={{ __html: product.content }}
                  />
                </CardContent>
              </Card>
            )}
          </motion.article>

          <Card className="border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageCircle className="h-5 w-5" />
                Comments ({comments?.length || 0})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <Textarea
                  placeholder={
                    isConnected
                      ? "Share your thoughts about this product..."
                      : "Connect your wallet to comment"
                  }
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  disabled={!isConnected}
                  className="min-h-[100px]"
                />
                <Button
                  onClick={handleCommentSubmit}
                  disabled={!isConnected || !comment.trim()}
                >
                  Post Comment
                </Button>
              </div>

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
                            {c.author?.name || c.wallet_address?.slice(0,6) + "..." || "Anonymous"}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {new Date(c.created_at).toLocaleString()}
                          </span>
                        </div>

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
