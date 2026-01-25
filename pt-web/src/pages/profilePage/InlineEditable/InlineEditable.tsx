import React, {useEffect, useState} from "react";
import {Pencil} from "lucide-react";
import styles from "src/pages/profilePage/InlineEditable/InlineEditable.module.scss";

type EditableField = "name" | "email";

export function InlineEditable({
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
