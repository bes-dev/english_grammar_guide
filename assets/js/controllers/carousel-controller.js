import CarouselView from '../views/carousel-view.js';
import TensesView from '../views/tenses-view.js';
import VoicesView from '../views/voices-view.js';
import ConditionalsView from '../views/conditionals-view.js';
import EventBus from '../utils/event-bus.js';
import Router from '../router.js';

/**
 * CarouselController - контроллер для меню-карусели
 */
class CarouselController {
    constructor() {
        // Инициализация представлений
        this.tensesView = new TensesView('tenses-container');
        this.voicesView = new VoicesView('voices-container');
        this.conditionalsView = new ConditionalsView('conditionals-container');
        
        // Доступ к основным компонентам
        this.eventBus = EventBus.getInstance();
        this.router = Router.getInstance();
        
        // Активная вкладка
        this.activeTab = null;
        this.carouselContainer = document.getElementById('carousel-container');
        
        // Привязка обработчиков событий
        this.bindEvents();
    }

    /**
     * Инициализация контроллера
     * @param {object} params - Параметры маршрута
     * @returns {Promise} Промис, разрешающийся после инициализации
     */
    async initialize(params = {}) {
        // Если указана вкладка в параметрах, устанавливаем её
        if (params.tab) {
            this.activeTab = params.tab;
        } else {
            // По умолчанию - "ВремяГид"
            this.activeTab = 'algorithm';
        }
        
        return this;
    }

    /**
     * Рендеринг контента карусели
     */
    async render() {
        // Показываем контейнер карусели
        this.carouselContainer.classList.remove('hidden');
        
        // Скрываем все контейнеры экранов
        this.hideAllContainers();
        
        // Активируем выбранный экран
        await this.activateTab(this.activeTab);
    }
    
    /**
     * Скрытие всех контейнеров для экранов карусели
     */
    hideAllContainers() {
        const containers = [
            document.getElementById('tenses-container'),
            document.getElementById('voices-container'),
            document.getElementById('conditionals-container')
        ];
        
        containers.forEach(container => {
            if (container) {
                container.classList.add('hidden');
            }
        });
    }

    /**
     * Активация вкладки и рендеринг соответствующего представления
     * @param {string} tabName - Имя вкладки для активации
     */
    async activateTab(tabName) {
        // Сохраняем активную вкладку
        this.activeTab = tabName;
        
        // Определяем экран для отображения
        let container = null;
        
        switch (tabName) {
            case 'tenses':
                // Показываем и рендерим экран "Времена"
                container = document.getElementById('tenses-container');
                container.classList.remove('hidden');
                await this.tensesView.render();
                break;
                
            case 'voices':
                // Показываем и рендерим экран "Залоги"
                container = document.getElementById('voices-container');
                container.classList.remove('hidden');
                await this.voicesView.render();
                break;
                
            case 'conditionals':
                // Показываем и рендерим экран "Условные"
                container = document.getElementById('conditionals-container');
                container.classList.remove('hidden');
                await this.conditionalsView.render();
                break;
                
            case 'algorithm':
                // Возвращаемся на главный экран
                this.eventBus.emit('navigate:home');
                break;
                
            default:
                console.error(`Неизвестная вкладка: ${tabName}`);
                // По умолчанию показываем "Времена"
                this.activateTab('tenses');
                return;
        }
    }
    
    /**
     * Скрытие представления карусели
     */
    hideView() {
        this.carouselContainer.classList.add('hidden');
    }

    /**
     * Привязка обработчиков событий
     */
    bindEvents() {
        // Обработка изменения вкладки в карусели
        this.eventBus.subscribe('carousel:change', (data) => {
            // Переключаем экран
            if (data.tab === 'algorithm') {
                // Если выбран "Алгоритм", переходим на главную страницу
                this.eventBus.emit('navigate:home');
            } else {
                // Иначе активируем соответствующую вкладку
                this.activateTab(data.tab);
                
                // Обновляем URL с новым параметром вкладки
                this.router.navigate('/carousel', { tab: data.tab });
            }
        });
    }
}

export default CarouselController;