import "next-auth";

declare module "next-auth" {
  interface User {
    tenantId?: string;
    tenantSlug?: string;
    planTier?: string;
    isExempt?: boolean;
  }

  interface Session {
    user: User & {
      tenantId: string;
      tenantSlug: string;
      planTier: string;
      isExempt?: boolean;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    tenantId?: string;
    tenantSlug?: string;
    planTier?: string;
    isExempt?: boolean;
  }
}
