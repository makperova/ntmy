import React, { Component, ErrorInfo, ReactNode } from 'react';
import Link from 'next/link';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    // Обновляем состояние, чтобы при следующем рендере показать fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Сохраняем информацию об ошибке для отображения в UI
    this.setState({ errorInfo });
    
    // Логируем ошибку для диагностики
    console.error('ErrorBoundary caught an error:', error);
    console.error('Component stack trace:', errorInfo.componentStack);
    
    // Здесь можно добавить отправку ошибки в аналитику или сервис логирования
  }

  render(): ReactNode {
    if (this.state.hasError) {
      // Если есть кастомный fallback, используем его
      if (this.props.fallback) {
        return this.props.fallback;
      }
      
      // Иначе показываем стандартный UI ошибки
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
          <div className="text-center max-w-xl w-full">
            <h1 className="text-4xl font-bold text-gray-900">
              Что-то пошло не так
            </h1>
            <p className="mt-3 text-xl text-gray-600">
              В приложении произошла ошибка
            </p>
            <div className="mt-2 mx-auto">
              <div className="text-left p-4 bg-gray-100 rounded-md overflow-auto text-sm text-red-500 mb-2">
                <strong>Ошибка:</strong> {this.state.error?.toString()}
              </div>
              
              {process.env.NODE_ENV === 'development' && this.state.errorInfo && (
                <details className="text-left p-4 bg-gray-100 rounded-md overflow-auto text-sm text-gray-600 mt-2">
                  <summary className="font-medium cursor-pointer mb-2">Component Stack Trace</summary>
                  <pre className="whitespace-pre-wrap">
                    {this.state.errorInfo.componentStack}
                  </pre>
                </details>
              )}
            </div>
            <div className="mt-6 flex flex-col md:flex-row justify-center space-y-2 md:space-y-0 md:space-x-4">
              <button 
                onClick={() => window.location.reload()}
                className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700"
              >
                Обновить страницу
              </button>
              <Link href="/" className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700">
                Вернуться на главную
              </Link>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary; 