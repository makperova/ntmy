import React, { useState } from 'react';
import { NfcCard, Profile } from '../../types/profile';

interface NfcCardManagerProps {
  userNfcCards: NfcCard[];
  profiles: Profile[];
  onLinkNfcCard: (nfcUid: string, profileId: string, name: string) => Promise<void>;
  onUnlinkNfcCard: (nfcCardId: string) => Promise<void>;
  isLoading?: boolean;
}

const NfcCardManager: React.FC<NfcCardManagerProps> = ({
  userNfcCards,
  profiles,
  onLinkNfcCard,
  onUnlinkNfcCard,
  isLoading = false
}) => {
  const [nfcUid, setNfcUid] = useState('');
  const [selectedProfileId, setSelectedProfileId] = useState(profiles[0]?.id || '');
  const [cardName, setCardName] = useState('');
  const [showAddCardForm, setShowAddCardForm] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Обработчик формы добавления NFC карты
  const handleAddNfcCard = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!nfcUid.trim()) {
      setError('Укажите UID NFC карты');
      return;
    }

    if (!selectedProfileId) {
      setError('Выберите профиль');
      return;
    }

    try {
      await onLinkNfcCard(nfcUid, selectedProfileId, cardName);
      setSuccess('NFC карта успешно добавлена');
      setNfcUid('');
      setCardName('');
      setShowAddCardForm(false);
    } catch (err: any) {
      setError(err.message || 'Ошибка при добавлении карты');
    }
  };

  // Обработчик отвязки NFC карты
  const handleUnlinkCard = async (cardId: string) => {
    if (confirm('Вы действительно хотите отвязать эту NFC карту?')) {
      try {
        await onUnlinkNfcCard(cardId);
        setSuccess('NFC карта успешно отвязана');
      } catch (err: any) {
        setError(err.message || 'Ошибка при отвязке карты');
      }
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Ваши NFC карты</h1>
        <button 
          onClick={() => setShowAddCardForm(!showAddCardForm)}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          {showAddCardForm ? 'Отмена' : 'Добавить карту'}
        </button>
      </div>

      {error && (
        <div className="p-3 mb-4 text-white bg-red-500 rounded">
          {error}
        </div>
      )}

      {success && (
        <div className="p-3 mb-4 text-white bg-green-500 rounded">
          {success}
        </div>
      )}

      {/* Форма добавления NFC карты */}
      {showAddCardForm && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-lg font-medium mb-4">Привязать новую NFC карту</h2>
          
          <form onSubmit={handleAddNfcCard}>
            <div className="mb-4">
              <label htmlFor="nfcUid" className="block text-sm font-medium mb-2">
                UID NFC карты *
              </label>
              <input
                id="nfcUid"
                type="text"
                value={nfcUid}
                onChange={(e) => setNfcUid(e.target.value)}
                className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Например: 04:A2:B3:C4:D5:E6"
                required
              />
              <p className="mt-1 text-xs text-gray-500">
                UID карты должен быть написан на физической NFC карте или доступен через приложение для чтения NFC
              </p>
            </div>
            
            <div className="mb-4">
              <label htmlFor="profileId" className="block text-sm font-medium mb-2">
                Выберите профиль *
              </label>
              <select
                id="profileId"
                value={selectedProfileId}
                onChange={(e) => setSelectedProfileId(e.target.value)}
                className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Выберите профиль</option>
                {profiles.map((profile) => (
                  <option key={profile.id} value={profile.id}>
                    {profile.name} {profile.role ? `(${profile.role})` : ''}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="mb-6">
              <label htmlFor="cardName" className="block text-sm font-medium mb-2">
                Название карты
              </label>
              <input
                id="cardName"
                type="text"
                value={cardName}
                onChange={(e) => setCardName(e.target.value)}
                className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Например: Рабочая карта"
              />
            </div>
            
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={isLoading}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {isLoading ? 'Сохранение...' : 'Привязать карту'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Список карт */}
      <div className="bg-white rounded-lg shadow-md">
        {userNfcCards.length > 0 ? (
          <div className="divide-y">
            {userNfcCards.map((card) => {
              const linkedProfile = profiles.find(p => p.id === card.profileId);
              
              return (
                <div key={card.id} className="p-4 flex justify-between items-center">
                  <div>
                    <h3 className="font-medium">
                      {card.name || 'NFC карта'} 
                      {!card.isActive && <span className="ml-2 text-sm text-red-500">(Неактивна)</span>}
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">
                      ID: {card.nfcUid}
                    </p>
                    {linkedProfile && (
                      <p className="text-sm text-gray-600 mt-1">
                        Профиль: <a href={`/profile/${linkedProfile.name}`} className="text-blue-600 hover:underline">{linkedProfile.name}</a>
                      </p>
                    )}
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleUnlinkCard(card.id)}
                      className="p-2 text-red-500 hover:text-red-700 rounded-full"
                      title="Отвязать карту"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-6 text-center text-gray-500">
            <svg className="w-16 h-16 mx-auto text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4" />
            </svg>
            <p className="mt-4 text-lg">У вас еще нет привязанных NFC карт</p>
            <p className="mt-2">Добавьте свою первую NFC карту, чтобы привязать её к профилю</p>
          </div>
        )}
      </div>

      {/* Информация о NFC */}
      <div className="mt-8 bg-gray-50 p-6 rounded-lg border border-gray-200">
        <h2 className="text-lg font-medium mb-4">Как работает NFC?</h2>
        
        <div className="text-gray-600 space-y-4">
          <p>
            NFC (Near Field Communication) - технология беспроводной связи малого радиуса действия, 
            которая позволяет быстро обмениваться данными между устройствами.
          </p>
          
          <ol className="list-decimal pl-5 space-y-2">
            <li>Привяжите физическую NFC карту к вашему профилю.</li>
            <li>Когда кто-то сканирует вашу карту смартфоном, он автоматически переходит на вашу цифровую визитку.</li>
            <li>Вы можете менять профиль, привязанный к карте, в любое время.</li>
          </ol>
          
          <p className="font-medium mt-4">
            Где приобрести NFC карты?
          </p>
          
          <p>
            Вы можете заказать фирменные карты NTMY в нашем 
            <a href="/shop" className="text-blue-600 hover:underline ml-1">магазине</a>, 
            или использовать любые совместимые NFC метки.
          </p>
        </div>
      </div>
    </div>
  );
};

export default NfcCardManager; 