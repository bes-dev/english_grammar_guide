/**
 * EventBus - система событий для коммуникации между компонентами приложения
 */
class EventBus {
    constructor() {
        this.subscribers = {};
    }

    static getInstance() {
        if (!EventBus.instance) {
            EventBus.instance = new EventBus();
        }
        return EventBus.instance;
    }

    /**
     * Подписка на событие
     * @param {string} event - Название события
     * @param {function} callback - Функция-обработчик
     * @returns {function} Функция для отписки
     */
    subscribe(event, callback) {
        if (!this.subscribers[event]) {
            this.subscribers[event] = [];
        }

        this.subscribers[event].push(callback);

        // Возвращаем функцию для отписки
        return () => {
            this.subscribers[event] = this.subscribers[event].filter(
                cb => cb !== callback
            );
        };
    }

    /**
     * Публикация события
     * @param {string} event - Название события
     * @param {any} data - Данные, передаваемые обработчикам
     */
    emit(event, data) {
        if (!this.subscribers[event]) {
            return;
        }

        this.subscribers[event].forEach(callback => {
            callback(data);
        });
    }
}

export default EventBus;