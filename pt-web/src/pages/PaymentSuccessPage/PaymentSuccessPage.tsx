import {NavLink} from "react-router-dom";
import {DictionaryKey} from "src/dictionary/dictionaryLoader";
import {useDictionary} from "src/dictionary/useDictionary";
import styles from "src/pages/PaymentSuccessPage/PaymentSuccessPage.module.scss";

export function PaymentSuccessPage() {
  const dictionary = useDictionary(DictionaryKey.PAYMENT_SUCCESS);

  if (!dictionary) {
    return (
      <div>
        Loading...
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>
        {dictionary.title}
      </h1>
      <p className={styles.text}>
        {dictionary.description}
      </p>
      <NavLink
        to="/profile"
        className={styles.link}
      >
        {dictionary.goToProfile}
      </NavLink>
    </div>
  );
}
