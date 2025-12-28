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
    return (
      <div>
        Loading...
      </div>
    );
  }

  return (
    <footer
      className={styles.footer}
      aria-label={dictionary.ariaFooter}
    >
      <div className={styles.grid}>
        <nav
          className={styles.col}
          aria-label={dictionary.sectionsTitle}
        >
          <h3 className={styles.colTitle}>
            {dictionary.sectionsTitle}
          </h3>
          <ul className={styles.list}>
            <li className={styles.item}>
              <Link
                to={PATHS.ABOUT}
                className={styles.link}
              >
                {dictionary.links.about}
              </Link>
            </li>
          </ul>
        </nav>
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
