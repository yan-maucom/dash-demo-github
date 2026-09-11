import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, RoomId, UsersConfigMap } from '../types';
import { USERS_CONFIG as DEFAULT_USERS_CONFIG } from '../data/mockData';
import { storageService } from '../services/storageService';

interface AuthContextType {
  user: User | null;
  login: (username: string, passwordHash: string) => { success: boolean; error?: string };
  logout: () => void;
  isChefe: boolean;
  canAccessRoom: (roomId: RoomId) => boolean;
  canEditRoom: (roomId: RoomId) => boolean;
  canEvaluateHygiene: boolean;
  // Gerenciamento de usuários (uso restrito à chefia na UI)
  usersConfig: UsersConfigMap;
  addUser: (params: {
    username: string;
    name: string;
    password: string;
    role: 'chefe' | 'responsavel_sala';
    roomId?: RoomId;
  }) => { success: boolean; error?: string };
  updateUserPassword: (username: string, newPassword: string) => { success: boolean; error?: string };
}

// Chave versionada: qualquer sessão salva por uma versão anterior do app
// (ex: o antigo login automático de demonstração) é ignorada, forçando
// um login real quando o app é atualizado.
const SESSION_KEY = 'caf_current_user_v3';

const normalizeKey = (raw: string) =>
  raw.trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem(SESSION_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // ignore
      }
    }
    return null;
  });

  const [usersConfig, setUsersConfig] = useState<UsersConfigMap>(DEFAULT_USERS_CONFIG);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const config = await storageService.getUsersConfig();
      if (mounted) setUsersConfig(config);
    })();
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (user) {
      localStorage.setItem(SESSION_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(SESSION_KEY);
    }
  }, [user]);

  const login = (username: string, passwordHash: string): { success: boolean; error?: string } => {
    const cleanUserKey = normalizeKey(username);

    let matchedKey: string | null = null;
    for (const key of Object.keys(usersConfig)) {
      if (key.toLowerCase() === cleanUserKey) {
        matchedKey = key;
        break;
      }
    }

    if (!matchedKey) {
      return { success: false, error: 'Usuário não encontrado.' };
    }

    const conf = usersConfig[matchedKey];
    if (conf.passwordHash !== passwordHash.trim()) {
      return { success: false, error: 'Senha incorreta.' };
    }

    setUser(conf.user);
    return { success: true };
  };

  const logout = () => {
    setUser(null);
  };

  const isChefe = user?.role === 'chefe';

  const canAccessRoom = (roomId: RoomId): boolean => {
    if (!user) return false;
    if (user.role === 'chefe') return true;
    return user.roomId === roomId;
  };

  const canEditRoom = (roomId: RoomId): boolean => {
    if (!user) return false;
    if (user.role === 'chefe') return true;
    return user.roomId === roomId;
  };

  const canEvaluateHygiene = isChefe;

  const addUser: AuthContextType['addUser'] = ({ username, name, password, role, roomId }) => {
    const key = normalizeKey(username);
    if (!key) {
      return { success: false, error: 'Informe um nome de usuário.' };
    }
    if (!password.trim()) {
      return { success: false, error: 'Informe uma senha.' };
    }
    if (usersConfig[key]) {
      return { success: false, error: 'Já existe um usuário com esse login.' };
    }
    if (role === 'responsavel_sala' && !roomId) {
      return { success: false, error: 'Selecione a sala responsável.' };
    }

    const newEntry: UsersConfigMap[string] = {
      user: {
        id: `usr_${key}_${Date.now()}`,
        name: name.trim() || key,
        role,
        roomId: role === 'responsavel_sala' ? roomId : undefined,
      },
      passwordHash: password.trim(),
    };

    const next: UsersConfigMap = { ...usersConfig, [key]: newEntry };
    setUsersConfig(next);
    storageService.saveUsersConfig(next);
    return { success: true };
  };

  const updateUserPassword: AuthContextType['updateUserPassword'] = (username, newPassword) => {
    const key = normalizeKey(username);
    if (!usersConfig[key]) {
      return { success: false, error: 'Usuário não encontrado.' };
    }
    if (!newPassword.trim()) {
      return { success: false, error: 'Informe uma nova senha.' };
    }

    const next: UsersConfigMap = {
      ...usersConfig,
      [key]: { ...usersConfig[key], passwordHash: newPassword.trim() },
    };
    setUsersConfig(next);
    storageService.saveUsersConfig(next);

    return { success: true };
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        isChefe,
        canAccessRoom,
        canEditRoom,
        canEvaluateHygiene,
        usersConfig,
        addUser,
        updateUserPassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
