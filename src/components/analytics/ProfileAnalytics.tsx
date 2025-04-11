import React, { useMemo } from 'react';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, BarElement } from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';
import { AnalyticsData } from '../../types/profile';

// Регистрируем компоненты Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface ProfileAnalyticsProps {
  analyticsData: AnalyticsData[];
  period: 'day' | 'week' | 'month' | 'year';
  profileId: string;
}

const ProfileAnalytics: React.FC<ProfileAnalyticsProps> = ({ 
  analyticsData, 
  period,
  profileId
}) => {
  // Опции для графиков
  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Посещения профиля',
      },
    },
  };

  // Подготовка данных для графика посещений по дням
  const visitsChartData = useMemo(() => {
    // Фильтрация данных для текущего профиля
    const filteredData = analyticsData.filter(data => data.profileId === profileId);
    
    // Группировка данных по дням для графика
    const dateGroups = filteredData.reduce<Record<string, number>>((acc, data) => {
      const date = new Date(data.visitDate);
      let dateKey: string;
      
      switch (period) {
        case 'day':
          dateKey = `${date.getDate()}.${date.getMonth() + 1}`;
          break;
        case 'week':
          dateKey = `Неделя ${getWeekNumber(date)}`;
          break;
        case 'month':
          dateKey = getMonthName(date.getMonth());
          break;
        case 'year':
          dateKey = date.getFullYear().toString();
          break;
        default:
          dateKey = `${date.getDate()}.${date.getMonth() + 1}`;
      }
      
      if (!acc[dateKey]) {
        acc[dateKey] = 0;
      }
      acc[dateKey]++;
      
      return acc;
    }, {});
    
    // Сортировка ключей дат для правильного отображения на графике
    const sortedDates = Object.keys(dateGroups).sort((a, b) => {
      if (period === 'month') {
        return getMonthIndex(a) - getMonthIndex(b);
      }
      return 0;
    });
    
    // Подготовка данных для графика
    return {
      labels: sortedDates,
      datasets: [
        {
          label: 'Посещения',
          data: sortedDates.map(date => dateGroups[date]),
          borderColor: 'rgb(53, 162, 235)',
          backgroundColor: 'rgba(53, 162, 235, 0.5)',
        },
      ],
    };
  }, [analyticsData, period, profileId]);

  // Данные для графика устройств
  const deviceChartData = useMemo(() => {
    // Фильтрация данных для текущего профиля
    const filteredData = analyticsData.filter(data => data.profileId === profileId);
    
    // Группировка по типам устройств
    const deviceGroups = filteredData.reduce<Record<string, number>>((acc, data) => {
      const deviceType = data.deviceType || 'Неизвестно';
      
      if (!acc[deviceType]) {
        acc[deviceType] = 0;
      }
      acc[deviceType]++;
      
      return acc;
    }, {});
    
    // Подготовка данных для графика
    return {
      labels: Object.keys(deviceGroups),
      datasets: [
        {
          label: 'Устройства',
          data: Object.values(deviceGroups),
          backgroundColor: [
            'rgba(255, 99, 132, 0.5)',
            'rgba(54, 162, 235, 0.5)',
            'rgba(255, 206, 86, 0.5)',
            'rgba(75, 192, 192, 0.5)',
            'rgba(153, 102, 255, 0.5)',
          ],
          borderColor: [
            'rgba(255, 99, 132, 1)',
            'rgba(54, 162, 235, 1)',
            'rgba(255, 206, 86, 1)',
            'rgba(75, 192, 192, 1)',
            'rgba(153, 102, 255, 1)',
          ],
          borderWidth: 1,
        },
      ],
    };
  }, [analyticsData, profileId]);

  // Статистика посещений
  const stats = useMemo(() => {
    const filteredData = analyticsData.filter(data => data.profileId === profileId);
    
    // Общее количество посещений
    const totalVisits = filteredData.length;
    
    // Уникальные IP адреса
    const uniqueIps = new Set(filteredData.map(data => data.ipAddress)).size;
    
    // Посещения за последние 24 часа
    const oneDayAgo = new Date();
    oneDayAgo.setDate(oneDayAgo.getDate() - 1);
    const last24HoursVisits = filteredData.filter(
      data => new Date(data.visitDate) >= oneDayAgo
    ).length;
    
    // Посещения за последние 7 дней
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const lastWeekVisits = filteredData.filter(
      data => new Date(data.visitDate) >= sevenDaysAgo
    ).length;
    
    return {
      totalVisits,
      uniqueIps,
      last24HoursVisits,
      lastWeekVisits
    };
  }, [analyticsData, profileId]);

  // Если нет данных, показываем сообщение
  if (analyticsData.length === 0) {
    return (
      <div className="text-center p-8 bg-gray-50 rounded-lg">
        <h2 className="text-xl font-semibold mb-2">Нет данных аналитики</h2>
        <p className="text-gray-600">
          Данные аналитики будут доступны после первых посещений вашего профиля.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h1 className="text-2xl font-bold mb-6">Аналитика профиля</h1>
      
      {/* Блоки статистики */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-blue-50 p-4 rounded-lg">
          <h3 className="text-sm text-gray-600">Всего посещений</h3>
          <p className="text-2xl font-bold text-blue-600">{stats.totalVisits}</p>
        </div>
        
        <div className="bg-green-50 p-4 rounded-lg">
          <h3 className="text-sm text-gray-600">Уникальные посетители</h3>
          <p className="text-2xl font-bold text-green-600">{stats.uniqueIps}</p>
        </div>
        
        <div className="bg-purple-50 p-4 rounded-lg">
          <h3 className="text-sm text-gray-600">За 24 часа</h3>
          <p className="text-2xl font-bold text-purple-600">{stats.last24HoursVisits}</p>
        </div>
        
        <div className="bg-orange-50 p-4 rounded-lg">
          <h3 className="text-sm text-gray-600">За 7 дней</h3>
          <p className="text-2xl font-bold text-orange-600">{stats.lastWeekVisits}</p>
        </div>
      </div>
      
      {/* Переключатель периода */}
      <div className="flex mb-6 space-x-2">
        <select 
          className="px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          defaultValue={period}
        >
          <option value="day">День</option>
          <option value="week">Неделя</option>
          <option value="month">Месяц</option>
          <option value="year">Год</option>
        </select>
      </div>
      
      {/* График посещений */}
      <div className="mb-8">
        <h2 className="text-lg font-medium mb-4">Динамика посещений</h2>
        <div className="h-64">
          <Line options={options} data={visitsChartData} />
        </div>
      </div>
      
      {/* График устройств */}
      <div className="mb-8">
        <h2 className="text-lg font-medium mb-4">Типы устройств</h2>
        <div className="h-64">
          <Bar options={{...options, plugins: {...options.plugins, title: {...options.plugins.title, text: 'Устройства'}}}} data={deviceChartData} />
        </div>
      </div>
    </div>
  );
};

// Вспомогательные функции
function getWeekNumber(date: Date): number {
  const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
  const pastDaysOfYear = (date.getTime() - firstDayOfYear.getTime()) / 86400000;
  return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
}

function getMonthName(monthIndex: number): string {
  const months = [
    'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
    'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'
  ];
  return months[monthIndex];
}

function getMonthIndex(monthName: string): number {
  const months = [
    'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
    'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'
  ];
  return months.indexOf(monthName);
}

export default ProfileAnalytics; 