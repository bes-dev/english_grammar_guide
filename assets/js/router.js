import EventBus from './utils/event-bus.js';

/**
 * Router - маршрутизатор для навигации между экранами
 */
class Router {
    constructor() {
        this.routes = {};
        this.currentRoute = null;
        this.eventBus = EventBus.getInstance();
        
        // Получение базового пути из тега base
        this.basePath = document.querySelector('base')?.getAttribute('href') || '/';
        
        // Определение контекста (GitHub Pages или кастомный домен)
        this.isGitHubPages = window.location.hostname.includes('github.io');
        if (this.isGitHubPages && this.basePath === '/') {
            this.basePath = '/english_grammar_guide/';
        }

        // Обработка изменения хэша вместо popstate для хэш-навигации
        window.addEventListener('hashchange', this.handleHashChange.bind(this));
    }

    static getInstance() {
        if (!Router.instance) {
            Router.instance = new Router();
        }
        return Router.instance;
    }

    /**
     * Добавление маршрута
     * @param {string} path - Путь маршрута
     * @param {object} controller - Контроллер для обработки маршрута
     * @returns {Router} Текущий экземпляр Router для цепочки вызовов
     */
    addRoute(path, controller) {
        this.routes[path] = controller;
        return this;
    }

    /**
     * Навигация по маршруту
     * @param {string} path - Путь маршрута
     * @param {object} params - Параметры для маршрута
     */
    navigate(path, params = {}) {
        // Использование хэш-навигации для лучшей совместимости при обновлении страницы
        // Убираем начальный слеш у пути, чтобы избежать дублирования
        const pathWithoutLeadingSlash = path.replace(/^\//, '');
        
        // Формируем URL с использованием хэша
        let url = window.location.origin + this.basePath + '#/' + pathWithoutLeadingSlash;
        
        // Добавление параметров в URL
        const searchParams = new URLSearchParams();
        Object.keys(params).forEach(key => {
            searchParams.append(key, params[key]);
        });
        
        const searchString = searchParams.toString();
        if (searchString) {
            url += '?' + searchString;
        }

        // Обновление URL
        window.location.href = url;

        // Вызов обработчика для нового URL
        this.handleRoute(path, params);
    }

    /**
     * Обработка события hashchange
     * @param {HashChangeEvent} event - Событие hashchange
     */
    handleHashChange(event) {
        // Обработка изменения хэша в URL
        // Парсим хэш для получения пути и параметров
        const hash = window.location.hash.slice(1) || '/'; // Удаляем # и используем / по умолчанию
        
        // Разделяем путь и параметры запроса
        const [hashPath, queryString] = hash.split('?');
        
        // Убеждаемся, что путь начинается с /
        let path = hashPath.startsWith('/') ? hashPath : '/' + hashPath;
        
        // Парсим параметры запроса
        const params = queryString 
            ? Object.fromEntries(new URLSearchParams(queryString))
            : {};

        this.handleRoute(path, params);
    }

    /**
     * Обработка маршрута
     * @param {string} path - Путь маршрута
     * @param {object} params - Параметры маршрута
     */
    handleRoute(path, params) {
        // Нормализация пути (для случая, когда путь /)
        const normalizedPath = path === '/' ? '/' : path.replace(/\/$/, '');
        
        // Поиск контроллера для текущего пути
        let controller = this.routes[normalizedPath];

        if (!controller) {
            // Если маршрут не найден, перенаправляем на главную
            console.error(`Route not found: ${normalizedPath}`);
            this.navigate('/');
            return;
        }

        // Скрытие текущего представления (если есть)
        if (this.currentRoute && this.currentRoute.hideView) {
            this.currentRoute.hideView();
        }

        // Активация нового контроллера
        this.currentRoute = controller;

        // Отправка события о смене маршрута
        this.eventBus.emit('route:changed', { path: normalizedPath, params });

        // Инициализация контроллера с параметрами
        controller.initialize(params).then(() => {
            controller.render();
        });
    }

    /**
     * Запуск маршрутизатора
     */
    start() {
        // Обработка текущего хэша при загрузке страницы
        if (window.location.hash) {
            // Если есть хэш, обрабатываем его
            this.handleHashChange();
        } else {
            // Если хэша нет, перенаправляем на корневой маршрут с хэшем
            window.location.href = window.location.origin + this.basePath + '#/';
            // Хэш-изменение вызовет handleHashChange автоматически
        }
    }

    /**
     * Получение контроллера по пути
     * @param {string} path - Путь маршрута
     * @returns {object|null} Контроллер для указанного пути или null
     */
    getController(path) {
        // Нормализация пути (для случая, когда путь /)
        const normalizedPath = path === '/' ? '/' : path.replace(/\/$/, '');
        return this.routes[normalizedPath] || null;
    }
}

export default Router;