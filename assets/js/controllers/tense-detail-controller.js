import TenseDetailView from '../views/tense-detail-view.js';
import EventBus from '../utils/event-bus.js';
import Router from '../router.js';

/**
 * TenseDetailController - контроллер для экрана с детальной информацией о времени
 */
class TenseDetailController {
    constructor() {
        this.view = new TenseDetailView('tense-detail-container');
        this.eventBus = EventBus.getInstance();
        this.router = Router.getInstance();
        this.tenseId = null;
        
        // Привязка обработчиков событий
        this.bindEvents();
    }
    
    /**
     * Инициализация контроллера
     * @param {object} params - Параметры маршрута
     * @returns {Promise} Промис, разрешающийся после инициализации
     */
    async initialize(params = {}) {
        // Отладочное сообщение
        console.log('TenseDetailController initialize with params:', params);
        
        // Получаем ID времени из параметров
        this.tenseId = params.id;
        
        if (!this.tenseId) {
            // Если ID времени не указан, перенаправляем на главную
            console.error('Tense ID is not specified');
            this.router.navigate('/carousel', { tab: 'tenses' });
            return this;
        }
        
        try {
            console.log('Loading data for tense ID:', this.tenseId);
            
            // Загружаем информацию о времени
            const response = await fetch(`config/algorithms/vremya-guide/results.json`);
            if (!response.ok) {
                throw new Error(`Ошибка загрузки данных: ${response.status}`);
            }
            
            const results = await response.json();
            console.log('Results loaded, available IDs:', Object.keys(results));
            
            this.tenseData = results[this.tenseId];
            
            if (!this.tenseData) {
                throw new Error(`Информация о времени ${this.tenseId} не найдена`);
            }
            
            console.log('Tense data found:', this.tenseData.title);
            await this.view.setTenseData(this.tenseData);
        } catch (error) {
            console.error('Ошибка при загрузке информации о времени:', error);
            // В случае ошибки возвращаемся к списку времен
            this.router.navigate('/carousel', { tab: 'tenses' });
        }
        
        return this;
    }
    
    /**
     * Рендеринг представления
     */
    render() {
        console.log('TenseDetailController.render() called, tenseData:', this.tenseData ? this.tenseData.title : 'no data');
        // Рендерим и показываем представление
        this.view.render(this.tenseData);
        this.view.show();
    }
    
    /**
     * Скрытие представления
     */
    hideView() {
        this.view.hideView();
    }
    
    /**
     * Привязка обработчиков событий
     */
    bindEvents() {
        // Обработка возврата назад
        this.eventBus.subscribe('tense-detail:back', () => {
            this.router.navigate('/carousel', { tab: 'tenses' });
        });
        
        // Обработка перехода на главную
        this.eventBus.subscribe('tense-detail:home', () => {
            this.router.navigate('/');
        });
    }
}

export default TenseDetailController;