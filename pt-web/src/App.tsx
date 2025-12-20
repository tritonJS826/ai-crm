import {useEffect} from "react";
import {Footer} from "src/components/Footer/Footer";
import {Header} from "src/components/Header/Header";
import {useSocket} from "src/providers/SocketProvider";
import {DevApi} from "src/services/health";
import "src/styles/_globals.scss";

export function App() {
  const {socket, isConnected, error} = useSocket();

  // TODO: remove this temporal check server integration
  useEffect(() => {
    DevApi.checkHealth();
  }, []);

  useEffect(() => {
    if (!socket) {
      return;
    }

    socket.on("message", (msg) => {
      // eslint-disable-next-line no-console
      console.log("Received:", msg);
    });

    return () => {
      socket.off("message");
    };
  }, [socket]);

  return (
    <div className="page">
      <Header />
      <main className="main">
        <p>
          {`Status: ${isConnected ? "Socket Connected" : "Disconnected"}`}
        </p>
        <p>
          {`Socket Error: ${error}`}
        </p>
      </main>
      <Footer />
    </div>
  );
}
