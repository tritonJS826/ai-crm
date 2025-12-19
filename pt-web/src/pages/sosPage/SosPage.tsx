import React, {useCallback, useEffect, useState} from "react";
import {useAtomValue} from "jotai";
import {PhoneCall} from "lucide-react";
import {Button} from "src/components/Button/Button";
import {PageHeader} from "src/components/PageHeader/PageHeader";
import {SupportPlan} from "src/constants/userPlans";
import {DictionaryKey} from "src/dictionary/dictionaryLoader";
import {useDictionary} from "src/dictionary/useDictionary";
import {PATHS} from "src/routes/routes";
import {getPaymentLink} from "src/services/payment";
import {getUserPersonal, type UserPersonal} from "src/services/profile";
import {getDoctorAvailability} from "src/services/support";
import {accessTokenAtomWithPersistence} from "src/state/authAtom";
import styles from "src/pages/sosPage/SosPage.module.scss";

type SelfhelpItem = {
  id: string;
  link: string;
  title: string;
  desc: string;
};

type SosDictionary = {
  page: { title: string; subtitle: string };
  emergency: { title: string; callNow: string; ariaLabel: string; busyText: string };
  consultation: { title: string; lead: string; cta: string };
  selfhelp: { title: string; lead: string };
  selfhelpItems: SelfhelpItem[];
};

const NOTICE_TIMEOUT = 10000;

export function SosPage() {
  const dictionary = useDictionary(DictionaryKey.SOS) as SosDictionary | null;

  const accessTokens = useAtomValue(accessTokenAtomWithPersistence);
  const isAuthenticated = Boolean(accessTokens?.token);

  const [userPersonal, setUserPersonal] = useState<UserPersonal | null>(null);
  const [availableDoctors, setAvailableDoctors] = useState<number>(0);
  const [noticeMessage, setNoticeMessage] = useState<string>("");
  const [paymentLink, setPaymentLink] = useState<string | null>(null);

  const isPaidSupportPlan = (userPersonal?.plan ?? SupportPlan.FREE) !== SupportPlan.FREE;

  useEffect(() => {
    async function fetchPaymentLink() {
      try {
        const link = await getPaymentLink();
        setPaymentLink(link);
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error("Error fetching payment link:", err);
        setPaymentLink(null);
      }
    }

    if (!isPaidSupportPlan) {
      fetchPaymentLink();
    }
  }, [isPaidSupportPlan]);

  useEffect(() => {
    const controller = new AbortController();

    async function load(): Promise<void> {
      try {
        if (isAuthenticated) {
          const personal = await getUserPersonal({signal: controller.signal});
          setUserPersonal(personal);
        } else {
          setUserPersonal(null);
        }
      } catch {
        setUserPersonal(null);
      }

      try {
        const count = await getDoctorAvailability({signal: controller.signal});
        setAvailableDoctors(count);
      } catch {
        setAvailableDoctors(0);
      }
    }

    load();

    return () => {
      controller.abort();
    };
  }, [isAuthenticated]);

  useEffect(() => {
    if (!noticeMessage) {
      return;
    }
    const messageTime = setTimeout(() => setNoticeMessage(""), NOTICE_TIMEOUT);

    return () => clearTimeout(messageTime);
  }, [noticeMessage]);

  const onUnavailableClick = useCallback((): void => {
    if (!dictionary) {
      return;
    }
    setNoticeMessage(dictionary.emergency.busyText);
  }, [dictionary]);

  const onInternetCallClick = useCallback((): void => {
    setNoticeMessage("Internet call will be available soon.");
    // TODO: real data
  }, []);

  if (!dictionary) {
    return (
      <div className={styles.page}>
        Loading...
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <PageHeader
        title={dictionary.page.title}
        subtitle={dictionary.page.subtitle}
      />

      <section
        className={styles.cardHero}
        id="emergency"
      >
        <h2 className={styles.cardTitleHero}>
          {dictionary.emergency.title}
        </h2>

        <div className={styles.heroRow}>
          <button
            type="button"
            className={`${styles.callNowBtn} ${availableDoctors > 0 ? styles.callNowOk : styles.callNowBad}`}
            aria-label={dictionary.emergency.ariaLabel}
            onClick={() => {
              if (availableDoctors > 0) {
                if (isPaidSupportPlan) {
                  onInternetCallClick();
                } else {
                  if (paymentLink) {
                    window.location.href = paymentLink;
                  } else {
                    setNoticeMessage("Ошибка: не удалось получить ссылку на оплату.");
                  }
                }
              } else {
                onUnavailableClick();
              }
            }}
          >
            <PhoneCall
              className={styles.callNowIcon}
              aria-hidden="true"
            />
            {dictionary.emergency.callNow}
          </button>
        </div>
        {noticeMessage && (
          <p className={`${styles.notice} ${styles.noticeVisible}`}>
            {noticeMessage}
          </p>
        )}
      </section>

      <section
        className={styles.card}
        id="consultation"
      >
        <h2 className={styles.cardTitle}>
          {dictionary.consultation.title}
        </h2>
        <p className={styles.lead}>
          {dictionary.consultation.lead}
        </p>
        <Button to={PATHS.SOS.CONSULTATION}>
          {dictionary.consultation.cta}
        </Button>
      </section>

      <section
        className={styles.card}
        id="selfhelp"
      >
        <h2 className={styles.cardTitle}>
          {dictionary.selfhelp.title}
        </h2>
        <p className={styles.lead}>
          {dictionary.selfhelp.lead}
        </p>
        <ul className={styles.topics}>
          {dictionary.selfhelpItems.map((item) => (
            <li
              key={item.id}
              className={styles.topic}
            >
              <Button to={`${PATHS.CONDITIONS.LIST}${item.link}`}>
                {item.title}
              </Button>
              <p className={styles.topicDesc}>
                {item.desc}
              </p>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
