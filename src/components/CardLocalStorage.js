/**
 * Утилита для работы с localStorage для хранения карточек пользователей
 */

// Ключ для хранения карточек в localStorage
const STORAGE_KEY = 'ntmy_cards';

/**
 * Сохраняет карточку в localStorage
 * @param {Object} card - объект карточки пользователя
 */
export const saveCardToLocalStorage = (card) => {
  if (typeof window === 'undefined') return;
  
  try {
    // Проверяем, что карточка содержит необходимые поля
    if (!card || !card.username) {
      console.error('Invalid card data for local storage', card);
      return;
    }
    
    // Получаем существующие карточки из localStorage
    const existingCards = getCardsFromLocalStorage();
    
    // Ищем карточку с тем же username
    const cardIndex = existingCards.findIndex(c => c.username === card.username);
    
    if (cardIndex >= 0) {
      // Обновляем существующую карточку
      existingCards[cardIndex] = {
        ...existingCards[cardIndex],
        ...card,
        updated_at: new Date().toISOString()
      };
    } else {
      // Добавляем новую карточку
      existingCards.push({
        ...card,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });
    }
    
    // Сохраняем обновленный список карточек
    localStorage.setItem(STORAGE_KEY, JSON.stringify(existingCards));
    console.log('Card saved to localStorage:', card.username);
    
    return true;
  } catch (error) {
    console.error('Error saving card to localStorage:', error);
    return false;
  }
};

/**
 * Получает все карточки из localStorage
 * @returns {Array} массив карточек
 */
export const getCardsFromLocalStorage = () => {
  if (typeof window === 'undefined') return [];
  
  try {
    const cardsJson = localStorage.getItem(STORAGE_KEY);
    if (!cardsJson) return [];
    
    const cards = JSON.parse(cardsJson);
    return Array.isArray(cards) ? cards : [];
  } catch (error) {
    console.error('Error getting cards from localStorage:', error);
    return [];
  }
};

/**
 * Получает карточку пользователя по username из localStorage
 * @param {string} username - имя пользователя
 * @returns {Object|null} карточка пользователя или null, если не найдена
 */
export const getCardByUsernameFromLocalStorage = (username) => {
  if (typeof window === 'undefined' || !username) return null;
  
  try {
    const cards = getCardsFromLocalStorage();
    return cards.find(card => card.username === username) || null;
  } catch (error) {
    console.error('Error getting card from localStorage:', error);
    return null;
  }
};

/**
 * Удаляет карточку пользователя из localStorage
 * @param {string} username - имя пользователя
 * @returns {boolean} успешно ли удалена карточка
 */
export const removeCardFromLocalStorage = (username) => {
  if (typeof window === 'undefined' || !username) return false;
  
  try {
    const cards = getCardsFromLocalStorage();
    const filteredCards = cards.filter(card => card.username !== username);
    
    if (filteredCards.length === cards.length) {
      // Карточка не найдена
      return false;
    }
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filteredCards));
    console.log('Card removed from localStorage:', username);
    return true;
  } catch (error) {
    console.error('Error removing card from localStorage:', error);
    return false;
  }
};

/**
 * Синхронизирует локальную карточку с сервером
 * @param {string} username - имя пользователя
 * @returns {Promise<Object|null>} результат синхронизации
 */
export const syncCardWithServer = async (username) => {
  if (typeof window === 'undefined' || !username) return null;
  
  try {
    // Получаем карточку из localStorage
    const localCard = getCardByUsernameFromLocalStorage(username);
    
    if (!localCard) {
      console.log('No local card found for sync:', username);
      return null;
    }
    
    // Отправляем карточку на сервер
    const apiUrl = `${process.env.NEXT_PUBLIC_BASE_URL || ''}/api/cards/username/${username}`;
    const response = await fetch(apiUrl, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(localCard),
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      console.error('Error syncing card with server:', data);
      return null;
    }
    
    console.log('Card synced with server:', username);
    return data;
  } catch (error) {
    console.error('Error syncing card with server:', error);
    return null;
  }
}; 