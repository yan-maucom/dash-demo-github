import React, { useState, useEffect } from 'react';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { InventoryProvider, useInventory } from './context/InventoryContext';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { ChiefDashboard } from './components/ChiefDashboard';
import { RoomDetailView } from './components/RoomDetailView';
import { HygieneAccuracyView } from './components/HygieneAccuracyView';
import { RankingRooms } from './components/RankingRooms';
import { ProductionTab } from './components/ProductionTab';
import { AuthModal } from './components/AuthModal';
import { LoginScreen } from './components/LoginScreen';
import { SupabaseModal } from './components/SupabaseModal';
import { ImportExcelModal } from './components/ImportExcelModal';
import { RoomId, NavigationTab } from './types';

const MainApp: React.FC = () => {
  const { user, isChefe, canAccessRoom } = useAuth();
  const { isLoading } = useInventory();
  const [currentView, setCurrentView] = useState<NavigationTab>('dashboard');
  const [selectedRoomId, setSelectedRoomId] = useState<RoomId | null>(null);
  const [isSidebarOpenMobile, setIsSidebarOpenMobile] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isSupabaseModalOpen, setIsSupabaseModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [importTargetRoom, setImportTargetRoom] = useState<RoomId>('unitarizacao');

  // If user is a single room responsible (not Chefe), route directly to their room
  useEffect(() => {
    if (user && !isChefe && user.roomId) {
      setSelectedRoomId(user.roomId);
      setCurrentView('room');
    }
  }, [user, isChefe]);

  // Sem login, o app não é acessível — mostra a tela de autenticação.
  if (!user) {
    return <LoginScreen />;
  }

  const handleSelectRoom = (roomId: RoomId) => {
    if (canAccessRoom(roomId)) {
      setSelectedRoomId(roomId);
      setImportTargetRoom(roomId);
      setCurrentView('room');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleSelectView = (view: NavigationTab) => {
    setCurrentView(view);
    if (view !== 'room') {
      setSelectedRoomId(null);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBackToDashboard = () => {
    if (isChefe) {
      setSelectedRoomId(null);
      setCurrentView('dashboard');
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenGlobalImport = () => {
    setImportTargetRoom(selectedRoomId || 'unitarizacao');
    setIsImportModalOpen(true);
  };

  return (
    <div className="min-h-screen flex flex-row bg-[#F3F7F5] text-[#23332B] transition-colors duration-200 font-sans">
      {/* 1. Left Sidebar Navigation Menu */}
      <Sidebar
        currentView={currentView}
        selectedRoomId={selectedRoomId}
        onSelectView={handleSelectView}
        onSelectRoom={handleSelectRoom}
        isOpenMobile={isSidebarOpenMobile}
        onCloseMobile={() => setIsSidebarOpenMobile(false)}
        onOpenSupabaseModal={() => setIsSupabaseModalOpen(true)}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
        onOpenImportModal={handleOpenGlobalImport}
      />

      {/* 2. Main Content Container */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen overflow-x-hidden">
        {/* Top Header Bar */}
        <Header
          onGoHome={handleBackToDashboard}
          onToggleSidebar={() => setIsSidebarOpenMobile(!isSidebarOpenMobile)}
        />

        {/* Dynamic Main Body Content according to selected view */}
        <main className="flex-1 w-full max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8 py-5 sm:py-6">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center gap-3 py-24 text-[#527365]">
              <div className="w-8 h-8 border-2 border-[#CBDED5] border-t-[#2D5A47] rounded-full animate-spin" />
              <p className="text-xs font-medium">Carregando dados do banco de dados...</p>
            </div>
          ) : currentView === 'room' && selectedRoomId ? (
            <RoomDetailView
              roomId={selectedRoomId}
              onBackToDashboard={handleBackToDashboard}
              onSelectOtherRoom={handleSelectRoom}
            />
          ) : currentView === 'hygiene' ? (
            <HygieneAccuracyView onSelectRoom={handleSelectRoom} />
          ) : currentView === 'ranking' ? (
            <div className="space-y-6 animate-fade-in pb-12">
              <RankingRooms onSelectRoom={handleSelectRoom} />
            </div>
          ) : currentView === 'production' ? (
            <div className="space-y-6 animate-fade-in pb-12">
              <div className="rounded-2xl bg-[#2D5A47] text-white p-6 shadow-sm border border-[#244b3b]">
                <h2 className="font-heading font-extrabold text-2xl">
                  Central de Unitarização & Produção de Doses
                </h2>
                <p className="text-xs text-[#CBDED5] mt-1">
                  Fracionamento, etiquetagem com código Datamatrix, controle de lotes e registro de perdas.
                </p>
              </div>
              <ProductionTab onOpenImport={handleOpenGlobalImport} />
            </div>
          ) : (
            <ChiefDashboard
              onSelectRoom={handleSelectRoom}
              onNavigateToHygiene={() => setCurrentView('hygiene')}
            />
          )}
        </main>

        {/* Hospital CAF Footer */}
        <footer className="border-t border-[#E1E9E4] py-5 bg-white text-center text-xs text-[#527365] mt-auto">
          <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
            <p className="font-medium text-xs">
              CAF • Central de Abastecimento Farmacêutico Hospitalar
            </p>
            <p className="text-[11px] text-[#527365]/80">
              Conforme Portaria SVS/MS nº 344/98 e RDC ANVISA nº 67/2007
            </p>
          </div>
        </footer>
      </div>

      {/* Global Modals */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />

      <SupabaseModal
        isOpen={isSupabaseModalOpen}
        onClose={() => setIsSupabaseModalOpen(false)}
      />

      <ImportExcelModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        roomId={importTargetRoom}
        mode={currentView === 'production' ? 'production' : 'inventory'}
      />
    </div>
  );
};

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <InventoryProvider>
          <MainApp />
        </InventoryProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
