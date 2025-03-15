import BaseView from './base-view.js';
import EventBus from '../utils/event-bus.js';
import Store from '../store.js';

/**
 * MainView - представление главной страницы
 */
class MainView extends BaseView {
    constructor() {
        super('main-container');
        this.eventBus = EventBus.getInstance();
        this.store = Store.getInstance();
        this.tabContents = {
            'algorithm': `
                <div class="tab-content">
                    <h3>🧠 ВремяГид</h3>
                    <p>Пошаговый процесс определения правильного времени в английском языке:</p>
                    <ul>
                        <li><strong>Шаг 1:</strong> Выбор фокуса (на исполнителе, объекте или условии)</li>
                        <li><strong>Шаг 2:</strong> Определение временного периода (прошлое, настоящее, будущее)</li>
                        <li><strong>Шаг 3:</strong> Уточнение характера действия (регулярное, в процессе, завершенное и т.д.)</li>
                    </ul>
                    <p>Алгоритм проведет вас через серию простых вопросов, чтобы определить нужное время.</p>
                    <div class="action-buttons">
                        <button class="btn primary-btn start-btn">Начать определение времени</button>
                        <button class="btn secondary-btn carousel-btn" data-tab="tenses">Открыть справочник</button>
                    </div>
                </div>
            `,
            'tenses': `
                <div class="tab-content">
                    <h3>⏰ Времена</h3>
                    <p>Обзор 16 времен английского языка:</p>
                    <div class="tenses-grid">
                        <div class="tense-group">
                            <h4>Настоящее время</h4>
                            <ul>
                                <li>Present Simple</li>
                                <li>Present Continuous</li>
                                <li>Present Perfect</li>
                                <li>Present Perfect Continuous</li>
                            </ul>
                        </div>
                        <div class="tense-group">
                            <h4>Прошедшее время</h4>
                            <ul>
                                <li>Past Simple</li>
                                <li>Past Continuous</li>
                                <li>Past Perfect</li>
                                <li>Past Perfect Continuous</li>
                            </ul>
                        </div>
                        <div class="tense-group">
                            <h4>Будущее время</h4>
                            <ul>
                                <li>Future Simple</li>
                                <li>Future Continuous</li>
                                <li>Future Perfect</li>
                                <li>Future Perfect Continuous</li>
                                <li>be going to</li>
                                <li>Present для будущего</li>
                            </ul>
                        </div>
                    </div>
                </div>
            `,
            'passive': `
                <div class="tab-content">
                    <h3>📢 Залоги</h3>
                    <p>Пассивные конструкции в английском языке:</p>
                    <div class="passive-grid">
                        <div class="passive-group">
                            <h4>Настоящее время</h4>
                            <ul>
                                <li>Present Simple Passive</li>
                                <li>Present Continuous Passive</li>
                                <li>Present Perfect Passive</li>
                            </ul>
                        </div>
                        <div class="passive-group">
                            <h4>Прошедшее время</h4>
                            <ul>
                                <li>Past Simple Passive</li>
                                <li>Past Continuous Passive</li>
                                <li>Past Perfect Passive</li>
                            </ul>
                        </div>
                        <div class="passive-group">
                            <h4>Будущее время</h4>
                            <ul>
                                <li>Future Simple Passive</li>
                                <li>Future Perfect Passive</li>
                            </ul>
                        </div>
                    </div>
                </div>
            `,
            'conditionals': `
                <div class="tab-content">
                    <h3>🔀 Условные предложения</h3>
                    <p>Пять типов условных предложений в английском языке:</p>
                    <div class="conditionals-list">
                        <div class="conditional-item">
                            <h4>Zero Conditional</h4>
                            <p>Используется для общих истин и естественных законов.</p>
                            <p><em>Пример:</em> If water reaches 100°C, it boils.</p>
                        </div>
                        <div class="conditional-item">
                            <h4>First Conditional</h4>
                            <p>Реальные условия в настоящем или будущем.</p>
                            <p><em>Пример:</em> If it rains tomorrow, I will stay at home.</p>
                        </div>
                        <div class="conditional-item">
                            <h4>Second Conditional</h4>
                            <p>Гипотетические условия в настоящем или будущем.</p>
                            <p><em>Пример:</em> If I won the lottery, I would travel the world.</p>
                        </div>
                        <div class="conditional-item">
                            <h4>Third Conditional</h4>
                            <p>Нереальные условия в прошлом.</p>
                            <p><em>Пример:</em> If I had studied harder, I would have passed the exam.</p>
                        </div>
                        <div class="conditional-item">
                            <h4>Mixed Conditional</h4>
                            <p>Смешанные условия (прошлое-настоящее).</p>
                            <p><em>Пример:</em> If I hadn't missed the train, I wouldn't be late now.</p>
                        </div>
                    </div>
                </div>
            `,
        };
    }

