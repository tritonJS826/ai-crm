import React, {useEffect, useRef, useState} from "react";
import {Link, NavLink} from "react-router-dom";
import {useAtom, useAtomValue} from "jotai";
import {UserRound} from "lucide-react";
import promoMental from "src/assets/1_consult.avif";
import promoTests from "src/assets/2_register.avif";
import promoBio from "src/assets/3_follow.avif";
import logo from "src/assets/BRAIN100.webp";
import {LEFT_LINK_KEYS, MenuKey, TIMEOUT_MENU_MS} from "src/components/Header/header.config";
import {languageAtomWithPersistence} from "src/dictionary/dictionaryAtom";
import {DictionaryKey, Language} from "src/dictionary/dictionaryLoader";
import {useDictionary} from "src/dictionary/useDictionary";
import {buildPath, PATHS} from "src/routes/routes";
import {accessTokenAtomWithPersistence} from "src/state/authAtom";
import styles from "src/components/Header/Header.module.scss";

type DropdownKey = "mental" | "tests" | "biohacking";

function isDropdownKey(key: MenuKey): key is DropdownKey {
  return key === "mental" || key === "tests" || key === "biohacking";
}

export function Header() {
  const dictionary = useDictionary(DictionaryKey.HEADER);
  const [lang, setLang] = useAtom(languageAtomWithPersistence);

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerActive, setDrawerActive] = useState<DropdownKey | null>(null);
  const [dockOpen, setDockOpen] = useState(false);
  const [activeKey, setActiveKey] = useState<DropdownKey | null>(null);
  const [langOpenTop, setLangOpenTop] = useState(false);
  const [langOpenDrawer, setLangOpenDrawer] = useState(false);

  const langBtnTopRef = useRef<HTMLButtonElement | null>(null);
  const langMenuTopRef = useRef<HTMLDivElement | null>(null);
  const langBtnDrawerRef = useRef<HTMLButtonElement | null>(null);
  const langMenuDrawerRef = useRef<HTMLDivElement | null>(null);

  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const access = useAtomValue(accessTokenAtomWithPersistence);
  const isAuthenticated = Boolean(access?.token);
  const profileTo = isAuthenticated ? PATHS.PROFILE.PAGE : PATHS.AUTH.PAGE;

  const dockRef = useRef<HTMLDivElement | null>(null);
  const navRef = useRef<HTMLUListElement | null>(null);

  const clearTimer = () => {
    if (closeTimerRef.current !== null) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
  };

  const scheduleClose = () => {
    clearTimer();
    closeTimerRef.current = setTimeout(() => {
      setDockOpen(false);
      setActiveKey(null);
    }, TIMEOUT_MENU_MS);
  };

  const handleMenuHover = (key: MenuKey) => {
    if (isDropdownKey(key)) {
      setActiveKey(key);
      setDockOpen(true);
      clearTimer();
    } else {
      setDockOpen(false);
      setActiveKey(null);
    }
  };

  const handleNavClick = () => {
    setDockOpen(false);
    setActiveKey(null);
    setDrawerOpen(false);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setDrawerOpen(false);
        setDockOpen(false);
        setLangOpenTop(false);
        setLangOpenDrawer(false);
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  useEffect(() => {
    if (!dockOpen) {
      return;
    }

    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target;
      if (!(target instanceof Node)) {
        return;
      }

      const isInsideDock = dockRef.current?.contains(target) ?? false;
      const isInsideNav = navRef.current?.contains(target) ?? false;

      if (!isInsideDock && !isInsideNav) {
        clearTimer();
        setDockOpen(false);
        setActiveKey(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [dockOpen]);

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

  if (!dictionary) {
    return (
      <div>
        Loading...
      </div>
    );
  }

  const labelByKey: Record<MenuKey, string> = {
    about: dictionary.nav.about,
    mental: dictionary.nav.mental,
    tests: dictionary.nav.tests,
    biohacking: dictionary.nav.biohacking,
  };
  const pathByKey: Record<MenuKey, string> = {
    about: PATHS.ABOUT,
    mental: PATHS.CONDITIONS.LIST,
    tests: PATHS.TESTS.LIST,
    biohacking: PATHS.BIOHACKING.LIST,
  };
  const toPairs = (menu: Record<string, string>) =>
    Object.entries(menu).map(([id, label]) => ({id, label}));
  const mentalItems = toPairs(dictionary.nav.menus.mental);
  const testItems = toPairs(dictionary.nav.menus.tests);
  const bioItems = toPairs(dictionary.nav.menus.biohacking);

  const currentLangLabel = lang === "ru" ? dictionary.lang.ru : dictionary.lang.en;

  const langOptions: { code: Language; label: string }[] = [
    {code: "ru", label: dictionary.lang.ru},
    {code: "en", label: dictionary.lang.en},
  ];

  const Promo = ({to, img, title}: {to: string; img: string; title: string}) => (
    <Link
      to={to}
      className={styles.dockPromo}
      onClick={handleNavClick}
    >
      <img
        src={img}
        alt={title}
        className={styles.dockPromoImg}
      />
      <span className={styles.dockPromoTitle}>
        {title}
      </span>
    </Link>
  );

  const renderDock = (key: DropdownKey | null) => {
    if (!key) {
      return null;
    }

    const menus: Record<
      DropdownKey,
      {
        list: { id: string; label: string }[];
        title: string;
        promo: React.ReactElement;
        buildLink: (id: string) => string;
        listPath: string;
      }
    > = {
      mental: {
        list: mentalItems,
        title: dictionary.dock.allStates,
        promo:
  <Promo
    to={buildPath.supportConsultation()}
    img={promoMental}
    title={dictionary.promo.consultCta}
  />,
        buildLink: (id) => buildPath.conditionsDetail(id),
        listPath: PATHS.CONDITIONS.LIST,
      },
      tests: {
        list: testItems,
        title: dictionary.dock.allTests,
        promo:
  <Promo
    to={isAuthenticated ? PATHS.PROFILE.PAGE : buildPath.auth()}
    img={promoTests}
    title={dictionary.promo.registerCta}
  />,
        buildLink: (id) => buildPath.testsDetail(id),
        listPath: PATHS.TESTS.LIST,
      },
      biohacking: {
        list: bioItems,
        title: dictionary.dock.allArticles,
        promo:
  <Promo
    to={isAuthenticated ? PATHS.PROFILE.PAGE : buildPath.auth()}
    img={promoBio}
    title={dictionary.promo.subscribeCta}
  />,
        buildLink: (id) => buildPath.biohackingDetail(id),
        listPath: PATHS.BIOHACKING.LIST,
      },
    };

    const data = menus[key];

    return (
      <div className={styles.dockLayout}>
        <div className={styles.dockLists}>
          <NavLink
            to={data.listPath}
            className={styles.dockHeading}
            onClick={handleNavClick}
          >
            {data.title}
          </NavLink>
          <ul className={`${styles.dockList} ${styles.dockListTwoCols}`}>
            {data.list.map((item) => (
              <li key={item.id}>
                <NavLink
                  to={data.buildLink(item.id)}
                  className={styles.dockLink}
                  onClick={handleNavClick}
                >
                  {item.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </div>
        {data.promo}
      </div>
    );
  };

  const toggleDrawerSection = (key: DropdownKey) => {
    setDrawerActive(prev => (prev === key ? null : key));
  };

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
          <ul
            className={styles.navAll}
            ref={navRef}
            onMouseLeave={scheduleClose}
          >
            {LEFT_LINK_KEYS.map((key) => (
              <li
                key={key}
                className={styles.navItem}
                onMouseEnter={() => handleMenuHover(key)}
                aria-haspopup={isDropdownKey(key)}
                aria-expanded={dockOpen && activeKey === key}
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
              ref={langBtnTopRef}
              type="button"
              className={styles.langBtn}
              onClick={() => setLangOpenTop(!langOpenTop)}
              aria-haspopup="true"
              aria-expanded={langOpenTop}
            >
              {currentLangLabel}
            </button>
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
          </div>

          <NavLink
            to={buildPath.sosList()}
            className={styles.cta}
            onClick={handleNavClick}
          >
            {dictionary.nav.sos}
          </NavLink>

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

      <aside
        ref={dockRef}
        className={`${styles.dock} ${dockOpen && activeKey ? styles.dockOpen : ""}`}
        onMouseEnter={clearTimer}
        onMouseLeave={scheduleClose}
        aria-hidden={!dockOpen}
      >
        <div className={styles.dockInner}>
          {renderDock(activeKey)}
        </div>
      </aside>

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
              <button
                type="button"
                className={`
                  ${styles.drawerLink}
                  ${styles.drawerLinkBtn}
                  ${drawerActive === "mental" ? styles.drawerLinkOpen : ""}`}
                onClick={() => toggleDrawerSection("mental")}
                aria-expanded={drawerActive === "mental"}
              >
                {dictionary.nav.mental}
                <span
                  className={`${styles.chevron} ${drawerActive === "mental" ? styles.chevronDown : styles.chevronRight}`}
                  aria-hidden="true"
                />
              </button>
              <ul className={`${styles.submenu} ${drawerActive === "mental" ? styles.submenuOpen : ""}`}>
                {mentalItems.map((item) => (
                  <li key={item.id}>
                    <NavLink
                      to={buildPath.conditionsDetail(item.id)}
                      className={styles.submenuLink}
                      onClick={() => setDrawerOpen(false)}
                    >
                      {item.label}
                    </NavLink>
                  </li>
                ))}
              </ul>
            </li>

            <li>
              <button
                type="button"
                className={`
                ${styles.drawerLink}
                ${styles.drawerLinkBtn}
                ${drawerActive === "tests" ? styles.drawerLinkOpen : ""}`}
                onClick={() => toggleDrawerSection("tests")}
                aria-expanded={drawerActive === "tests"}
              >
                {dictionary.nav.tests}
                <span
                  className={`${styles.chevron} ${drawerActive === "tests" ? styles.chevronDown : styles.chevronRight}`}
                  aria-hidden="true"
                />
              </button>
              <ul className={`${styles.submenu} ${drawerActive === "tests" ? styles.submenuOpen : ""}`}>
                {testItems.map((item) => (
                  <li key={item.id}>
                    <NavLink
                      to={buildPath.testsDetail(item.id)}
                      className={styles.submenuLink}
                      onClick={() => setDrawerOpen(false)}
                    >
                      {item.label}
                    </NavLink>
                  </li>
                ))}
              </ul>
            </li>

            <li>
              <button
                type="button"
                className={`
                ${styles.drawerLink}
                ${styles.drawerLinkBtn}
                ${drawerActive === "biohacking" ? styles.drawerLinkOpen : ""}`}
                onClick={() => toggleDrawerSection("biohacking")}
                aria-expanded={drawerActive === "biohacking"}
              >
                {dictionary.nav.biohacking}
                <span
                  className={`${styles.chevron} ${drawerActive === "biohacking" ? styles.chevronDown : styles.chevronRight}`}
                  aria-hidden="true"
                />
              </button>
              <ul className={`${styles.submenu} ${drawerActive === "biohacking" ? styles.submenuOpen : ""}`}>
                {bioItems.map((item) => (
                  <li key={item.id}>
                    <NavLink
                      to={buildPath.biohackingDetail(item.id)}
                      className={styles.submenuLink}
                      onClick={() => setDrawerOpen(false)}
                    >
                      {item.label}
                    </NavLink>
                  </li>
                ))}
              </ul>
            </li>

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
              ref={langBtnDrawerRef}
              type="button"
              className={styles.langBtn}
              onClick={() => setLangOpenDrawer(!langOpenDrawer)}
              aria-haspopup="true"
              aria-expanded={langOpenDrawer}
              aria-controls="lang-menu-drawer"
            >
              {currentLangLabel}
            </button>
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
          </div>

          <NavLink
            to={buildPath.sosList()}
            className={styles.cta}
            onClick={() => setDrawerOpen(false)}
          >
            {dictionary.nav.sos}
          </NavLink>

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

      <NavLink
        to={PATHS.SOS.PAGE}
        className={styles.sosFloat}
        aria-label="Страница поддержки"
        onClick={handleNavClick}
      >
        SOS
      </NavLink>
    </header>
  );
}
