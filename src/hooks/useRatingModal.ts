"use client";

import { useState, useCallback } from "react";

interface RatingModalState {
  isOpen: boolean;
  postId: string | null;
  postCaption: string;
  postThumbnail: string;
  authorUsername: string;
}

export function useRatingModal() {
  const [state, setState] = useState<RatingModalState>({
    isOpen: false,
    postId: null,
    postCaption: "",
    postThumbnail: "",
    authorUsername: "",
  });

  const openModal = useCallback(
    (postId: string, postCaption: string, postThumbnail: string, authorUsername: string) => {
      setState({ isOpen: true, postId, postCaption, postThumbnail, authorUsername });
    },
    []
  );

  const closeModal = useCallback(() => {
    setState((prev) => ({ ...prev, isOpen: false, postId: null }));
  }, []);

  return { ...state, openModal, closeModal };
}
