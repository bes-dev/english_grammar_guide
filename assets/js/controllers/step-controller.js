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
        
        // Сохраняем полные данные о шагах для доступа из представления
        window.fullStepsData = this.model.steps;
        
        // Проверяем, пришли ли мы сюда после события "restart:algorithm"
        const resetRequired = params.reset === 'true';
        
        if (resetRequired) {
            // Если требуется сброс, вызываем reset() у модели
            this.model.reset();
            // Очищаем информацию о пропущенных шагах
            this.store.setState({ skippedSteps: [] });
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
                // Очищаем информацию о пропущенных шагах при начале нового алгоритма
                this.store.setState({ skippedSteps: [] });
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
            stepLabel: currentStep.label,
            isConditionalPlaceholder: false
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
        
        // Отладочная информация
        console.log('Текущий шаг:', currentStep);
        console.log('Все выборы пользователя:', this.model.userChoices);
        
        // Сохраняем текущий шаг в историю
        this.store.setCurrentStep(currentStep.id);
        
        // На шаге перед формой нам нужно запомнить промежуточный результат
        if (currentStep.id.startsWith('step3_')) {
            // Находим правило для данного шага и выбора
            const choice = this.model.userChoices[currentStep.id];
            const rule = this.model.rules.find(r => 
                r.stepId === currentStep.id && 
                r.choice === choice
            );
            
            if (rule && rule.saveResult) {
                console.log('Сохраняем промежуточный результат:', rule.saveResult);
                this.model.userChoices['savedResult'] = rule.saveResult;
                this.store.setUserChoice('savedResult', rule.saveResult);
            }
            
            // Если это шаг условного предложения, то сразу идем к результату
            if (currentStep.id === 'step3_condition') {
                const savedResult = this.model.userChoices['savedResult'];
                console.log('Шаг условного предложения завершен, переходим к результату:', savedResult);
                
                if (savedResult && this.model.results[savedResult]) {
                    console.log('Переходим к результату из условного предложения');
                    this.eventBus.emit('algorithm:complete');
                    return;
                }
            }
        }
        
        // Если это шаг формы и у нас есть выбор, то сразу идем к результату
        if (currentStep.id === 'step4_form' && this.model.userChoices[currentStep.id]) {
            const formChoice = this.model.userChoices[currentStep.id];
            const savedResult = this.model.userChoices['savedResult'];
            
            console.log('Форма выбрана:', formChoice);
            console.log('Сохраненный результат:', savedResult);
            
            if (savedResult && this.model.results[savedResult]) {
                console.log('Переходим к результату из шага формы');
                this.eventBus.emit('algorithm:complete');
                return;
            }
        }
        
        // Проверяем, есть ли результат для текущего выбора
        const result = this.model.getResult();
        console.log('Получен результат:', result);
        
        if (result) {
            // Если есть результат, переходим к нему
            this.eventBus.emit('algorithm:complete');
            return;
        }
        
        // Иначе переходим к следующему шагу
        const nextStepData = this.model.getNextStep();
        console.log('Следующий шаг:', nextStepData);
        
        if (nextStepData) {
            const { step, skippedSteps } = nextStepData;
            
            // Обрабатываем пропущенные шаги
            if (skippedSteps && skippedSteps.length > 0) {
                console.log('Пропускаем шаги:', skippedSteps);
                
                // Сохраняем информацию о пропущенных шагах
                this.store.setState({ skippedSteps });
                
                // Для каждого пропущенного шага получаем информацию
                skippedSteps.forEach(stepId => {
                    const skippedStep = this.model.steps.find(s => s.id === stepId);
                    if (skippedStep && skippedStep.canBeSkipped) {
                        console.log('Пропускаем шаг:', skippedStep.label);
                    }
                });
            }
            
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
            // Проверяем, не был ли предыдущий шаг пропущен
            const skippedSteps = this.store.getState().skippedSteps || [];
            if (skippedSteps.includes(prevStepId)) {
                console.log('Предыдущий шаг был пропущен, ищем непропущенный шаг');
                
                // Ищем первый непропущенный шаг в истории
                const history = this.store.getState().history || [];
                let foundPrevStepId = null;
                
                for (let i = history.length - 1; i >= 0; i--) {
                    if (!skippedSteps.includes(history[i]) && history[i] !== currentStep.id) {
                        foundPrevStepId = history[i];
                        break;
                    }
                }
                
                if (foundPrevStepId) {
                    // Удаляем текущий шаг из истории
                    const historyIndex = this.store.getState().history.indexOf(currentStep.id);
                    if (historyIndex >= 0) {
                        const newHistory = [...this.store.getState().history];
                        newHistory.splice(historyIndex, 1);
                        this.store.setState({ history: newHistory });
                    }
                    
                    // Устанавливаем найденный непропущенный шаг
                    this.model.setCurrentStep(foundPrevStepId);
                    this.store.setCurrentStep(foundPrevStepId);
                    this.renderCurrentStep();
                    return;
                }
            }
            
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
            
            // Очищаем информацию о пропущенных шагах при возврате к шагу выбора фокуса
            if (prevStepId === 'step1') {
                this.store.setState({ skippedSteps: [] });
            }
            
            this.renderCurrentStep();
        } else {
            // Если история пуста, но мы не на первом шаге, переходим к первому шагу
            if (currentStep && currentStep.id !== 'step1') {
                const firstStep = this.model.steps.find(step => step.id === 'step1');
                if (firstStep) {
                    this.model.setCurrentStep('step1');
                    this.store.setCurrentStep('step1');
                    // Очищаем информацию о пропущенных шагах
                    this.store.setState({ skippedSteps: [] });
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
        // В соответствии с 6-шаговым дизайном:
        // Начало - 0%
        // Фокус (шаг 1, индекс 0) - 20%
        // Время (шаг 2, индекс 1) - 40%
        // Характер (шаг 3, индексы 2+) - 60%
        // Форма (шаг 4) - 80%
        // Результат - 100%

        // Определяем, какой это шаг по логической последовательности
        const currentStep = this.model.getCurrentStep();
        
        // Получаем информацию о пропущенных шагах
        const skippedSteps = this.store.getState().skippedSteps || [];
        
        // Если текущий шаг - Условие (step3_condition) и был пропущен шаг Время (step2),
        // то увеличиваем процент прогресса, так как мы фактически прошли два шага
        if (currentStep && currentStep.id === 'step3_condition' && skippedSteps.includes('step2')) {
            return 60; // Прогресс такой же, как для шага 3
        }
        
        if (currentIndex === 0) {
            return 20; // Шаг 1 - Фокус
        } else if (currentIndex === 1) {
            return 40; // Шаг 2 - Время
        } else if (currentStep && currentStep.id === 'step4_form') {
            // Для формы учитываем возможные пропущенные шаги
            return skippedSteps.length > 0 ? 80 : 80; // В любом случае 80%, но потенциально можно сделать разницу
        } else {
            return 60; // Шаг 3 - Характер (любой вариант)
        }
    }
}

export default StepController;