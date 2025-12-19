import {AboutProjectSection} from "src/pages/homePage/aboutProjectSection/AboutProjectSection";
import {Hero} from "src/pages/homePage/heroSection/HeroSection";
import {ServicesSection} from "src/pages/homePage/servicesSection/ServicesSection";

export function HomePage() {
  return (
    <section>
      <Hero />
      <AboutProjectSection />
      <ServicesSection />
    </section>
  );
}
