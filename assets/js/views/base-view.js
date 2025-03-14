/**
 * BaseView - базовый класс для всех представлений
 */
class BaseView {
    /**
     * @param {string} elementId - ID DOM-элемента для рендеринга
     */
    constructor(elementId) {
        this.element = document.getElementById(elementId);
        if (!this.element) {
            console.error(`Элемент с ID "${elementId}" не найден`);
        }
    }

    /**
     * Рендеринг представления
     * @param {object} data - Данные для рендеринга
     * @returns {BaseView} Текущий экземпляр представления
     */
    async render(data) {
        console.log('BaseView.render() for element:', this.element ? this.element.id : 'no element');
        if (!this.element) {
            console.error('Cannot render: element is null or undefined');
            return this;
        }
        
        const html = this.processTemplate(data);
        console.log('Rendered HTML length:', html ? html.length : 0);
        this.element.innerHTML = html;
        this.bindEvents();

        return this;
    }
    
    /**
     * Добавляет содержимое к элементу, не заменяя его полностью
     * @param {object} data - Данные для рендеринга
     * @returns {BaseView} Текущий экземпляр представления
     */
    async append(data) {
        if (!this.element) return this;
        
        const html = this.processTemplate(data);
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = html;
        
        Array.from(tempDiv.children).forEach(child => {
            this.element.appendChild(child);
        });
        
        this.bindEvents();
        
        return this;
    }

    /**
     * Обработка шаблона
     * @param {object} data - Данные для подстановки в шаблон
     * @returns {string} Обработанный HTML
     */
    processTemplate(data) {
        // Переопределяется в дочерних классах
        return '';
    }

    /**
     * Привязка обработчиков событий
     */
    bindEvents() {
        // Переопределяется в дочерних классах
    }

    /**
     * Показать представление
     * @returns {BaseView} Текущий экземпляр представления
     */
    show() {
        console.log('BaseView.show() for element:', this.element ? this.element.id : 'no element');
        if (this.element) {
            this.element.classList.remove('hidden');
        }
        return this;
    }

    /**
     * Скрыть представление
     * @returns {BaseView} Текущий экземпляр представления
     */
    hide() {
        if (this.element) {
            this.element.classList.add('hidden');
        }
        return this;
    }

    /**
     * Очистка представления
     * @returns {BaseView} Текущий экземпляр представления
     */
    clear() {
        if (this.element) {
            this.element.innerHTML = '';
        }
        return this;
    }
}

export default BaseView;