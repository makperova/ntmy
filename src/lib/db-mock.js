// Заглушка для избежания ошибок соединения с БД во время тестирования других функций
export const mockDBConnection = () => {
  const originalConsoleError = console.error;
  
  // Подменяем console.error, чтобы игнорировать ошибки Prisma
  console.error = (...args) => {
    const errorMessage = typeof args[0] === 'string' ? args.join(' ') : '';
    
    if (
      errorMessage.includes('PrismaClientInitializationError') || 
      errorMessage.includes('Can\'t reach database server') ||
      (args[0] instanceof Error && args[0].message && (
        args[0].message.includes('PrismaClientInitializationError') ||
        args[0].message.includes('Can\'t reach database server')
      ))
    ) {
      // Игнорируем ошибки подключения к БД
      return;
    }
    originalConsoleError(...args);
  };
  
  return () => {
    // Возвращаем оригинальную функцию
    console.error = originalConsoleError;
  };
};

// Заглушка для имитации возвращаемых значений Prisma
export const mockPrismaClient = () => {
  // Мок данные для тестирования UI
  const mockUsers = [
    { id: '1', username: 'testuser', email: 'test@example.com', name: 'Test User' }
  ];
  
  const mockProfiles = [
    { 
      id: '1', 
      userId: '1', 
      name: 'Test Profile', 
      role: 'Developer',
      company: 'Test Company',
      bio: 'This is a test profile',
      isPublished: true 
    }
  ];
  
  // Возвращаем мок-объект, имитирующий Prisma Client
  return {
    user: {
      findUnique: async () => mockUsers[0],
      findFirst: async () => mockUsers[0],
      findMany: async () => mockUsers,
      create: async (data) => ({ ...mockUsers[0], ...data.data }),
      update: async (data) => ({ ...mockUsers[0], ...data.data }),
      upsert: async (data) => ({ ...mockUsers[0], ...data.create })
    },
    profile: {
      findUnique: async () => mockProfiles[0],
      findFirst: async () => mockProfiles[0],
      findMany: async () => mockProfiles,
      create: async (data) => ({ ...mockProfiles[0], ...data.data }),
      update: async (data) => ({ ...mockProfiles[0], ...data.data }),
      upsert: async (data) => ({ ...mockProfiles[0], ...data.create })
    },
    $connect: async () => {},
    $disconnect: async () => {}
  };
}; 