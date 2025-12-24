import React from "react";
import {Link, NavLink} from "react-router-dom";
import {useAtomValue} from "jotai";
import {UserRound} from "lucide-react";
import {DictionaryKey} from "src/dictionary/dictionaryLoader";
import {useDictionary} from "src/dictionary/useDictionary";
import {PATHS} from "src/routes/routes";
import {accessTokenAtomWithPersistence} from "src/state/authAtom";
import styles from "src/components/Header/Header.module.scss";

export function Header() {
  const dictionary = useDictionary(DictionaryKey.HEADER);
  const access = useAtomValue(accessTokenAtomWithPersistence);
  const isAuthenticated = Boolean(access?.token);
  const profileTo = isAuthenticated ? PATHS.PROFILE.PAGE : PATHS.AUTH.PAGE;

  if (!dictionary) {
    return (
      <div>
        Loading...
      </div>
    );
  }

  return (
    <header className={styles.header}>
      <nav
        className={styles.nav}
        aria-label={dictionary.nav.ariaPrimary}
      >
        <Link
          to={PATHS.HOME}
          className={styles.logo}
          aria-label={dictionary.nav.ariaHome}
        >
          <span className={styles.logoText}>
            AI-CRM
          </span>
        </Link>

        <div className={styles.navCenter}>
          <ul className={styles.navAll}>
            <li className={styles.navItem}>
              <NavLink
                to={PATHS.ABOUT}
                className={({isActive}) => `${styles.navLink} ${isActive ? styles.active : ""}`}
              >
                {dictionary.nav.about}
              </NavLink>
            </li>
          </ul>
        </div>

        <div className={styles.actions}>
          <NavLink
            to={profileTo}
            className={styles.iconBtn}
            aria-label={dictionary.nav.profile}
          >
            <UserRound className={styles.icon} />
          </NavLink>
        </div>
      </nav>
    </header>
  );
}
