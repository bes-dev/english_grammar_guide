import ResultView from '../views/result-view.js';
import EventBus from '../utils/event-bus.js';
import Store from '../store.js';

/**
 * ResultController - контроллер для страницы результата
 */
class ResultController {
    constructor(algorithmModel) {
        this.model = algorithmModel;
        this.view = new ResultView();
        this.eventBus = EventBus.getInstance();
        this.store = Store.getInstance();
    }

    /**
     * Инициализация контроллера
     * @param {object} params - Параметры для инициализации
     * @returns {Promise<ResultController>} Текущий экземпляр контроллера
     */
    async initialize(params = {}) {
        await this.model.initialize();
        
        // Загрузка состояния и выборов пользователя
        const state = this.store.getState();
        if (state.currentStepId) {
            this.model.setCurrentStep(state.currentStepId);
            this.model.userChoices = state.userChoices || {};
        }
        
        return this;
    }

    /**
     * Рендеринг результата
     */
    async render() {
        const result = this.model.getResult();
        
        await this.view.render({ result });
        this.view.show();
    }

    /**
     * Скрытие представления
     */
    hideView() {
        this.view.hide();
    }

    /**
     * Установка модели алгоритма
     * @param {AlgorithmModel} model - Модель алгоритма
     */
    setModel(model) {
        this.model = model;
    }
}

export default ResultController;