import {atom} from "jotai";
import {UserProfileModel} from "src/models/UserProfile";
import {
  getUserProfile,
  patchUserProfile,
} from "src/services/profileService";

const userProfileAtom = atom<UserProfileModel | null>(null);
const userProfileLoadingAtom = atom<boolean>(false);
const userProfileErrorAtom = atom<string | null>(null);

export const userProfileStateAtom = atom((get) => ({
  userProfile: get(userProfileAtom),
  userProfileLoading: get(userProfileLoadingAtom),
  userProfileError: get(userProfileErrorAtom),
}));

export const loadUserProfileAtom = atom(
  null,
  async (_get, set): Promise<void> => {
    set(userProfileLoadingAtom, true);
    set(userProfileErrorAtom, null);

    try {
      const profile: UserProfileModel = await getUserProfile();

      set(userProfileAtom, profile);
    } catch (error) {
      if (error instanceof Error) {
        set(userProfileErrorAtom, error.message);
      } else {
        set(userProfileErrorAtom, "Unknown fetch error");
      }
    } finally {
      set(userProfileLoadingAtom, false);
    }
  },
);

export const updateUserProfileAtom = atom(
  null,
  async (
    get,
    set,
    payload: Partial<Pick<UserProfileModel, "name" | "email">>,
  ): Promise<void> => {
    await patchUserProfile(payload);

    const previousProfile = get(userProfileAtom);
    if (previousProfile) {
      set(userProfileAtom, {...previousProfile, ...payload});
    }
  },
);

export const clearUserProfileAtom = atom(null, (_get, set) => {
  set(userProfileAtom, null);
  set(userProfileLoadingAtom, false);
  set(userProfileErrorAtom, null);
});
