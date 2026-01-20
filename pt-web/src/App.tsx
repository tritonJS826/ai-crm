import {useEffect} from "react";
import {useSetAtom} from "jotai";
import {Footer} from "src/components/Footer/Footer";
import {Header} from "src/components/Header/Header";
import {Navbar} from "src/components/Navbar/Navbar";
import {ScrollToTop} from "src/components/ScrollToTop/ScrollToTop";
import {Navigation} from "src/pages/Navigation";
import {DevApi} from "src/services/healthService";
import {loadUserDataAtom} from "src/state/userProfileAtoms";
import "src/styles/_globals.scss";

export function App() {
  const loadUserData = useSetAtom(loadUserDataAtom);

  useEffect(() => {
    loadUserData();
  }, []);

  // TODO: remove this temporal check server integration
  useEffect(() => {
    DevApi.checkHealth();
  }, []);

  return (
    <div className="page">
      <Header />
      <main className="main container">
        <Navbar />
        <div className="content">
          <ScrollToTop />
          <Navigation />
        </div>

      </main>
      <Footer />
    </div>
  );
}
