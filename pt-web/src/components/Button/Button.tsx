import {Link} from "react-router-dom";
import styles from "src/components/Button/Button.module.scss";

type ButtonProps = {
  to: string;
  children: React.ReactNode;
};

export function Button({to, children}: ButtonProps) {
  return (
    <Link
      to={to}
      className={styles.ctaButton}
    >
      {children}
    </Link>
  );
}
