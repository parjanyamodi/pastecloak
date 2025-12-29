"use server";

import { db, pastes, comments } from "@/db";
import { eq, and, gt, or, isNull } from "drizzle-orm";
import { nanoid } from "nanoid";

// Generate a short URL-safe ID
function generateUrlId(): string {
  return nanoid(10);
}

// Hash password using Web Crypto API
async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

// Create paste action - receives already encrypted content from client
export async function createPaste(data: {
  encryptedContent: string; // JSON string of EncryptedData
  algorithm: string;
  format: string;
  password?: string;
  burnAfterRead: boolean;
  openDiscussion: boolean;
  expiresIn?: string;
}): Promise<{ urlId: string } | { error: string }> {
  try {
    const urlId = generateUrlId();
    const passwordHash = data.password ? await hashPassword(data.password) : null;
    const expiresAt =
      data.expiresIn && data.expiresIn !== "0"
        ? new Date(Date.now() + parseInt(data.expiresIn, 10) * 1000)
        : null;

    await db.insert(pastes).values({
      urlId,
      encryptedContent: data.encryptedContent,
      algorithm: data.algorithm,
      format: data.format,
      passwordHash,
      burnAfterRead: data.burnAfterRead,
      openDiscussion: data.openDiscussion,
      expiresAt,
    });

    return { urlId };
  } catch (error) {
    console.error("Error creating paste:", error);
    return { error: "Failed to create paste" };
  }
}

// Get paste by URL ID - returns encrypted content (decryption happens client-side)
export async function getPaste(urlId: string, password?: string) {
  const [paste] = await db
    .select()
    .from(pastes)
    .where(
      and(
        eq(pastes.urlId, urlId),
        eq(pastes.isDeleted, false),
        or(isNull(pastes.expiresAt), gt(pastes.expiresAt, new Date()))
      )
    )
    .limit(1);

  if (!paste) {
    return { error: "Paste not found or expired" };
  }

  // Check password
  if (paste.passwordHash) {
    if (!password) {
      return { error: "Password required", passwordProtected: true };
    }

    const inputHash = await hashPassword(password);
    if (inputHash !== paste.passwordHash) {
      return { error: "Invalid password", passwordProtected: true };
    }
  }

  // Handle burn after read
  if (paste.burnAfterRead && paste.viewCount > 0) {
    await db
      .update(pastes)
      .set({ isDeleted: true })
      .where(eq(pastes.id, paste.id));
    return { error: "This paste has been burned after reading" };
  }

  // Increment view count and mark for deletion if burn after read
  if (paste.burnAfterRead) {
    await db
      .update(pastes)
      .set({ viewCount: 1, isDeleted: true })
      .where(eq(pastes.id, paste.id));
  } else {
    await db
      .update(pastes)
      .set({ viewCount: paste.viewCount + 1 })
      .where(eq(pastes.id, paste.id));
  }

  return {
    encryptedContent: paste.encryptedContent,
    algorithm: paste.algorithm,
    format: paste.format,
    burnAfterRead: paste.burnAfterRead,
    openDiscussion: paste.openDiscussion,
    createdAt: paste.createdAt,
    expiresAt: paste.expiresAt,
    id: paste.id,
  };
}

// Verify password action (for client-side unlocking)
export async function verifyPassword(urlId: string, password: string) {
  return getPaste(urlId, password);
}

// Get comments for a paste
export async function getComments(pasteId: string) {
  return db
    .select()
    .from(comments)
    .where(eq(comments.pasteId, pasteId))
    .orderBy(comments.createdAt);
}

// Add comment action
export async function addComment(formData: FormData) {
  const pasteId = formData.get("pasteId") as string;
  const nickname = formData.get("nickname") as string;
  const content = formData.get("content") as string;
  const parentId = formData.get("parentId") as string | null;

  if (!nickname || !content) {
    return { error: "Nickname and content are required" };
  }

  const [comment] = await db
    .insert(comments)
    .values({
      pasteId,
      nickname,
      content,
      parentId: parentId || null,
    })
    .returning();

  return { comment };
}
