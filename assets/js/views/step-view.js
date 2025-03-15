import BaseView from './base-view.js';
import EventBus from '../utils/event-bus.js';

/**
 * StepView - представление шага алгоритма
 */
class StepView extends BaseView {
    constructor() {
        super('step-container');
        this.eventBus = EventBus.getInstance();
    }

    /**
     * Обработка шаблона шага алгоритма
     * @param {object} data - Данные для шаблона
     * @returns {string} HTML шага алгоритма
     */
    processTemplate(data) {
        // Получаем данные о пропущенных шагах
        const skippedSteps = window.store?.getState().skippedSteps || [];
        const skippedStepsJson = JSON.stringify(skippedSteps);

        return `
            <header>
                <div class="logo-small" id="step-logo">ВремяГид</div>
            </header>

            <div class="card fade-in" data-step-id="${data.steps[data.currentStepIndex]?.id || ''}" data-skipped-steps='${skippedStepsJson}'>
                <div class="step-indicator">
                    ${this.renderStepIndicator(data.steps, data.currentStepIndex)}
                </div>

                <div class="question-title">${data.title}</div>

                <div class="options-container">
                    ${this.renderOptions(data.options)}
                </div>

                <div class="navigation-buttons">
                    <button class="nav-btn back-btn">← Назад</button>
                    <button class="nav-btn next-btn" disabled>Далее →</button>
                </div>

                <div class="progress-bar">
                    <div class="progress-fill" style="width: ${data.progress}%"></div>
                </div>
            </div>

            <div class="hint-box fade-in delay-3">
                <div class="hint-header">
                    <div class="hint-icon">?</div>
                    <div class="hint-title">Подсказка</div>
                </div>
                <div class="hint-content">
                    ${data.hint}
                </div>
            </div>

            <div class="footer">
                © 2025 ВремяГид | Шаг ${this.getFixedStepNumber(data.currentStepIndex)} из 5: ${data.stepLabel}
            </div>
        `;
    }

    /**
     * Рендеринг индикатора шагов
     * @param {Array} steps - Массив шагов
     * @param {number} currentIndex - Индекс текущего шага
     * @returns {string} HTML индикатора шагов
     */
    renderStepIndicator(steps, currentIndex) {
        // Определяем 6 фиксированных шагов в соответствии с дизайном
        const fixedSteps = [
            { label: "Начало", id: "start" },
            { label: "Фокус", id: "step1" },
            { label: "Время", id: "step2" },
            { label: "Характер", id: "step3" },
            { label: "Форма", id: "step4_form" },
            { label: "Результат", id: "result" }
        ];
        
        // Определяем текущий шаг в контексте фиксированных шагов
        let currentFixedIndex = 0;
        
        // Получаем ID текущего шага, чтобы определить, какой это шаг логически
        const currentStepId = steps[currentIndex]?.id;
        
        if (currentIndex === 0) {
            // Если это первый шаг (Фокус), то мы на шаге 1 (после Начала)
            currentFixedIndex = 1;
        } else if (currentIndex === 1) {
            // Если это второй шаг (Время), то мы на шаге 2
            currentFixedIndex = 2;
        } else if (currentStepId && currentStepId === 'step4_form') {
            // Если это шаг Форма, то мы на шаге 4
            currentFixedIndex = 4;
        } else {
            // Если это любой из шагов Характера, то мы на шаге 3
            currentFixedIndex = 3;
        }
        
        // Получаем информацию о пропущенных шагах из хранилища
        const store = document.querySelector('.card')?.dataset;
        const skippedStepsString = store?.skippedSteps || '[]';
        let skippedSteps = [];
        
        try {
            skippedSteps = JSON.parse(skippedStepsString);
        } catch (e) {
            console.error('Ошибка при парсинге пропущенных шагов:', e);
        }
        
        // Получаем информацию о шагах из полной модели
        const stepsWithInfo = steps.map(step => {
            const fullStepData = window.fullStepsData?.find(s => s.id === step.id);
            return {
                ...step,
                skipMessage: fullStepData?.skipMessage || ''
            };
        });
        
        return fixedSteps.map((step, index) => {
            // Определяем статус шага
            let status = '';
            
            if (index < currentFixedIndex) {
                status = 'completed';
            } else if (index === currentFixedIndex) {
                status = 'active';
            }
            
            // Проверяем, является ли шаг пропущенным
            const isSkipped = skippedSteps.includes(step.id);
            if (isSkipped) {
                status = 'skipped';
            }
            
            // Определяем содержимое кружка
            let content = index;
            if (index === 0) {
                content = '✓'; // Начало всегда отмечено галочкой
            } else if (status === 'completed') {
                content = '✓'; // Завершенный шаг отмечен галочкой
            } else if (status === 'skipped') {
                content = '↷'; // Пропущенный шаг отмечен символом перенаправления
            }
            
            // Находим сообщение о пропуске, если есть
            const stepInfo = stepsWithInfo.find(s => s.id === step.id);
            const skipMessage = stepInfo?.skipMessage || '';
            
            // Если шаг пропущен и есть сообщение, добавляем его как title
            const titleAttr = isSkipped && skipMessage ? 
                `title="${skipMessage}"` : '';
            
            return `
                <div class="step ${status}" data-step-id="${step.id}" ${titleAttr}>
                    <div class="step-circle">${content}</div>
                    <div class="step-label">${step.label}</div>
                </div>
            `;
        }).join('');
    }

