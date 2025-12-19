import {Calendar, Clock, HeartHandshake, LifeBuoy, Sparkles, Target} from "lucide-react";
import {DictionaryKey} from "src/dictionary/dictionaryLoader";
import {useDictionary} from "src/dictionary/useDictionary";
import styles from "src/pages/homePage/aboutProjectSection/AboutProjectSection.module.scss";

const FEATURE_ICONS = [Calendar, Target, LifeBuoy, HeartHandshake, Clock, Sparkles] as const;
const DEFAULT_ICON = FEATURE_ICONS[0];

export function AboutProjectSection() {
  const dictionary = useDictionary(DictionaryKey.HOME);

  if (!dictionary) {
    return (
      <div>
        Loading...
      </div>
    );
  }

  const about = dictionary.about;

  return (
    <section>
      <div className={styles.aboutInner}>
        <div className={styles.head}>
          <p className={styles.eyebrow}>
            {about.eyebrow}
          </p>
          <h2 className={styles.title}>
            {about.title}
          </h2>
          <p className={styles.subtitle}>
            {about.subtitle}
          </p>
        </div>

        <ul className={styles.grid}>
          {about.features.map((feat, idx) => {
            const Icon = FEATURE_ICONS[idx] ?? DEFAULT_ICON;

            return (
              <li
                key={`${feat.title}-${idx}`}
                className={styles.item}
              >
                <span className={styles.iconBox}>
                  <Icon className={styles.icon} />
                </span>
                <div className={styles.body}>
                  <h3 className={styles.itemTitle}>
                    {feat.title}
                  </h3>
                  <p className={styles.itemText}>
                    {feat.text}
                  </p>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
