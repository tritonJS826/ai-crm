import styles from "src/components/PageHeader/PageHeader.module.scss";

type PageHeaderProps = {
  title: string;
  subtitle: string;
};

export function PageHeader({title, subtitle}: PageHeaderProps) {
  return (
    <header className={styles.head}>
      <h1
        id="page-title"
        className={styles.title}
      >
        {title}
      </h1>
      {subtitle && <p className={styles.subtitle}>
        {subtitle}
      </p>}
    </header>
  );
}
