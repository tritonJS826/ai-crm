import {Link} from "react-router-dom";
import {Button} from "src/components/Button/Button";
import {EmptyState} from "src/components/EmptyState/EmptyState";
import {PageHeader} from "src/components/PageHeader/PageHeader";
import {DictionaryKey} from "src/dictionary/dictionaryLoader";
import {useDictionary} from "src/dictionary/useDictionary";
import {buildPath} from "src/routes/routes";
import styles from "src/pages/biohackingListPage/BiohackingListPage.module.scss";

type BioItem = {
  id: string;
  title: string;
  subtitle?: string;
  excerpt?: string;
  img?: string;
  isPaid?: boolean;
};

type BioDictionary = {
  title: string;
  subtitle: string;
  searchPlaceholder: string;
  ariaSearchLabel: string;
  cta: string;
  empty: string;
  loading: string;
  articlesItems: BioItem[];
};

export function BiohackingListPage() {
  const dictionary = useDictionary(DictionaryKey.BIOHACKING) as BioDictionary | null;

  if (!dictionary) {
    return (
      <div>
        Loading…
      </div>
    );
  }

  const articleItems = dictionary.articlesItems;

  return (
    <section
      className={styles.wrap}
      aria-labelledby="bio-title"
    >
      <PageHeader
        title={dictionary.title}
        subtitle={dictionary.subtitle}
      />

      <ul className={styles.grid}>
        {articleItems.map((articleItem) => (
          <li
            key={articleItem.id}
            className={styles.card}
          >
            {articleItem.isPaid && <span className={styles.lockBadge}>
              PRO
            </span>}

            {articleItem.img && (
              <Link
                to={buildPath.biohackingDetail(articleItem.id)}
                className={styles.coverLink}
              >
                <img
                  src={articleItem.img}
                  alt={articleItem.title}
                  className={styles.cover}
                  loading="lazy"
                />
              </Link>
            )}

            <div className={styles.cardBody}>
              <h2 className={styles.cardTitle}>
                <Link
                  to={buildPath.biohackingDetail(articleItem.id)}
                  className={styles.cardLink}
                >
                  {articleItem.title}
                </Link>
              </h2>

              {articleItem.subtitle && <p className={styles.cardSubtitle}>
                {articleItem.subtitle}
              </p>}
              {articleItem.excerpt && <p className={styles.cardText}>
                {articleItem.excerpt}
              </p>}
            </div>

            <div className={styles.cardFoot}>
              <Button to={buildPath.biohackingDetail(articleItem.id)}>
                {dictionary.cta}
              </Button>
            </div>
          </li>
        ))}
      </ul>

      {articleItems.length === 0 && <EmptyState message={dictionary.empty} />}
    </section>
  );
}
