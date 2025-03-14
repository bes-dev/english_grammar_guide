/**
 * AlgorithmModel - модель для работы с алгоритмами ВремяГид
 */
class AlgorithmModel {
    constructor(algorithmId) {
        this.algorithmId = algorithmId;
        this.steps = [];
        this.results = {};
        this.rules = [];
        this.currentStep = null;
        this.userChoices = {};
        this.initialized = false;
        this.basePath = document.querySelector('base')?.getAttribute('href') || '/';
    }

    /**
     * Инициализация модели
     * @returns {Promise<AlgorithmModel>} Текущий экземпляр модели
     */
    async initialize() {
        if (this.initialized) {
            return this;
        }

        try {
            // Загрузка данных алгоритма из конфигурационных файлов
            this.steps = await this.fetchConfig('steps');
            this.results = await this.fetchConfig('results');
            this.rules = await this.fetchConfig('rules');
            
            if (this.steps.length > 0) {
                this.currentStep = this.steps[0]; // Начальный шаг
            }
            
            this.initialized = true;
        } catch (error) {
            console.error('Ошибка при инициализации алгоритма:', error);
        }
        
        return this;
    }

    /**
     * Загрузка конфигурации из файла
     * @param {string} configType - Тип конфигурации (steps, results, rules)
     * @returns {Promise<object>} Загруженная конфигурация
     */
    async fetchConfig(configType) {
        try {
            // Формируем путь с учетом базового пути приложения
            const path = `${this.basePath}config/algorithms/${this.algorithmId}/${configType}.json`;
            const response = await fetch(path);
            if (!response.ok) {
                throw new Error(`Ошибка загрузки конфигурации: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.error(`Ошибка загрузки ${configType}:`, error);
            return configType === 'steps' ? [] : (configType === 'results' ? {} : []);
        }
    }

    /**
     * Получение текущего шага
     * @returns {object|null} Текущий шаг алгоритма
     */
    getCurrentStep() {
        return this.currentStep;
    }

    /**
     * Установка выбора пользователя для текущего шага
     * @param {string} stepId - Идентификатор шага
     * @param {string} choice - Выбор пользователя
     */
    setChoice(stepId, choice) {
        this.userChoices[stepId] = choice;
    }

    /**
     * Получение следующего шага на основе выборов пользователя
     * @returns {object|null} Следующий шаг алгоритма или null
     */
    getNextStep() {
        // Определение следующего шага на основе правил и выборов пользователя
        const nextStepId = this.determineNextStep();
        
        if (!nextStepId) {
            return null; // Если следующего шага нет (результат)
        }
        
        const nextStep = this.steps.find(step => step.id === nextStepId);
        
        if (nextStep) {
            this.currentStep = nextStep;
            return nextStep;
        }
        
        return null;
    }

    /**
     * Получение предыдущего шага
     * @param {string} currentStepId - Идентификатор текущего шага
     * @returns {object|null} Предыдущий шаг или null
     */
    getPreviousStep(currentStepId) {
        // Получение всех шагов, ведущих к текущему
        const prevSteps = this.rules.filter(rule => rule.nextStep === currentStepId);
        
        if (prevSteps.length === 0) {
            return null;
        }
        
        // Находим шаг, который соответствует предыдущему выбору пользователя
        for (const prevStep of prevSteps) {
            if (this.userChoices[prevStep.stepId] === prevStep.choice) {
                const step = this.steps.find(s => s.id === prevStep.stepId);
                if (step) {
                    this.currentStep = step;
                    return step;
                }
            }
        }
        
        // Если не удалось найти соответствующий шаг, возвращаем первый из списка
        const step = this.steps.find(s => s.id === prevSteps[0].stepId);
        if (step) {
            this.currentStep = step;
            return step;
        }
        
        return null;
    }

    /**
     * Установка текущего шага по ID
     * @param {string} stepId - Идентификатор шага
     * @returns {object|null} Установленный шаг или null
     */
    setCurrentStep(stepId) {
        const step = this.steps.find(s => s.id === stepId);
        if (step) {
            this.currentStep = step;
            return step;
        }
        return null;
    }

    /**
     * Определение ID следующего шага на основе правил
     * @returns {string|null} Идентификатор следующего шага или null
     */
    determineNextStep() {
        const currentStepId = this.currentStep.id;
        const choice = this.userChoices[currentStepId];
        
        // Если нет выбора для текущего шага, не можем определить следующий
        if (!choice) {
            return null;
        }

        // Поиск в правилах с учетом предыдущих выборов
        const relevantRules = this.rules.filter(r => r.stepId === currentStepId && r.choice === choice);
        
        if (relevantRules.length === 0) {
            return null;
        }
        
        // Проверяем правила с учетом предыдущих шагов
        for (const rule of relevantRules) {
            // Если в правиле нет условия prevChoice или оно соответствует предыдущему выбору
            if (!rule.prevChoice || this.userChoices[this.getPrevStepId(currentStepId)] === rule.prevChoice) {
                // Если есть nextStep, возвращаем его, иначе это шаг к результату
                return rule.nextStep || null;
            }
        }
        
        // Если не нашли подходящее правило, возвращаем первое
        return relevantRules[0].nextStep || null;
    }

    /**
     * Получение ID предыдущего шага
     * @param {string} currentStepId - Идентификатор текущего шага
     * @returns {string|null} Идентификатор предыдущего шага или null
     */
    getPrevStepId(currentStepId) {
        const stepIndex = this.steps.findIndex(s => s.id === currentStepId);
        if (stepIndex <= 0) {
            return null;
        }
        return this.steps[stepIndex - 1].id;
    }

    /**
     * Определение результата на основе выборов пользователя
     * @returns {object|null} Объект результата или null
     */
    getResult() {
        const resultId = this.determineResult();
        return resultId ? this.results[resultId] : null;
    }

    /**
     * Определение ID результата
     * @returns {string|null} Идентификатор результата или null
     */
    determineResult() {
        // Находим правило, которое ведет к результату
        const currentStepId = this.currentStep.id;
        const choice = this.userChoices[currentStepId];
        
        // Поиск правила, ведущего к результату
        const resultRule = this.rules.find(r => 
            r.stepId === currentStepId && 
            r.choice === choice && 
            r.resultId
        );
        
        return resultRule ? resultRule.resultId : null;
    }

    /**
     * Сброс модели к начальному состоянию
     */
    reset() {
        this.currentStep = this.steps.length > 0 ? this.steps[0] : null;
        this.userChoices = {};
    }
}

export default AlgorithmModel;