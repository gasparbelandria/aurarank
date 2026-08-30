import type { Post } from "../types";
import { MOCK_USERS } from "./users";

export const MOCK_POSTS: Post[] = [
  {
    id: "p1",
    authorId: "u1",
    author: MOCK_USERS[0],
    mediaType: "image",
    mediaUrl: "https://picsum.photos/seed/gaming-setup-01/800/450",
    caption: "New setup hits different at 3am. The aura is immaculate 🔮",
    category: "Gaming",
    auraScore: 94,
    ratingCount: 1247,
    createdAt: "2024-11-28T22:14:00Z",
  },
];

export function getPostById(id: string): Post | undefined {
  return MOCK_POSTS.find((p) => p.id === id);
}

export function getPostsByUser(username: string): Post[] {
  return MOCK_POSTS.filter((p) => p.author.username === username);
}
