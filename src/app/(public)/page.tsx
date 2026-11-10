import { HomePage } from "@/components/public/home-page";
import { getHomeData } from "@/lib/public-data";

export const dynamic = "force-dynamic";

export default async function Home() {
  const data = await getHomeData();
  return <HomePage data={data} />;
}
