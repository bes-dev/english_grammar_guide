/**
 * Template - утилита для работы с шаблонами
 */
class Template {
    /**
     * Обработка шаблона и подстановка данных
     * @param {string} template - Шаблон с плейсхолдерами вида {{ключ}}
     * @param {object} data - Объект с данными для подстановки
     * @returns {string} Обработанный шаблон
     */
    static render(template, data) {
        return template.replace(/\{\{([\s\S]+?)\}\}/g, (match, expression) => {
            const keys = expression.trim().split('.');
            let value = data;

            for (const key of keys) {
                value = value[key];
                if (value === undefined || value === null) {
                    return '';
                }
            }

            return value;
        });
    }

    /**
     * Загрузка шаблона из файла
     * @param {string} url - Путь к файлу шаблона
     * @returns {Promise<string>} Содержимое шаблона
     */
    static async loadTemplate(url) {
        const response = await fetch(url);
        return await response.text();
    }
}

export default Template;