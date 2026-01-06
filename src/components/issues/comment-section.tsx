"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { createComment, getComments } from "@/lib/actions/comments"
import { useToast } from "@/components/ui/use-toast"
import { useSession } from "next-auth/react"
import { formatRelativeTime } from "@/lib/utils"
import ReactMarkdown from "react-markdown"
import { motion, AnimatePresence } from "framer-motion"
import { Send } from "lucide-react"

interface Comment {
  id: string
  content: string
  authorId: string
  createdAt: Date
  updatedAt: Date
  author?: {
    name: string | null
    image: string | null
  }
}

interface CommentSectionProps {
  issueId: string
  initialComments: Comment[]
}

export function CommentSection({ issueId, initialComments }: CommentSectionProps) {
  const { data: session } = useSession()
  const { toast } = useToast()
  const [comments, setComments] = useState<Comment[]>(initialComments)
  const [content, setContent] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!content.trim() || !session) return

    setIsSubmitting(true)
    try {
      const newComment = await createComment(issueId, content)
      setComments([newComment as any, ...comments])
      setContent("")
      toast({
        title: "Comment added",
        description: "Your comment has been posted",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to post comment",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-4">
      {session && (
        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          onSubmit={handleSubmit}
          className="space-y-2"
        >
          <Textarea
            placeholder="Add a comment..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={4}
          />
          <Button type="submit" disabled={isSubmitting || !content.trim()}>
            <Send className="mr-2 h-4 w-4" />
            {isSubmitting ? "Posting..." : "Post comment"}
          </Button>
        </motion.form>
      )}

      <div className="space-y-4">
        <AnimatePresence>
          {comments.map((comment, index) => (
            <motion.div
              key={comment.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ delay: index * 0.05 }}
              className="flex gap-4"
            >
              <Avatar className="h-8 w-8">
                <AvatarImage src={comment.author?.image || undefined} />
                <AvatarFallback>
                  {comment.author?.name?.charAt(0).toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">{comment.author?.name || "Unknown"}</span>
                  <span className="text-xs text-muted-foreground">
                    {formatRelativeTime(comment.createdAt)}
                  </span>
                </div>
                <div className="prose prose-sm max-w-none">
                  <ReactMarkdown>{comment.content}</ReactMarkdown>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {comments.length === 0 && (
          <p className="text-sm text-muted-foreground">No comments yet</p>
        )}
      </div>
    </div>
  )
}

