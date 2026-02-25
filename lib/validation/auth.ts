export const MIN_PASSWORD_LENGTH = 8;
export const MIN_FULL_NAME_LENGTH = 2;

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type LoginValidationSuccess = {
  ok: true;
  email: string;
  password: string;
};

type RegisterValidationSuccess = LoginValidationSuccess & {
  fullName: string;
};

type ValidationError = {
  ok: false;
  message: string;
};

export function normalizeEmail(value: string) {
  return value.trim().toLowerCase();
}

export function normalizeFullName(value: string) {
  return value.trim().replace(/\s+/g, " ");
}

export function isValidEmail(value: string) {
  return EMAIL_REGEX.test(value);
}

export function validateLoginPayload(payload: {
  email?: unknown;
  password?: unknown;
}): LoginValidationSuccess | ValidationError {
  if (
    typeof payload.email !== "string" ||
    typeof payload.password !== "string"
  ) {
    return { ok: false, message: "Email и пароль обязательны" };
  }

  const email = normalizeEmail(payload.email);
  const password = payload.password;

  if (!email || !password) {
    return { ok: false, message: "Email и пароль обязательны" };
  }

  if (!isValidEmail(email)) {
    return { ok: false, message: "Некорректный формат email" };
  }

  return {
    ok: true,
    email,
    password,
  };
}

export function validateRegisterPayload(payload: {
  email?: unknown;
  fullName?: unknown;
  password?: unknown;
}): RegisterValidationSuccess | ValidationError {
  const loginPayload = validateLoginPayload(payload);
  if (!loginPayload.ok) {
    return loginPayload;
  }

  if (typeof payload.fullName !== "string") {
    return { ok: false, message: "Имя обязательно" };
  }

  const fullName = normalizeFullName(payload.fullName);
  if (fullName.length < MIN_FULL_NAME_LENGTH) {
    return {
      ok: false,
      message: `Имя должно содержать минимум ${MIN_FULL_NAME_LENGTH} символа`,
    };
  }

  if (loginPayload.password.length < MIN_PASSWORD_LENGTH) {
    return {
      ok: false,
      message: `Пароль должен содержать минимум ${MIN_PASSWORD_LENGTH} символов`,
    };
  }

  return {
    ok: true,
    email: loginPayload.email,
    fullName,
    password: loginPayload.password,
  };
}
