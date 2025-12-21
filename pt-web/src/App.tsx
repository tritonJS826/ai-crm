import {useEffect} from "react";
import {Navigation} from "src/pages/Navigation";
import {useOnSocketMessage} from "src/socket/useOnSocketMessage";
import {useSocket} from "src/socket/useSocket";
import "src/styles/_globals.scss";

export function App() {
  const {isConnected, error, emit} = useSocket();
  useOnSocketMessage("health_ping", (msg) => {
    // eslint-disable-next-line no-console
    console.log("Received:", msg);
  });

  useEffect(() => {
    emit("health_ping", {
      v: 1,
      type: "health_ping",
      ts: new Date(),
      data: {value: "someValue"},
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
