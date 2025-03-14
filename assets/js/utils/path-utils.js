/**
 * Утилиты для работы с путями в приложении
 */
class PathUtils {
    /**
     * Возвращает базовый путь приложения
     * @returns {string} Базовый путь
     */
    static getBasePath() {
        try {
            // Сначала проверяем наличие тега base
            const baseTag = document.querySelector('base');
            if (baseTag && baseTag.getAttribute('href')) {
                return baseTag.getAttribute('href');
            }
            
            // Для GitHub Pages используем жестко заданный путь
            if (window.location.hostname.includes('github.io')) {
                const repoName = window.location.pathname.split('/')[1];
                if (repoName) {
                    return `/${repoName}/`;
                }
            }
            
            return '/';
        } catch (error) {
            console.error('Ошибка при определении базового пути:', error);
            return '/';
        }
    }
    
    /**
     * Формирует абсолютный путь с учетом базового пути приложения
     * @param {string} relativePath - Относительный путь (с или без начального слеша)
     * @returns {string} Абсолютный путь
     */
    static getAbsolutePath(relativePath) {
        try {
            const basePath = this.getBasePath();
            
            // Если путь уже начинается с базового пути, возвращаем его как есть
            if (relativePath.startsWith(basePath)) {
                return relativePath;
            }
            
            // Удаляем начальный слеш, если он есть, чтобы избежать дублирования
            const normalizedPath = relativePath.replace(/^\//, '');
            return `${basePath}${normalizedPath}`;
        } catch (error) {
            console.error('Ошибка при формировании абсолютного пути:', error);
            return relativePath;
        }
    }
    
    /**
     * Извлекает относительный путь из абсолютного, удаляя базовый путь
     * @param {string} absolutePath - Абсолютный путь (например, window.location.pathname)
     * @returns {string} Относительный путь (начинается с /)
     */
    static getRelativePath(absolutePath) {
        try {
            const basePath = this.getBasePath();
            
            // Если путь начинается с базового пути, удаляем базовый путь
            if (absolutePath.startsWith(basePath)) {
                const relativePath = absolutePath.substring(basePath.length);
                return relativePath.startsWith('/') ? relativePath : `/${relativePath}`;
            }
            
            // Для GitHub Pages и других хостингов со специфичными URL
            if (basePath !== '/' && absolutePath.includes(basePath.replace(/^\/|\/$/g, ''))) {
                const parts = absolutePath.split(basePath.replace(/^\/|\/$/g, ''));
                const lastPart = parts[parts.length - 1];
                return lastPart.startsWith('/') ? lastPart : `/${lastPart}`;
            }
            
            // Если путь не начинается с базового пути, возвращаем его как есть с начальным слешем
            return absolutePath.startsWith('/') ? absolutePath : `/${absolutePath}`;
        } catch (error) {
            console.error('Ошибка при получении относительного пути:', error);
            return absolutePath.startsWith('/') ? absolutePath : `/${absolutePath}`;
        }
    }
}

export default PathUtils;