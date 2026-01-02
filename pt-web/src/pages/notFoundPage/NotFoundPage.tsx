import {Button} from "src/components/Button/Button";
import {DictionaryKey} from "src/dictionary/dictionaryLoader";
import {useDictionary} from "src/dictionary/useDictionary";
import {PATHS} from "src/routes/routes";
import styles from "src/pages/notFoundPage/NotFoundPage.module.scss";

export function NotFoundPage() {
  const dictionary = useDictionary(DictionaryKey.NOT_FOUND);

  if (!dictionary) {
    return (
      <div className={styles.wrap}>
        Loading...
      </div>
    );
  }

  return (
    <section
      className={styles.wrap}
      aria-labelledby="not-found-title"
    >
      <h1
        id="not-found-title"
        className={styles.title}
      >
        {dictionary.title}
      </h1>
      <div className={styles.actions}>
        <Button to={PATHS.HOME}>
          {dictionary.goHome}
        </Button>
      </div>
    </section>
  );
}
