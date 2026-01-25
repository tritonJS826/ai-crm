import type {ReactNode} from "react";
import {Navigate, Outlet} from "react-router-dom";
import {useAtomValue} from "jotai";
import {PATHS} from "src/routes/routes";
import {userProfileStateAtom} from "src/state/userProfileAtoms";

export function PublicRoutes (): ReactNode {
  const {userProfile} = useAtomValue(userProfileStateAtom);

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