    /**
     * Обработка шаблона главной страницы
     * @returns {string} HTML главной страницы
     */
    processTemplate() {
        // Получаем текущую активную вкладку из хранилища
        const activeTab = this.store.getActiveTab();
        
        return `
            <header>
                <div class="logo" id="main-logo">ВремяГид</div>
                <div class="tagline">Интерактивный помощник для определения нужного времени в английском языке</div>
            </header>

            <div class="card fade-in">
                <div class="card-title">Добро пожаловать в ВремяГид!</div>
                <div class="card-description">
                    <p>ВремяГид — это интеллектуальный алгоритм, который поможет вам выбрать правильное время в английском языке независимо от вашего уровня знания грамматики.</p>
                    <p style="margin-top: 10px;">Просто ответьте на несколько простых вопросов о том, что вы хотите сказать, и алгоритм подскажет нужную конструкцию, формулу и примеры использования.</p>
                </div>
                <div class="action-buttons">
                    <button class="btn primary-btn start-btn">Начать определение времени</button>
                </div>
            </div>


            <div class="card fade-in delay-1">
                <div class="nav-tabs">
                    <div class="nav-tab ${activeTab === 'algorithm' ? 'active' : ''}" data-tab="algorithm">🧠 ВремяГид</div>
                    <div class="nav-tab ${activeTab === 'tenses' ? 'active' : ''}" data-tab="tenses">⏰ Времена</div>
                    <div class="nav-tab ${activeTab === 'passive' ? 'active' : ''}" data-tab="passive">📢 Залоги</div>
                    <div class="nav-tab ${activeTab === 'conditionals' ? 'active' : ''}" data-tab="conditionals">🔀 Условные предложения</div>
                </div>
                <div class="card-description" style="margin-top: 15px;">
                    <p>Выберите раздел приложения для быстрого доступа к нужной информации. ВремяГид поможет определить время, таблица времен содержит все правила и формулы, а разделы по пассивному залогу и условным предложениям помогут в изучении этих важных грамматических конструкций.</p>
                </div>
            </div>

            <div class="footer">
                © 2025 ВремяГид | Интеллектуальный помощник в изучении английской грамматики
            </div>
        `;
    }

    /**
     * Привязка обработчиков событий
     */
    bindEvents() {
        // Обработчик для логотипа
        const logo = this.element.querySelector('#main-logo');
        if (logo) {
            logo.style.cursor = 'pointer';
            logo.addEventListener('click', () => {
                this.eventBus.emit('navigate:home');
            });
        }
        
        // Обработчик для кнопки "Начать"
        const startButtons = this.element.querySelectorAll('.start-btn');
        startButtons.forEach(button => {
            button.addEventListener('click', () => {
                this.eventBus.emit('start:algorithm', { id: 'vremya-guide' });
            });
        });
        
        // Обработчик для кнопки "Открыть справочник"
        const carouselButtons = this.element.querySelectorAll('.carousel-btn');
        carouselButtons.forEach(button => {
            button.addEventListener('click', () => {
                const tab = button.getAttribute('data-tab') || 'tenses';
                this.eventBus.emit('navigate:carousel', { tab });
            });
        });

        // Обработчики для навигационных вкладок
        const navTabs = this.element.querySelectorAll('.nav-tab');
        navTabs.forEach(tab => {
            tab.addEventListener('click', (event) => {
                // Удаляем класс active у всех вкладок
                navTabs.forEach(t => {
                    t.classList.remove('active');
                });
                
                // Добавляем класс active к текущей вкладке
                event.currentTarget.classList.add('active');
                
                // Получаем идентификатор вкладки из атрибута data-tab
                const tabId = event.currentTarget.getAttribute('data-tab');
                
                // Сохраняем активную вкладку в хранилище
                this.store.setActiveTab(tabId);
                
                // На главной странице кнопка "ВремяГид" (algorithm) ничего не делает
                // Для остальных табов открываем соответствующую карусель
                if (tabId !== 'algorithm') {
                    const carouselTabMapping = {
                        'tenses': 'tenses',
                        'passive': 'voices',
                        'conditionals': 'conditionals'
                    };
                    this.eventBus.emit('navigate:carousel', { tab: carouselTabMapping[tabId] });
                }
            });
        });
    }
}

export default MainView;