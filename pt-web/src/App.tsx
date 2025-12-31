import {useEffect} from "react";
import {Footer} from "src/components/Footer/Footer";
import {Header} from "src/components/Header/Header";
import {ScrollToTop} from "src/components/ScrollToTop/ScrollToTop";
import {ConversationStatus} from "src/constants/conversationStatuses";
import {WsEventType} from "src/constants/wsEventTypes";
import {Navigation} from "src/pages/Navigation";
import {getConversationList} from "src/services/conversation";
import {DevApi} from "src/services/health";
import {useSocket} from "src/socket/useSocket";
import {useSubscribe} from "src/socket/useSubscribe";
import "src/styles/_globals.scss";

export function App() {
  // TODO: remove this temporal check server integration
  useEffect(() => {
    DevApi.checkHealth();
  }, []);

  // Example for useSocket
  const {isConnected, error, emit} = useSocket();

  // Example for add ws listeners
  useSubscribe(WsEventType.HEALTH_PING, (msg) => {
    // eslint-disable-next-line no-console
    console.log("Received:", msg);
  });

  // Example for ws emit message
  useEffect(() => {
    emit<string>({
      v: 1,
      type: WsEventType.HEALTH_PING,
      ts: new Date(),
      data: "someValue",
    });
  }, []);

  // TODO: remove this
  useEffect(() => {
    async function test() {
      // eslint-disable-next-line no-magic-numbers
      const data = await getConversationList(ConversationStatus.OPEN, 2, 4);
      // eslint-disable-next-line no-console
      console.log(data);

    }
    test();
  }, []);

  return (
    <div className="page">
      <Header />
      <main className="main">
        <ScrollToTop />
        <p>
          {`Status: ${isConnected ? "Socket Connected" : "Disconnected"}`}
        </p>
        {error && (
          <p>
            {`Socket Error: ${error}`}
          </p>
        )}
        <Navigation />
      </main>
      <Footer />
    </div>
  );
}
