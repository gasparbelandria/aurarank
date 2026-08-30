export type AuraLevel = "NPC" | "ROOKIE" | "RISING" | "AURA FARMER" | "ELITE" | "LEGENDARY";
export type PostCategory = "Gaming" | "Sports" | "Fashion" | "Gym" | "Music" | "Funny" | "Random";
export type MediaType = "image" | "video" | "youtube";
export type RankMovement = "up" | "down" | "same" | "new";

export interface Badge {
  id: string;
  label: string;
  icon: string;
}

export interface User {
  id: string;
  username: string;
  displayName: string;
  avatarUrl: string | null;
  bio: string;
  auraScore: number;
  level: AuraLevel;
  globalRank: number;
  weeklyRank: number;
  badges: Badge[];
  postCount: number;
  ratingCount: number;
  joinedAt: string;
  // Geolocation (optional — powers ranking hierarchy)
  countryCode?: string;
  countryName?: string;
  city?: string;
  town?: string;
}

export interface Profile {
  userId: string;
  bio?: string;
  countryCode?: string;
  countryName?: string;
  city?: string;
  town?: string;
}

export type AspectRatio = "1:1" | "9:16" | "16:9";

export interface Post {
  id: string;
  authorId: string;
  author: User;
  mediaType: MediaType;
  mediaUrl: string;
  thumbnailUrl?: string;
  youtubeId?: string;
  caption: string;
  category: PostCategory;
  auraScore: number;
  ratingCount: number;
  createdAt: string;
  aspectRatio?: AspectRatio;
}

export interface RankingEntry {
  rank: number;
  user: User;
  auraScore: number;
  movement: RankMovement;
  movementDelta: number;
}

export interface RatingSubmission {
  postId: string;
  score: number;
  submittedAt: string;
}

export interface ToastItem {
  id: string;
  message: string;
  type: "success" | "error" | "info";
}

export interface Group {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  countryCode: string | null;
  countryName: string | null;
  city: string | null;
  ownerId: string;
  memberCount: number;
  createdAt: string;
  myRole?: "owner" | "member";
}

export interface GroupMember {
  userId: string;
  username: string | null;
  displayName: string;
  avatarUrl: string | null;
  role: "owner" | "member";
  joinedAt: string;
}

export type InviteStatus = "pending" | "accepted" | "rejected";

export interface GroupInvite {
  id: string;
  groupId: string;
  groupName: string;
  groupSlug: string;
  inviterId: string;
  inviterUsername: string | null;
  inviterDisplayName: string;
  status: InviteStatus;
  createdAt: string;
}

export interface AppNotification {
  id: string;
  type: string;
  payload: Record<string, unknown>;
  read: boolean;
  createdAt: string;
}
