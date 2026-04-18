import React from "react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
interface UploadedVideo {
    id: string;
    title: string;
    description: string;
    genre: string;
    releaseYear: number;
    duration: number;
    status: 'processing' | 'ready' | 'deleted';
    intro_start: number;
    intro_end: number;
    recap_start: number;
    recap_end: number;
    video_file: string;
    uploaded_by: string;
    created_at: string;
    updated_at: string;
  }
  interface EditModalProps {
    editingVideo: UploadedVideo | null;
    setEditingVideo: (video: UploadedVideo | null) => void;
    isUpdating: boolean;
    handleUpdate: () => void;
    genres: string[];
  }


export function EditModal({ 
  editingVideo, 
  setEditingVideo, 
  isUpdating, 
  handleUpdate,
  genres 
}: EditModalProps) {
  return (
    <Dialog open={!!editingVideo} onOpenChange={(open) => !open && setEditingVideo(null)}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Video Details</DialogTitle>
          <DialogDescription>
            Make changes to your video metadata here.
          </DialogDescription>
        </DialogHeader>

        {editingVideo && (
          <div className="grid gap-4 py-4 md:grid-cols-2">
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="edit-title">Title</Label>
              <Input
                id="edit-title"
                value={editingVideo.title}
                onChange={(e) => setEditingVideo({ ...editingVideo, title: e.target.value })}
                disabled={isUpdating}
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="edit-description">Description</Label>
              <textarea
                id="edit-description"
                className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                value={editingVideo.description || ""}
                onChange={(e) => setEditingVideo({ ...editingVideo, description: e.target.value })}
                disabled={isUpdating}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-genre">Genre</Label>
              <Select 
                value={editingVideo.genre || ""} 
                onValueChange={(value) => setEditingVideo({ ...editingVideo, genre: value })}
                disabled={isUpdating}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select genre" />
                </SelectTrigger>
                <SelectContent>
                  {genres.map((g) => (
                    <SelectItem key={g} value={g}>{g}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-status">Status</Label>
              <Select 
                value={editingVideo.status} 
                onValueChange={(value: 'processing' | 'ready' | 'deleted') => setEditingVideo({ ...editingVideo, status: value })}
                disabled={isUpdating}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="processing">Processing</SelectItem>
                  <SelectItem value="ready">Ready</SelectItem>
                  <SelectItem value="deleted">Deleted</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-releaseYear">Release Year</Label>
              <Input
                id="edit-releaseYear"
                type="number"
                value={editingVideo.releaseYear || ""}
                onChange={(e) => setEditingVideo({ ...editingVideo, releaseYear: parseInt(e.target.value) || 0 })}
                disabled={isUpdating}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-duration">Duration (minutes)</Label>
              <Input
                id="edit-duration"
                type="number"
                value={editingVideo.duration || ""}
                onChange={(e) => setEditingVideo({ ...editingVideo, duration: parseInt(e.target.value) || 0 })}
                disabled={isUpdating}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-introStart">Intro Start (sec)</Label>
              <Input
                id="edit-introStart"
                type="number"
                value={editingVideo.intro_start || 0}
                onChange={(e) => setEditingVideo({ ...editingVideo, intro_start: parseInt(e.target.value) || 0 })}
                disabled={isUpdating}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-introEnd">Intro End (sec)</Label>
              <Input
                id="edit-introEnd"
                type="number"
                value={editingVideo.intro_end || 0}
                onChange={(e) => setEditingVideo({ ...editingVideo, intro_end: parseInt(e.target.value) || 0 })}
                disabled={isUpdating}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-recapStart">Recap Start (sec)</Label>
              <Input
                id="edit-recapStart"
                type="number"
                value={editingVideo.recap_start || 0}
                onChange={(e) => setEditingVideo({ ...editingVideo, recap_start: parseInt(e.target.value) || 0 })}
                disabled={isUpdating}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-recapEnd">Recap End (sec)</Label>
              <Input
                id="edit-recapEnd"
                type="number"
                value={editingVideo.recap_end || 0}
                onChange={(e) => setEditingVideo({ ...editingVideo, recap_end: parseInt(e.target.value) || 0 })}
                disabled={isUpdating}
              />
            </div>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => setEditingVideo(null)} disabled={isUpdating}>
            Cancel
          </Button>
          <Button onClick={handleUpdate} disabled={isUpdating || !editingVideo?.title?.trim()}>
            {isUpdating ? "Saving..." : "Save Changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}