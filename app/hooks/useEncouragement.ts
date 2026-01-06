"use client";

import { useState, useEffect, useCallback } from "react";
import { encouragementService } from "../../lib/services/encouragementService";
import { Encouragement } from "../utils/networkDb";

export interface Comment {
    id: string;
    author: string;
    text: string;
    date: string;
    authorUrl?: string;
}

const SAMPLE_COMMENTS: Comment[] = [
    { id: "sample-1", author: "하현주 작가", text: "작품의 색감이 정말 따뜻하고 깊이 있네요. 응원합니다!", date: "2025.12.27", authorUrl: "#" },
    { id: "sample-2", author: "문혜경 작가", text: "새로 올리신 작품 '겨울 정원' 너무 인상적이에요.", date: "2025.12.28", authorUrl: "#" },
];

export function useEncouragement() {
    const [comments, setComments] = useState<Comment[]>(SAMPLE_COMMENTS);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [deletingId, setDeletingId] = useState<string | null>(null);

    const fetchComments = useCallback(async () => {
        try {
            const data = await encouragementService.getAll();
            if (data && data.length > 0) {
                const converted: Comment[] = data.map((e: Encouragement) => ({
                    id: e.id,
                    author: e.author_name,
                    text: e.content,
                    date: new Date(e.created_at).toLocaleDateString('ko-KR', {
                        year: 'numeric',
                        month: '2-digit',
                        day: '2-digit'
                    }).replace(/\. /g, '.').replace('.', ''),
                    authorUrl: e.author_archive_url,
                }));
                setComments(converted);
            }
        } catch (err) {
            console.error("Failed to load comments:", err);
        }
    }, []);

    useEffect(() => {
        fetchComments();
    }, [fetchComments]);

    const addComment = async (authorName: string, text: string) => {
        setIsSubmitting(true);
        try {
            const result = await encouragementService.create(authorName, text);
            if (result) {
                const newAddedComment: Comment = {
                    id: result.id,
                    author: result.author_name,
                    text: result.content,
                    date: new Date().toLocaleDateString('ko-KR', {
                        year: 'numeric',
                        month: '2-digit',
                        day: '2-digit'
                    }).replace(/\. /g, '.').replace('.', ''),
                };
                setComments(prev => [newAddedComment, ...prev]);
                return true;
            }
        } catch (err) {
            console.error("Submit error:", err);
        } finally {
            setIsSubmitting(false);
        }
        return false;
    };

    const removeComment = async (id: string) => {
        setDeletingId(id);
        try {
            const success = await encouragementService.delete(id);
            if (success) {
                setComments(prev => prev.filter(c => c.id !== id));
                return true;
            }
        } catch (err) {
            console.error("Delete error:", err);
        } finally {
            setDeletingId(null);
        }
        return false;
    };

    return {
        comments,
        isSubmitting,
        deletingId,
        addComment,
        removeComment
    };
}
