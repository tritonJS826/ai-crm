import styles from "src/components/EmptyState/EmptyState.module.scss";

type EmptyStateProps = {
  message: string;
};

export function EmptyState({message}: EmptyStateProps) {
  return (
    <div className={styles.empty}>
      <p>
        {message}
      </p>
    </div>
  );
}
