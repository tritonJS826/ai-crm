import React, {useEffect, useState} from "react";
import {NavLink, useNavigate} from "react-router-dom";
import {useAtomValue, useSetAtom} from "jotai";
import {Pencil, PhoneCall} from "lucide-react";
import {Button} from "src/components/Button/Button";
import {PageHeader} from "src/components/PageHeader/PageHeader";
import {SupportPlan} from "src/constants/userPlans";
import {DictionaryKey} from "src/dictionary/dictionaryLoader";
import {useDictionary} from "src/dictionary/useDictionary";
import {buildPath, PATHS} from "src/routes/routes";
import {logoutUser} from "src/services/auth";
import {getPaymentLink} from "src/services/payment";
import {
  getUserPersonal,
  getUserProfile,
  patchUserProfile,
  type UserPersonal as ApiUserPersonal,
  type UserProfile as ApiUserProfile,
} from "src/services/profile";
import {
  accessTokenAtomWithPersistence,
  clearTokensAtom,
} from "src/state/authAtom";
import styles from "src/pages/profilePage/ProfilePage.module.scss";

type EditableField = "city" | "phone" | "language";

function InlineEditable({
  label,
  value,
  field,
  onSave,
  canEdit = true,
  saveLabel = "Save",
  cancelLabel = "Cancel",
}: {

  label: string;
  value: string | null | undefined;
  field: EditableField;

  onSave: (field: EditableField, next: string) => Promise<void>;

  canEdit?: boolean;
  saveLabel?: string;
  cancelLabel?: string;
}) {
  const [isEditMode, setIsEditMode] = useState(false);
  const [draftValue, setDraftValue] = useState(value ?? "");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!isEditMode) {
      setDraftValue(value ?? "");
    }
  }, [isEditMode, value]);

  const startEdit = (): void => {
    if (!canEdit) {
      return;
    }
    setDraftValue(value ?? "");
    setIsEditMode(true);
  };

  const handleSave = async (): Promise<void> => {
    setIsSaving(true);
    try {
      await onSave(field, draftValue.trim());
      setIsEditMode(false);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = (): void => {
    setIsEditMode(false);
    setDraftValue(value ?? "");
  };

  const handleInputChange: React.ChangeEventHandler<HTMLInputElement> = (event) => {
    setDraftValue(event.target.value);
  };

  return (
    <li className={styles.userItem}>
      <span className={styles.userLabel}>
        {label}
      </span>

      {!isEditMode
        ? (
          <>
            <span className={styles.userValue}>
              {value ?? "—"}
            </span>
            {canEdit
              ? (
                <button
                  type="button"
                  className={styles.editBtn}
                  aria-label={`Edit ${label}`}
                  onClick={startEdit}
                >
                  <Pencil className={styles.editIcon} />
                </button>
              )
              : (
                <span className={styles.editPlaceholder} />
              )}
          </>
        )
        : (
          <>
            <input
              className={styles.userInput}
              value={draftValue}
              onChange={handleInputChange}
              placeholder={label}
            />
            <div className={styles.inlineActions}>
              <button
                type="button"
                className={styles.saveBtn}
                onClick={handleSave}
                disabled={isSaving}
              >
                {isSaving ? "…" : saveLabel}
              </button>
              <button
                type="button"
                className={styles.cancelBtn}
                onClick={handleCancel}
                disabled={isSaving}
              >
                {cancelLabel}
              </button>
            </div>
          </>
        )}
    </li>
  );
}

type ConditionKey = "panic" | "depression" | "burnout";
type StatusKey = "low" | "moderate" | "high";

type ProfileDictionary = {
  page: { title: string; subtitle: string; logoutBtn: string };
  user: {
    title: string;
    name: string;
    preferredContactEmail: string;
    city: string;
    phone: string;
    language: string;
    preferredContactPhone: string;
  };
  plan: {
    title: string;
    baseTitle: string;
    supportTitle: string;
    scheduleBtn: string;
    buyBtn: string;
    statsIncluded: string;
    statsDaysLeft: string;
    descActivePrefix: string;
    descActiveSuffix: string;
    descInactive: string;
    priorityBooking: string;
    emergencyCall: string;
    hint: string;
  };
  tests: {
    title: string;
    subtitle: string;
    name: string;
  };
  actions: {
    save: string;
    cancel: string;
  };
  conditions: Record<ConditionKey, string>;
  status: Record<StatusKey, string>;
  recommendations: Record<ConditionKey, Record<StatusKey, string>>;
};

export function ProfilePage() {
  const dictionary = useDictionary(DictionaryKey.PROFILE) as ProfileDictionary | null;
  const navigate = useNavigate();

  const accessTokens = useAtomValue(accessTokenAtomWithPersistence);
  const isAuthenticated = Boolean(accessTokens?.token);
  const clearTokens = useSetAtom(clearTokensAtom);

  const [isLoading, setIsLoading] = useState(true);
  const [pageError, setPageError] = useState<string | null>(null);
  const [userProfile, setUserProfile] = useState<ApiUserProfile | null>(null);
  const [userPersonal, setUserPersonal] = useState<ApiUserPersonal | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate(PATHS.AUTH.PAGE, {replace: true});
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    let isMounted = true;

    async function loadUserData(): Promise<void> {
      setIsLoading(true);
      setPageError(null);
      try {
        const [profileResponse, personalResponse] = await Promise.all([
          getUserProfile(),
          getUserPersonal(),
        ]);
        if (!isMounted) {
          return;
        }
        setUserProfile(profileResponse);
        setUserPersonal(personalResponse);
      } catch (err) {
        if (!isMounted) {
          return;
        }
        const message = err instanceof Error ? err.message : "Failed to load profile";
        setPageError(message);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    if (isAuthenticated) {
      loadUserData();
    }

    return () => {
      isMounted = false;
    };
  }, [isAuthenticated]);

  if (!isAuthenticated) {
    return null;
  }

  const isPaidSupportPlan = (userPersonal?.plan ?? SupportPlan.FREE) !== SupportPlan.FREE;
  const planTitle =
    isPaidSupportPlan ? (dictionary?.plan.supportTitle ?? "Paid") : (dictionary?.plan.baseTitle ?? "Base");
  const hotlineNumber = "+49 123 4567890";
  const [paymentLink, setPaymentLink] = useState<string | null>(null);

  useEffect(() => {
    async function fetchPaymentLink() {
      try {
        const link = await getPaymentLink();
        setPaymentLink(link);
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error("Error fetching payment link:", error);
        setPaymentLink(null);
      }
    }

    fetchPaymentLink();
  }, []);

  const handleLogout = async (): Promise<void> => {
    await logoutUser();
    clearTokens();
    navigate(PATHS.HOME);
  };

  const handleSaveField = async (field: EditableField, next: string): Promise<void> => {
    await patchUserProfile({[field]: next});
    setUserProfile((previous) => (previous ? {...previous, [field]: next} : previous));
  };

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

      {isLoading && (
        <section className={styles.card}>
          <div>
            Loading…
          </div>
        </section>
      )}

      {!isLoading && pageError && (
        <section className={styles.card}>
          <div className={styles.errorMessage}>
            {pageError}
          </div>
        </section>
      )}

      {!isLoading && !pageError && (
        <>
          <section className={styles.grid}>
            <div className={styles.card}>
              <div className={styles.userHeader}>
                <h2 className={styles.cardTitle}>
                  {dictionary.user.title}
                </h2>
                <button
                  type="button"
                  className={styles.logoutBtn}
                  onClick={handleLogout}
                >
                  {dictionary.page.logoutBtn}
                </button>
              </div>

              <ul className={styles.userList}>
                <li className={styles.userItem}>
                  <span className={styles.userLabel}>
                    {dictionary.user.name}
                  </span>
                  <span className={styles.userValue}>
                    {userProfile?.name ?? "—"}
                  </span>
                  <span className={styles.editPlaceholder} />
                </li>
                <li className={styles.userItem}>
                  <span className={styles.userLabel}>
                    {dictionary.user.preferredContactEmail}
                  </span>
                  <span className={styles.userValue}>
                    {userProfile?.email ?? "—"}
                  </span>
                  <span className={styles.editPlaceholder} />
                </li>

                <InlineEditable
                  label={dictionary.user.city}
                  value={userProfile?.city}
                  field="city"
                  onSave={handleSaveField}
                  saveLabel={dictionary.actions.save}
                  cancelLabel={dictionary.actions.cancel}
                />
                <InlineEditable
                  label={dictionary.user.phone}
                  value={userProfile?.phone}
                  field="phone"
                  onSave={handleSaveField}
                  saveLabel={dictionary.actions.save}
                  cancelLabel={dictionary.actions.cancel}
                />
                <InlineEditable
                  label={dictionary.user.language}
                  value={userProfile?.language}
                  field="language"
                  onSave={handleSaveField}
                  saveLabel={dictionary.actions.save}
                  cancelLabel={dictionary.actions.cancel}
                />
              </ul>
            </div>

            <div className={styles.card}>
              <div className={styles.cardTitleRow}>
                <h2 className={styles.cardTitle}>
                  {dictionary.plan.title}
                </h2>
                <div className={styles.planStatusInline}>
                  {isPaidSupportPlan
                    ? (
                      <span className={`${styles.planBadge} ${styles.planSupport}`}>
                        {planTitle}
                      </span>
                    )
                    : (
                      <span className={styles.planDefault}>
                        {planTitle}
                      </span>
                    )}
                </div>
              </div>

              <div className={styles.planHeader}>
                <div className={styles.planPrimaryActions}>
                  <Button to={PATHS.SOS.CONSULTATION}>
                    {dictionary.plan.scheduleBtn}
                  </Button>

                  {!isPaidSupportPlan && (
                    <a
                      className={styles.upgradeBtn}
                      href={paymentLink ?? "#"}
                      target="_blank"
                      rel="noreferrer"
                      onClick={(e) => {
                        if (!paymentLink) {
                          e.preventDefault();
                          alert("Платёжная ссылка ещё загружается. Попробуйте позже.");
                        }
                      }}
                    >
                      {dictionary.plan.buyBtn}
                    </a>
                  )}
                </div>
              </div>

              <div className={styles.planBody}>
                <div className={styles.statActions}>
                  <div
                    className={styles.statBtn}
                    aria-label={dictionary.plan.statsIncluded}
                  >
                    <span className={styles.statBtnValue}>
                      {isPaidSupportPlan ? userPersonal?.consultations_included ?? "—" : "—"}
                    </span>
                    <span className={styles.statBtnLabel}>
                      {dictionary.plan.statsIncluded}
                    </span>
                  </div>

                  <div
                    className={styles.statBtn}
                    aria-label={dictionary.plan.statsDaysLeft}
                  >
                    <span className={styles.statBtnValue}>
                      {isPaidSupportPlan ? userPersonal?.days_to_end ?? "—" : "—"}
                    </span>
                    <span className={styles.statBtnLabel}>
                      {dictionary.plan.statsDaysLeft}
                    </span>
                  </div>
                </div>

                <p className={styles.planDesc}>
                  {isPaidSupportPlan
                    ? `${dictionary.plan.descActivePrefix} ${dictionary.plan.descActiveSuffix}`
                    : dictionary.plan.descInactive}
                </p>

                <div className={styles.planSecondaryActions}>
                  <button
                    type="button"
                    className={`${styles.ghostBtn} ${!isPaidSupportPlan ? styles.btnDisabled : ""}`}
                    aria-disabled={!isPaidSupportPlan}
                  >
                    {dictionary.plan.priorityBooking}
                  </button>
                  {isPaidSupportPlan
                    ? (
                      <a
                        href={hotlineNumber ? `tel:${hotlineNumber}` : undefined}
                        className={styles.ghostBtn}
                      >
                        <PhoneCall className={styles.inlineIcon} />
                        {dictionary.plan.emergencyCall}
                      </a>
                    )
                    : (
                      <button
                        type="button"
                        className={`${styles.ghostBtn} ${styles.btnDisabled}`}
                        aria-disabled
                      >
                        <PhoneCall className={styles.inlineIcon} />
                        {dictionary.plan.emergencyCall}
                      </button>
                    )}
                </div>
              </div>
            </div>
          </section>

          <section className={styles.card}>
            <div className={styles.cardHead}>
              <h2 className={styles.cardTitle}>
                {dictionary.tests.title}
              </h2>
              <div className={styles.cardSub}>
                {dictionary.tests.subtitle}
              </div>
            </div>

            <div className={styles.tableWrap}>
              <table
                className={styles.table}
                aria-label={dictionary.tests.title}
              >
                <thead>
                  <tr>
                    <th>
                      {dictionary.tests.name}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {(userPersonal?.test_topics ?? []).length === 0 && (
                    <tr>
                      <td>
                        —
                      </td>
                    </tr>
                  )}
                  {(userPersonal?.test_topics ?? []).map((topic) => (
                    <tr key={topic.id}>
                      <td data-label={dictionary.tests.name}>
                        <NavLink
                          className={styles.linkBtn}
                          to={buildPath.testsDetail(topic.id)}
                        >
                          {topic.title}
                        </NavLink>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </>
      )}
    </div>
  );
}
