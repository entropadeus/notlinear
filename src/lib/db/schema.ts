import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";
import { relations } from "drizzle-orm";

// Helper function to generate IDs
function generateId() {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// Users table
export const users = sqliteTable("users", {
  id: text("id").primaryKey().$defaultFn(generateId),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: integer("email_verified", { mode: "boolean" }),
  image: text("image"),
  password: text("password"), // hashed password for credentials auth
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
});

// Accounts table (for OAuth)
export const accounts = sqliteTable("accounts", {
  id: text("id").primaryKey().$defaultFn(generateId),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  type: text("type").notNull(),
  provider: text("provider").notNull(),
  providerAccountId: text("provider_account_id").notNull(),
  refreshToken: text("refresh_token"),
  accessToken: text("access_token"),
  expiresAt: integer("expires_at"),
  tokenType: text("token_type"),
  scope: text("scope"),
  idToken: text("id_token"),
  sessionState: text("session_state"),
});

// Sessions table
export const sessions = sqliteTable("sessions", {
  id: text("id").primaryKey().$defaultFn(generateId),
  sessionToken: text("session_token").notNull().unique(),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  expires: integer("expires", { mode: "timestamp" }).notNull(),
});

// Verification tokens
export const verificationTokens = sqliteTable("verification_tokens", {
  identifier: text("identifier").notNull(),
  token: text("token").notNull(),
  expires: integer("expires", { mode: "timestamp" }).notNull(),
});

// Workspaces
export const workspaces = sqliteTable("workspaces", {
  id: text("id").primaryKey().$defaultFn(generateId),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  description: text("description"),
  ownerId: text("owner_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
});

// Workspace members
export const workspaceMembers = sqliteTable("workspace_members", {
  id: text("id").primaryKey().$defaultFn(generateId),
  workspaceId: text("workspace_id").notNull().references(() => workspaces.id, { onDelete: "cascade" }),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  role: text("role").notNull().default("member"), // owner, admin, member
  joinedAt: integer("joined_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
});

// Projects
export const projects = sqliteTable("projects", {
  id: text("id").primaryKey().$defaultFn(generateId),
  name: text("name").notNull(),
  description: text("description"),
  workspaceId: text("workspace_id").notNull().references(() => workspaces.id, { onDelete: "cascade" }),
  color: text("color").notNull().default("#6366f1"), // hex color
  icon: text("icon"), // emoji or icon name
  issueCounter: integer("issue_counter").notNull().default(0), // for PROJ-123 format
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
});

// Labels
export const labels = sqliteTable("labels", {
  id: text("id").primaryKey().$defaultFn(generateId),
  name: text("name").notNull(),
  color: text("color").notNull().default("#6366f1"),
  workspaceId: text("workspace_id").notNull().references(() => workspaces.id, { onDelete: "cascade" }),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
});

// Issues
export const issues = sqliteTable("issues", {
  id: text("id").primaryKey().$defaultFn(generateId),
  identifier: text("identifier").notNull(), // PROJ-123 format
  title: text("title").notNull(),
  description: text("description"), // markdown
  status: text("status").notNull().default("backlog"), // backlog, todo, in_progress, in_review, done, cancelled
  priority: text("priority").notNull().default("none"), // none, low, medium, high, urgent
  projectId: text("project_id").notNull().references(() => projects.id, { onDelete: "cascade" }),
  workspaceId: text("workspace_id").notNull().references(() => workspaces.id, { onDelete: "cascade" }),
  assigneeId: text("assignee_id").references(() => users.id, { onDelete: "set null" }),
  parentId: text("parent_id").references(() => issues.id, { onDelete: "cascade" }), // for sub-issues
  position: real("position").notNull().default(0), // for ordering
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
  completedAt: integer("completed_at", { mode: "timestamp" }),
});

// Issue labels (many-to-many)
export const issueLabels = sqliteTable("issue_labels", {
  id: text("id").primaryKey().$defaultFn(generateId),
  issueId: text("issue_id").notNull().references(() => issues.id, { onDelete: "cascade" }),
  labelId: text("label_id").notNull().references(() => labels.id, { onDelete: "cascade" }),
});

// Comments
export const comments = sqliteTable("comments", {
  id: text("id").primaryKey().$defaultFn(generateId),
  content: text("content").notNull(), // markdown
  issueId: text("issue_id").notNull().references(() => issues.id, { onDelete: "cascade" }),
  authorId: text("author_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
});

// Issue revisions (version history for text fields)
export const issueRevisions = sqliteTable("issue_revisions", {
  id: text("id").primaryKey().$defaultFn(generateId),
  issueId: text("issue_id").notNull().references(() => issues.id, { onDelete: "cascade" }),
  field: text("field").notNull(), // 'title' | 'description' | 'status' | 'priority' | 'assignee'
  oldValue: text("old_value"), // null for initial creation
  newValue: text("new_value"),
  authorId: text("author_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  message: text("message"), // optional commit-like message explaining the change
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
});

// Git commits (linked to issues)
export const gitCommits = sqliteTable("git_commits", {
  id: text("id").primaryKey().$defaultFn(generateId),
  sha: text("sha").notNull().unique(),
  message: text("message").notNull(),
  author: text("author").notNull(),
  authorEmail: text("author_email").notNull(),
  url: text("url"),
  repository: text("repository"),
  branch: text("branch"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
});

// Issue-commit links (many-to-many)
export const issueCommits = sqliteTable("issue_commits", {
  id: text("id").primaryKey().$defaultFn(generateId),
  issueId: text("issue_id").notNull().references(() => issues.id, { onDelete: "cascade" }),
  commitId: text("commit_id").notNull().references(() => gitCommits.id, { onDelete: "cascade" }),
});

// Pull requests
export const pullRequests = sqliteTable("pull_requests", {
  id: text("id").primaryKey().$defaultFn(generateId),
  number: integer("number").notNull(),
  title: text("title").notNull(),
  body: text("body"),
  state: text("state").notNull(), // open, closed, merged
  url: text("url").notNull(),
  repository: text("repository").notNull(),
  author: text("author").notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
  mergedAt: integer("merged_at", { mode: "timestamp" }),
});

// Issue-PR links (many-to-many)
export const issuePullRequests = sqliteTable("issue_pull_requests", {
  id: text("id").primaryKey().$defaultFn(generateId),
  issueId: text("issue_id").notNull().references(() => issues.id, { onDelete: "cascade" }),
  pullRequestId: text("pull_request_id").notNull().references(() => pullRequests.id, { onDelete: "cascade" }),
});

// Workspace invites - for team invitation tokens
// Designed for both link-based and future email-specific invites
export const workspaceInvites = sqliteTable("workspace_invites", {
  id: text("id").primaryKey().$defaultFn(generateId),
  workspaceId: text("workspace_id").notNull().references(() => workspaces.id, { onDelete: "cascade" }),
  // Cryptographically secure token - unique index for fast lookups
  token: text("token").notNull().unique(),
  // Who created this invite (must be owner/admin)
  createdById: text("created_by_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  // Role assigned to users who join via this invite
  role: text("role").notNull().default("member"), // "member" | "admin"
  // Usage limits - null means unlimited
  maxUses: integer("max_uses"),
  usedCount: integer("used_count").notNull().default(0),
  // Optional expiration
  expiresAt: integer("expires_at", { mode: "timestamp" }),
  // For future email-specific invites: null = link invite, set = email-specific
  email: text("email"),
  // Status for email invites: pending, accepted, expired, revoked
  status: text("status").notNull().default("active"), // "active" | "revoked"
  // Timestamps
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  accounts: many(accounts),
  sessions: many(sessions),
  ownedWorkspaces: many(workspaces),
  workspaceMemberships: many(workspaceMembers),
  assignedIssues: many(issues),
  comments: many(comments),
  createdInvites: many(workspaceInvites),
}));

export const accountsRelations = relations(accounts, ({ one }) => ({
  user: one(users, { fields: [accounts.userId], references: [users.id] }),
}));

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, { fields: [sessions.userId], references: [users.id] }),
}));

export const workspacesRelations = relations(workspaces, ({ one, many }) => ({
  owner: one(users, { fields: [workspaces.ownerId], references: [users.id] }),
  members: many(workspaceMembers),
  projects: many(projects),
  issues: many(issues),
  labels: many(labels),
  invites: many(workspaceInvites),
}));

export const workspaceMembersRelations = relations(workspaceMembers, ({ one }) => ({
  workspace: one(workspaces, { fields: [workspaceMembers.workspaceId], references: [workspaces.id] }),
  user: one(users, { fields: [workspaceMembers.userId], references: [users.id] }),
}));

export const projectsRelations = relations(projects, ({ one, many }) => ({
  workspace: one(workspaces, { fields: [projects.workspaceId], references: [workspaces.id] }),
  issues: many(issues),
}));

export const issuesRelations = relations(issues, ({ one, many }) => ({
  project: one(projects, { fields: [issues.projectId], references: [projects.id] }),
  workspace: one(workspaces, { fields: [issues.workspaceId], references: [workspaces.id] }),
  assignee: one(users, { fields: [issues.assigneeId], references: [users.id] }),
  parent: one(issues, { fields: [issues.parentId], references: [issues.id], relationName: "parentIssue" }),
  subIssues: many(issues, { relationName: "parentIssue" }),
  labels: many(issueLabels),
  comments: many(comments),
  revisions: many(issueRevisions),
  commits: many(issueCommits),
  pullRequests: many(issuePullRequests),
}));

export const labelsRelations = relations(labels, ({ one, many }) => ({
  workspace: one(workspaces, { fields: [labels.workspaceId], references: [workspaces.id] }),
  issues: many(issueLabels),
}));

export const issueLabelsRelations = relations(issueLabels, ({ one }) => ({
  issue: one(issues, { fields: [issueLabels.issueId], references: [issues.id] }),
  label: one(labels, { fields: [issueLabels.labelId], references: [labels.id] }),
}));

export const commentsRelations = relations(comments, ({ one }) => ({
  issue: one(issues, { fields: [comments.issueId], references: [issues.id] }),
  author: one(users, { fields: [comments.authorId], references: [users.id] }),
}));

export const issueRevisionsRelations = relations(issueRevisions, ({ one }) => ({
  issue: one(issues, { fields: [issueRevisions.issueId], references: [issues.id] }),
  author: one(users, { fields: [issueRevisions.authorId], references: [users.id] }),
}));

export const gitCommitsRelations = relations(gitCommits, ({ many }) => ({
  issues: many(issueCommits),
}));

export const issueCommitsRelations = relations(issueCommits, ({ one }) => ({
  issue: one(issues, { fields: [issueCommits.issueId], references: [issues.id] }),
  commit: one(gitCommits, { fields: [issueCommits.commitId], references: [gitCommits.id] }),
}));

export const pullRequestsRelations = relations(pullRequests, ({ many }) => ({
  issues: many(issuePullRequests),
}));

export const issuePullRequestsRelations = relations(issuePullRequests, ({ one }) => ({
  issue: one(issues, { fields: [issuePullRequests.issueId], references: [issues.id] }),
  pullRequest: one(pullRequests, { fields: [issuePullRequests.pullRequestId], references: [pullRequests.id] }),
}));

export const workspaceInvitesRelations = relations(workspaceInvites, ({ one }) => ({
  workspace: one(workspaces, { fields: [workspaceInvites.workspaceId], references: [workspaces.id] }),
  createdBy: one(users, { fields: [workspaceInvites.createdById], references: [users.id] }),
}));
