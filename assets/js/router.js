import EventBus from './utils/event-bus.js';

/**
 * Router - маршрутизатор для навигации между экранами
 */
class Router {
    constructor() {
        this.routes = {};
        this.currentRoute = null;
        this.eventBus = EventBus.getInstance();

        // Обработка изменения URL
        window.addEventListener('popstate', this.handlePopState.bind(this));
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
        // Изменение URL и обновление страницы
        const url = new URL(window.location.origin + path);

        // Добавление параметров в URL
        Object.keys(params).forEach(key => {
            url.searchParams.append(key, params[key]);
        });

        // Обновление истории браузера
        window.history.pushState({}, '', url);

        // Вызов обработчика для нового URL
        this.handleRoute(path, params);
    }

    /**
     * Обработка события popstate (навигация назад/вперед)
     * @param {PopStateEvent} event - Событие popstate
     */
    handlePopState(event) {
        // Обработка навигации "назад" и "вперед"
        const path = window.location.pathname || '/';
        const params = Object.fromEntries(new URLSearchParams(window.location.search));

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
        // Обработка текущего URL при загрузке страницы
        const path = window.location.pathname || '/';
        const params = Object.fromEntries(new URLSearchParams(window.location.search));

        this.handleRoute(path, params);
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