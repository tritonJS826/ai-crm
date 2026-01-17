import {Link} from "react-router-dom";
import authIcon from "src/assets/navbarIcons/auth.avif";
import {navbarConfig} from "src/components/Navbar/navbarConfig";
import {DictionaryKey} from "src/dictionary/dictionaryLoader";
import {useDictionary} from "src/dictionary/useDictionary";
import {PATHS} from "src/routes/routes";
import styles from "src/components/Navbar/Navbar.module.scss";

export function Navbar() {
  const dictionary = useDictionary(DictionaryKey.NAVBAR);

  if (!dictionary) {
    return (
      <div>
        Loading...
      </div>
    );
  }

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
      <Link
        to={PATHS.AUTH.PAGE}
        className={styles.link}
      >
        <img
          src={authIcon}
          className={styles.icon}
        />

        <span className={styles.label}>
          Authentication
        </span>
      </Link>
    </div>
  );
}