    /**
     * Рендеринг опций выбора
     * @param {Array} options - Массив опций
     * @returns {string} HTML опций выбора
     */
    renderOptions(options) {
        return options.map((option, index) => {
            return `
                <button class="option-btn fade-in delay-${index + 1}" data-value="${option.value}">
                    <span class="option-icon">${option.icon}</span>
                    <div class="option-content">
                        <div class="option-title">${option.title}</div>
                        <div class="option-description">${option.description}</div>
                    </div>
                </button>
            `;
        }).join('');
    }

    /**
     * Привязка обработчиков событий
     */
    bindEvents() {
        // Обработчик для логотипа
        const logo = this.element.querySelector('#step-logo');
        if (logo) {
            logo.style.cursor = 'pointer';
            logo.addEventListener('click', () => {
                this.eventBus.emit('navigate:home');
            });
        }
        
        // Обработчики для опций выбора (если они есть)
        const options = this.element.querySelectorAll('.option-btn');
        const nextBtn = this.element.querySelector('.next-btn');
        const backBtn = this.element.querySelector('.back-btn');

        if (options.length > 0) {
            options.forEach(option => {
                option.addEventListener('click', () => {
                    // Сброс выбранных опций
                    options.forEach(opt => opt.classList.remove('selected'));
    
                    // Выбор текущей опции
                    option.classList.add('selected');
    
                    // Активация кнопки "Далее"
                    if (nextBtn) {
                        nextBtn.disabled = false;
                    }
    
                    // Оповещение о выборе
                    this.eventBus.emit('option:selected', {
                        value: option.dataset.value
                    });
                });
            });
        }

        if (nextBtn) {
            nextBtn.addEventListener('click', () => {
                this.eventBus.emit('step:next');
            });
        }

        if (backBtn) {
            backBtn.addEventListener('click', () => {
                this.eventBus.emit('step:back');
            });
        }
    }

    /**
     * Обновление подсказки
     * @param {string} hintContent - HTML-содержимое подсказки
     */
    updateHint(hintContent) {
        const hintElement = this.element.querySelector('.hint-content');
        if (hintElement) {
            hintElement.innerHTML = hintContent;
        }
    }
    
    /**
     * Получение номера фиксированного шага
     * @param {number} currentIndex - Индекс шага в массиве шагов
     * @returns {number} Номер фиксированного шага
     */
    getFixedStepNumber(currentIndex) {
        // Получаем ID текущего шага из атрибута data-step-id на контейнере
        const currentStepId = this.element.querySelector('.card')?.dataset.stepId;
        
        if (currentIndex === 0) {
            return 1; // Фокус = шаг 1
        } else if (currentIndex === 1) {
            return 2; // Время = шаг 2
        } else if (currentStepId === 'step4_form') {
            return 4; // Форма = шаг 4
        } else {
            return 3; // Любой шаг характера = шаг 3
        }
    }
}

export default StepView;