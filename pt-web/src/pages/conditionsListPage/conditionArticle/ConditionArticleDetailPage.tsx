import {Link, useParams} from "react-router-dom";
import {DictionaryKey} from "src/dictionary/dictionaryLoader";
import {useDictionary} from "src/dictionary/useDictionary";
import {PATHS} from "src/routes/routes";
import styles from "src/pages/conditionsListPage/conditionArticle/ConditionArticleDetailPage.module.scss";

type ParagraphNode = { type: "paragraph"; text: string };
type QuoteNode = { type: "quote"; text: string; author?: string };
type ContentNode = ParagraphNode | QuoteNode;

export function ConditionArticleDetailPage() {
  const {id} = useParams<{ id: string }>();
  const dictionary = useDictionary(DictionaryKey.CONDITIONS);

  if (!dictionary) {
    return (
      <div>
        Loading...
      </div>
    );
  }

  const article = dictionary.articles.find((a: { id: string }) => a.id === id);
  if (!article) {
    return (
      <section className={styles.wrap}>
        <div className={styles.empty}>
          <p>
            {dictionary.notFound}
          </p>
          <Link
            to={PATHS.CONDITIONS.LIST}
            className={styles.btn}
          >
            {dictionary.backToAll}
          </Link>
        </div>
      </section>
    );
  }

  const content: ContentNode[] = Array.isArray(article.content)
    ? (article.content as ContentNode[])
    : [];

  return (
    <article
      className={styles.wrap}
      aria-labelledby="article-title"
    >
      {article.title && (
        <h1
          id="article-title"
          className={styles.title}
        >
          {article.title}
        </h1>
      )}
      {article.subtitle && (
        <p className={styles.subtitle}>
          {article.subtitle}
        </p>
      )}

      <div className={styles.content}>
        {content.map((node, i) => {
          switch (node.type) {
            case "paragraph":
              return (
                <p
                  key={i}
                  className={styles.p}
                >
                  {node.text}
                </p>
              );
            case "quote":
              return (
                <figure
                  key={i}
                  className={styles.quote}
                >
                  <blockquote className={styles.q}>
                    {node.text}
                  </blockquote>
                  {node.author && (
                    <figcaption className={styles.caption}>
                      —
                      {node.author}
                    </figcaption>
                  )}
                </figure>
              );
            default:
              return null;
          }
        })}
      </div>

      <div className={styles.actions}>
        <Link
          to={PATHS.CONDITIONS.LIST}
          className={styles.btn}
        >
          {dictionary.backToAll}
        </Link>
      </div>
    </article>
  );
}
