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
        
        // Определение контекста (GitHub Pages или кастомный домен)
        this.isGitHubPages = window.location.hostname.includes('github.io');
        if (this.isGitHubPages && this.basePath === '/') {
            this.basePath = '/english_grammar_guide/';
        }
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
        const result = this.determineNextStepWithSkips();
        
        if (!result || !result.nextStepId) {
            return null; // Если следующего шага нет (результат)
        }
        
        const nextStep = this.steps.find(step => step.id === result.nextStepId);
        
        if (nextStep) {
            this.currentStep = nextStep;
            return { 
                step: nextStep,
                skippedSteps: result.skippedSteps || []
            };
        }
        
        return null;
    }
    
    /**
     * Определение следующего шага с учетом возможности пропуска шагов
     * @returns {object} Объект с id следующего шага и массивом пропущенных шагов
     */
    determineNextStepWithSkips() {
        const currentStepId = this.currentStep.id;
        const choice = this.userChoices[currentStepId];
        
        // Если нет выбора для текущего шага, не можем определить следующий
        if (!choice) {
            return { nextStepId: null, skippedSteps: [] };
        }
        
        // Поиск в правилах с учетом предыдущих выборов
        const relevantRules = this.rules.filter(r => r.stepId === currentStepId && r.choice === choice);
        
        if (relevantRules.length === 0) {
            return { nextStepId: null, skippedSteps: [] };
        }
        
        // Проверяем правила с учетом предыдущих шагов
        for (const rule of relevantRules) {
            // Если в правиле нет условия prevChoice или оно соответствует предыдущему выбору
            if (!rule.prevChoice || this.userChoices[this.getPrevStepId(currentStepId)] === rule.prevChoice) {
                // Сохраняем промежуточный результат, если он есть в правиле
                if (rule.saveResult) {
                    this.userChoices['savedResult'] = rule.saveResult;
                }
                
                const skippedSteps = rule.skipSteps || [];
                
                // Если есть nextStep, возвращаем его вместе с пропущенными шагами
                return { 
                    nextStepId: rule.nextStep || null,
                    skippedSteps: skippedSteps
                };
            }
        }
        
        // Если не нашли подходящее правило, возвращаем первое
        const rule = relevantRules[0];
        
        // Сохраняем промежуточный результат, если он есть в правиле
        if (rule.saveResult) {
            console.log('Сохраняем промежуточный результат:', rule.saveResult);
            this.userChoices['savedResult'] = rule.saveResult;
        }
        
        // Если это правило для формы и у него есть resultType=form
        if (rule.resultType === 'form') {
            // То это финальный шаг и нам не нужен nextStep
            console.log('Правило с resultType=form - это финальный шаг');
            return { nextStepId: null, skippedSteps: [] };
        }
        
        // Иначе возвращаем nextStep если он есть
        return { 
            nextStepId: rule.nextStep || null,
            skippedSteps: rule.skipSteps || []
        };
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
                // Сохраняем промежуточный результат, если он есть в правиле
                if (rule.saveResult) {
                    this.userChoices['savedResult'] = rule.saveResult;
                }
                
                // Если есть nextStep, возвращаем его, иначе это шаг к результату
                return rule.nextStep || null;
            }
        }
        
        // Если не нашли подходящее правило, возвращаем первое
        const rule = relevantRules[0];
        
        // Сохраняем промежуточный результат, если он есть в правиле
        if (rule.saveResult) {
            console.log('Сохраняем промежуточный результат:', rule.saveResult);
            this.userChoices['savedResult'] = rule.saveResult;
        }
        
        // Если это правило для формы и у него есть resultType=form
        if (rule.resultType === 'form') {
            // То это финальный шаг и нам не нужен nextStep
            console.log('Правило с resultType=form - это финальный шаг');
            return null;
        }
        
        // Иначе возвращаем nextStep если он есть
        return rule.nextStep || null;
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
        // Получаем ID результата
        let resultId = this.determineResult();
        
        if (!resultId) {
            console.log('Не удалось определить ID результата');
            return null;
        }
        
        console.log('Определен ID результата:', resultId);
        
        // Специальная обработка для шага формы
        if (this.currentStep && this.currentStep.id === 'step4_form') {
            // Форма выбрана (affirmative, question, negative)
            const formType = this.userChoices[this.currentStep.id];
            // Получаем сохраненный результат
            const savedResult = this.userChoices['savedResult'];
            
            console.log('На шаге формы - тип формы:', formType, 'сохраненный результат:', savedResult);
            
            if (savedResult && this.results[savedResult]) {
                // Берём базовый результат и фильтруем формулы в зависимости от выбранной формы предложения
                const baseResult = JSON.parse(JSON.stringify(this.results[savedResult])); // Глубокое клонирование
                
                // Фильтруем только ту формулу, которая соответствует выбранной форме
                if (baseResult.formulas && baseResult.formulas.length > 0) {
                    console.log('Фильтруем формулы по типу:', formType);
                    
                    // Выбираем только подходящую формулу по полю type
                    const filteredFormula = baseResult.formulas.find(f => f.type === formType);
                    
                    console.log('Найдена подходящая формула:', filteredFormula ? 'да' : 'нет');
                    
                    // Обновляем результат только с одной формулой, если она найдена
                    if (filteredFormula) {
                        baseResult.formulas = [filteredFormula];
                        
                        // Фильтруем примеры соответственно типу формы
                        if (baseResult.examples && baseResult.examples.length > 0) {
                            // Фильтруем по полю type
                            const filteredExamples = baseResult.examples.filter(example => 
                                example.type === formType
                            );
                            
                            // Если нашли примеры с нужным типом, используем их
                            if (filteredExamples.length > 0) {
                                baseResult.examples = filteredExamples;
                                console.log('Отфильтровано примеров по типу:', filteredExamples.length);
                            } else {
                                console.log('Не найдено примеров с типом ' + formType + ', оставляем все примеры');
                            }
                        }
                    }
                }
                
                console.log('Возвращаем результат с фильтрацией по форме');
                return baseResult;
            } else {
                console.log('Нет сохраненного результата или результат не найден в данных');
            }
        }
        
        // Если в форме не нашли сохраненный результат или это не шаг формы, 
        // то возвращаем обычный результат из общей коллекции
        if (this.results[resultId]) {
            console.log('Возвращаем обычный результат:', resultId);
            return this.results[resultId];
        }
        
        console.log('Результат не найден в данных:', resultId);
        return null;
    }

    /**
     * Определение ID результата
     * @returns {string|null} Идентификатор результата или null
     */
    determineResult() {
        // Находим правило, которое ведет к результату
        const currentStepId = this.currentStep.id;
        const choice = this.userChoices[currentStepId];
        
        if (!choice) {
            return null;
        }
        
        // Ищем правило для текущего шага и выбора
        const matchingRule = this.rules.find(r => 
            r.stepId === currentStepId && 
            r.choice === choice
        );
        
        if (!matchingRule) {
            console.log('Правило не найдено для', currentStepId, choice);
            return null;
        }
        
        // Если это шаг формы предложения
        if (currentStepId === 'step4_form') {
            // Проверяем, есть ли resultType=form в правиле
            if (matchingRule.resultType === 'form') {
                console.log('Шаг формы с типом результата form:', choice);
                // Для формы предложения просто возвращаем выбор (affirmative, question, negative)
                // Этот выбор будет использован в getResult() для фильтрации формул и примеров
                return choice;
            }
        }
        
        // Проверяем, есть ли в правиле resultId
        if (matchingRule.resultId) {
            console.log('Найден resultId в правиле:', matchingRule.resultId);
            return matchingRule.resultId;
        }
        
        // Если нет результата, возвращаем null
        return null;
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