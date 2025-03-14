import StepView from '../views/step-view.js';
import EventBus from '../utils/event-bus.js';
import Store from '../store.js';

/**
 * StepController - контроллер для шагов алгоритма
 */
class StepController {
    constructor(algorithmModel) {
        this.model = algorithmModel;
        this.view = new StepView();
        this.eventBus = EventBus.getInstance();
        this.store = Store.getInstance();
        
        // Подписка на события
        this.bindEvents();
    }

    /**
     * Привязка обработчиков событий
     */
    bindEvents() {
        this.eventBus.subscribe('option:selected', this.handleOptionSelected.bind(this));
        this.eventBus.subscribe('step:next', this.handleNextStep.bind(this));
        this.eventBus.subscribe('step:back', this.handlePreviousStep.bind(this));
    }

    /**
     * Инициализация контроллера
     * @param {object} params - Параметры для инициализации
     * @returns {Promise<StepController>} Текущий экземпляр контроллера
     */
    async initialize(params = {}) {
        await this.model.initialize();
        
        // Проверяем, пришли ли мы сюда после события "restart:algorithm"
        const resetRequired = params.reset === 'true';
        
        if (resetRequired) {
            // Если требуется сброс, вызываем reset() у модели
            this.model.reset();
            return this;
        }
        
        // Если есть сохраненное состояние и не требуется сброс, восстанавливаем его
        const state = this.store.getState();
        if (state.currentStepId) {
            this.model.setCurrentStep(state.currentStepId);
            this.model.userChoices = state.userChoices || {};
        } else {
            // Если нет сохраненного состояния, начинаем с первого шага
            const firstStep = this.model.steps.find(step => step.id === 'step1');
            if (firstStep) {
                this.model.setCurrentStep('step1');
            }
        }
        
        return this;
    }

    /**
     * Рендеринг текущего шага
     */
    async render() {
        const currentStep = this.model.getCurrentStep();
        if (!currentStep) {
            console.error('Текущий шаг не определен');
            return;
        }
        
        await this.renderCurrentStep();
        this.view.show();
    }

    /**
     * Скрытие представления
     */
    hideView() {
        this.view.hide();
    }

    /**
     * Рендеринг текущего шага
     */
    async renderCurrentStep() {
        const currentStep = this.model.getCurrentStep();
        const steps = this.model.steps;
        const currentIndex = steps.findIndex(step => step.id === currentStep.id);
        
        const viewData = {
            title: currentStep.title,
            options: currentStep.options,
            steps: steps.map(step => ({ id: step.id, label: step.label })),
            currentStepIndex: currentIndex,
            isFirstStep: currentIndex === 0,
            progress: this.calculateProgress(currentIndex),
            hint: currentStep.hint,
            stepLabel: currentStep.label
        };
        
        await this.view.render(viewData);
        
        // Если есть сохраненный выбор для этого шага, отмечаем его
        const selectedValue = this.model.userChoices[currentStep.id];
        if (selectedValue) {
            const options = this.view.element.querySelectorAll('.option-btn');
            options.forEach(option => {
                if (option.dataset.value === selectedValue) {
                    option.classList.add('selected');
                    // Активируем кнопку "Далее"
                    const nextBtn = this.view.element.querySelector('.next-btn');
                    if (nextBtn) {
                        nextBtn.disabled = false;
                    }
                }
            });
        }
    }

    /**
     * Обработчик выбора опции
     * @param {object} data - Данные о выборе
     */
    handleOptionSelected(data) {
        const currentStep = this.model.getCurrentStep();
        
        // Сохранение выбора пользователя
        this.model.setChoice(currentStep.id, data.value);
        this.store.setUserChoice(currentStep.id, data.value);
        
        // Обновление подсказки
        const selectedOption = currentStep.options.find(option => option.value === data.value);
        if (selectedOption && selectedOption.hint) {
            this.view.updateHint(selectedOption.hint);
        }
    }

    /**
     * Обработчик кнопки "Далее"
     */
    handleNextStep() {
        const currentStep = this.model.getCurrentStep();
        
        // Сохраняем текущий шаг в историю
        this.store.setCurrentStep(currentStep.id);
        
        // Проверяем, есть ли результат для текущего выбора
        const result = this.model.getResult();
        if (result) {
            // Если есть результат, переходим к нему
            this.eventBus.emit('algorithm:complete');
            return;
        }
        
        // Иначе переходим к следующему шагу
        const nextStep = this.model.getNextStep();
        
        if (nextStep) {
            // Переход к следующему шагу
            this.renderCurrentStep();
        } else {
            // Если следующего шага нет, но и результата нет - ошибка
            console.error('Ошибка: нет ни следующего шага, ни результата');
        }
    }

    /**
     * Обработчик кнопки "Назад"
     */
    handlePreviousStep() {
        const currentStep = this.model.getCurrentStep();
        
        // Если это первый шаг, возвращаемся на главную
        if (currentStep && currentStep.id === 'step1') {
            this.eventBus.emit('return:main');
            return;
        }
        
        // Получаем предыдущий шаг из истории или модели
        const prevStepId = this.store.getPreviousStep();
        
        if (prevStepId) {
            // Удаляем текущий шаг из истории
            const historyIndex = this.store.getState().history.indexOf(currentStep.id);
            if (historyIndex >= 0) {
                const newHistory = [...this.store.getState().history];
                newHistory.splice(historyIndex, 1);
                this.store.setState({ history: newHistory });
            }
            
            // Устанавливаем предыдущий шаг
            this.model.setCurrentStep(prevStepId);
            this.store.setCurrentStep(prevStepId);
            this.renderCurrentStep();
        } else {
            // Если история пуста, но мы не на первом шаге, переходим к первому шагу
            if (currentStep && currentStep.id !== 'step1') {
                const firstStep = this.model.steps.find(step => step.id === 'step1');
                if (firstStep) {
                    this.model.setCurrentStep('step1');
                    this.store.setCurrentStep('step1');
                    this.renderCurrentStep();
                } else {
                    // Если не можем найти первый шаг, возвращаемся на главную
                    this.eventBus.emit('return:main');
                }
            } else {
                // Если мы на первом шаге или не определен текущий шаг, возвращаемся на главную
                this.eventBus.emit('return:main');
            }
        }
    }

    /**
     * Установка модели алгоритма
     * @param {AlgorithmModel} model - Модель алгоритма
     */
    setModel(model) {
        this.model = model;
    }
    
    /**
     * Расчет процента прогресса для индикатора
     * @param {number} currentIndex - Индекс текущего шага
     * @returns {number} Процент прогресса
     */
    calculateProgress(currentIndex) {
        // В соответствии с 5-шаговым дизайном:
        // Начало - 0%
        // Фокус (шаг 1, индекс 0) - 20%
        // Время (шаг 2, индекс 1) - 40%
        // Характер (шаг 3, индексы 2+) - 60%
        // Результат - 80-100%
        
        if (currentIndex === 0) {
            return 20; // Шаг 1 - Фокус
        } else if (currentIndex === 1) {
            return 40; // Шаг 2 - Время
        } else {
            return 60; // Шаг 3 - Характер (любой вариант)
        }
    }
}

export default StepController;