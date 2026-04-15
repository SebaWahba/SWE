import { useState, useRef, useEffect } from "react";
import { motion } from "motion/react";
import { Upload, X, Film, Trash2, CheckCircle, AlertCircle } from "lucide-react";
import { Header } from "../components/Header";
import { useAuth } from "../contexts/AuthContext";
import { adminApi } from "../lib/api";
import { PageErrorBoundary } from "../components/PageErrorBoundary";
import { toast } from "sonner";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Progress } from "../components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";
import React from "react";

const GENRES = [
  "Nature & Wildlife",
  "Science & Space",
  "Technology",
  "Travel & Adventure",
  "Food & Cooking",
  "Documentary",
  "Entertainment",
  "Education",
  "Uncategorized",
];

const CATEGORIES = [
  "Nature",
  "Science",
  "Technology",
  "Travel",
  "Food",
  "Documentary",
  "Entertainment",
  "Education",
  "Uncategorized",
];

interface UploadedVideo {
  id: string;
  title: string;
  description: string;
  genre: string;
  category: string;
  video_file: string;
  tags: string[];
  created_at: string;
}

function AdminContent() {
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [genre, setGenre] = useState("");
  const [category, setCategory] = useState("");
  const [tags, setTags] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [myVideos, setMyVideos] = useState<UploadedVideo[]>([]);
  const [isLoadingVideos, setIsLoadingVideos] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    loadMyVideos();
  }, []);

  const loadMyVideos = async () => {
    setIsLoadingVideos(true);
    try {
      const { videos } = await adminApi.getMyVideos();
      setMyVideos(videos || []);
    } catch (error) {
      console.error("Failed to load videos:", error);
    } finally {
      setIsLoadingVideos(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const allowedTypes = ["video/mp4", "video/webm", "video/quicktime", "video/x-msvideo"];
      if (!allowedTypes.includes(file.type)) {
        toast.error("Invalid file type", {
          description: "Please select an MP4, WebM, MOV, or AVI video file.",
        });
        return;
      }
      if (file.size > 5 * 1024 * 1024 * 1024) {
        toast.error("File too large", {
          description: "Maximum file size is 5GB.",
        });
        return;
      }
      setSelectedFile(file);
      if (!title) {
        const fileName = file.name.replace(/\.[^/.]+$/, "");
        setTitle(fileName);
      }
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith("video/")) {
      if (file.size <= 5 * 1024 * 1024 * 1024) {
        setSelectedFile(file);
        if (!title) {
          const fileName = file.name.replace(/\.[^/.]+$/, "");
          setTitle(fileName);
        }
      } else {
        toast.error("File too large", {
          description: "Maximum file size is 5GB.",
        });
      }
    } else {
      toast.error("Invalid file", {
        description: "Please drop a video file.",
      });
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !title.trim()) {
      toast.error("Missing information", {
        description: "Please select a video and enter a title.",
      });
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    const result = await adminApi.uploadVideo(
      selectedFile,
      title.trim(),
      description.trim() || undefined,
      genre || undefined,
      category || undefined,
      tags || undefined,
      (progress) => setUploadProgress(progress)
    );

    setIsUploading(false);

    if (result.success) {
      toast.success("Video uploaded successfully!", {
        description: `"${title}" is now available.`,
      });
      setSelectedFile(null);
      setTitle("");
      setDescription("");
      setGenre("");
      setCategory("");
      setTags("");
      setUploadProgress(0);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      loadMyVideos();
    } else {
      toast.error("Upload failed", {
        description: result.error || "Something went wrong. Please try again.",
      });
    }
  };

  const handleDelete = async (video: UploadedVideo) => {
    setDeletingId(video.id);
    const result = await adminApi.deleteVideo(video.id);
    setDeletingId(null);

    if (result.success) {
      toast.success("Video deleted", {
        description: `"${video.title}" has been removed.`,
      });
      loadMyVideos();
    } else {
      toast.error("Delete failed", {
        description: result.error || "Something went wrong.",
      });
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="mb-8">
            <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
            <p className="text-muted-foreground mt-2">
              Upload and manage your video content
            </p>
          </div>

          <div className="grid gap-8 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="h-5 w-5" />
                  Upload Video
                </CardTitle>
                <CardDescription>
                  Upload a new video to the platform. Max file size: 5GB
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div
                  className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer ${
                    selectedFile
                      ? "border-primary bg-primary/5"
                      : "border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/50"
                  }`}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="video/mp4,video/webm,video/quicktime,video/x-msvideo"
                    className="hidden"
                    onChange={handleFileSelect}
                  />
                  {selectedFile ? (
                    <div className="space-y-2">
                      <CheckCircle className="h-12 w-12 mx-auto text-primary" />
                      <p className="font-medium">{selectedFile.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {(selectedFile.size / (1024 * 1024 * 1024)).toFixed(2)} GB
                      </p>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedFile(null);
                          if (fileInputRef.current) {
                            fileInputRef.current.value = "";
                          }
                        }}
                      >
                        <X className="h-4 w-4 mr-2" />
                        Remove
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <Upload className="h-12 w-12 mx-auto text-muted-foreground" />
                      <p className="font-medium">
                        Drag and drop your video here, or click to browse
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Supports MP4, WebM, MOV, and AVI
                      </p>
                    </div>
                  )}
                </div>

                {isUploading && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Uploading...</span>
                      <span>{uploadProgress}%</span>
                    </div>
                    <Progress value={uploadProgress} />
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="title">Title *</Label>
                  <Input
                    id="title"
                    placeholder="Enter video title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    disabled={isUploading}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <textarea
                    id="description"
                    className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    placeholder="Enter video description (optional)"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    disabled={isUploading}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="genre">Genre</Label>
                  <Select value={genre} onValueChange={setGenre} disabled={isUploading}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select genre" />
                    </SelectTrigger>
                    <SelectContent>
                      {GENRES.map((g) => (
                        <SelectItem key={g} value={g}>
                          {g}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select value={category} onValueChange={setCategory} disabled={isUploading}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORIES.map((c) => (
                        <SelectItem key={c} value={c}>
                          {c}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tags">Tags (comma-separated)</Label>
                  <Input
                    id="tags"
                    placeholder="e.g., wildlife, nature, documentary"
                    value={tags}
                    onChange={(e) => setTags(e.target.value)}
                    disabled={isUploading}
                  />
                </div>

                <Button
                  className="w-full"
                  size="lg"
                  onClick={handleUpload}
                  disabled={!selectedFile || !title.trim() || isUploading}
                >
                  {isUploading ? (
                    <>
                      <span className="mr-2">Uploading...</span>
                      <span>{uploadProgress}%</span>
                    </>
                  ) : (
                    <>
                      <Upload className="mr-2 h-4 w-4" />
                      Upload Video
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Film className="h-5 w-5" />
                  My Uploaded Videos
                </CardTitle>
                <CardDescription>
                  Videos you have uploaded to the platform
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoadingVideos ? (
                  <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                      <div
                        key={i}
                        className="h-16 rounded-lg bg-muted animate-pulse"
                      />
                    ))}
                  </div>
                ) : myVideos.length === 0 ? (
                  <div className="text-center py-8">
                    <Film className="h-12 w-12 mx-auto text-muted-foreground/50" />
                    <p className="mt-4 text-muted-foreground">No videos uploaded yet</p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Title</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Tags</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {myVideos.map((video) => (
                        <TableRow key={video.id}>
                          <TableCell className="font-medium">
                            <div className="max-w-[200px] truncate">{video.title}</div>
                          </TableCell>
                          <TableCell>
                            <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80">
                              {video.category || 'Uncategorized'}
                            </span>
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            <div className="max-w-[150px] truncate">
                              {video.tags?.join(', ') || '-'}
                            </div>
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {formatDate(video.created_at)}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDelete(video)}
                              disabled={deletingId === video.id}
                            >
                              {deletingId === video.id ? (
                                <span className="h-4 w-4 animate-spin">...</span>
                              ) : (
                                <Trash2 className="h-4 w-4 text-destructive" />
                              )}
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </div>
        </motion.div>
      </main>
    </div>
  );
}

export default function Admin() {
  const { user } = useAuth();
  const [accessDenied, setAccessDenied] = useState(false);

  useEffect(() => {
    if (user && user.isAdmin !== true) {
      setAccessDenied(true);
    }
  }, [user]);

  if (accessDenied) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <AlertCircle className="h-6 w-6" />
              Access Denied
            </CardTitle>
            <CardDescription>
              You do not have permission to access the admin dashboard.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Please contact an administrator if you believe this is an error.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <PageErrorBoundary pageName="Admin">
      <AdminContent />
    </PageErrorBoundary>
  );
}
