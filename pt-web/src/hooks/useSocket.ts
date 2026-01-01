import {useEffect} from "react";
import {socketClient} from "src/services/websocketClient";

export function useSocket(url?: string) {

  useEffect(() => {
    socketClient.connect(url);

    return () => {
      socketClient.disconnect();
    };
  }, []);
}
