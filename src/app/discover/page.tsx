import { prisma } from "@/lib/prisma";
import DiscoverFeedClient from "@/components/DiscoverFeedClient";

export const dynamic = "force-dynamic";

export default async function DiscoverPage() {
  const businesses = await prisma.business.findMany({
    include: {
      seller: true,
      images: true,
    },
    orderBy: {
      createdAt: 'desc'
    }
  });

  return <DiscoverFeedClient businesses={businesses} />;
}
