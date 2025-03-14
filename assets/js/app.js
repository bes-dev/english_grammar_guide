import Router from './router.js';
import AlgorithmModel from './models/algorithm.js';
import StepController from './controllers/step-controller.js';
import ResultController from './controllers/result-controller.js';
import MainController from './controllers/main-controller.js';
import CarouselController from './controllers/carousel-controller.js';
import TenseDetailController from './controllers/tense-detail-controller.js';
import EventBus from './utils/event-bus.js';
import Store from './store.js';
import PathUtils from './utils/path-utils.js';

// Вывод отладочной информации
console.log('ВремяГид: Инициализация приложения');
console.log('Базовый путь:', PathUtils.getBasePath());
console.log('Текущий URL:', window.location.href);
console.log('Относительный путь:', PathUtils.getRelativePath(window.location.pathname));

// Скрыть индикатор загрузки сразу при загрузке скрипта, для перестраховки
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        const loadingIndicator = document.getElementById('loading-indicator');
        if (loadingIndicator) {
            loadingIndicator.classList.add('hidden');
        }
        console.log('ВремяГид: Индикатор загрузки скрыт принудительно');
    }, 2000); // Даем 2 секунды на загрузку
});

/**
 * App - основной класс приложения
 */
class App {
    constructor() {
        this.router = Router.getInstance();
        this.store = Store.getInstance();
        this.eventBus = EventBus.getInstance();
        
        // Инициализация маршрутов
        this.initializeRoutes();
        
        // Подписка на события
        this.bindEvents();
    }

    /**
     * Инициализация маршрутов и контроллеров
     */
    initializeRoutes() {
        // Создание модели алгоритма
        const algorithmModel = new AlgorithmModel('vremya-guide');
        
        // Инициализация контроллеров
        const mainController = new MainController();
        const stepController = new StepController(algorithmModel);
        const resultController = new ResultController(algorithmModel);
        const carouselController = new CarouselController();
        const tenseDetailController = new TenseDetailController();
        
        // Добавление маршрутов
        this.router
            .addRoute('/', mainController)
            .addRoute('/step', stepController)
            .addRoute('/result', resultController)
            .addRoute('/carousel', carouselController)
            .addRoute('/tense-detail', tenseDetailController);
    }

    /**
     * Привязка обработчиков событий
     */
    bindEvents() {
        this.eventBus.subscribe('start:algorithm', (data) => {
            // Сохранение выбранного алгоритма
            this.store.setAlgorithm(data.id);
            
            // Сброс состояния при начале нового прохождения
            this.store.clearState();
            
            // Переход к первому шагу алгоритма
            this.router.navigate('/step');
        });
        
        this.eventBus.subscribe('algorithm:complete', () => {
            // Переход к результату
            this.router.navigate('/result');
        });
        
        this.eventBus.subscribe('restart:algorithm', () => {
            // Полный сброс состояния и модели
            this.store.clearState();
            
            // Навигация к первому шагу с параметром сброса
            this.router.navigate('/step', { reset: 'true' });
        });
        
        this.eventBus.subscribe('return:main', () => {
            // Возврат на главную страницу
            this.router.navigate('/');
        });
        
        this.eventBus.subscribe('navigate:home', () => {
            // Переход на главную страницу
            this.router.navigate('/');
        });
        
        this.eventBus.subscribe('navigate:carousel', (data) => {
            // Переход к меню карусели с выбранной вкладкой
            this.router.navigate('/carousel', { tab: data.tab || 'tenses' });
        });
        
        this.eventBus.subscribe('navigate:tense-detail', (data) => {
            // Переход к экрану с детальной информацией о времени
            this.router.navigate('/tense-detail', { id: data.id });
        });
    }

    /**
     * Запуск приложения
     */
    start() {
        try {
            // Запуск маршрутизатора
            this.router.start();
            
            // Скрытие индикатора загрузки
            this.hideLoadingIndicator();
            
            console.log('ВремяГид: Приложение успешно запущено');
        } catch (error) {
            console.error('Ошибка при запуске приложения:', error);
            if (window.showError) {
                window.showError('Ошибка при запуске приложения: ' + error.message);
            }
            // Даже при ошибке скрываем индикатор загрузки
            this.hideLoadingIndicator();
        }
    }
    
    /**
     * Скрытие индикатора загрузки
     */
    hideLoadingIndicator() {
        // Пытаемся скрыть индикатор загрузки
        const loadingIndicator = document.getElementById('loading-indicator');
        if (loadingIndicator) {
            loadingIndicator.classList.add('hidden');
            console.log('ВремяГид: Индикатор загрузки скрыт');
        } else {
            console.warn('ВремяГид: Не удалось найти индикатор загрузки');
            // Если элемент не найден, пробуем найти его через 500 мс
            setTimeout(() => {
                const indicator = document.getElementById('loading-indicator');
                if (indicator) {
                    indicator.classList.add('hidden');
                    console.log('ВремяГид: Индикатор загрузки скрыт с задержкой');
                }
            }, 500);
        }
    }
}

// Инициализация приложения при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    try {
        console.log('ВремяГид: DOM загружен, инициализация приложения');
        const app = new App();
        app.start();
    } catch (error) {
        console.error('Ошибка при инициализации приложения:', error);
        if (window.showError) {
            window.showError('Ошибка при инициализации приложения: ' + error.message);
        }
        
        // Скрываем индикатор загрузки даже при ошибке
        const loadingIndicator = document.getElementById('loading-indicator');
        if (loadingIndicator) {
            loadingIndicator.classList.add('hidden');
        }
    }
});

// Дополнительный скрипт, который гарантировано скроет индикатор загрузки через 10 секунд
// Это обеспечит возможность взаимодействия с приложением даже при проблемах с инициализацией
window.addEventListener('load', function() {
    setTimeout(function() {
        const loadingIndicator = document.getElementById('loading-indicator');
        if (loadingIndicator && !loadingIndicator.classList.contains('hidden')) {
            console.warn('ВремяГид: Принудительное скрытие индикатора загрузки по таймауту (10 сек)');
            loadingIndicator.classList.add('hidden');
        }
    }, 10000); // 10 секунд максимум для индикатора загрузки
});

export default App;