import {useEffect} from "react";
import {Footer} from "src/components/Footer/Footer";
import {Header} from "src/components/Header/Header";
import {ScrollToTop} from "src/components/ScrollToTop/ScrollToTop";
import {Navigation} from "src/pages/Navigation";
import {loginByEmail} from "src/services/authService";
import {DevApi} from "src/services/healthService";
import "src/styles/_globals.scss";

export function App() {
  // TODO: remove this temporal check server integration
  useEffect(() => {
    DevApi.checkHealth();
  }, []);

  // TODO: remove this temporal login
  useEffect(() => {
    loginByEmail("user@example.com", "stringst");
  });

  return (
    <div className="page">
      <Header />
      <main className="main">
        <ScrollToTop />
        <Navigation />
      </main>
      <Footer />
    </div>
  );
}
