import type {ReactNode} from "react";
import {Navigate, Outlet} from "react-router-dom";
import {useAtomValue} from "jotai";
import {Footer} from "src/components/Footer/Footer";
import {Header} from "src/components/Header/Header";
import {Navbar} from "src/components/Navbar/Navbar";
import {ScrollToTop} from "src/components/ScrollToTop/ScrollToTop";
import {PATHS} from "src/routes/routes";
import {userProfileStateAtom} from "src/state/userProfileAtoms";
import "src/styles/_globals.scss";

export function PrivateRoutes (): ReactNode {
  const {userProfile} = useAtomValue(userProfileStateAtom);

  if (!userProfile) {
    return <Navigate to={PATHS.AUTH.PAGE} />;
  }

  return (
    <div className="page">
      <Header />
      <main className="main container">
        <Navbar />
        <div className="content">
          <ScrollToTop />
          <Outlet />
        </div>
      </main>
      <Footer />
    </div>
  );
};
