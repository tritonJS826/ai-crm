import {useEffect} from "react";
import {WsEventType} from "src/constants/wsEventTypes";
import {Navigation} from "src/pages/Navigation";
import {DevApi} from "src/services/health";
import {useOnSocketMessage} from "src/socket/useOnSocketMessage";
import {useSocket} from "src/socket/useSocket";
import "src/styles/_globals.scss";

export function App() {
  // TODO: remove this temporal check server integration
  useEffect(() => {
    DevApi.checkHealth();
  }, []);

  // Example for useSocket
  const {isConnected, error, emit} = useSocket();

  // Example for add ws listeners
  useOnSocketMessage(WsEventType.HEALTH_PING, (msg) => {
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

  return (
    <div className="page">
      <main className="main">
        <p>
          {`Status: ${isConnected ? "Socket Connected" : "Disconnected"}`}
        </p>
        <p>
          {`Socket Error: ${error}`}
        </p>
        <Navigation />
      </main>
    </div>
  );
}
