import React, {useEffect, /* useRef, */ useState} from "react";
import {Link, NavLink} from "react-router-dom";
import {useAtom, useAtomValue} from "jotai";
import {UserRound} from "lucide-react";
import logo from "src/assets/AICRM.avif";
import {LEFT_LINK_KEYS, MenuKey} from "src/components/Header/header.config";
import {languageAtomWithPersistence} from "src/dictionary/dictionaryAtom";
import {DictionaryKey} from "src/dictionary/dictionaryLoader";
import {useDictionary} from "src/dictionary/useDictionary";
import {PATHS} from "src/routes/routes";
import {accessTokenAtomWithPersistence} from "src/state/authAtom";
import styles from "src/components/Header/Header.module.scss";

export function Header() {
  const dictionary = useDictionary(DictionaryKey.HEADER);
  const [lang] = useAtom(languageAtomWithPersistence);

  const [drawerOpen, setDrawerOpen] = useState(false);

  /* Language switcher state (enable when switcher is active)
  const [langOpenTop, setLangOpenTop] = useState(false);
  const [langOpenDrawer, setLangOpenDrawer] = useState(false);
  */

  /* Language switcher refs (enable when switcher is active)
  const langBtnTopRef = useRef<HTMLButtonElement | null>(null);
  const langMenuTopRef = useRef<HTMLDivElement | null>(null);
  const langBtnDrawerRef = useRef<HTMLButtonElement | null>(null);
  const langMenuDrawerRef = useRef<HTMLDivElement | null>(null);
  */

  const access = useAtomValue(accessTokenAtomWithPersistence);
  const isAuthenticated = Boolean(access?.token);
  const profileTo = isAuthenticated ? PATHS.PROFILE.PAGE : PATHS.AUTH.PAGE;

  const handleNavClick = () => {
    setDrawerOpen(false);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setDrawerOpen(false);

        /* Language switcher is disabled now
        setLangOpenTop(false);
        setLangOpenDrawer(false);
        */
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  /* Language switcher handlers (enable when switcher is active)
  useEffect(() => {
    if (!langOpenTop) {
      return;
    }

    const handleMouseDownTop = (event: MouseEvent) => {
      const eventTargetNode = event.target;
      if (!(eventTargetNode instanceof Node)) {
        return;
      }

      const isInsideMenu = langMenuTopRef.current?.contains(eventTargetNode);
      const isInsideButton = langBtnTopRef.current?.contains(eventTargetNode);

      if (!isInsideMenu && !isInsideButton) {
        setLangOpenTop(false);
      }
    };

    document.addEventListener("mousedown", handleMouseDownTop);

    return () => document.removeEventListener("mousedown", handleMouseDownTop);
  }, [langOpenTop]);

  useEffect(() => {
    if (!langOpenDrawer) {
      return;
    }

    const handleMouseDownDrawer = (event: MouseEvent) => {
      const eventTargetNode = event.target;
      if (!(eventTargetNode instanceof Node)) {
        return;
      }

      const isInsideMenu = langMenuDrawerRef.current?.contains(eventTargetNode);
      const isInsideButton = langBtnDrawerRef.current?.contains(eventTargetNode);

      if (!isInsideMenu && !isInsideButton) {
        setLangOpenDrawer(false);
      }
    };

    document.addEventListener("mousedown", handleMouseDownDrawer);

    return () => document.removeEventListener("mousedown", handleMouseDownDrawer);
  }, [langOpenDrawer]);
  */

  if (!dictionary) {
    return (
      <div>
        Loading...
      </div>
    );
  }

  const labelByKey: Record<MenuKey, string> = {about: dictionary.nav.about};
  const pathByKey: Record<MenuKey, string> = {about: PATHS.ABOUT};

  const currentLangLabel = lang === "ru" ? dictionary.lang.ru : dictionary.lang.en;

  /* Language switcher options (enable when switcher is active)
  const langOptions: { code: Language; label: string }[] = [
    {code: "ru", label: dictionary.lang.ru},
    {code: "en", label: dictionary.lang.en},
  ];
  */

  return (
    <header className={styles.header}>
      <nav
        className={styles.nav}
        aria-label={dictionary.nav.ariaPrimary}
      >
        <Link
          to={PATHS.HOME}
          className={styles.logo}
          aria-label={dictionary.nav.ariaHome}
          onClick={handleNavClick}
        >
          <img
            src={logo}
            alt="BRAIN100"
            className={styles.logoImg}
          />
        </Link>

        <div className={styles.navCenter}>
          <ul className={styles.navAll}>
            {LEFT_LINK_KEYS.map((key) => (
              <li
                key={key}
                className={styles.navItem}
              >
                <NavLink
                  to={pathByKey[key]}
                  className={({isActive}) => `${styles.navLink} ${isActive ? styles.active : ""}`}
                  onClick={handleNavClick}
                >
                  {labelByKey[key]}
                </NavLink>
              </li>
            ))}
          </ul>
        </div>

        <div className={styles.actions}>
          <NavLink
            to={profileTo}
            className={styles.iconBtn}
            aria-label={dictionary.nav.profile}
            onClick={handleNavClick}
          >
            <UserRound className={styles.icon} />
          </NavLink>

          <div className={styles.langWrap}>
            <button
              type="button"
              className={styles.langBtn}
            >
              {currentLangLabel}
            </button>

            {/* Language switcher menu (enable when switcher is active)
            <div
              ref={langMenuTopRef}
              className={`${styles.langMenu} ${langOpenTop ? styles.langMenuOpen : ""}`}
              role="menu"
            >
              {langOptions.map((opt) => (
                <button
                  key={opt.code}
                  type="button"
                  className={styles.langOption}
                  role="menuitem"
                  aria-current={lang === opt.code}
                  onClick={() => {
                    setLang(opt.code);
                    setLangOpenTop(false);
                  }}
                >
                  {opt.label}
                </button>
              ))}
            </div>
            */}
          </div>

          <div className={styles.burgerWrap}>
            <button
              type="button"
              className={`${styles.burger} ${drawerOpen ? styles.burgerOpen : ""}`}
              aria-label={dictionary.nav.ariaOpenMenu}
              aria-expanded={drawerOpen}
              aria-controls="mobile-drawer"
              onClick={() => setDrawerOpen(!drawerOpen)}
            >
              <span className={styles.burgerInner}>
                <span />
                <span />
                <span />
              </span>
            </button>
          </div>
        </div>
      </nav>

      <button
        aria-hidden={!drawerOpen}
        className={`${styles.backdrop} ${drawerOpen ? styles.backdropOpen : ""}`}
        onClick={() => setDrawerOpen(false)}
      />

      <aside
        id="mobile-drawer"
        className={`${styles.drawer} ${drawerOpen ? styles.drawerOpen : ""}`}
        role="dialog"
        aria-modal="true"
        aria-label={dictionary.nav.ariaMenu}
      >
        <div className={styles.drawerHead}>
          <Link
            to={PATHS.HOME}
            className={styles.logo}
            aria-label={dictionary.nav.ariaHome}
            onClick={() => setDrawerOpen(false)}
          >
            <img
              src={logo}
              alt="BRAIN100"
              className={styles.drawerLogo}
            />
          </Link>
          <button
            type="button"
            className={styles.close}
            aria-label={dictionary.nav.ariaCloseMenu}
            onClick={() => setDrawerOpen(false)}
          >
            ×
          </button>
        </div>

        <div className={styles.drawerScroll}>
          <ul className={styles.drawerList}>
            <li>
              <NavLink
                to={PATHS.ABOUT}
                className={styles.drawerLink}
                onClick={() => setDrawerOpen(false)}
              >
                {dictionary.nav.about}
              </NavLink>
            </li>
          </ul>
        </div>

        <div className={styles.drawerFoot}>
          <div className={styles.langWrap}>
            <button
              type="button"
              className={styles.langBtn}
            >
              {currentLangLabel}
            </button>

            {/* Language switcher menu (enable when switcher is active)
            <div
              id="lang-menu-drawer"
              ref={langMenuDrawerRef}
              className={`${styles.langMenu} ${styles.langMenuSide} ${langOpenDrawer ? styles.langMenuOpen : ""}`}
              role="menu"
            >
              {langOptions.map((opt) => (
                <button
                  key={opt.code}
                  type="button"
                  className={styles.langOption}
                  role="menuitem"
                  aria-current={lang === opt.code}
                  onClick={() => {
                    setLang(opt.code);
                    setLangOpenDrawer(false);
                  }}
                >
                  {opt.label}
                </button>
              ))}
            </div>
            */}
          </div>

          <NavLink
            to={isAuthenticated ? PATHS.PROFILE.PAGE : PATHS.AUTH.PAGE}
            className={styles.iconBtn}
            onClick={() => setDrawerOpen(false)}
            aria-label={dictionary.nav.profile}
          >
            <UserRound className={styles.icon} />
          </NavLink>
        </div>
      </aside>

    </header>
  );
}
