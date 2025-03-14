/**
 * Storage - утилита для работы с localStorage
 */
class Storage {
    /**
     * Сохранение данных в localStorage
     * @param {string} key - Ключ для сохранения
     * @param {any} value - Данные для сохранения
     */
    static save(key, value) {
        try {
            const serializedValue = JSON.stringify(value);
            localStorage.setItem(key, serializedValue);
            return true;
        } catch (error) {
            console.error('Ошибка при сохранении в localStorage:', error);
            return false;
        }
    }

    /**
     * Получение данных из localStorage
     * @param {string} key - Ключ для получения данных
     * @param {any} defaultValue - Значение по умолчанию
     * @returns {any} Данные из localStorage или значение по умолчанию
     */
    static load(key, defaultValue = null) {
        try {
            const serializedValue = localStorage.getItem(key);
            if (serializedValue === null) {
                return defaultValue;
            }
            return JSON.parse(serializedValue);
        } catch (error) {
            console.error('Ошибка при загрузке из localStorage:', error);
            return defaultValue;
        }
    }

    /**
     * Удаление данных из localStorage
     * @param {string} key - Ключ для удаления
     */
    static remove(key) {
        try {
            localStorage.removeItem(key);
            return true;
        } catch (error) {
            console.error('Ошибка при удалении из localStorage:', error);
            return false;
        }
    }

    /**
     * Очистка всего localStorage
     */
    static clear() {
        try {
            localStorage.clear();
            return true;
        } catch (error) {
            console.error('Ошибка при очистке localStorage:', error);
            return false;
        }
    }
}

export default Storage;