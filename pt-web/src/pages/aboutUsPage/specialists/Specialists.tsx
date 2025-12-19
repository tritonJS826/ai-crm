import styles from "src/pages/aboutUsPage/AboutUsPage.module.scss";

export type Specialist = {
  id: string;
  name: string;
  role: string;
  bio: string;
  skills: readonly string[];
  photoUrl?: string;
  photoAlt?: string;
};

const FIRST_LETTER_COUNT = 1;

type SpecialistsSectionProps = {
  title: string;
  items: ReadonlyArray<Specialist>;
};

type SpecialistCardProps = Specialist;

function SpecialistCard(props: SpecialistCardProps) {
  const firstLetter = props.name.slice(0, FIRST_LETTER_COUNT).toUpperCase();

  return (
    <li className={styles.card}>
      <div className={styles.avatar}>
        {props.photoUrl
          ? (
            <img
              src={props.photoUrl}
              alt={props.photoAlt || props.name}
              className={styles.avatarImg}
            />
          )
          : (
            <span className={styles.avatarFallback}>
              {firstLetter}
            </span>
          )}
      </div>

      <div className={styles.cardBody}>
        <h3 className={styles.cardName}>
          {props.name}
        </h3>
        <p className={styles.cardRole}>
          {props.role}
        </p>
        <p className={styles.cardBio}>
          {props.bio}
        </p>

        {props.skills?.length > 0 && (
          <ul className={styles.tags}>
            {props.skills.map((skill) => (
              <li
                key={skill}
                className={styles.tag}
              >
                {skill}
              </li>
            ))}
          </ul>
        )}
      </div>
    </li>
  );
}

export function SpecialistsSection({title, items}: SpecialistsSectionProps) {
  return (
    <section
      className={styles.specs}
      aria-label={title}
    >
      <h2 className={styles.sectionTitle}>
        {title}
      </h2>
      <ul className={styles.cards}>
        {items.map((specialist) => (
          <SpecialistCard
            key={specialist.id}
            id={specialist.id}
            name={specialist.name}
            role={specialist.role}
            bio={specialist.bio}
            skills={specialist.skills}
            photoUrl={specialist.photoUrl}
            photoAlt={specialist.photoAlt}
          />
        ))}
      </ul>
    </section>
  );
}
