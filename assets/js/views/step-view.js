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
        // Если это шаг 2 (время) и предыдущий выбор был "условие", отображаем заглушку
        if (data.isConditionalPlaceholder) {
            return this.renderConditionalPlaceholder(data);
        }

        return `
            <header>
                <div class="logo-small" id="step-logo">ВремяГид</div>
            </header>

            <div class="card fade-in">
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
     * Отображение заглушки для условных предложений на шаге 2
     * @param {object} data - Данные для шаблона
     * @returns {string} HTML заглушки
     */
    renderConditionalPlaceholder(data) {
        return `
            <header>
                <div class="logo-small" id="step-logo">ВремяГид</div>
            </header>

            <div class="card fade-in">
                <div class="step-indicator">
                    ${this.renderStepIndicator(data.steps, data.currentStepIndex)}
                </div>

                <div class="question-title">Особенности условных предложений</div>

                <div class="info-container fade-in">
                    <div class="info-content">
                        <p>Для условных предложений временной период определяется их типом</p>
                        <p>В условных предложениях (If-clauses) время действия уже заложено в структуру самого типа условного предложения. Поэтому вместо выбора времени, вам нужно определить тип условного предложения.</p>
                        <p>На следующем шаге вы сможете выбрать нужный тип условия в зависимости от вероятности события и временного периода.</p>
                    </div>
                    
                    <div class="examples-block fade-in delay-2">
                        <p><strong>Примеры:</strong></p>
                        <p>Пример 1: "If it rains tomorrow, I will stay at home."<br>
                        (Реальная возможность в будущем - First Conditional)</p>
                        <p>Пример 2: "If I had more money, I would buy a new car."<br>
                        (Маловероятная ситуация в настоящем - Second Conditional)</p>
                    </div>
                </div>

                <div class="navigation-buttons">
                    <button class="nav-btn back-btn">← Назад</button>
                    <button class="nav-btn next-btn">Далее →</button>
                </div>

                <div class="progress-bar">
                    <div class="progress-fill" style="width: ${data.progress}%"></div>
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
        // Определяем 5 фиксированных шагов в соответствии с дизайном
        const fixedSteps = [
            { label: "Начало" },
            { label: "Фокус" },
            { label: "Время" },
            { label: "Характер" },
            { label: "Результат" }
        ];
        
        // Определяем текущий шаг в контексте фиксированных шагов
        let currentFixedIndex = 0;
        
        if (currentIndex === 0) {
            // Если это первый шаг (Фокус), то мы на шаге 1 (после Начала)
            currentFixedIndex = 1;
        } else if (currentIndex === 1) {
            // Если это второй шаг (Время), то мы на шаге 2
            currentFixedIndex = 2;
        } else {
            // Если это любой из шагов Характера, то мы на шаге 3
            currentFixedIndex = 3;
        }
        
        return fixedSteps.map((step, index) => {
            const status = index < currentFixedIndex ? 'completed' :
                          index === currentFixedIndex ? 'active' : '';
            const content = index < currentFixedIndex ? '✓' : (index === 0 ? '✓' : index);

            return `
                <div class="step ${status}">
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
        if (currentIndex === 0) {
            return 1; // Фокус = шаг 1
        } else if (currentIndex === 1) {
            return 2; // Время = шаг 2
        } else {
            return 3; // Любой шаг характера = шаг 3
        }
    }
}

export default StepView;