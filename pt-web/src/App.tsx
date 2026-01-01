import {useEffect} from "react";
import {Footer} from "src/components/Footer/Footer";
import {Header} from "src/components/Header/Header";
import {ScrollToTop} from "src/components/ScrollToTop/ScrollToTop";
import {WsEventType} from "src/constants/wsEventTypes";
import {useSocket} from "src/hooks/useSocket";
import {useSubscribe} from "src/hooks/useSubscribe";
import {Navigation} from "src/pages/Navigation";
import {DevApi} from "src/services/health";
import {socketClient} from "src/services/websocketClient";
import "src/styles/_globals.scss";

export function App() {
  // TODO: remove this temporal check server integration
  useEffect(() => {
    DevApi.checkHealth();
  }, []);

  // Example for ws connect
  useSocket();

  // Example for add ws listeners
  useSubscribe(WsEventType.HEALTH_PING, (msg) => {
    // eslint-disable-next-line no-console
    console.log("Received:", msg);
  });

  // Example for ws emit message
  useEffect(() => {
    socketClient.emit<string>({
      v: 1,
      type: WsEventType.HEALTH_PING,
      ts: new Date(),
      data: "someValue",
    });
  }, []);

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
