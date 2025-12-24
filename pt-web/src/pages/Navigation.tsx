import type {ReactNode} from "react";
import {Route, Routes} from "react-router-dom";
import {AboutPage} from "src/pages/aboutUsPage/AboutUsPage";
import {AuthPage} from "src/pages/authPage/AuthPage";
import {HomePage} from "src/pages/homePage/Homepage";
import {NotFoundPage} from "src/pages/notFoundPage/NotFoundPage";
import {PATHS} from "src/routes/routes";

export function Navigation(): ReactNode {
  return (
    <Routes>
      <Route
        path={PATHS.HOME}
        element={<HomePage />}
      />
      <Route
        path={PATHS.ABOUT}
        element={<AboutPage />}
      />
      <Route
        path={PATHS.AUTH.PAGE}
        element={<AuthPage />}
      />
      <Route
        path={PATHS.NOT_FOUND}
        element={<NotFoundPage />}
      />
    </Routes>
  );
}
