import { prisma } from '@/lib/prisma';

export type ClerkUserSnapshot = {
  clerkUserId: string;
  email?: string | null;
  displayName?: string | null;
};

export class UserService {
  private static async fetchClerkProfile(clerkUserId: string) {
    try {
      const { clerkClient } = await import('@clerk/nextjs/server');
      const client = await clerkClient();
      const user = await client.users.getUser(clerkUserId);
      const email = user.primaryEmailAddress?.emailAddress ?? user.emailAddresses?.[0]?.emailAddress ?? null;
      const displayName =
        user.fullName ||
        [user.firstName, user.lastName].filter(Boolean).join(' ').trim() ||
        user.username ||
        null;
      return { email, displayName };
    } catch {
      return { email: null, displayName: null };
    }
  }

  static async ensureAppUser(snapshot: ClerkUserSnapshot) {
    if (!snapshot.clerkUserId) {
      throw new Error('Please sign in to continue.');
    }

    let email = snapshot.email;
    let displayName = snapshot.displayName;

    // Enrich from Clerk when the caller did not already supply profile fields,
    // so accounts persist a real email/display name instead of just an id.
    if (email === undefined && displayName === undefined) {
      const profile = await this.fetchClerkProfile(snapshot.clerkUserId);
      email = profile.email;
      displayName = profile.displayName;
    }

    return prisma.appUser.upsert({
      where: { clerkUserId: snapshot.clerkUserId },
      create: {
        clerkUserId: snapshot.clerkUserId,
        email: email ?? null,
        displayName: displayName ?? null,
      },
      update: {
        email: email ?? undefined,
        displayName: displayName ?? undefined,
      },
    });
  }

  static async getAppUserByClerkId(clerkUserId: string) {
    const appUser = await prisma.appUser.findUnique({ where: { clerkUserId } });

    if (!appUser) {
      throw new Error('Account profile was not found. Please refresh and try again.');
    }

    return appUser;
  }
}
