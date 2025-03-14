import BaseView from './base-view.js';
import EventBus from '../utils/event-bus.js';

/**
 * HelpView - представление для экрана "Справка"
 */
class HelpView extends BaseView {
    /**
     * @param {string} elementId - ID DOM-элемента для рендеринга
     */
    constructor(elementId) {
        super(elementId);
        this.eventBus = EventBus.getInstance();
    }

    /**
     * Обработка шаблона для экрана "Справка"
     * @param {object} data - Данные для подстановки в шаблон
     * @returns {string} Обработанный HTML
     */
    processTemplate(data = {}) {
        return `
            <div class="card fade-in">
                <header>
                    <div class="logo-small">ВремяГид</div>
                </header>
                
                <div class="nav-tabs">
                    <div class="nav-tab">🧠 ВремяГид</div>
                    <div class="nav-tab">⏰ Времена</div>
                    <div class="nav-tab">📢 Залоги</div>
                    <div class="nav-tab">🔀 Условные предложения</div>
                </div>

                <div class="card-title">Справочные материалы</div>
                <div class="card-description">
                    <p>Здесь вы найдете исчерпывающую информацию о работе с интерактивным помощником "ВремяГид", ответы на часто задаваемые вопросы и полезные грамматические подсказки.</p>
                </div>

                <div class="search-box">
                    <input type="text" class="search-input" placeholder="Поиск по справке...">
                    <button class="search-btn">Найти</button>
                </div>

                <div class="guide-sections fade-in delay-1">
                    <div class="guide-section">
                        <div class="section-icon">📖</div>
                        <div class="section-title">Руководство пользователя</div>
                        <div class="section-description">Подробное описание всех функций и возможностей интерактивного алгоритма ВремяГид.</div>
                    </div>
                    <div class="guide-section">
                        <div class="section-icon">🔍</div>
                        <div class="section-title">Грамматический справочник</div>
                        <div class="section-description">Полный справочник по грамматике английского языка с подробными объяснениями.</div>
                    </div>
                    <div class="guide-section">
                        <div class="section-icon">🧩</div>
                        <div class="section-title">Упражнения и тесты</div>
                        <div class="section-description">Интерактивные упражнения для закрепления теоретических знаний на практике.</div>
                    </div>
                    <div class="guide-section">
                        <div class="section-icon">🔄</div>
                        <div class="section-title">Обновления и новости</div>
                        <div class="section-description">Информация о последних обновлениях и новых функциях приложения.</div>
                    </div>
                </div>

                <div class="how-to-use fade-in delay-2">
                    <div class="card-title">Как пользоваться ВремяГид</div>

                    <div class="steps-container">
                        <div class="step-item">
                            <div class="step-number">1</div>
                            <div class="step-content">
                                <div class="step-title">Выберите фокус предложения</div>
                                <div class="step-description">Определите, хотите ли вы акцентировать внимание на исполнителе действия (активный залог), на объекте действия (пассивный залог) или на взаимосвязи между условием и результатом.</div>
                            </div>
                        </div>

                        <div class="step-item">
                            <div class="step-number">2</div>
                            <div class="step-content">
                                <div class="step-title">Укажите временной период</div>
                                <div class="step-description">Выберите, когда происходит (произошло/произойдет) действие — в прошлом, настоящем или будущем.</div>
                            </div>
                        </div>

                        <div class="step-item">
                            <div class="step-number">3</div>
                            <div class="step-content">
                                <div class="step-title">Определите характер действия</div>
                                <div class="step-description">Уточните особенности действия: его регулярность, длительность, завершенность и т.д.</div>
                            </div>
                        </div>

                        <div class="step-item">
                            <div class="step-number">4</div>
                            <div class="step-content">
                                <div class="step-title">Получите результат</div>
                                <div class="step-description">На основе ваших ответов алгоритм определит нужное грамматическое время и предоставит формулу построения, примеры использования и дополнительную информацию.</div>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="faq-accordion fade-in delay-3">
                    <div class="card-title">Часто задаваемые вопросы</div>

                    <div class="faq-item active">
                        <div class="faq-question">Чем ВремяГид отличается от других грамматических справочников?</div>
                        <div class="faq-answer">
                            <p>ВремяГид — это не просто справочник, а интерактивный помощник, который определяет нужное время на основе смысла, который вы хотите выразить. Вместо запоминания грамматических правил, вы отвечаете на простые вопросы о том, что хотите сказать, и алгоритм подсказывает нужную конструкцию.</p>
                        </div>
                    </div>

                    <div class="faq-item">
                        <div class="faq-question">Можно ли использовать ВремяГид без знания грамматической терминологии?</div>
                        <div class="faq-answer">
                            <p>Да, это одно из ключевых преимуществ ВремяГид. Алгоритм использует интуитивно понятные вопросы вместо сложных грамматических терминов. Вам не нужно знать, что такое "Present Perfect Continuous" — достаточно выбрать, что действие началось в прошлом и продолжается до сих пор.</p>
                        </div>
                    </div>

                    <div class="faq-item">
                        <div class="faq-question">Поддерживает ли ВремяГид все времена английского языка?</div>
                        <div class="faq-answer">
                            <p>Да, ВремяГид поддерживает все 12 основных времен английского языка в активном и пассивном залоге, а также все типы условных предложений. Всего алгоритм охватывает более 30 различных грамматических конструкций.</p>
                        </div>
                    </div>

                    <div class="faq-item">
                        <div class="faq-question">Как использовать ВремяГид для проверки уже составленных предложений?</div>
                        <div class="faq-answer">
                            <p>Если у вас уже есть готовое предложение, и вы хотите проверить правильность используемого времени, просто проанализируйте смысл этого предложения и ответьте на вопросы алгоритма. Полученный результат можно сравнить с вашим вариантом. Также в разделе "Упражнения" есть специальный режим "Распознавание", где вы можете тренироваться в определении времен.</p>
                        </div>
                    </div>
                </div>

                <div class="grammar-tip fade-in delay-3">
                    <div class="tip-title">
                        <span class="tip-icon">💡</span>
                        Грамматическая подсказка
                    </div>
                    <div class="tip-content">
                        <p>При выборе между <strong>Past Simple</strong> и <strong>Present Perfect</strong> обратите внимание на связь с настоящим:</p>
                        <ul style="margin-top: 10px; margin-left: 20px;">
                            <li>Используйте <strong>Past Simple</strong>, когда речь идет о завершенном действии в прошлом без связи с настоящим: "I visited London last year."</li>
                            <li>Используйте <strong>Present Perfect</strong>, когда действие имеет связь с настоящим моментом: "I have visited London three times (and could go again)."</li>
                        </ul>
                    </div>
                </div>

                <div class="contact-section fade-in delay-3">
                    <div class="contact-title">Остались вопросы?</div>
                    <div class="contact-description">Если у вас есть вопросы, предложения или замечания по работе ВремяГид, мы всегда готовы помочь.</div>
                    <a href="#" class="contact-btn">Связаться с нами</a>
                </div>
            </div>

            <div class="footer">
                © 2025 ВремяГид | Справочный центр
            </div>
        `;
    }

