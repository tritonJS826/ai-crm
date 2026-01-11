import {useEffect} from "react";
import {Footer} from "src/components/Footer/Footer";
import {Header} from "src/components/Header/Header";
import {ScrollToTop} from "src/components/ScrollToTop/ScrollToTop";
import {Navigation} from "src/pages/Navigation";
import {loginByEmail} from "src/services/auth";
import {sendMessage} from "src/services/conversation";
import {DevApi} from "src/services/health";
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

  const handler = () => {
    setTimeout(() => {
      sendMessage({conversationId: "1", text: "test text"});
    // eslint-disable-next-line no-magic-numbers
    }, 6000);
  };

  // TODO: remove this temporal send new message
  // useEffect(() => {

  // }, []);

  return (
    <div className="page">
      <Header />
      <main className="main">
        <ScrollToTop />
        <Navigation />
        <button onClick={handler}>
          send message
        </button>
      </main>
      <Footer />
    </div>
  );
}
