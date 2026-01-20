import type {ReactNode} from "react";
import {Navigate, Outlet} from "react-router-dom";
import {useAtom} from "jotai";
import {PATHS} from "src/routes/routes";
import {userProfileAtom} from "src/state/userProfileAtoms";

export function PublicRoutes (): ReactNode {
  const [userProfile] = useAtom(userProfileAtom);

  if (userProfile) {
    return <Navigate to={PATHS.HOME} />;
  }

  return (
    <div className="page">
      <main className="container">
        <Outlet />
      </main>
    </div>
  );
};

