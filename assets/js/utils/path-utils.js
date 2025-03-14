/**
 * Утилиты для работы с путями в приложении
 */
class PathUtils {
    /**
     * Возвращает базовый путь приложения
     * @returns {string} Базовый путь
     */
    static getBasePath() {
        // Сначала проверяем наличие тега base
        const baseTag = document.querySelector('base');
        if (baseTag && baseTag.getAttribute('href')) {
            return baseTag.getAttribute('href');
        }
        
        // Если тега base нет, вычисляем путь на основе расположения index.html
        const pathSegments = window.location.pathname.split('/');
        let basePath = '/';
        
        // Находим сегмент с index.html или последний пустой сегмент
        for (let i = pathSegments.length - 1; i >= 0; i--) {
            if (pathSegments[i] === '' || pathSegments[i].includes('index.html')) {
                // Составляем базовый путь из всех сегментов до текущего
                basePath = pathSegments.slice(0, i).join('/');
                if (basePath) {
                    basePath = '/' + basePath + '/';
                } else {
                    basePath = '/';
                }
                break;
            }
        }
        
        return basePath;
    }
    
    /**
     * Формирует абсолютный путь с учетом базового пути приложения
     * @param {string} relativePath - Относительный путь (с или без начального слеша)
     * @returns {string} Абсолютный путь
     */
    static getAbsolutePath(relativePath) {
        const basePath = this.getBasePath();
        // Если путь уже начинается с базового пути, возвращаем его как есть
        if (relativePath.startsWith(basePath)) {
            return relativePath;
        }
        
        // Удаляем начальный слеш, если он есть, чтобы избежать дублирования
        const normalizedPath = relativePath.replace(/^\//, '');
        return `${basePath}${normalizedPath}`;
    }
    
    /**
     * Извлекает относительный путь из абсолютного, удаляя базовый путь
     * @param {string} absolutePath - Абсолютный путь (например, window.location.pathname)
     * @returns {string} Относительный путь (начинается с /)
     */
    static getRelativePath(absolutePath) {
        const basePath = this.getBasePath();
        
        // Если путь начинается с базового пути, удаляем базовый путь
        if (absolutePath.startsWith(basePath)) {
            const relativePath = absolutePath.substring(basePath.length);
            return relativePath.startsWith('/') ? relativePath : `/${relativePath}`;
        }
        
        // Если путь не начинается с базового пути, возвращаем его как есть с начальным слешем
        return absolutePath.startsWith('/') ? absolutePath : `/${absolutePath}`;
    }
}

export default PathUtils;