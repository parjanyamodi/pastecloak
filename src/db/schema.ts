import { pgTable, text, varchar, boolean, timestamp, integer, index } from 'drizzle-orm/pg-core';

export const pastes = pgTable('pastes', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  urlId: varchar('url_id', { length: 12 }).notNull().unique(),
  // Encrypted content stored as JSON string containing EncryptedData
  encryptedContent: text('encrypted_content').notNull(),
  // Encryption algorithm used
  algorithm: varchar('algorithm', { length: 30 }).notNull().default('x25519-chacha20'),
  format: varchar('format', { length: 20 }).notNull().default('plaintext'),
  passwordHash: varchar('password_hash', { length: 255 }),
  burnAfterRead: boolean('burn_after_read').notNull().default(false),
  openDiscussion: boolean('open_discussion').notNull().default(false),
  expiresAt: timestamp('expires_at'),
  viewCount: integer('view_count').notNull().default(0),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
  isDeleted: boolean('is_deleted').notNull().default(false),
}, (table) => [
  index('pastes_url_id_idx').on(table.urlId),
  index('pastes_expires_at_idx').on(table.expiresAt),
  index('pastes_created_at_idx').on(table.createdAt),
]);

export const comments = pgTable('comments', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  pasteId: text('paste_id').notNull().references(() => pastes.id, { onDelete: 'cascade' }),
  nickname: varchar('nickname', { length: 50 }).notNull(),
  content: text('content').notNull(),
  parentId: text('parent_id'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
}, (table) => [
  index('comments_paste_id_idx').on(table.pasteId),
  index('comments_parent_id_idx').on(table.parentId),
]);

export const attachments = pgTable('attachments', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  pasteId: text('paste_id').notNull().references(() => pastes.id, { onDelete: 'cascade' }),
  filename: varchar('filename', { length: 255 }).notNull(),
  mimeType: varchar('mime_type', { length: 100 }).notNull(),
  size: integer('size').notNull(),
  data: text('data').notNull(), // Base64 encoded
  createdAt: timestamp('created_at').notNull().defaultNow(),
}, (table) => [
  index('attachments_paste_id_idx').on(table.pasteId),
]);

// Types
export type Paste = typeof pastes.$inferSelect;
export type NewPaste = typeof pastes.$inferInsert;
export type Comment = typeof comments.$inferSelect;
export type NewComment = typeof comments.$inferInsert;
export type Attachment = typeof attachments.$inferSelect;
export type NewAttachment = typeof attachments.$inferInsert;

