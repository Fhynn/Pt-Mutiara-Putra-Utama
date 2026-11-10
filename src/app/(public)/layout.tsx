import { SiteFooter } from "@/components/public/site-footer";
import { SiteHeader } from "@/components/public/site-header";
import { MotionObserver } from "@/components/public/motion-observer";
import { getSettings } from "@/lib/public-data";

export default async function PublicLayout({ children }: { children: React.ReactNode }) {
  const settings = await getSettings();
  return (
    <>
      <MotionObserver />
      <SiteHeader />
      <main>{children}</main>
      <SiteFooter settings={settings} />
    </>
  );
}
