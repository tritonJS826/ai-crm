import {useEffect} from "react";
import {useAtom, useSetAtom} from "jotai";
import {Navigation} from "src/pages/Navigation";
import {DevApi} from "src/services/healthService";
import {accessTokenAtom} from "src/state/authAtom";
import {loadUserProfileAtom} from "src/state/userProfileAtoms";
import "src/styles/_globals.scss";

export function App() {
  const accessToken = useAtom(accessTokenAtom);
  const loadUserData = useSetAtom(loadUserProfileAtom);
  useEffect(() => {
    loadUserData();
  }, [accessToken]);

  // TODO: remove this temporal check server integration
  useEffect(() => {
    DevApi.checkHealth();
  }, []);

  return (<Navigation />);
}
