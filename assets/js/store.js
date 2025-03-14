import Storage from './utils/storage.js';

/**
 * Store - хранилище состояния приложения
 */
class Store {
    constructor() {
        this.state = {
            algorithm: 'vremya-guide',
            currentStepId: null,
            history: [],
            userChoices: {},
            activeTab: 'algorithm' // Добавляем активную вкладку
        };

        // Загрузка состояния из localStorage, если оно есть
        this.loadState();
    }

    static getInstance() {
        if (!Store.instance) {
            Store.instance = new Store();
        }
        return Store.instance;
    }

    /**
     * Обновление состояния
     * @param {object} newState - Новые данные для состояния
     * @returns {object} Обновленное состояние
     */
    setState(newState) {
        this.state = { ...this.state, ...newState };
        this.saveState();
        return this.state;
    }

    /**
     * Получение текущего состояния
     * @returns {object} Текущее состояние
     */
    getState() {
        return this.state;
    }

    /**
     * Установка используемого алгоритма
     * @param {string} algorithmId - Идентификатор алгоритма
     */
    setAlgorithm(algorithmId) {
        this.setState({ algorithm: algorithmId });
    }

    /**
     * Установка текущего шага
     * @param {string} stepId - Идентификатор шага
     */
    setCurrentStep(stepId) {
        // Добавление текущего шага в историю
        const history = [...this.state.history];

        // Если в истории уже есть этот шаг, обрезаем историю до него
        const stepIndex = history.indexOf(stepId);
        if (stepIndex >= 0) {
            history.splice(stepIndex + 1);
        } else {
            // Иначе добавляем шаг в историю
            history.push(stepId);
        }

        this.setState({
            currentStepId: stepId,
            history
        });
    }

    /**
     * Сохранение выбора пользователя
     * @param {string} stepId - Идентификатор шага
     * @param {string} choice - Выбор пользователя
     */
    setUserChoice(stepId, choice) {
        const userChoices = { ...this.state.userChoices, [stepId]: choice };
        this.setState({ userChoices });
    }

    /**
     * Получение предыдущего шага из истории
     * @returns {string|null} Идентификатор предыдущего шага или null
     */
    getPreviousStep() {
        const { history } = this.state;
        if (history.length <= 1) {
            return null;
        }

        // Возврат предыдущего шага
        return history[history.length - 2];
    }

    /**
     * Загрузка состояния из localStorage
     */
    loadState() {
        const savedState = Storage.load('vremya-guide-state');
        if (savedState) {
            this.state = savedState;
        }
    }

    /**
     * Сохранение состояния в localStorage
     */
    saveState() {
        Storage.save('vremya-guide-state', this.state);
    }

    /**
     * Очистка состояния (сброс)
     */
    clearState() {
        this.state = {
            algorithm: this.state.algorithm,
            currentStepId: null,
            history: [],
            userChoices: {},
            activeTab: this.state.activeTab
        };
        this.saveState();
    }
    
    /**
     * Установка активной вкладки
     * @param {string} tabId - Идентификатор вкладки
     */
    setActiveTab(tabId) {
        this.setState({ activeTab: tabId });
    }
    
    /**
     * Получение активной вкладки
     * @returns {string} Идентификатор активной вкладки
     */
    getActiveTab() {
        return this.state.activeTab;
    }
}

export default Store;