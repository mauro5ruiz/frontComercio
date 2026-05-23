const AUTH_USER_KEY = "auth_user";
const AUTH_EXPIRES_AT_KEY = "auth_expires_at";
const AUTH_SESSION_TTL_MS = 8 * 60 * 60 * 1000;

export interface AuthUser {
  id: number;
  nombre: string;
  rol: string;
  rolId: number;
  usuarioLogin: string;
  email: string;
}

const storage = sessionStorage;

const normalizarTexto = (valor: unknown) => String(valor ?? "").trim();

export const normalizarAuthUser = (raw: any): AuthUser => ({
  id: Number(raw?.id ?? raw?.Id ?? 0),
  nombre: normalizarTexto(raw?.nombreCompleto ?? raw?.NombreCompleto ?? raw?.nombre ?? raw?.Nombre),
  rol: normalizarTexto(raw?.rol ?? raw?.Rol).toLowerCase(),
  rolId: Number(raw?.rolId ?? raw?.RolId ?? raw?.idRol ?? raw?.IdRol ?? 0),
  usuarioLogin: normalizarTexto(raw?.usuarioLogin ?? raw?.UsuarioLogin ?? raw?.usuario ?? raw?.Usuario),
  email: normalizarTexto(raw?.email ?? raw?.Email)
});

export const clearAuthSession = () => {
  storage.removeItem(AUTH_USER_KEY);
  storage.removeItem(AUTH_EXPIRES_AT_KEY);
};

export const createAuthSession = (rawUser: any) => {
  const user = normalizarAuthUser(rawUser);
  storage.setItem(AUTH_USER_KEY, JSON.stringify(user));
  storage.setItem(AUTH_EXPIRES_AT_KEY, String(Date.now() + AUTH_SESSION_TTL_MS));
  return user;
};

export const getAuthUser = (): AuthUser | null => {
  const expiresAt = Number(storage.getItem(AUTH_EXPIRES_AT_KEY) ?? "0");
  if (!expiresAt || expiresAt <= Date.now()) {
    clearAuthSession();
    return null;
  }

  try {
    const raw = storage.getItem(AUTH_USER_KEY);
    if (!raw) {
      clearAuthSession();
      return null;
    }

    return JSON.parse(raw) as AuthUser;
  } catch {
    clearAuthSession();
    return null;
  }
};

export const isAuthenticated = () => getAuthUser() !== null;
