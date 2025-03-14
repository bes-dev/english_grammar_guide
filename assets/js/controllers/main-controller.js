import MainView from '../views/main-view.js';
import EventBus from '../utils/event-bus.js';

/**
 * MainController - контроллер для главной страницы
 */
class MainController {
    constructor() {
        this.view = new MainView();
        this.eventBus = EventBus.getInstance();
    }

    /**
     * Инициализация контроллера
     * @param {object} params - Параметры для инициализации
     * @returns {Promise<MainController>} Текущий экземпляр контроллера
     */
    async initialize(params = {}) {
        return this;
    }

    /**
     * Рендеринг главной страницы
     */
    async render() {
        await this.view.render();
        this.view.show();
    }

    /**
     * Скрытие представления
     */
    hideView() {
        this.view.hide();
    }
}

export default MainController;