/**
 * Утилиты для работы с API карточек в MongoDB
 * 
 * Эти функции позволяют получать данные карточек напрямую из MongoDB через API.
 */

/**
 * Получить карточку по username из MongoDB через API
 * 
 * @param {string} username - Имя пользователя карточки
 * @returns {Promise<Object|null>} - Объект карточки или null, если карточка не найдена
 */
export const getCardByUsername = async (username) => {
  try {
    if (!username) return null;
    
    const response = await fetch(`/api/cards/username/${username}`);
    
    if (!response.ok) {
      console.error(`Error fetching card for username ${username}: ${response.status}`);
      return null;
    }
    
    const card = await response.json();
    return card;
  } catch (error) {
    console.error('Error in getCardByUsername:', error);
    return null;
  }
};

/**
 * Проверка наличия карточки по username на сервере MongoDB
 * 
 * @param {string} username - Имя пользователя карточки
 * @returns {Promise<boolean>} - true если карточка существует, false в противном случае
 */
export const checkCardExists = async (username) => {
  try {
    if (!username) return false;
    
    const response = await fetch(`/api/cards/username/${username}`);
    return response.ok; // Если статус 200, значит карточка существует
  } catch (error) {
    console.error('Error in checkCardExists:', error);
    return false;
  }
};

/**
 * Получить все карточки пользователя по user_id
 * 
 * @param {string} userId - ID пользователя
 * @returns {Promise<Array|null>} - Массив карточек или null в случае ошибки
 */
export const getUserCards = async (userId) => {
  try {
    if (!userId) return null;
    
    const response = await fetch(`/api/cards/user/${userId}`);
    
    if (!response.ok) {
      console.error(`Error fetching cards for user ${userId}: ${response.status}`);
      return null;
    }
    
    const cards = await response.json();
    return Array.isArray(cards) ? cards : [];
  } catch (error) {
    console.error('Error in getUserCards:', error);
    return null;
  }
};

/**
 * Создать новую карточку в MongoDB
 * 
 * @param {Object} cardData - Данные карточки
 * @returns {Promise<Object|null>} - Созданная карточка или null в случае ошибки
 */
export const createCard = async (cardData) => {
  try {
    if (!cardData || !cardData.username) {
      console.error('Invalid card data for creation', cardData);
      return null;
    }
    
    const response = await fetch('/api/cards', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'user-id': cardData.user_id
      },
      body: JSON.stringify(cardData)
    });
    
    if (!response.ok) {
      console.error(`Error creating card: ${response.status}`);
      return null;
    }
    
    const card = await response.json();
    console.log('Card created successfully:', card);
    return card;
  } catch (error) {
    console.error('Error in createCard:', error);
    return null;
  }
};

/**
 * Обновить существующую карточку в MongoDB
 * 
 * @param {string} username - Username карточки
 * @param {Object} cardData - Новые данные карточки
 * @returns {Promise<Object|null>} - Обновленная карточка или null в случае ошибки
 */
export const updateCard = async (username, cardData) => {
  try {
    if (!username || !cardData) {
      console.error('Invalid data for card update', { username, cardData });
      return null;
    }
    
    const response = await fetch(`/api/cards/username/${username}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'user-id': cardData.user_id
      },
      body: JSON.stringify(cardData)
    });
    
    if (!response.ok) {
      console.error(`Error updating card: ${response.status}`);
      return null;
    }
    
    const card = await response.json();
    console.log('Card updated successfully:', card);
    return card;
  } catch (error) {
    console.error('Error in updateCard:', error);
    return null;
  }
}; 