import {useState} from "react";
import {useNavigate} from "react-router-dom";
import {DictionaryKey} from "src/dictionary/dictionaryLoader";
import {useDictionary} from "src/dictionary/useDictionary";
import {PATHS} from "src/routes/routes";
import styles from "src/pages/homePage/heroSection/HeroSection.module.scss";

const OPTION_TEST_VALUE = "test";
const OPTION_STATES_VALUE = "states";
const OPTION_CONTACT_VALUE = "contact";

export function Hero() {
  const [intent, setIntent] = useState<string>("");
  const navigate = useNavigate();
  const dictionary = useDictionary(DictionaryKey.HOME);

  if (!dictionary) {
    return (
      <div>
        Loading...
      </div>
    );
  }

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>): void => {
    e.preventDefault();
    if (intent === OPTION_TEST_VALUE) {
      navigate(PATHS.TESTS.LIST);
    } else if (intent === OPTION_STATES_VALUE) {
      navigate(PATHS.CONDITIONS.LIST);
    } else if (intent === OPTION_CONTACT_VALUE) {
      navigate(PATHS.SOS.PAGE);
    }
  };

  return (
    <section
      className={styles.hero}
      aria-label="Вступительный блок"
    >
      <div className={styles.heroInner}>
        <div className={styles.heroContent}>
          <p className={styles.heroEyebrow}>
            {dictionary.hero.eyebrow}
          </p>

          <h1 className={styles.heroTitle}>
            {dictionary.hero.title}
          </h1>

          <p className={styles.heroSubtitle}>
            {dictionary.hero.subtitle}
          </p>

          <ul className={styles.heroList}>
            {dictionary.hero.benefits.map((text) => (
              <li
                key={text}
                className={styles.heroListItem}
              >
                {text}
              </li>
            ))}
          </ul>

          <form
            className={styles.heroCta}
            onSubmit={handleSubmit}
          >
            <label
              htmlFor="hero-intent"
              className={styles.heroLabel}
            >
              {dictionary.hero.form.label}
            </label>

            <div className={styles.heroControls}>
              <select
                id="hero-intent"
                className={styles.heroSelect}
                value={intent}
                onChange={(e) => setIntent(e.target.value)}
              >
                <option
                  value=""
                  disabled
                >
                  {dictionary.hero.form.placeholder}
                </option>
                <option value={OPTION_TEST_VALUE}>
                  {dictionary.hero.form.options.test}
                </option>
                <option value={OPTION_STATES_VALUE}>
                  {dictionary.hero.form.options.states}
                </option>
                <option value={OPTION_CONTACT_VALUE}>
                  {dictionary.hero.form.options.contact}
                </option>
              </select>

              <button
                type="submit"
                className={styles.heroButton}
              >
                {dictionary.hero.form.cta}
              </button>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}
