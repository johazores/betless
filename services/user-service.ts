import { prisma } from '@/lib/prisma';

export type ClerkUserSnapshot = {
  clerkUserId: string;
  email?: string | null;
  displayName?: string | null;
};

export class UserService {
  static async ensureAppUser(snapshot: ClerkUserSnapshot) {
    if (!snapshot.clerkUserId) {
      throw new Error('Please sign in to continue.');
    }

    return prisma.appUser.upsert({
      where: { clerkUserId: snapshot.clerkUserId },
      create: {
        clerkUserId: snapshot.clerkUserId,
        email: snapshot.email ?? null,
        displayName: snapshot.displayName ?? null,
      },
      update: {
        email: snapshot.email ?? undefined,
        displayName: snapshot.displayName ?? undefined,
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
