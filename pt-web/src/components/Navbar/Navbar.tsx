import {Link} from "react-router-dom";
import {useSetAtom} from "jotai";
import authIcon from "src/assets/navbarIcons/auth.avif";
import {navbarConfig} from "src/components/Navbar/navbarConfig";
import {DictionaryKey} from "src/dictionary/dictionaryLoader";
import {useDictionary} from "src/dictionary/useDictionary";
import {clearTokens, logoutUser} from "src/services/authService";
import {clearUserProfileAtom} from "src/state/userProfileAtoms";
import styles from "src/components/Navbar/Navbar.module.scss";

export function Navbar() {
  const clearUserProfile = useSetAtom(clearUserProfileAtom);
  const dictionary = useDictionary(DictionaryKey.NAVBAR);

  if (!dictionary) {
    return (
      <div>
        Loading...
      </div>
    );
  }

  const handleLogout = async (): Promise<void> => {
    await logoutUser();
    clearTokens();
    clearUserProfile();
  };

  const elements = navbarConfig.map(item => (
    <li
      key={item.key}
      className={styles.navbarItem}
    >
      <Link
        to={item.href}
        className={styles.link}
      >
        <img
          src={item.iconSrc}
          className={styles.icon}
        />

        <span className={styles.label}>
          {dictionary.labels[item.key]}
        </span>
      </Link>
    </li>));

  return (
    <div className={styles.navbar}>
      <ul className={styles.navList}>
        {elements}
      </ul>
      <button
        type="button"
        className={styles.link}
        onClick={handleLogout}
      >
        <img
          src={authIcon}
          className={styles.icon}
        />

        <span className={styles.label}>
          {dictionary.labels.logout}
        </span>
      </button>
    </div>
  );
}

