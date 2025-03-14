import BaseView from './base-view.js';
import EventBus from '../utils/event-bus.js';

/**
 * TenseDetailView - представление для экрана с детальной информацией о времени
 */
class TenseDetailView extends BaseView {
    /**
     * @param {string} elementId - ID DOM-элемента для рендеринга
     */
    constructor(elementId) {
        super(elementId);
        this.eventBus = EventBus.getInstance();
        this.tenseData = null;
    }
    
    /**
     * Установка данных о времени
     * @param {object} tenseData - Данные о времени
     */
    async setTenseData(tenseData) {
        console.log('TenseDetailView setTenseData:', tenseData ? tenseData.title : 'no data');
        this.tenseData = tenseData;
        return this;
    }

    /**
     * Обработка шаблона для экрана с детальной информацией о времени
     * @param {object} data - Данные для подстановки в шаблон
     * @returns {string} Обработанный HTML
     */
    processTemplate(data) {
        console.log('TenseDetailView processTemplate, data:', data ? data.title : 'no data provided');
        console.log('TenseDetailView processTemplate, this.tenseData:', this.tenseData ? this.tenseData.title : 'no data in this.tenseData');
        
        // Используем data если передано, иначе используем this.tenseData
        const tenseData = data || this.tenseData;
        if (!tenseData) {
            return `
                <header>
                    <div class="logo-small" id="detail-logo">ВремяГид</div>
                </header>
                <div class="card fade-in">
                    <div class="result-header">
                        <div class="result-icon">❓</div>
                        <div class="result-title">Информация не найдена</div>
                    </div>
                    <p>К сожалению, не удалось загрузить информацию о выбранном времени.</p>
                    <div class="action-buttons" style="margin-top: 20px;">
                        <button class="action-btn secondary-btn back-btn">Назад</button>
                        <button class="action-btn primary-btn home-btn">На главную</button>
                    </div>
                </div>
            `;
        }


        return `
            <header>
                <div class="logo-small" id="detail-logo">ВремяГид</div>
            </header>

            <div class="card fade-in">
                <div class="result-header">
                    <div class="result-icon">${tenseData.icon}</div>
                    <div class="result-title">${tenseData.title}</div>
                    <div class="result-subtitle">${tenseData.subtitle}</div>
                </div>

                <div class="section-title">Формула построения</div>
                ${this.renderFormulas(tenseData.formulas)}

                <div class="section-title">Примеры предложений</div>
                ${this.renderExamples(tenseData.examples)}
            </div>

            <div class="card fade-in delay-1">
                <div class="section-title">Когда использовать</div>
                <ul class="usage-list">
                    ${tenseData.usage.map(item => `<li>${item}</li>`).join('')}
                </ul>

                <div class="section-title">Слова-маркеры</div>
                <div class="markers-box">
                    ${tenseData.markers.map(marker => `<div class="marker-tag">${marker}</div>`).join('')}
                </div>

                ${this.renderAdditionalInfo(tenseData.additionalInfo)}
            </div>

            ${this.renderComparison(tenseData.comparison)}

            <div class="card fade-in delay-3">
                <div class="action-buttons">
                    <button class="action-btn secondary-btn back-btn">Назад</button>
                    <button class="action-btn primary-btn home-btn">На главную</button>
                </div>
            </div>

            <div class="footer">
                © 2025 ВремяГид | ${tenseData.title}
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
                <div class="section-title">Сравнение с другими временами</div>
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
        const logo = this.element.querySelector('#detail-logo');
        if (logo) {
            logo.style.cursor = 'pointer';
            logo.addEventListener('click', () => {
                this.eventBus.emit('navigate:home');
            });
        }
        
        // Обработчик для кнопки "Назад"
        const backButton = this.element.querySelector('.back-btn');
        if (backButton) {
            backButton.addEventListener('click', () => {
                this.eventBus.emit('tense-detail:back');
            });
        }

        // Обработчик для кнопки "На главную"
        const homeButton = this.element.querySelector('.home-btn');
        if (homeButton) {
            homeButton.addEventListener('click', () => {
                this.eventBus.emit('tense-detail:home');
            });
        }
    }
    
    /**
     * Скрытие представления
     */
    hideView() {
        if (this.element) {
            this.element.classList.add('hidden');
        }
    }
}

export default TenseDetailView;