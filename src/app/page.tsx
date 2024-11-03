import { api, HydrateClient } from "~/trpc/server";
import HomeWrapper from "./_components/HomeWrapper";
import { auth } from "~/server/auth";

export default async function Home() {
  const session = await auth();

  if (session?.user) {
    void api.post.getLatest.prefetch();
  }

  return (
    <HydrateClient>
      <HomeWrapper session={session} />
    </HydrateClient>
  );
}