    /**
     * Привязка обработчиков событий
     */
    bindEvents() {
        // Привязка событий навигации
        const navTabs = this.element.querySelectorAll('.nav-tab');
        navTabs.forEach(tab => {
            tab.addEventListener('click', (e) => {
                const index = Array.from(navTabs).indexOf(tab);
                if (index === 0) { // Если вкладка "ВремяГид"
                    this.eventBus.emit('navigate:home');
                } else { // Любая другая вкладка
                    const tabNames = ['algorithm', 'tenses', 'voices', 'conditionals'];
                    this.eventBus.emit('carousel:change', { tab: tabNames[index] });
                }
            });
        });

        // Обработка FAQ аккордеона
        const faqQuestions = this.element.querySelectorAll('.faq-question');
        faqQuestions.forEach(question => {
            question.addEventListener('click', () => {
                const faqItem = question.parentElement;
                const isActive = faqItem.classList.contains('active');
                
                // Закрываем все FAQ элементы
                this.element.querySelectorAll('.faq-item').forEach(item => {
                    item.classList.remove('active');
                });
                
                // Если элемент не был активен, делаем его активным
                if (!isActive) {
                    faqItem.classList.add('active');
                }
            });
        });

        // Обработка карточек разделов справки
        const guideSections = this.element.querySelectorAll('.guide-section');
        guideSections.forEach(section => {
            section.addEventListener('click', () => {
                const title = section.querySelector('.section-title').textContent;
                alert(`Раздел "${title}" будет доступен в следующей версии приложения.`);
            });
        });

        // Кнопка связи
        const contactBtn = this.element.querySelector('.contact-btn');
        if (contactBtn) {
            contactBtn.addEventListener('click', (e) => {
                e.preventDefault();
                alert('Функция обратной связи будет доступна в следующей версии приложения.');
            });
        }

        // Поиск по справке
        const searchBtn = this.element.querySelector('.search-btn');
        if (searchBtn) {
            searchBtn.addEventListener('click', () => {
                const searchInput = this.element.querySelector('.search-input');
                const searchTerm = searchInput.value.trim();
                
                if (searchTerm) {
                    alert(`Поиск по запросу "${searchTerm}" будет доступен в следующей версии приложения.`);
                } else {
                    alert('Пожалуйста, введите поисковый запрос.');
                }
            });
        }

        // Кнопка возврата на главную через нажатие на пункт ВремяГид
        // обрабатывается в событиях выше
    }
}

export default HelpView;