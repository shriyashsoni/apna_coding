import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { useAuth } from "@/hooks/use-auth";
import { Plus, Edit, Trash2, Star, StarOff, Eye, EyeOff, Calendar, MapPin, Users, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { supabase } from "@/lib/supabase";

interface EventGroupForm {
  groupName: string;
  description: string;
  bannerImage: string;
  location: string;
  startDate: string;
  endDate: string;
  isFeatured: boolean;
  status: "draft" | "published";
}

export function EventGroupsManager() {
  const { user: authUser } = useAuth();
  const address = authUser?.wallet_address;
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingGroupId, setEditingGroupId] = useState<string | null>(null);
  const [eventGroups, setEventGroups] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState<EventGroupForm>({
    groupName: "",
    description: "",
    bannerImage: "",
    location: "",
    startDate: "",
    endDate: "",
    isFeatured: false,
    status: "draft",
  });

  const fetchEventGroups = async () => {
    if (!address) return;
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('event_groups')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      setEventGroups(data || []);
    } catch (err) {
      console.error("Error fetching event groups:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEventGroups();
  }, [address]);

  const handleCreate = async () => {
    if (!address) {
      toast.error("Please connect your wallet");
      return;
    }

    if (!formData.groupName.trim() || !formData.description.trim() || !formData.location.trim()) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (!formData.startDate || !formData.endDate) {
      toast.error("Please select start and end dates");
      return;
    }

    try {
      const { error } = await supabase.from('event_groups').insert({
        group_name: formData.groupName.trim(),
        description: formData.description.trim(),
        banner_image: formData.bannerImage.trim() || null,
        location: formData.location.trim(),
        start_date: new Date(formData.startDate).getTime(),
        end_date: new Date(formData.endDate).getTime(),
        is_featured: formData.isFeatured,
        status: formData.status,
        wallet_address: address,
      });

      if (error) throw error;

      toast.success("✅ Event group created successfully!");
      setIsCreateDialogOpen(false);
      resetForm();
      fetchEventGroups();
    } catch (error: any) {
      toast.error(error.message || "Failed to create event group");
    }
  };

  const handleEdit = async () => {
    if (!address || !editingGroupId) {
      toast.error("Something went wrong");
      return;
    }

    if (!formData.groupName.trim() || !formData.description.trim() || !formData.location.trim()) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      const { error } = await supabase.from('event_groups').update({
        group_name: formData.groupName.trim(),
        description: formData.description.trim(),
        banner_image: formData.bannerImage.trim() || null,
        location: formData.location.trim(),
        start_date: new Date(formData.startDate).getTime(),
        end_date: new Date(formData.endDate).getTime(),
        is_featured: formData.isFeatured,
        status: formData.status,
      }).eq('id', editingGroupId);

      if (error) throw error;

      toast.success("✅ Event group updated successfully!");
      setIsEditDialogOpen(false);
      resetForm();
      fetchEventGroups();
    } catch (error: any) {
      toast.error(error.message || "Failed to update event group");
    }
  };

  const handleDelete = async (id: string) => {
    if (!address) {
      toast.error("Please connect your wallet");
      return;
    }

    if (!confirm("Are you sure you want to delete this event group? This cannot be undone.")) {
      return;
    }

    try {
      const { error } = await supabase.from('event_groups').delete().eq('id', id);
      if (error) throw error;
      toast.success("✅ Event group deleted successfully!");
      fetchEventGroups();
    } catch (error: any) {
      toast.error(error.message || "Failed to delete event group");
    }
  };

  const handleToggleFeatured = async (id: string, currentFeatured: boolean) => {
    if (!address) {
      toast.error("Please connect your wallet");
      return;
    }

    try {
      const { error } = await supabase.from('event_groups').update({ is_featured: !currentFeatured }).eq('id', id);
      if (error) throw error;
      toast.success(!currentFeatured ? "⭐ Marked as featured!" : "Removed from featured");
      fetchEventGroups();
    } catch (error: any) {
      toast.error(error.message || "Failed to toggle featured status");
    }
  };

  const handleTogglePublish = async (id: string, currentStatus: string) => {
    if (!address) {
      toast.error("Please connect your wallet");
      return;
    }

    try {
      const newStatus = currentStatus === "published" ? "draft" : "published";
      const { error } = await supabase.from('event_groups').update({ status: newStatus }).eq('id', id);
      if (error) throw error;
      toast.success(newStatus === "published" ? "✅ Published successfully!" : "📝 Moved to draft");
      fetchEventGroups();
    } catch (error: any) {
      toast.error(error.message || "Failed to update status");
    }
  };

  const resetForm = () => {
    setFormData({
      groupName: "",
      description: "",
      bannerImage: "",
      location: "",
      startDate: "",
      endDate: "",
      isFeatured: false,
      status: "draft",
    });
    setEditingGroupId(null);
  };

  const openEditDialog = (group: any) => {
    setFormData({
      groupName: group.group_name,
      description: group.description,
      bannerImage: group.banner_image || "",
      location: group.location,
      startDate: new Date(group.start_date).toISOString().split('T')[0],
      endDate: new Date(group.end_date).toISOString().split('T')[0],
      isFeatured: group.is_featured || false,
      status: group.status,
    });
    setEditingGroupId(group.id);
    setIsEditDialogOpen(true);
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                Event Groups Management
              </CardTitle>
              <CardDescription>
                Create and manage event groups like "Consensus Hong Kong" with multiple side events
              </CardDescription>
            </div>

            <Dialog open={isCreateDialogOpen} onOpenChange={(open) => {
              setIsCreateDialogOpen(open);
              if (!open) resetForm();
            }}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Create Event Group
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Create New Event Group</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 pt-4">
                  <div>
                    <Label htmlFor="groupName">Group Name *</Label>
                    <Input
                      id="groupName"
                      value={formData.groupName}
                      onChange={(e) => setFormData({ ...formData, groupName: e.target.value })}
                      placeholder="Consensus Hong Kong 2026"
                    />
                  </div>

                  <div>
                    <Label htmlFor="description">Description *</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="The biggest blockchain conference in Asia with 50+ side events..."
                      className="min-h-[100px]"
                    />
                  </div>

                  <div>
                    <Label htmlFor="bannerImage">Banner Image URL (Optional)</Label>
                    <Input
                      id="bannerImage"
                      value={formData.bannerImage}
                      onChange={(e) => setFormData({ ...formData, bannerImage: e.target.value })}
                      placeholder="https://example.com/banner.jpg"
                    />
                  </div>

                  <div>
                    <Label htmlFor="location">Location *</Label>
                    <Input
                      id="location"
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      placeholder="Hong Kong"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="startDate">Start Date *</Label>
                      <Input
                        id="startDate"
                        type="date"
                        value={formData.startDate}
                        onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="endDate">End Date *</Label>
                      <Input
                        id="endDate"
                        type="date"
                        value={formData.endDate}
                        onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="isFeatured"
                      checked={formData.isFeatured}
                      onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                      className="h-4 w-4"
                    />
                    <Label htmlFor="isFeatured">Mark as Featured</Label>
                  </div>

                  <div>
                    <Label htmlFor="status">Status</Label>
                    <select
                      id="status"
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value as "draft" | "published" })}
                      className="w-full border rounded-md p-2"
                    >
                      <option value="draft">Draft</option>
                      <option value="published">Published</option>
                    </select>
                  </div>

                  <Button onClick={handleCreate} className="w-full">
                    <Plus className="mr-2 h-4 w-4" />
                    Create Event Group
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>

        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2 text-primary" />
              <p className="text-muted-foreground">Loading event groups...</p>
            </div>
          ) : eventGroups.length === 0 ? (
            <div className="text-center py-12">
              <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
              <p className="text-muted-foreground">No event groups yet. Create your first one!</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Group Name</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Dates</TableHead>
                  <TableHead>Events</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {eventGroups.map((group) => (
                  <TableRow key={group.id}>
                    <TableCell>
                      <div>
                        <div className="font-semibold flex items-center gap-2">
                          {group.group_name}
                          {group.is_featured && <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />}
                        </div>
                        <div className="text-sm text-muted-foreground truncate max-w-md">
                          {group.description}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center text-sm">
                        <MapPin className="h-4 w-4 mr-1 text-muted-foreground" />
                        {group.location}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center text-sm">
                        <Calendar className="h-4 w-4 mr-1 text-muted-foreground" />
                        {formatDate(group.start_date)} - {formatDate(group.end_date)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{group.event_count || 0} events</Badge>
                    </TableCell>
                    <TableCell>
                      {group.status === "published" ? (
                        <Badge variant="default">Published</Badge>
                      ) : (
                        <Badge variant="outline">Draft</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleToggleFeatured(group.id, group.is_featured)}
                          title={group.is_featured ? "Remove from featured" : "Mark as featured"}
                        >
                          {group.is_featured ? (
                            <StarOff className="h-4 w-4" />
                          ) : (
                            <Star className="h-4 w-4" />
                          )}
                        </Button>

                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleTogglePublish(group.id, group.status)}
                          title={group.status === "published" ? "Unpublish" : "Publish"}
                        >
                          {group.status === "published" ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </Button>

                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => openEditDialog(group)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>

                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDelete(group.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={(open) => {
        setIsEditDialogOpen(open);
        if (!open) resetForm();
      }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Event Group</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div>
              <Label htmlFor="editGroupName">Group Name *</Label>
              <Input
                id="editGroupName"
                value={formData.groupName}
                onChange={(e) => setFormData({ ...formData, groupName: e.target.value })}
                placeholder="Consensus Hong Kong 2026"
              />
            </div>

            <div>
              <Label htmlFor="editDescription">Description *</Label>
              <Textarea
                id="editDescription"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="The biggest blockchain conference in Asia with 50+ side events..."
                className="min-h-[100px]"
              />
            </div>

            <div>
              <Label htmlFor="editBannerImage">Banner Image URL (Optional)</Label>
              <Input
                id="editBannerImage"
                value={formData.bannerImage}
                onChange={(e) => setFormData({ ...formData, bannerImage: e.target.value })}
                placeholder="https://example.com/banner.jpg"
              />
            </div>

            <div>
              <Label htmlFor="editLocation">Location *</Label>
              <Input
                id="editLocation"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="Hong Kong"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="editStartDate">Start Date *</Label>
                <Input
                  id="editStartDate"
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="editEndDate">End Date *</Label>
                <Input
                  id="editEndDate"
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="editIsFeatured"
                checked={formData.isFeatured}
                onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                className="h-4 w-4"
              />
              <Label htmlFor="editIsFeatured">Mark as Featured</Label>
            </div>

            <div>
              <Label htmlFor="editStatus">Status</Label>
              <select
                id="editStatus"
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as "draft" | "published" })}
                className="w-full border rounded-md p-2"
              >
                <option value="draft">Draft</option>
                <option value="published">Published</option>
              </select>
            </div>

            <Button onClick={handleEdit} className="w-full">
              <Edit className="mr-2 h-4 w-4" />
              Update Event Group
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
