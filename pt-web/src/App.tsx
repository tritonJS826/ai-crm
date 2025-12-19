import {useEffect} from "react";
import {Route, Routes} from "react-router-dom";
import {Footer} from "src/components/Footer/Footer";
import {Header} from "src/components/Header/Header";
import {ScrollToTop} from "src/components/ScrollToTop/ScrollToTop";
import {AboutPage} from "src/pages/aboutUsPage/AboutUsPage";
import {AuthPage} from "src/pages/authPage/AuthPage";
import {BiohackingDetailPage} from "src/pages/biohackingListPage/articles/BiohackingDetailPage";
import {BiohackingListPage} from "src/pages/biohackingListPage/BiohackingListPage";
import {ConditionArticleDetailPage} from "src/pages/conditionsListPage/conditionArticle/ConditionArticleDetailPage";
import {ConditionsListPage} from "src/pages/conditionsListPage/ConditionsListPage";
import {HomePage} from "src/pages/homePage/Homepage";
import {NotFoundPage} from "src/pages/notFoundPage/NotFoundPage";
import {PaymentSuccessPage} from "src/pages/PaymentSuccessPage/PaymentSuccessPage";
import {ProfilePage} from "src/pages/profilePage/ProfilePage";
import {ConditionHistoryPage} from "src/pages/profilePage/сonditionHistoryPage/ConditionHistoryPage";
import {SosConsultationPage} from "src/pages/sosPage/SosConsultationPage/SosConsultationPage";
import {SosPage} from "src/pages/sosPage/SosPage";
import {Test} from "src/pages/testsListPage/tests/Test";
import {TestsList} from "src/pages/testsListPage/TestsListPage";
import {PATHS} from "src/routes/routes";
import {DevApi} from "src/services/health";
import "src/styles/_globals.scss";

export function App() {
  // TODO: remove this temporal check server integration
  useEffect(() => {
    DevApi.checkHealth();
  }, [ ]);

  return (
    <div className="page">
      <ScrollToTop />
      <Header />
      <main className="main">
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
            path={PATHS.CONDITIONS.LIST}
            element={<ConditionsListPage />}
          />
          <Route
            path={PATHS.CONDITIONS.DETAIL}
            element={<ConditionArticleDetailPage />}
          />

          <Route
            path={PATHS.TESTS.LIST}
            element={<TestsList />}
          />
          <Route
            path={PATHS.TESTS.DETAIL}
            element={<Test />}
          />

          <Route
            path={PATHS.BIOHACKING.LIST}
            element={<BiohackingListPage />}
          />
          <Route
            path={PATHS.BIOHACKING.DETAIL}
            element={<BiohackingDetailPage />}
          />
          <Route
            path={PATHS.SOS.PAGE}
            element={<SosPage />}
          />
          <Route
            path={PATHS.SOS.CONSULTATION}
            element={<SosConsultationPage />}
          />
          <Route
            path={PATHS.AUTH.PAGE}
            element={<AuthPage />}
          />
          <Route
            path={PATHS.PROFILE.PAGE}
            element={<ProfilePage />}
          />
          <Route
            path={PATHS.PROFILE.CONDITION}
            element={<ConditionHistoryPage />}
          />
          <Route
            path={PATHS.NOT_FOUND}
            element={<NotFoundPage />}
          />
          <Route
            path="/payment/success"
            element={<PaymentSuccessPage />}
          />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}
