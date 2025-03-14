import BaseView from './base-view.js';
import EventBus from '../utils/event-bus.js';

/**
 * ResultView - представление результата
 */
class ResultView extends BaseView {
    constructor() {
        super('result-container');
        this.eventBus = EventBus.getInstance();
    }

    /**
     * Обработка шаблона результата
     * @param {object} data - Данные результата
     * @returns {string} HTML результата
     */
    processTemplate(data) {
        if (!data || !data.result) {
            return `
                <header>
                    <div class="logo-small" id="result-logo">ВремяГид</div>
                </header>
                <div class="card fade-in">
                    <div class="result-header">
                        <div class="result-icon">❓</div>
                        <div class="result-title">Результат не найден</div>
                    </div>
                    <p>К сожалению, не удалось определить подходящую конструкцию для ваших выборов.</p>
                    <div class="action-buttons" style="margin-top: 20px;">
                        <button class="action-btn secondary-btn restart-btn">Начать заново</button>
                    </div>
                </div>
            `;
        }

        const result = data.result;

        return `
            <header>
                <div class="logo-small" id="result-logo">ВремяГид</div>
            </header>

            <div class="card fade-in">
                <div class="result-header">
                    <div class="result-icon">${result.icon}</div>
                    <div class="result-title">${result.title}</div>
                    <div class="result-subtitle">${result.subtitle}</div>
                </div>

                <div class="section-title">Формула построения</div>
                ${this.renderFormulas(result.formulas)}

                <div class="section-title">Примеры предложений</div>
                ${this.renderExamples(result.examples)}
            </div>

            <div class="card fade-in delay-1">
                <div class="section-title">Когда использовать</div>
                <ul class="usage-list">
                    ${result.usage.map(item => `<li>${item}</li>`).join('')}
                </ul>

                <div class="section-title">Слова-маркеры</div>
                <div class="markers-box">
                    ${result.markers.map(marker => `<div class="marker-tag">${marker}</div>`).join('')}
                </div>

                ${this.renderAdditionalInfo(result.additionalInfo)}
            </div>

            ${this.renderComparison(result.comparison)}

            <div class="card fade-in delay-3">
                <div class="action-buttons">
                    <button class="action-btn secondary-btn restart-btn">Начать заново</button>
                    <button class="action-btn primary-btn home-btn">На главную</button>
                </div>
            </div>

            <div class="footer">
                © 2025 ВремяГид | Результат: ${result.title}
            </div>
        `;
    }

    /**
     * Рендеринг формул
     * @param {Array} formulas - Массив формул
     * @returns {string} HTML формул
     */
    renderFormulas(formulas) {
        if (!formulas || formulas.length === 0) {
            return '';
        }

        return formulas.map(formula => `
            <div class="formula-box">
                <div class="formula-title">${formula.title}</div>
                <div class="formula-text">${formula.formula}</div>
            </div>
        `).join('');
    }

    /**
     * Рендеринг примеров
     * @param {Array} examples - Массив примеров
     * @returns {string} HTML примеров
     */
    renderExamples(examples) {
        if (!examples || examples.length === 0) {
            return '';
        }

        return examples.map((example, index) => `
            <div class="example-box">
                <div class="example-title">Пример ${index + 1}:</div>
                <div class="example-original">${example.original}</div>
                <div class="example-translation">${example.translation}</div>
            </div>
        `).join('');
    }

    /**
     * Рендеринг дополнительной информации
     * @param {object} additionalInfo - Объект с дополнительной информацией
     * @returns {string} HTML дополнительной информации
     */
    renderAdditionalInfo(additionalInfo) {
        if (!additionalInfo) {
            return '';
        }

        let examples = '';
        if (additionalInfo.examples && additionalInfo.examples.length > 0) {
            examples = additionalInfo.examples.map(example => {
                const icon = example.correct ? '✅' : '❌';
                const correction = example.correction ? ` (правильно: <em>${example.correction}</em>)` : '';
                return `<p>${icon} <em>${example.text}</em>${correction}</p>`;
            }).join('');
        }

        return `
            <div class="additional-info">
                <p><strong>Важно:</strong> ${additionalInfo.important}</p>
                ${examples}
            </div>
        `;
    }

    /**
     * Рендеринг сравнения с другими временами
     * @param {Array} comparison - Массив сравнений
     * @returns {string} HTML сравнений
     */
    renderComparison(comparison) {
        if (!comparison || comparison.length === 0) {
            return '';
        }

        return `
            <div class="card fade-in delay-2">
                <div class="section-title">Сравнение с другими способами выражения будущего</div>
                ${comparison.map(item => `
                    <div class="example-box">
                        <div class="example-title">${item.title}</div>
                        <div class="example-original">${item.first}</div>
                        <div class="example-translation">${item.second}</div>
                    </div>
                `).join('')}
            </div>
        `;
    }

    /**
     * Привязка обработчиков событий
     */
    bindEvents() {
        // Обработчик для логотипа
        const logo = this.element.querySelector('#result-logo');
        if (logo) {
            logo.style.cursor = 'pointer';
            logo.addEventListener('click', () => {
                this.eventBus.emit('navigate:home');
            });
        }
        
        // Обработчик для кнопки "Начать заново"
        const restartButton = this.element.querySelector('.restart-btn');
        if (restartButton) {
            restartButton.addEventListener('click', () => {
                this.eventBus.emit('restart:algorithm');
            });
        }

        // Обработчик для кнопки "На главную"
        const homeButton = this.element.querySelector('.home-btn');
        if (homeButton) {
            homeButton.addEventListener('click', () => {
                this.eventBus.emit('navigate:home');
            });
        }
    }
}

export default ResultView;