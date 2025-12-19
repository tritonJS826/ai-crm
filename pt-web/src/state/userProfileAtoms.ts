import {atom} from "jotai";
import {
  getUserPersonal,
  getUserProfile,
  patchUserProfile,
  UserPersonal,
  UserProfile,
} from "src/services/profile";

export const userProfileAtom = atom<UserProfile | null>(null);
export const userPersonalAtom = atom<UserPersonal | null>(null);
export const userLoadingAtom = atom<boolean>(false);
export const userErrorAtom = atom<string | null>(null);

export const loadUserDataAtom = atom(
  null,
  async (_get, set): Promise<void> => {
    set(userLoadingAtom, true);
    set(userErrorAtom, null);

    try {
      const [profile, personal] = await Promise.all([
        getUserProfile(),
        getUserPersonal(),
      ]);

      set(userProfileAtom, profile);
      set(userPersonalAtom, personal);
    } catch (error) {
      if (error instanceof Error) {
        set(userErrorAtom, error.message);
      } else {
        set(userErrorAtom, "Неизвестная ошибка загрузки данных");
      }
    } finally {
      set(userLoadingAtom, false);
    }
  },
);

export const updateUserProfileAtom = atom(
  null,
  async (
    get,
    set,
    update: Partial<Pick<UserProfile, "city" | "phone" | "language">>,
  ): Promise<void> => {
    await patchUserProfile(update);

    const previousProfile = get(userProfileAtom);
    if (previousProfile) {
      set(userProfileAtom, {...previousProfile, ...update});
    }
  },
);
