import type { AppRole, UserStatus } from './auth-roles';

export interface RegisteredAccount {
  email: string;
  displayName: string;
  storeName: string;
  role: AppRole;
  status: UserStatus;
  password: string;
  createdAt: string;
}

export interface AccountRegistrationInput {
  email: string;
  ownerName: string;
  storeName: string;
  password: string;
  confirmPassword: string;
  acceptedTerms: boolean;
}

export interface AccountRegistrationResult {
  ok: boolean;
  message?: string;
  account?: RegisteredAccount;
}

export const normalizeEmail = (email: string): string => email.trim().toLowerCase();

export const validateAccountRegistration = ({
  email,
  ownerName,
  storeName,
  password,
  confirmPassword,
  acceptedTerms,
}: AccountRegistrationInput): AccountRegistrationResult => {
  const normalizedEmail = normalizeEmail(email);
  const trimmedOwnerName = ownerName.trim();
  const trimmedStoreName = storeName.trim();

  if (!normalizedEmail || !trimmedOwnerName || !trimmedStoreName) {
    return { ok: false, message: 'Vui lòng nhập đầy đủ thông tin.' };
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
    return { ok: false, message: 'Email không hợp lệ.' };
  }

  if (password.length < 8) {
    return { ok: false, message: 'Mật khẩu cần ít nhất 8 ký tự.' };
  }

  if (password !== confirmPassword) {
    return { ok: false, message: 'Mật khẩu xác nhận không khớp.' };
  }

  if (!acceptedTerms) {
    return { ok: false, message: 'Vui lòng đồng ý điều khoản sử dụng.' };
  }

  return {
    ok: true,
    account: {
      email: normalizedEmail,
      displayName: trimmedOwnerName,
      storeName: trimmedStoreName,
      role: 'STAFF',
      status: 'PENDING',
      password,
      createdAt: new Date().toISOString(),
    },
  };
};
