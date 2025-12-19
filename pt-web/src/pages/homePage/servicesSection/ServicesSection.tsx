import men from "src/assets/pictures/men.avif";
import {DictionaryKey} from "src/dictionary/dictionaryLoader";
import {useDictionary} from "src/dictionary/useDictionary";
import styles from "src/pages/homePage/servicesSection/ServicesSection.module.scss";

export function ServicesSection() {

  const dictionary = useDictionary(DictionaryKey.HOME);

  if (!dictionary) {
    return (
      <div>
        Loading...
      </div>
    );
  }

  const services = dictionary.services;

  return (
    <section>
      <div className={styles.wrapper}>
        <div className={styles.textBlock}>
          <p className={styles.eyebrow}>
            {services.eyebrow}
          </p>
          <h2 className={styles.title}>
            {services.title}
          </h2>
          <p className={styles.subtitle}>
            {services.subtitle}
          </p>

          <ul className={styles.list}>
            {services.servicesItems.map(({title, text}, i) => (
              <li
                key={`${title}-${i}`}
                className={styles.item}
              >
                <h3 className={styles.itemTitle}>
                  {title}
                </h3>
                <p className={styles.itemText}>
                  {text}
                </p>
              </li>
            ))}
          </ul>
        </div>

        <figure className={styles.imageBox}>
          <img
            src={men}
            alt="Illustration"
            className={styles.image}
            loading="lazy"
          />
        </figure>
      </div>
    </section>
  );
}
