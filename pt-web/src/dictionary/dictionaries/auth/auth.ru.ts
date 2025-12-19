export const authDict = {
  tabs: {login: "Вход", register: "Регистрация"},
  title: {login: "Вход", register: "Регистрация"},
  subtitle: {
    login: "Введите данные вашего аккаунта",
    register: "Создайте новый аккаунт",
  },
  fields: {
    fullName: "Имя",
    email: "Email",
    password: "Пароль",
    passwordRepeat: "Повторите пароль",
  },
  placeholders: {
    fullName: "Ваше имя",
    email: "name@example.com",
    password: "Не менее 6 символов",
    passwordRepeat: "Повторите пароль",
  },
  errors: {
    nameRequired: "Введите имя",
    passwordsMismatch: "Пароли не совпадают",
    requestFailed: "Не удалось выполнить запрос. Попробуйте ещё раз.",
  },
  buttons: {
    submitLogin: "Войти",
    submitRegister: "Зарегистрироваться",
    loading: "…",
  },
} as const;

export type AuthDictRu = typeof authDict;
