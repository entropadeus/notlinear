"use client"

import { IssueDetail } from "./issue-detail"

interface Issue {
  id: string
  identifier: string
  title: string
  description: string | null
  status: string
  priority: string
  createdAt: Date
  updatedAt: Date
}

interface Comment {
  id: string
  content: string
  authorId: string
  createdAt: Date
  updatedAt: Date
}

interface IssuePageContentProps {
  issue: Issue
  workspaceSlug: string
  initialComments: Comment[]
}

export function IssuePageContent({ issue, workspaceSlug, initialComments }: IssuePageContentProps) {
  return (
    <div className="flex h-screen">
      <div className="flex-1 overflow-auto p-8">
        <IssueDetail issue={issue as any} workspaceSlug={workspaceSlug} initialComments={initialComments} />
      </div>
    </div>
  )
}

