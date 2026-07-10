import { prisma } from '@/lib/prisma';

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

  static async ensureAppUser(clerkUserId: string) {
    const existing = await prisma.appUser.findUnique({ where: { clerkUserId } });
    if (existing) {
      return prisma.appUser.update({
        where: { id: existing.id },
        data: { lastSeenAt: new Date() },
      });
    }

    const profile = await this.fetchClerkProfile(clerkUserId);

    return prisma.appUser.upsert({
      where: { clerkUserId },
      create: {
        clerkUserId,
        email: profile.email,
        displayName: profile.displayName,
        lastSeenAt: new Date(),
      },
      update: {},
    });
  }
}
