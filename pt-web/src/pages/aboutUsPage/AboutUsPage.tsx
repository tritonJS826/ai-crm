import {DictionaryKey} from "src/dictionary/dictionaryLoader";
import {useDictionary} from "src/dictionary/useDictionary";
import {ContactsSection} from "src/pages/aboutUsPage/contacts/Contacts";
import {SpecialistsSection} from "src/pages/aboutUsPage/specialists/Specialists";
import styles from "src/pages/aboutUsPage/AboutUsPage.module.scss";

type ProjectBlock = { title: string; text: string };

export function AboutPage() {
  const dictionary = useDictionary(DictionaryKey.ABOUT);

  if (!dictionary) {
    return (
      <div>
        Loading...
      </div>
    );
  }

  return (
    <section
      className={styles.wrap}
      aria-label={dictionary.sectionAria}
    >
      <header className={styles.head}>
        <p className={styles.eyebrow}>
          {dictionary.eyebrow}
        </p>
        <h1 className={styles.title}>
          {dictionary.title}
        </h1>
        <p className={styles.subtitle}>
          {dictionary.subtitle}
        </p>
      </header>

      <section className={styles.project}>
        <ul className={styles.projectGrid}>
          {dictionary.project.blocks.map((block: ProjectBlock) => (
            <li
              key={block.title}
              className={styles.projectItem}
            >
              <h2 className={styles.projectTitle}>
                {block.title}
              </h2>
              <p className={styles.projectText}>
                {block.text}
              </p>
            </li>
          ))}
        </ul>
      </section>

      <SpecialistsSection
        title={dictionary.specialistsTitle}
        items={dictionary.specialists}
      />

      <ContactsSection
        title={dictionary.contactsTitle}
        data={dictionary.contacts}
      />
    </section>
  );
}
