"use server";

import Secret from "../db/secret.schema";

export async function storeSecret({
  secretContent,
  expires,
}: {
  secretContent: string;
  expires: number;
}) {
  try {
    const secret = new Secret({
      secretContent,
      expireAt: new Date(Date.now() + expires * 1000),
    });

    return JSON.stringify(secret.save());
  } catch (error) {
    console.error(error);
  }
}
