import React, {useEffect, useState} from "react";
import {useNavigate} from "react-router-dom";
import {useAtomValue, useSetAtom} from "jotai";
import {Pencil} from "lucide-react";
import {PageHeader} from "src/components/PageHeader/PageHeader";
import {DictionaryKey} from "src/dictionary/dictionaryLoader";
import {useDictionary} from "src/dictionary/useDictionary";
import {PATHS} from "src/routes/routes";
import {logoutUser} from "src/services/authService";
import {
  getUserProfile,
  patchUserProfile,
  type UserProfile as ApiUserProfile,
} from "src/services/profileService";
import {
  accessTokenAtomWithPersistence,
  clearTokensAtom,
} from "src/state/authAtom";
import styles from "src/pages/profilePage/ProfilePage.module.scss";

type EditableField = "name" | "email";

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
  value: string | undefined;
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

export function ProfilePage() {
  const dictionary = useDictionary(DictionaryKey.PROFILE);
  const navigate = useNavigate();

  const accessTokens = useAtomValue(accessTokenAtomWithPersistence);
  const isAuthenticated = Boolean(accessTokens?.token);
  const clearTokens = useSetAtom(clearTokensAtom);

  const [isLoading, setIsLoading] = useState(true);
  const [pageError, setPageError] = useState<string | null>(null);
  const [userProfile, setUserProfile] = useState<ApiUserProfile | null>(null);

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
        const profileResponse = await getUserProfile();
        if (!isMounted) {
          return;
        }
        setUserProfile(profileResponse);
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
                <InlineEditable
                  label={dictionary.user.name}
                  value={userProfile?.name}
                  field="name"
                  onSave={handleSaveField}
                  saveLabel={dictionary.actions.save}
                  cancelLabel={dictionary.actions.cancel}
                />
                <InlineEditable
                  label={dictionary.user.preferredContactEmail}
                  value={userProfile?.email}
                  field="email"
                  onSave={handleSaveField}
                  saveLabel={dictionary.actions.save}
                  cancelLabel={dictionary.actions.cancel}
                />
              </ul>
            </div>
          </section>
        </>
      )}
    </div>
  );
}
