// Удаляем React компонент, так как он не нужен в API-эндпоинте
export default async function handler(req, res) {
  // Включаем подробное логирование
  console.log("Testing Cloudinary connection...");
  
  try {
    // 1. Проверяем доступность переменных окружения
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;
    
    // Логируем значения для отладки (скрываем секретные данные)
    console.log("Environment variables check:", {
      cloudName,
      apiKeyExists: !!apiKey,
      apiSecretExists: !!apiSecret,
      apiKeyFirstChars: apiKey ? apiKey.substring(0, 4) + '...' : null,
      apiSecretFirstChars: apiSecret ? apiSecret.substring(0, 4) + '...' : null
    });

    return res.status(200).json({
      success: true,
      message: "Environment variables loaded",
      cloudName,
      apiKeyExists: !!apiKey,
      apiSecretExists: !!apiSecret
    });
  } catch (error) {
    // Логируем глобальные ошибки
    console.error("Global error in Cloudinary test:", error);
    
    return res.status(500).json({
      success: false,
      message: "Global error in Cloudinary test",
      error: error.message,
      stack: error.stack
    });
  }
}
