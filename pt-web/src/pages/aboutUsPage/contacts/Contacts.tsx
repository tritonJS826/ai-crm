import styles from "src/pages/aboutUsPage/AboutUsPage.module.scss";

export type ContactsData = {
  emailLabel: string;
  email: string;
  phoneLabel: string;
  phone: string;
  telegramLabel: string;
  telegram: string;
  hoursLabel: string;
  hours: string;
};

export function ContactsSection(props: { title: string; data: ContactsData }) {
  const contact = props.data;

  return (
    <section
      className={styles.contacts}
      aria-label={props.title}
    >
      <h2 className={styles.sectionTitle}>
        {props.title}
      </h2>
      <ul className={styles.contactList}>
        <li className={styles.contactItem}>
          <span className={styles.contactLabel}>
            {contact.emailLabel}
          </span>
          <a
            className={styles.contactLink}
            href={`mailto:${contact.email}`}
          >
            {contact.email}
          </a>
        </li>
        <li className={styles.contactItem}>
          <span className={styles.contactLabel}>
            {contact.phoneLabel}
          </span>
          <a
            className={styles.contactLink}
            href={`tel:${contact.phone}`}
          >
            {contact.phone}
          </a>
        </li>
        <li className={styles.contactItem}>
          <span className={styles.contactLabel}>
            {contact.telegramLabel}
          </span>
          <a
            className={styles.contactLink}
            href={`https://t.me/${contact.telegram.replace("@", "")}`}
            target="_blank"
            rel="noreferrer"
          >
            {contact.telegram}
          </a>
        </li>
        <li className={styles.contactItem}>
          <span className={styles.contactLabel}>
            {contact.hoursLabel}
          </span>
          <span className={styles.contactText}>
            {contact.hours}
          </span>
        </li>
      </ul>
    </section>
  );
}
