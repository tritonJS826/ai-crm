import {Link} from "react-router-dom";
import {Facebook, Instagram, Linkedin, Twitter} from "lucide-react";
import {DictionaryKey} from "src/dictionary/dictionaryLoader";
import {useDictionary} from "src/dictionary/useDictionary";
import {PATHS} from "src/routes/routes";
import styles from "src/components/Footer/Footer.module.scss";

const SOCIALS = [
  {href: "https://twitter.com", Icon: Twitter, label: "Twitter"},
  {href: "https://facebook.com", Icon: Facebook, label: "Facebook"},
  {href: "https://instagram.com", Icon: Instagram, label: "Instagram"},
  {href: "https://linkedin.com", Icon: Linkedin, label: "LinkedIn"},
] as const;

export function Footer() {
  const dictionary = useDictionary(DictionaryKey.FOOTER);
  if (!dictionary) {
    return null;
  }

  const COL_1 = {
    title: dictionary.sectionsTitle,
    links: [
      {label: dictionary.links.about, to: PATHS.ABOUT},
      {label: dictionary.links.states, to: PATHS.CONDITIONS.LIST},
      {label: dictionary.links.tests, to: PATHS.TESTS.LIST},
    ],
  } as const;

  const COL_2 = {
    title: dictionary.resourcesTitle,
    links: [
      {label: dictionary.links.statesCatalog, to: PATHS.CONDITIONS.LIST},
      {label: dictionary.links.testsCatalog, to: PATHS.TESTS.LIST},
      {label: dictionary.links.biohackingCatalog, to: PATHS.BIOHACKING.LIST},
    ],
  } as const;

  return (
    <footer
      className={styles.footer}
      aria-label={dictionary.ariaFooter}
    >
      <div className={styles.grid}>
        {[COL_1, COL_2].map((col) => (
          <nav
            key={col.title}
            className={styles.col}
            aria-label={col.title}
          >
            <h3 className={styles.colTitle}>
              {col.title}
            </h3>
            <ul className={styles.list}>
              {col.links.map((l) => (
                <li
                  key={l.label}
                  className={styles.item}
                >
                  <Link
                    to={l.to}
                    className={styles.link}
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </div>

      <div className={styles.divider} />

      <div className={styles.bottom}>
        <ul
          className={styles.socials}
          aria-label={dictionary.socialsAria}
        >
          {SOCIALS.map((s) => (
            <li
              key={s.label}
              className={styles.socialItem}
            >
              <a
                href={s.href}
                aria-label={s.label}
                className={styles.socialLink}
                target="_blank"
                rel="noreferrer"
              >
                <s.Icon className={styles.socialIcon} />
              </a>
            </li>
          ))}
        </ul>

        <p className={styles.copy}>
          {dictionary.copyright}
        </p>
      </div>
    </footer>
  );
}
