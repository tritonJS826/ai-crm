import type {ReactNode} from "react";
import {Route, Routes} from "react-router-dom";
import {AboutPage} from "src/pages/aboutUsPage/AboutUsPage";
import {AuthPage} from "src/pages/authPage/AuthPage";
import {ChatPage} from "src/pages/chatPage/ChatPage";
import {HomePage} from "src/pages/homePage/Homepage";
import {NotFoundPage} from "src/pages/notFoundPage/NotFoundPage";
import {PaymentSuccessPage} from "src/pages/PaymentSuccessPage/PaymentSuccessPage";
import {PrivateRoutes} from "src/pages/PrivateRoutes";
import {ProfilePage} from "src/pages/profilePage/ProfilePage";
import {PublicRoutes} from "src/pages/PublicRoutes";
import {PATHS} from "src/routes/routes";

export function Navigation(): ReactNode {
  return (
    <Routes>
      <Route element={<PrivateRoutes />}>
        <Route
          path={PATHS.HOME}
          element={<HomePage />}
        />
        <Route
          path={PATHS.ABOUT}
          element={<AboutPage />}
        />
        <Route
          path={PATHS.PAYMENT_SUCCESS}
          element={<PaymentSuccessPage />}
        />
        <Route
          path={PATHS.PROFILE.PAGE}
          element={<ProfilePage />}
        />
        <Route
          path={PATHS.CHAT}
          element={<ChatPage />}
        />

      </Route>

      <Route element={<PublicRoutes />}>
        <Route
          path={PATHS.AUTH.PAGE}
          element={<AuthPage />}
        />
      </Route>

      <Route
        path={PATHS.NOT_FOUND}
        element={<NotFoundPage />}
      />
    </Routes>
  );
}
