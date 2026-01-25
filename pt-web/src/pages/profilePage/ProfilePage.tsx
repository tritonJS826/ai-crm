import React, {useEffect} from "react";
import {useNavigate} from "react-router-dom";
import {useAtomValue, useSetAtom} from "jotai";
import {PageHeader} from "src/components/PageHeader/PageHeader";
import {DictionaryKey} from "src/dictionary/dictionaryLoader";
import {useDictionary} from "src/dictionary/useDictionary";
import {InlineEditable} from "src/pages/profilePage/InlineEditable/InlineEditable";
import {PATHS} from "src/routes/routes";
import {logoutUser} from "src/services/authService";
import {clearTokensAtom} from "src/state/authAtom";
import {clearUserProfileAtom, loadUserProfileAtom, updateUserProfileAtom, userProfileStateAtom} from "src/state/userProfileAtoms";
import styles from "src/pages/profilePage/ProfilePage.module.scss";

type EditableField = "name" | "email";

export function ProfilePage() {
  const dictionary = useDictionary(DictionaryKey.PROFILE);
  const navigate = useNavigate();

  const clearTokens = useSetAtom(clearTokensAtom);
  const clearUserProfile = useSetAtom(clearUserProfileAtom);
  const updateUserProfile = useSetAtom(updateUserProfileAtom);
  const loadUserProfile = useSetAtom(loadUserProfileAtom);

  const {userProfile, userProfileLoading, userProfileError} = useAtomValue(userProfileStateAtom);

  useEffect(() => {
    loadUserProfile();
  }, []);

  const handleLogout = async (): Promise<void> => {
    await logoutUser();
    clearTokens();
    clearUserProfile();
    navigate(PATHS.HOME);
  };

  const handleSaveField = async (field: EditableField, next: string): Promise<void> => {
    await updateUserProfile({[field]: next});
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

      {userProfileLoading && (
        <section className={styles.card}>
          <div>
            Loading…
          </div>
        </section>
      )}

      {!userProfileLoading && userProfileError && (
        <section className={styles.card}>
          <div className={styles.errorMessage}>
            {userProfileError}
          </div>
        </section>
      )}

      {!userProfileLoading && !userProfileError && (
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
