import {useState} from "react";
import {Link, useParams} from "react-router-dom";
import {DictionaryKey} from "src/dictionary/dictionaryLoader";
import {useDictionary} from "src/dictionary/useDictionary";
import {PATHS} from "src/routes/routes";
import {getPaymentLink} from "src/services/payment";
import styles from "src/pages/biohackingListPage/articles/BiohackingDetailPage.module.scss";

type ParagraphNode = { type: "paragraph"; text: string };
type QuoteNode = { type: "quote"; text: string; author?: string };
type ContentNode = ParagraphNode | QuoteNode;

type Article = {
  id: string;
  title: string;
  subtitle?: string;
  img?: string;
  isPaid?: boolean;
  paywallAtIndex?: number;
  content: ContentNode[];
};

type BiohackingDictionary = {
  loading: string;
  notFound: string;
  backToAll: string;
  back: string;
  articleEyebrow: string;
  buyBtn: string;
  paywallTitle: string;
  paywallText: string;
  articles: Article[];
};

export function BiohackingDetailPage() {
  const routeParams = useParams<{ id: string }>();
  const dictionary = useDictionary(DictionaryKey.BIOHACKING) as BiohackingDictionary | null;

  const [isLoadingPayment, setIsLoadingPayment] = useState(false);

  const handleBuyClick = async () => {
    try {
      setIsLoadingPayment(true);
      const link = await getPaymentLink();
      window.location.href = link;
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error("Error while fetching payment link:", error);
      setIsLoadingPayment(false);
      alert("Failed to retrieve payment link. Please try again later.");
    }
  };

  if (!dictionary) {
    return (
      <div>
        Loading…
      </div>
    );
  }

  const currentArticleId = routeParams.id;
  const article = dictionary.articles.find((articleItem) => articleItem.id === currentArticleId);

  if (!article) {
    return (
      <section className={styles.wrap}>
        <div className={styles.empty}>
          <p>
            {dictionary.notFound}
          </p>
          <Link
            to={PATHS.BIOHACKING.LIST}
            className={styles.btn}
          >
            {dictionary.backToAll}
          </Link>
        </div>
      </section>
    );
  }

  const contentNodes: ContentNode[] = Array.isArray(article.content) ? article.content : [];

  const isPaidArticle = Boolean(article.isPaid);
  const hasValidCutIndex =
    typeof article.paywallAtIndex === "number" && article.paywallAtIndex >= 0;

  const cutIndex = hasValidCutIndex ? (article.paywallAtIndex as number) : Number.POSITIVE_INFINITY;
  const visibleContentNodes = isPaidArticle ? contentNodes.slice(0, cutIndex) : contentNodes;
  const shouldShowPaywall = isPaidArticle && contentNodes.length > visibleContentNodes.length;

  return (
    <article
      className={styles.wrap}
      aria-labelledby="article-title"
    >
      {article.img && (
        <figure className={styles.figure}>
          <img
            src={article.img}
            alt={article.title}
            className={styles.cover}
          />
        </figure>
      )}

      <header className={styles.head}>
        <p className={styles.eyebrow}>
          {dictionary.articleEyebrow}
        </p>
        <h1
          id="article-title"
          className={styles.title}
        >
          {article.title}
        </h1>
        {article.subtitle && (
          <p className={styles.subtitle}>
            {article.subtitle}
          </p>
        )}
        <div className={styles.metaRow}>
          <Link
            to={PATHS.BIOHACKING.LIST}
            className={styles.back}
          >
            {dictionary.back}
          </Link>
        </div>
      </header>

      <div className={styles.content}>
        {visibleContentNodes.map((contentNode, nodeIndex) => {
          if (contentNode.type === "paragraph") {
            return (
              <p
                key={nodeIndex}
                className={styles.p}
              >
                {contentNode.text}
              </p>
            );
          }
          if (contentNode.type === "quote") {
            return (
              <figure
                key={nodeIndex}
                className={styles.quote}
              >
                <blockquote className={styles.q}>
                  {contentNode.text}
                </blockquote>
                {contentNode.author && (
                  <figcaption className={styles.caption}>
                    —
                    {contentNode.author}
                  </figcaption>
                )}
              </figure>
            );
          }

          return null;
        })}
      </div>

      {shouldShowPaywall && (
        <div className={styles.paywall}>
          <div className={styles.paywallTitle}>
            {dictionary.paywallTitle}
          </div>
          <div className={styles.paywallText}>
            {dictionary.paywallText}
          </div>
          <button
            className={styles.paywallBtn}
            onClick={handleBuyClick}
            disabled={isLoadingPayment}
          >
            {isLoadingPayment ? "Loading..." : dictionary.buyBtn}
          </button>
        </div>
      )}
    </article>
  );
}
