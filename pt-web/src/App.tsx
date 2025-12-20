import {useEffect} from "react";
import {Footer} from "src/components/Footer/Footer";
import {Header} from "src/components/Header/Header";
import {DevApi} from "src/services/health";
import {SocketIOClient} from "src/services/socketIOClient";
import "src/styles/_globals.scss";

export function App() {
  // TODO: remove this temporal check server integration
  useEffect(() => {
    DevApi.checkHealth();
  }, []);

  useEffect(() => {
    SocketIOClient.getInstance();
    SocketIOClient.emit("eventType1", {id: 1, message: "test"});
  }, []);

  return (
    <div className="page">
      <Header />
      <main className="main"> </main>
      <Footer />
    </div>
  );
}
