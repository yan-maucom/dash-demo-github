import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { ROOMS_CONFIG } from '../data/mockData';
import { RoomId } from '../types';
import {
  X,
  Users,
  UserPlus,
  KeyRound,
  Shield,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';

interface UserManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const UserManagementModal: React.FC<UserManagementModalProps> = ({ isOpen, onClose }) => {
  const { usersConfig, addUser, updateUserPassword } = useAuth();
  const [tab, setTab] = useState<'list' | 'add'>('list');

  // Add user form
  const [newUsername, setNewUsername] = useState('');
  const [newName, setNewName] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newRole, setNewRole] = useState<'chefe' | 'responsavel_sala'>('responsavel_sala');
  const [newRoomId, setNewRoomId] = useState<RoomId>(ROOMS_CONFIG[0]?.id);
  const [addFeedback, setAddFeedback] = useState<{ success: boolean; message: string } | null>(null);

  // Change password (per user row)
  const [passwordEdits, setPasswordEdits] = useState<Record<string, string>>({});
  const [pwFeedback, setPwFeedback] = useState<Record<string, { success: boolean; message: string }>>({});

  if (!isOpen) return null;

  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    const res = addUser({
      username: newUsername,
      name: newName,
      password: newPassword,
      role: newRole,
      roomId: newRole === 'responsavel_sala' ? newRoomId : undefined,
    });
    if (res.success) {
      setAddFeedback({ success: true, message: 'Usuário criado com sucesso!' });
      setNewUsername('');
      setNewName('');
      setNewPassword('');
      setNewRole('responsavel_sala');
    } else {
      setAddFeedback({ success: false, message: res.error || 'Não foi possível criar o usuário.' });
    }
  };

  const handleChangePassword = (username: string) => {
    const pwd = passwordEdits[username];
    if (!pwd) return;
    const res = updateUserPassword(username, pwd);
    setPwFeedback((prev) => ({
      ...prev,
      [username]: res.success
        ? { success: true, message: 'Senha atualizada.' }
        : { success: false, message: res.error || 'Erro ao atualizar.' },
    }));
    if (res.success) {
      setPasswordEdits((prev) => ({ ...prev, [username]: '' }));
    }
  };

  const roomLabel = (roomId?: RoomId) =>
    ROOMS_CONFIG.find((r) => r.id === roomId)?.shortName || roomId || '—';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-fade-in">
      <div className="bg-white border border-[#E1E9E4] rounded-2xl shadow-xl max-w-2xl w-full max-h-[85vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E1E9E4] bg-[#F8FAF9] shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-[#EBF1EE] text-[#2D5A47] rounded-xl">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-heading font-bold text-[#23332B] text-base">
                Gerenciar Usuários e Senhas
              </h3>
              <p className="text-xs text-[#527365]">Somente a chefia pode adicionar logins ou trocar senhas</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-[#527365] hover:text-[#23332B] rounded-xl hover:bg-[#EBF1EE] transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 px-6 pt-3 border-b border-[#E1E9E4] shrink-0">
          <button
            onClick={() => setTab('list')}
            className={`px-3.5 py-2 text-xs font-semibold rounded-t-xl transition cursor-pointer ${
              tab === 'list'
                ? 'bg-[#EBF1EE] text-[#2D5A47] border-b-2 border-[#2D5A47]'
                : 'text-[#527365] hover:text-[#23332B]'
            }`}
          >
            Usuários Existentes
          </button>
          <button
            onClick={() => setTab('add')}
            className={`px-3.5 py-2 text-xs font-semibold rounded-t-xl transition cursor-pointer flex items-center gap-1.5 ${
              tab === 'add'
                ? 'bg-[#EBF1EE] text-[#2D5A47] border-b-2 border-[#2D5A47]'
                : 'text-[#527365] hover:text-[#23332B]'
            }`}
          >
            <UserPlus className="w-3.5 h-3.5" />
            Adicionar Novo Login
          </button>
        </div>

        <div className="p-6 overflow-y-auto flex-1">
          {tab === 'list' && (
            <div className="space-y-3">
              {Object.entries(usersConfig).map(([username, entry]) => (
                <div
                  key={username}
                  className="p-3.5 rounded-xl border border-[#E1E9E4] bg-[#F8FAF9] flex flex-col sm:flex-row sm:items-center gap-3"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-bold text-[#23332B] truncate">{entry.user.name}</p>
                      {entry.user.role === 'chefe' && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold bg-[#2D5A47] text-white shrink-0">
                          Chefia da Unidade
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-[#527365] mt-0.5">
                      Login: <span className="font-mono font-semibold">{username}</span>
                      {entry.user.role === 'responsavel_sala' && (
                        <> · Sala: {roomLabel(entry.user.roomId)}</>
                      )}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <div className="relative">
                      <KeyRound className="w-3.5 h-3.5 text-[#527365] absolute left-2.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        placeholder="Nova senha"
                        value={passwordEdits[username] || ''}
                        onChange={(e) =>
                          setPasswordEdits((prev) => ({ ...prev, [username]: e.target.value }))
                        }
                        className="pl-8 pr-2.5 py-1.5 w-32 bg-white border border-[#E1E9E4] rounded-lg text-xs font-medium text-[#23332B] focus:outline-none focus:border-[#2D5A47]"
                      />
                    </div>
                    <button
                      onClick={() => handleChangePassword(username)}
                      className="px-3 py-1.5 bg-[#2D5A47] hover:bg-[#244b3b] text-white text-xs font-semibold rounded-lg transition cursor-pointer whitespace-nowrap"
                    >
                      Trocar
                    </button>
                  </div>

                  {pwFeedback[username] && (
                    <div
                      className={`w-full text-[11px] font-medium flex items-center gap-1.5 ${
                        pwFeedback[username].success ? 'text-[#2D5A47]' : 'text-[#D32F2F]'
                      }`}
                    >
                      {pwFeedback[username].success ? (
                        <CheckCircle2 className="w-3.5 h-3.5" />
                      ) : (
                        <AlertCircle className="w-3.5 h-3.5" />
                      )}
                      {pwFeedback[username].message}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {tab === 'add' && (
            <form onSubmit={handleAddUser} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-semibold text-[#527365] uppercase tracking-wider mb-1.5">
                    Login (usuário)
                  </label>
                  <input
                    type="text"
                    value={newUsername}
                    onChange={(e) => setNewUsername(e.target.value)}
                    placeholder="ex: joao.silva"
                    className="w-full px-3.5 py-2.5 bg-[#F8FAF9] border border-[#E1E9E4] rounded-xl text-xs font-medium text-[#23332B] focus:outline-none focus:border-[#2D5A47]"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-[#527365] uppercase tracking-wider mb-1.5">
                    Nome completo
                  </label>
                  <input
                    type="text"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="ex: João Silva"
                    className="w-full px-3.5 py-2.5 bg-[#F8FAF9] border border-[#E1E9E4] rounded-xl text-xs font-medium text-[#23332B] focus:outline-none focus:border-[#2D5A47]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-[#527365] uppercase tracking-wider mb-1.5">
                  Senha
                </label>
                <input
                  type="text"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Defina uma senha"
                  className="w-full px-3.5 py-2.5 bg-[#F8FAF9] border border-[#E1E9E4] rounded-xl text-xs font-medium text-[#23332B] focus:outline-none focus:border-[#2D5A47]"
                />
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-[#527365] uppercase tracking-wider mb-1.5">
                  Tipo de acesso
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setNewRole('responsavel_sala')}
                    className={`p-2.5 rounded-xl text-xs font-semibold border transition cursor-pointer flex items-center justify-center gap-1.5 ${
                      newRole === 'responsavel_sala'
                        ? 'bg-[#2D5A47] text-white border-[#2D5A47]'
                        : 'bg-[#F8FAF9] text-[#23332B] border-[#E1E9E4] hover:bg-[#EBF1EE]'
                    }`}
                  >
                    Responsável de Sala
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewRole('chefe')}
                    className={`p-2.5 rounded-xl text-xs font-semibold border transition cursor-pointer flex items-center justify-center gap-1.5 ${
                      newRole === 'chefe'
                        ? 'bg-[#2D5A47] text-white border-[#2D5A47]'
                        : 'bg-[#F8FAF9] text-[#23332B] border-[#E1E9E4] hover:bg-[#EBF1EE]'
                    }`}
                  >
                    <Shield className="w-3.5 h-3.5" />
                    Chefia da Unidade
                  </button>
                </div>
              </div>

              {newRole === 'responsavel_sala' && (
                <div>
                  <label className="block text-[10px] font-semibold text-[#527365] uppercase tracking-wider mb-1.5">
                    Sala responsável
                  </label>
                  <select
                    value={newRoomId}
                    onChange={(e) => setNewRoomId(e.target.value as RoomId)}
                    className="w-full px-3.5 py-2.5 bg-[#F8FAF9] border border-[#E1E9E4] rounded-xl text-xs font-medium text-[#23332B] focus:outline-none focus:border-[#2D5A47]"
                  >
                    {ROOMS_CONFIG.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.shortName}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {addFeedback && (
                <div
                  className={`flex items-center gap-2 p-3 text-xs rounded-xl border ${
                    addFeedback.success
                      ? 'bg-[#EBF1EE] text-[#2D5A47] border-[#CBDED5]'
                      : 'bg-rose-50 text-[#D32F2F] border-rose-200'
                  }`}
                >
                  {addFeedback.success ? (
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                  ) : (
                    <AlertCircle className="w-4 h-4 shrink-0" />
                  )}
                  {addFeedback.message}
                </div>
              )}

              <button
                type="submit"
                className="w-full py-2.5 bg-[#2D5A47] hover:bg-[#244b3b] text-white font-semibold text-xs rounded-xl shadow-xs transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <UserPlus className="w-4 h-4" />
                Criar Usuário
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
