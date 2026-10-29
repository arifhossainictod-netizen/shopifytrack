import Nav from "@/components/nav";
import Footer from "@/components/footer";
import Hero from "@/components/landing/hero";
import Marquee from "@/components/landing/marquee";
import { ProblemSection, HowSection, FeaturesSection } from "@/components/landing/sections";
import ExtensionPromo from "@/components/landing/extension-promo";

export default function Home() {
  return (
    <main>
      <Nav />
      <Hero />
      <Marquee />
      <ProblemSection />
      <HowSection />
      <FeaturesSection />
      <ExtensionPromo />
      <Footer />
    </main>
  );
}
