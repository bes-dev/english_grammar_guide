document.addEventListener('DOMContentLoaded', function() {
    // App state management
    const state = {
        currentPage: 'home-page',
        selectedTimePeriod: null,
        selectedActionType: null,
        selectedClarification: null
    };

    // Navigation functions
    function navigateTo(pageId) {
        document.getElementById(state.currentPage).classList.remove('active');
        document.getElementById(pageId).classList.add('active');
        state.currentPage = pageId;

        // Update UI based on current page
        if (pageId === 'step1-page') {
            // Сбрасываем выбор кнопок при переходе на первый шаг
            document.querySelectorAll('#step1-page .option-btn').forEach(btn => {
                btn.classList.remove('selected');
            });
            document.querySelector('#step1-page .next-btn').disabled = true;
            
            // Устанавливаем общую подсказку для первого шага
            document.querySelector('#step1-page .card:last-child p').textContent = 
                "Прошедшее время описывает действие, которое уже завершилось. Настоящее время используется для действий, происходящих сейчас или регулярно. Будущее время описывает то, что произойдет.";
            
            // Сбрасываем состояние, если пользователь начинает заново
            state.selectedTimePeriod = null;
            state.selectedActionType = null;
            state.selectedClarification = null;
        } else if (pageId === 'step2-page') {
            // Сбрасываем выбор кнопок при переходе на второй шаг
            document.querySelectorAll('#step2-page .option-btn').forEach(btn => {
                btn.classList.remove('selected');
            });
            document.querySelector('#step2-page .next-btn').disabled = true;
            
            // Если пользователь вернулся назад, сбрасываем выбор типа действия
            if (state.currentPage === 'step3-page') {
                state.selectedActionType = null;
                state.selectedClarification = null;
            }
            
            // Устанавливаем общую подсказку для второго шага, если нет выбранного периода времени
            if (!state.selectedTimePeriod) {
                document.querySelector('#step2-page .card:last-child p').textContent = 
                    "Simple - простое действие или факт. Continuous - процесс в развитии. Perfect - результат действия. Perfect Continuous - длительный процесс с результатом.";
            } else {
                // Если период времени выбран, но тип действия не выбран, устанавливаем подсказку для выбранного периода
                let periodHint = "Выберите характер действия, соответствующий вашей ситуации.";
                if (state.selectedTimePeriod === 'past') {
                    periodHint = "Выберите характер действия в прошлом. Simple для фактов, Continuous для процессов, Perfect для предшествующих действий, Perfect Continuous для длительных процессов с результатом.";
                } else if (state.selectedTimePeriod === 'present') {
                    periodHint = "Выберите характер действия в настоящем. Simple для регулярных действий, Continuous для текущих процессов, Perfect для завершенных действий с результатом, Perfect Continuous для длительных процессов.";
                } else if (state.selectedTimePeriod === 'future') {
                    periodHint = "Выберите характер действия в будущем. Simple для предсказаний, Continuous для процессов в будущем, Perfect для завершенных действий к моменту в будущем, Perfect Continuous для длительных процессов до момента в будущем.";
                }
                document.querySelector('#step2-page .card:last-child p').textContent = periodHint;
            }
        } else if (pageId === 'step3-page') {
            updateClarificationQuestion();
            // По умолчанию кнопка "Показать результат" заблокирована, если не показывается заглушка
            // В функции updateClarificationQuestion() мы разблокируем кнопку, если показывается заглушка
            if (!state.selectedClarification) {
                document.querySelector('#step3-page .next-btn').disabled = true;
            } else {
                document.querySelector('#step3-page .next-btn').disabled = false;
            }
        } else if (pageId === 'result-page') {
            // Проверяем, что уточнение было выбрано, прежде чем показывать результат
            if (!state.selectedClarification) {
                // Если уточнение не выбрано, возвращаемся на шаг 3
                navigateTo('step3-page');
                return;
            }
            showResult();
        } else if (pageId === 'tenses-page') {
            loadTensesData();
        } else if (pageId === 'verbs-page') {
            loadIrregularVerbs();
        }
    }

    // Initialize navigation buttons
    document.querySelectorAll('[data-nav]').forEach(button => {
        button.addEventListener('click', function() {
            // Если это кнопка "Показать результат", проверяем, что выбрано уточнение
            if (this.classList.contains('next-btn') && this.closest('#step3-page') && 
                this.getAttribute('data-nav') === 'result' && !state.selectedClarification) {
                // Если уточнение не выбрано, блокируем переход
                return;
            }
            
            // Если это кнопка "Назад" на шаге 3, сбрасываем выбранное уточнение
            if (this.classList.contains('back-btn') && this.closest('#step3-page')) {
                state.selectedClarification = null;
            }
            
            navigateTo(this.getAttribute('data-nav') + '-page');
        });
    });

    // Initialize start button
    document.querySelector('.start-btn').addEventListener('click', function() {
        navigateTo('step1-page');
    });

    // Initialize tab navigation
    document.querySelectorAll('.nav-tab').forEach(tab => {
        tab.addEventListener('click', function() {
            if (this.getAttribute('data-tab') === 'wizard') {
                return; // Already on the wizard
            } else if (this.getAttribute('data-tab') === 'tenses') {
                navigateTo('tenses-page');
            } else if (this.getAttribute('data-tab') === 'passive') {
                navigateTo('passive-page');
            } else if (this.getAttribute('data-tab') === 'conditionals') {
                navigateTo('conditionals-page');
            } else if (this.getAttribute('data-tab') === 'verbs') {
                navigateTo('verbs-page');
            }
        });
    });

    // Подсказки для каждого этапа
    const hintData = {
        // Подсказки для периода времени (шаг 1)
        timePeriod: {
            past: "Выберите «В прошлом», если действие уже произошло и закончилось в прошлом. Например: «Я сделал домашнюю работу вчера», «Она посетила Париж в прошлом году».",
            present: "Выберите «В настоящем», если действие происходит сейчас, регулярно повторяется или представляет собой общую истину. Например: «Я работаю в офисе», «Я читаю книгу прямо сейчас», «Земля вращается вокруг Солнца».",
            future: "Выберите «В будущем», если действие произойдет позже или планируется на будущее. Например: «Я поеду в отпуск следующим летом», «Она приготовит ужин завтра»."
        },
        // Подсказки для характера действия (шаг 2)
        actionType: {
            // Прошлое
            past: {
                simple: "Простой факт или законченное действие в прошлом. Например: «Я купил новую машину на прошлой неделе», «Она посетила Лондон в 2019 году».",
                continuous: "Действие, которое было в процессе в определенный момент прошлого. Например: «В 7 вечера вчера я готовил ужин», «Когда он позвонил, я принимал душ».",
                perfect: "Действие, которое произошло до другого действия или момента в прошлом. Например: «К 6 вечера я уже закончил работу», «Она уже ушла, когда я пришел».",
                "perfect-continuous": "Длительное действие, которое началось и продолжалось до определенного момента в прошлом. Например: «К моменту выпуска я учился в этой школе 5 лет», «Она работала над проектом 3 часа до того, как шеф пришел»."
            },
            // Настоящее
            present: {
                simple: "Регулярное действие, факт или общая истина. Например: «Я работаю в банке», «Он играет в футбол по выходным», «Вода закипает при 100 градусах».",
                continuous: "Действие, происходящее прямо сейчас или временно. Например: «Я читаю интересную книгу (сейчас или в целом в этот период)», «Она учит французский в этом семестре».",
                perfect: "Действие, которое началось в прошлом и имеет результат или связь с настоящим. Например: «Я уже сделал домашнюю работу», «Она никогда не была в Париже».",
                "perfect-continuous": "Действие, которое началось в прошлом и продолжается до настоящего момента. Например: «Я изучаю английский 5 лет», «Она ждет автобус уже 20 минут»."
            },
            // Будущее
            future: {
                simple: "Простое действие, которое произойдет в будущем. Например: «Я позвоню тебе завтра», «Она приедет на следующей неделе».",
                continuous: "Действие, которое будет происходить в определенный момент в будущем. Например: «Завтра в 5 часов я буду работать», «В это время завтра она будет лететь в Лондон».",
                perfect: "Действие, которое завершится к определенному моменту в будущем. Например: «К следующему вторнику я закончу проект», «К 2025 году она получит диплом».",
                "perfect-continuous": "Действие, которое начнется в будущем и будет продолжаться до определенного момента в будущем. Например: «К концу года я буду работать в компании уже 10 лет», «К вечеру она будет учиться уже 8 часов»."
            }
        },
        // Подсказки для уточняющих вопросов (шаг 3) могут быть добавлены здесь
        clarification: {
            // Структура будет добавлена в соответствии с выбранными опциями
        }
    };

    // Функция для обновления подсказки
    function updateHint(step, value, secondValue = null) {
        let hintText = "";
        
        if (step === "time") {
            hintText = hintData.timePeriod[value];
        } else if (step === "action") {
            if (state.selectedTimePeriod && value) {
                hintText = hintData.actionType[state.selectedTimePeriod][value];
            }
        } else if (step === "clarification") {
            // Для третьего шага подсказки можно добавить позже
            hintText = "Отвечая на уточняющий вопрос, обратите внимание на конкретные обстоятельства действия. Это поможет точно определить нужное время.";
        }
        
        // Обновляем текст подсказки на соответствующей странице с анимацией
        let hintElement;
        if (step === "time") {
            hintElement = document.querySelector('#step1-page .card:last-child p');
        } else if (step === "action") {
            hintElement = document.querySelector('#step2-page .card:last-child p');
        } else if (step === "clarification") {
            hintElement = document.querySelector('#step3-page .card:last-child p');
        }
        
        if (hintElement) {
            // Добавляем анимацию с помощью классов
            const hintBox = hintElement.closest('.hint-box');
            if (hintBox) {
                // Добавляем временный класс для анимации
                hintBox.style.transition = 'all 0.3s ease';
                hintBox.style.backgroundColor = 'rgba(76, 201, 240, 0.2)';
                
                // Обновляем текст подсказки
                hintElement.textContent = hintText;
                
                // Возвращаем исходный фон через некоторое время
                setTimeout(() => {
                    hintBox.style.backgroundColor = 'rgba(76, 201, 240, 0.08)';
                }, 300);
            } else {
                // Если нет блока hint-box, просто обновляем текст
                hintElement.textContent = hintText;
            }
        }
    }

    // Initialize option buttons in step 1
    document.querySelectorAll('#step1-page .option-btn').forEach(button => {
        button.addEventListener('click', function() {
            // Reset previously selected button
            document.querySelectorAll('#step1-page .option-btn').forEach(btn => {
                btn.classList.remove('selected');
            });
            
            // Mark this button as selected
            this.classList.add('selected');
            
            // Update state
            state.selectedTimePeriod = this.getAttribute('data-value');
            
            // Update hint
            updateHint("time", state.selectedTimePeriod);
            
            // Enable next button
            document.querySelector('#step1-page .next-btn').disabled = false;
        });
    });

    // Initialize option buttons in step 2
    document.querySelectorAll('#step2-page .option-btn').forEach(button => {
        button.addEventListener('click', function() {
            // Reset previously selected button
            document.querySelectorAll('#step2-page .option-btn').forEach(btn => {
                btn.classList.remove('selected');
            });
            
            // Mark this button as selected
            this.classList.add('selected');
            
            // Update state
            state.selectedActionType = this.getAttribute('data-value');
            
            // Update hint
            updateHint("action", state.selectedActionType);
            
            // Enable next button
            document.querySelector('#step2-page .next-btn').disabled = false;
        });
    });

    // Update clarification question based on selected time period and action type
    function updateClarificationQuestion() {
        const clarificationContainer = document.getElementById('clarification-question');
        let question = '';
        let options = [];
        let clarificationHint = '';

        // Проверяем комбинации, для которых не требуется уточняющий вопрос
        // и устанавливаем соответствующие заглушки
        let showPlaceholderMessage = false;
        let placeholderMessage = '';
        let tenseType = '';

        // Present Simple
        if (state.selectedTimePeriod === 'present' && state.selectedActionType === 'simple') {
            showPlaceholderMessage = true;
            placeholderMessage = 'Не важно, повторяется ли действие или оно представляет собой общеизвестный факт – мы определили, что для вас оптимальным выбором является Present Simple (Настоящее простое время).';
            tenseType = 'present-simple';
            clarificationHint = 'Present Simple используется как для регулярных действий, так и для общеизвестных фактов. Например: «Я каждый день хожу на работу», «Солнце встает на востоке».';
        } 
        // Present Continuous
        else if (state.selectedTimePeriod === 'present' && state.selectedActionType === 'continuous') {
            showPlaceholderMessage = true;
            placeholderMessage = 'Не важно, происходит ли действие прямо сейчас или носит временный характер – подходящим для вас временем будет Present Continuous (Настоящее длительное время).';
            tenseType = 'present-continuous';
            clarificationHint = 'Present Continuous используется для действий, происходящих сейчас или имеющих временный характер. Например: «Я сейчас разговариваю по телефону», «В этом году я изучаю испанский».';
        }
        // Present Perfect
        else if (state.selectedTimePeriod === 'present' && state.selectedActionType === 'perfect') {
            showPlaceholderMessage = true;
            placeholderMessage = 'Не важно, какие детали результата вы учитываете – мы поняли, что для описания вашего действия оптимальным выбором является Present Perfect (Настоящее совершенное время).';
            tenseType = 'present-perfect';
            clarificationHint = 'Present Perfect используется, когда нас интересует результат действия в настоящем. Например: «Я уже посмотрел этот фильм», «Я никогда не был в Японии».';
        }
        // Present Perfect Continuous
        else if (state.selectedTimePeriod === 'present' && state.selectedActionType === 'perfect-continuous') {
            showPlaceholderMessage = true;
            placeholderMessage = 'Не важно, насколько длительно действие продолжается до настоящего момента – подходящим временем для вас станет Present Perfect Continuous (Настоящее совершенное длительное время).';
            tenseType = 'present-perfect-continuous';
            clarificationHint = 'Present Perfect Continuous используется для описания действия, которое началось в прошлом и продолжается до сих пор. Например: «Я изучаю английский уже 5 лет», «Она ждет автобус уже 20 минут».';
        } 
        // Past Simple
        else if (state.selectedTimePeriod === 'past' && state.selectedActionType === 'simple') {
            showPlaceholderMessage = true;
            placeholderMessage = 'Не важно, что действие уже завершилось в прошлом – мы определили, что оптимальным выбором для вашего случая является Past Simple (Прошедшее простое время).';
            tenseType = 'past-simple';
            clarificationHint = 'Past Simple используется для завершенных действий в прошлом. Например: «Я вчера ходил в кино», «Она окончила университет в 2015 году».';
        }
        // Past Continuous
        else if (state.selectedTimePeriod === 'past' && state.selectedActionType === 'continuous') {
            showPlaceholderMessage = true;
            placeholderMessage = 'Не важно, что действие происходило в определённый момент в прошлом – подходящим для вас временем будет Past Continuous (Прошедшее длительное время).';
            tenseType = 'past-continuous';
            clarificationHint = 'Past Continuous используется для действий, которые были в процессе в конкретный момент прошлого. Например: «Вчера в 8 вечера я смотрел фильм», «Когда зазвонил телефон, я принимал душ».';
        }
        // Для остальных комбинаций показываем обычные уточняющие вопросы
        else if (state.selectedTimePeriod === 'past') {
            if (state.selectedActionType === 'perfect') {
                question = 'Это действие произошло до другого действия в прошлом?';
                options = [
                    { value: 'yes', text: 'Да, действие произошло до другого действия' },
                    { value: 'no', text: 'Нет, действие не предшествовало другому' }
                ];
                clarificationHint = 'Для действий, которые произошли до другого момента в прошлом, используйте Past Perfect. Например: «К моменту его приезда я уже приготовил ужин», «Она сказала, что уже видела этот фильм».';
            } else if (state.selectedActionType === 'perfect-continuous') {
                question = 'Это длительное действие, которое продолжалось до определенного момента в прошлом?';
                options = [
                    { value: 'yes', text: 'Да, действие продолжалось до определенного момента' },
                    { value: 'no', text: 'Нет, действие не продолжалось до определенного момента' }
                ];
                clarificationHint = 'Для длительных действий, которые продолжались до определенного момента в прошлом, используйте Past Perfect Continuous. Например: «К моменту нашей встречи она ждала уже два часа», «Я работал над проектом пять часов, прежде чем закончил его».';
            }
        } else if (state.selectedTimePeriod === 'future') {
            if (state.selectedActionType === 'simple') {
                question = 'Это предсказание, обещание, спонтанное решение или факт о будущем?';
                options = [
                    { value: 'yes', text: 'Да, это предсказание, обещание или спонтанное решение' },
                    { value: 'no', text: 'Нет, это запланированное действие или намерение' }
                ];
                clarificationHint = 'Для предсказаний, обещаний или спонтанных решений о будущем используйте Future Simple (will). Для запланированных действий или намерений лучше использовать конструкцию "going to" или Present Continuous. Сравните: "Я позвоню тебе завтра" (спонтанное решение, will) vs "Я собираюсь позвонить тебе завтра" (запланированное действие, going to).';
            } else if (state.selectedActionType === 'continuous') {
                question = 'Это действие будет происходить в определенный момент в будущем?';
                options = [
                    { value: 'yes', text: 'Да, действие будет происходить в конкретный момент' },
                    { value: 'no', text: 'Нет, действие не будет происходить в конкретный момент' }
                ];
                clarificationHint = 'Для действий, которые будут происходить в определенный момент в будущем, используйте Future Continuous. Например: «Завтра в 10 утра я буду ехать на работу», «В это время завтра мы будем лететь в Париж».';
            } else if (state.selectedActionType === 'perfect') {
                question = 'Это действие завершится к определенному моменту в будущем?';
                options = [
                    { value: 'yes', text: 'Да, действие завершится к определенному моменту' },
                    { value: 'no', text: 'Нет, действие не завершится к определенному моменту' }
                ];
                clarificationHint = 'Для действий, которые завершатся к определенному моменту в будущем, используйте Future Perfect. Например: «К концу недели я закончу этот проект», «К 2025 году она получит степень доктора наук».';
            } else if (state.selectedActionType === 'perfect-continuous') {
                question = 'Это действие, которое будет длиться до определенного момента в будущем?';
                options = [
                    { value: 'yes', text: 'Да, действие будет длиться до определенного момента' },
                    { value: 'no', text: 'Нет, действие не будет длиться до определенного момента' }
                ];
                clarificationHint = 'Для действий, которые начнутся до определенного момента в будущем и будут продолжаться до этого момента, используйте Future Perfect Continuous. Например: «К концу года я буду работать в компании уже 10 лет», «К тому времени, когда он приедет, я буду ждать уже два часа».';
            }
        }

        // Создаем HTML контент в зависимости от того, показываем заглушку или уточняющий вопрос
        let html = '';
        
        if (showPlaceholderMessage) {
            // Для заглушки обновляем заголовок
            document.querySelector('#step3-page .question-title').textContent = 'Необходимое время уже определено';
            
            // Создаем HTML с заглушкой
            html = `
                <div class="placeholder-message" style="background-color: rgba(76, 201, 240, 0.08); padding: 15px; border-radius: 10px; margin-bottom: 20px; border-left: 3px solid var(--accent);">
                    <p style="margin: 0;">${placeholderMessage}</p>
                </div>
                <input type="hidden" id="clarification-value" value="yes">
            `;
            
            // Автоматически устанавливаем значение уточнения
            state.selectedClarification = 'yes';
            
            // Разблокируем кнопку "Показать результат"
            document.querySelector('#step3-page .next-btn').disabled = false;
        } else {
            // Для обычного уточняющего вопроса обновляем заголовок
            document.querySelector('#step3-page .question-title').textContent = 'Уточняющий вопрос';
            
            // Создаем стандартный HTML с вопросом и опциями
            html = '<div class="question-title">' + question + '</div>';
            
            options.forEach(option => {
                html += `
                    <button class="option-btn" data-value="${option.value}">
                        <span class="option-icon">${option.value === 'yes' ? '✓' : '✗'}</span> ${option.text}
                    </button>
                `;
            });
        }
        
        // Обновляем контейнер
        clarificationContainer.innerHTML = html;

        // Update hint for clarification step
        document.querySelector('#step3-page .card:last-child p').textContent = clarificationHint;

        // Если не показываем заглушку, добавляем обработчики событий для кнопок
        if (!showPlaceholderMessage) {
            document.querySelectorAll('#clarification-question .option-btn').forEach(button => {
                button.addEventListener('click', function() {
                    // Reset previously selected button
                    document.querySelectorAll('#clarification-question .option-btn').forEach(btn => {
                        btn.classList.remove('selected');
                    });
                    
                    // Mark this button as selected
                    this.classList.add('selected');
                    
                    // Update state
                    state.selectedClarification = this.getAttribute('data-value');
                    
                    // Разблокируем кнопку "Показать результат"
                    document.querySelector('#step3-page .next-btn').disabled = false;
                    
                    // Обновляем подсказку на основе выбранного уточнения
                    let resultHint = "";
                    const tense = determineTense();
                    
                    if (tense && tensesData[tense]) {
                        const tenseData = tensesData[tense];
                        
                        // Формируем дополнительную информацию о времени
                        resultHint = `Вы выбрали время ${tenseData.name} (${tenseData.translation}). Используйте его для: ${tenseData.usage[0].toLowerCase()}. Пример: "${tenseData.examples[0].original}" (${tenseData.examples[0].translation})`;
                        
                        // Обновляем подсказку
                        document.querySelector('#step3-page .card:last-child p').textContent = resultHint;
                        
                        // Подсвечиваем блок подсказки
                        const hintBox = document.querySelector('#step3-page .card:last-child .hint-box');
                        if (hintBox) {
                            hintBox.style.transition = 'all 0.3s ease';
                            hintBox.style.backgroundColor = 'rgba(76, 201, 240, 0.2)';
                            
                            // Возвращаем исходный фон через некоторое время
                            setTimeout(() => {
                                hintBox.style.backgroundColor = 'rgba(76, 201, 240, 0.08)';
                            }, 300);
                        }
                    }
                });
            });
        } else {
            // Если показываем заглушку, то также обновляем подсказку на основе уже выбранного времени
            const tense = tenseType; // Уже определено выше
            
            if (tense && tensesData[tense]) {
                const tenseData = tensesData[tense];
                
                // Формируем дополнительную информацию о времени
                const resultHint = `${tenseData.name} (${tenseData.translation}) используется для: ${tenseData.usage[0].toLowerCase()}. Пример: "${tenseData.examples[0].original}" (${tenseData.examples[0].translation})`;
                
                // Обновляем подсказку
                document.querySelector('#step3-page .card:last-child p').textContent = resultHint;
                
                // Подсвечиваем блок подсказки
                const hintBox = document.querySelector('#step3-page .card:last-child .hint-box');
                if (hintBox) {
                    hintBox.style.transition = 'all 0.3s ease';
                    hintBox.style.backgroundColor = 'rgba(76, 201, 240, 0.2)';
                    
                    // Возвращаем исходный фон через некоторое время
                    setTimeout(() => {
                        hintBox.style.backgroundColor = 'rgba(76, 201, 240, 0.08)';
                    }, 300);
                }
            }
        }
    }

    // Determine the tense based on selections
    function determineTense() {
        const { selectedTimePeriod, selectedActionType, selectedClarification } = state;
        
        // Basic validation
        if (!selectedTimePeriod || !selectedActionType) {
            return null;
        }
        
        // Present tenses
        if (selectedTimePeriod === 'present') {
            if (selectedActionType === 'simple') {
                return 'present-simple';
            } else if (selectedActionType === 'continuous') {
                return 'present-continuous';
            } else if (selectedActionType === 'perfect') {
                if (selectedClarification === 'yes') {
                    // Действие завершено с результатом в настоящем
                    return 'present-perfect';
                } else {
                    // Предложить альтернативное время в зависимости от контекста
                    return 'present-perfect'; // По умолчанию всё равно Present Perfect
                }
            } else if (selectedActionType === 'perfect-continuous') {
                return 'present-perfect-continuous';
            }
        }
        
        // Past tenses
        else if (selectedTimePeriod === 'past') {
            if (selectedActionType === 'simple') {
                return 'past-simple';
            } else if (selectedActionType === 'continuous') {
                return 'past-continuous';
            } else if (selectedActionType === 'perfect') {
                if (selectedClarification === 'yes') {
                    // Действие произошло до другого действия в прошлом
                    return 'past-perfect';
                } else {
                    // Если действие не предшествовало другому, предложить Past Simple
                    return 'past-simple';
                }
            } else if (selectedActionType === 'perfect-continuous') {
                if (selectedClarification === 'yes') {
                    // Действие продолжалось до определенного момента в прошлом
                    return 'past-perfect-continuous';
                } else {
                    // Если действие не продолжалось до определенного момента, предложить Past Continuous
                    return 'past-continuous';
                }
            }
        }
        
        // Future tenses
        else if (selectedTimePeriod === 'future') {
            if (selectedActionType === 'simple') {
                if (selectedClarification === 'yes') {
                    // Это предсказание, обещание или спонтанное решение
                    return 'future-simple';
                } else {
                    // Если это запланированное действие, предложить Present Continuous для будущего
                    return 'going-to-future';
                }
            } else if (selectedActionType === 'continuous') {
                if (selectedClarification === 'yes') {
                    // Действие будет происходить в конкретный момент в будущем
                    return 'future-continuous';
                } else {
                    return 'future-simple';
                }
            } else if (selectedActionType === 'perfect') {
                if (selectedClarification === 'yes') {
                    // Действие завершится к определенному моменту в будущем
                    return 'future-perfect';
                } else {
                    return 'future-simple';
                }
            } else if (selectedActionType === 'perfect-continuous') {
                if (selectedClarification === 'yes') {
                    // Действие будет длиться до определенного момента в будущем
                    return 'future-perfect-continuous';
                } else {
                    return 'future-continuous';
                }
            }
        }
        
        return null;
    }

    // Tense data
    const tensesData = {
        'going-to-future': {
            name: 'Going to Future',
            translation: 'Конструкция "собираться" для будущего',
            icon: '🔮',
            formulas: {
                positive: 'Subject + am/is/are + going to + V1',
                negative: 'Subject + am/is/are + not + going to + V1',
                question: 'Am/Is/Are + Subject + going to + V1 + ?'
            },
            examples: [
                { original: 'I am going to visit my parents this weekend.', translation: 'Я собираюсь навестить родителей в эти выходные.' },
                { original: 'She is not going to attend the meeting.', translation: 'Она не собирается присутствовать на встрече.' },
                { original: 'Are they going to buy a new car?', translation: 'Они собираются купить новую машину?' }
            ],
            usage: [
                'Запланированные действия в будущем',
                'Действия, для которых уже есть договоренность или намерение',
                'События, которые, вероятно, произойдут (по имеющимся признакам)',
                'Ситуации, когда говорящий уверен в событии будущего'
            ],
            markers: ['this weekend', 'next week', 'tomorrow', 'soon', 'plan to', 'intend to']
        },
        'present-simple': {
            name: 'Present Simple',
            translation: 'Настоящее простое время',
            icon: '📊',
            formulas: {
                positive: 'Subject + V1 (+ окончание -s/-es для 3-го лица ед. числа)',
                negative: 'Subject + do/does + not + V1',
                question: 'Do/Does + Subject + V1 + ?'
            },
            examples: [
                { original: 'I work in an office.', translation: 'Я работаю в офисе.' },
                { original: 'She doesn\'t like coffee.', translation: 'Она не любит кофе.' },
                { original: 'Do they live in London?', translation: 'Они живут в Лондоне?' }
            ],
            usage: [
                'Регулярные, повторяющиеся действия',
                'Общеизвестные факты, истины',
                'Расписания и постоянные ситуации',
                'Привычки и предпочтения'
            ],
            markers: ['always', 'usually', 'often', 'sometimes', 'never', 'every day', 'every week']
        },
        'present-continuous': {
            name: 'Present Continuous',
            translation: 'Настоящее длительное время',
            icon: '⏳',
            formulas: {
                positive: 'Subject + am/is/are + Ving',
                negative: 'Subject + am/is/are + not + Ving',
                question: 'Am/Is/Are + Subject + Ving + ?'
            },
            examples: [
                { original: 'I am working right now.', translation: 'Я работаю прямо сейчас.' },
                { original: 'They are not listening to music.', translation: 'Они не слушают музыку.' },
                { original: 'Is she studying for the exam?', translation: 'Она готовится к экзамену?' }
            ],
            usage: [
                'Действия, происходящие в момент речи',
                'Временные действия в настоящем',
                'Заранее запланированные действия в ближайшем будущем',
                'Развивающиеся ситуации и тенденции'
            ],
            markers: ['now', 'right now', 'at the moment', 'currently', 'at present', 'look!', 'listen!']
        },
        'present-perfect': {
            name: 'Present Perfect',
            translation: 'Настоящее совершенное время',
            icon: '✅',
            formulas: {
                positive: 'Subject + have/has + V3 (причастие прошедшего времени)',
                negative: 'Subject + have/has + not + V3',
                question: 'Have/Has + Subject + V3 + ?'
            },
            examples: [
                { original: 'I have finished my homework.', translation: 'Я закончил свою домашнюю работу.' },
                { original: 'She hasn\'t seen that movie.', translation: 'Она не видела этот фильм.' },
                { original: 'Have they visited Paris?', translation: 'Они посещали Париж?' }
            ],
            usage: [
                'Действие завершилось к настоящему моменту и важен результат (акцент на результате, а не на времени действия)',
                'Действие произошло в неуказанное время в прошлом, которое связано с настоящим',
                'Жизненный опыт или то, что случилось хотя бы раз в жизни',
                'Новости или недавние события, которые имеют значение для настоящего момента'
            ],
            markers: ['already', 'just', 'yet', 'ever', 'never', 'recently', 'so far', 'today', 'this week']
        },
        'present-perfect-continuous': {
            name: 'Present Perfect Continuous',
            translation: 'Настоящее совершенное длительное время',
            icon: '⏱️',
            formulas: {
                positive: 'Subject + have/has + been + Ving',
                negative: 'Subject + have/has + not + been + Ving',
                question: 'Have/Has + Subject + been + Ving + ?'
            },
            examples: [
                { original: 'I have been studying for three hours.', translation: 'Я учусь уже три часа.' },
                { original: 'She hasn\'t been working all day.', translation: 'Она не работала весь день.' },
                { original: 'Have they been waiting for a long time?', translation: 'Они ждут уже долго?' }
            ],
            usage: [
                'Длительное действие, которое началось в прошлом и продолжается до настоящего момента (акцент на процессе)',
                'Действие, длящееся в течение определенного периода времени (с указанием продолжительности)',
                'Объяснение причины текущей ситуации ("Почему ты устал? — Я работал весь день")',
                'Акцент на продолжительности и непрерывности действия'
            ],
            markers: ['for + период времени', 'since + момент начала', 'how long', 'all day', 'all week', 'recently', 'lately']
        },
        'past-simple': {
            name: 'Past Simple',
            translation: 'Прошедшее простое время',
            icon: '📅',
            formulas: {
                positive: 'Subject + V2 (прошедшее время глагола)',
                negative: 'Subject + did + not + V1',
                question: 'Did + Subject + V1 + ?'
            },
            examples: [
                { original: 'I worked yesterday.', translation: 'Я работал вчера.' },
                { original: 'She didn\'t go to the party.', translation: 'Она не пошла на вечеринку.' },
                { original: 'Did they call you?', translation: 'Они звонили тебе?' }
            ],
            usage: [
                'Законченное действие в прошлом',
                'Последовательность действий в прошлом',
                'Привычки и повторяющиеся действия в прошлом',
                'Исторические факты'
            ],
            markers: ['yesterday', 'last week', 'last year', 'ago', 'in 1990', 'when', 'then']
        },
        'past-continuous': {
            name: 'Past Continuous',
            translation: 'Прошедшее длительное время',
            icon: '⏳',
            formulas: {
                positive: 'Subject + was/were + Ving',
                negative: 'Subject + was/were + not + Ving',
                question: 'Was/Were + Subject + Ving + ?'
            },
            examples: [
                { original: 'I was sleeping when the phone rang.', translation: 'Я спал, когда зазвонил телефон.' },
                { original: 'They weren\'t listening to the teacher.', translation: 'Они не слушали учителя.' },
                { original: 'Was she studying at 7 PM?', translation: 'Она занималась в 7 вечера?' }
            ],
            usage: [
                'Действие, которое происходило в определенный момент в прошлом',
                'Фоновое действие для другого события',
                'Описание обстановки в рассказе',
                'Параллельные действия в прошлом'
            ],
            markers: ['when', 'while', 'as', 'at that moment', 'at 5 PM yesterday']
        },
        'past-perfect': {
            name: 'Past Perfect',
            translation: 'Прошедшее совершенное время',
            icon: '✅',
            formulas: {
                positive: 'Subject + had + V3 (причастие прошедшего времени)',
                negative: 'Subject + had + not + V3',
                question: 'Had + Subject + V3 + ?'
            },
            examples: [
                { original: 'I had finished my work before she arrived.', translation: 'Я закончил свою работу до того, как она пришла.' },
                { original: 'They hadn\'t heard the news until I told them.', translation: 'Они не слышали новость, пока я им не сказал.' },
                { original: 'Had you visited London before that trip?', translation: 'Ты посещал Лондон до той поездки?' }
            ],
            usage: [
                'Действие, которое произошло до определенного момента в прошлом',
                'Предпрошедшее действие (действие перед другим действием в прошлом)',
                'Нереализованные желания или действия в прошлом',
                'Сожаления о прошлом'
            ],
            markers: ['before', 'after', 'already', 'just', 'never', 'by the time', 'until then']
        },
        'past-perfect-continuous': {
            name: 'Past Perfect Continuous',
            translation: 'Прошедшее совершенное длительное время',
            icon: '⏱️',
            formulas: {
                positive: 'Subject + had + been + Ving',
                negative: 'Subject + had + not + been + Ving',
                question: 'Had + Subject + been + Ving + ?'
            },
            examples: [
                { original: 'I had been working for three hours before the meeting.', translation: 'Я работал в течение трех часов до встречи.' },
                { original: 'They hadn\'t been waiting long when the bus arrived.', translation: 'Они не ждали долго, когда пришел автобус.' },
                { original: 'Had you been living in Paris before you moved to London?', translation: 'Ты жил в Париже до того, как переехал в Лондон?' }
            ],
            usage: [
                'Действие, которое длилось до определенного момента в прошлом',
                'Причина ситуации, которая была в прошлом',
                'Акцент на продолжительности действия в прошлом',
                'Действие, которое началось и продолжалось некоторое время в прошлом'
            ],
            markers: ['for', 'since', 'how long', 'before', 'until']
        },
        'future-simple': {
            name: 'Future Simple',
            translation: 'Будущее простое время',
            icon: '🔮',
            formulas: {
                positive: 'Subject + will + V1',
                negative: 'Subject + will + not + V1',
                question: 'Will + Subject + V1 + ?'
            },
            examples: [
                { original: 'I will call you tomorrow.', translation: 'Я позвоню тебе завтра.' },
                { original: 'She won\'t attend the meeting.', translation: 'Она не будет присутствовать на встрече.' },
                { original: 'Will they help us?', translation: 'Они помогут нам?' }
            ],
            usage: [
                'Предсказания о будущем без твердых доказательств ("Я думаю, что завтра будет дождь")',
                'Спонтанные решения, принятые в момент речи ("Я открою окно")',
                'Обещания, предложения, предупреждения, угрозы ("Я обещаю, что помогу тебе")',
                'Факты о будущем, которые невозможно контролировать ("Мне будет 30 лет в следующем году")'
            ],
            markers: ['tomorrow', 'next week', 'next year', 'soon', 'in 2030', 'I think', 'probably', 'perhaps']
        },
        'future-continuous': {
            name: 'Future Continuous',
            translation: 'Будущее длительное время',
            icon: '⏳',
            formulas: {
                positive: 'Subject + will + be + Ving',
                negative: 'Subject + will + not + be + Ving',
                question: 'Will + Subject + be + Ving + ?'
            },
            examples: [
                { original: 'I will be working at 8 PM tomorrow.', translation: 'Я буду работать в 8 вечера завтра.' },
                { original: 'They won\'t be sleeping when you call.', translation: 'Они не будут спать, когда ты позвонишь.' },
                { original: 'Will she be studying for the exam?', translation: 'Она будет готовиться к экзамену?' }
            ],
            usage: [
                'Действие, которое будет происходить в определенный момент в будущем',
                'Действие, которое будет продолжаться в течение некоторого периода времени в будущем',
                'Параллельные действия в будущем',
                'Запланированные действия в будущем'
            ],
            markers: ['at this time tomorrow', 'all day tomorrow', 'when you arrive', 'this time next week']
        },
        'future-perfect': {
            name: 'Future Perfect',
            translation: 'Будущее совершенное время',
            icon: '✅',
            formulas: {
                positive: 'Subject + will + have + V3 (причастие прошедшего времени)',
                negative: 'Subject + will + not + have + V3',
                question: 'Will + Subject + have + V3 + ?'
            },
            examples: [
                { original: 'I will have finished the project by next week.', translation: 'Я закончу проект к следующей неделе.' },
                { original: 'They won\'t have arrived by the time we leave.', translation: 'Они не прибудут к тому времени, когда мы уйдем.' },
                { original: 'Will she have graduated by June?', translation: 'Она закончит учебу к июню?' }
            ],
            usage: [
                'Действие, которое завершится к определенному моменту в будущем',
                'Действие, которое произойдет до другого действия в будущем',
                'Акцент на результате действия в будущем',
                'Предположения о завершенных действиях'
            ],
            markers: ['by next week', 'by the time', 'by then', 'before']
        },
        'future-perfect-continuous': {
            name: 'Future Perfect Continuous',
            translation: 'Будущее совершенное длительное время',
            icon: '⏱️',
            formulas: {
                positive: 'Subject + will + have + been + Ving',
                negative: 'Subject + will + not + have + been + Ving',
                question: 'Will + Subject + have + been + Ving + ?'
            },
            examples: [
                { original: 'I will have been working here for ten years by 2025.', translation: 'К 2025 году я буду работать здесь уже десять лет.' },
                { original: 'She won\'t have been studying for long before the exam.', translation: 'Она не будет учиться долго перед экзаменом.' },
                { original: 'Will they have been living together for five years?', translation: 'Они будут жить вместе уже пять лет?' }
            ],
            usage: [
                'Действие, которое будет длиться до определенного момента в будущем',
                'Акцент на продолжительности действия в будущем',
                'Действие, которое началось в прошлом/настоящем и будет продолжаться в будущем',
                'Причина будущей ситуации'
            ],
            markers: ['for', 'by then', 'by the time', 'by 2030']
        }
    };

    // Irregular verbs data
    const irregularVerbs = [
        { v1: 'be', v2: 'was/were', v3: 'been', translation: 'быть' },
        { v1: 'become', v2: 'became', v3: 'become', translation: 'становиться' },
        { v1: 'begin', v2: 'began', v3: 'begun', translation: 'начинать' },
        { v1: 'break', v2: 'broke', v3: 'broken', translation: 'ломать' },
        { v1: 'bring', v2: 'brought', v3: 'brought', translation: 'приносить' },
        { v1: 'build', v2: 'built', v3: 'built', translation: 'строить' },
        { v1: 'buy', v2: 'bought', v3: 'bought', translation: 'покупать' },
        { v1: 'catch', v2: 'caught', v3: 'caught', translation: 'ловить' },
        { v1: 'choose', v2: 'chose', v3: 'chosen', translation: 'выбирать' },
        { v1: 'come', v2: 'came', v3: 'come', translation: 'приходить' },
        { v1: 'cost', v2: 'cost', v3: 'cost', translation: 'стоить' },
        { v1: 'cut', v2: 'cut', v3: 'cut', translation: 'резать' },
        { v1: 'do', v2: 'did', v3: 'done', translation: 'делать' },
        { v1: 'draw', v2: 'drew', v3: 'drawn', translation: 'рисовать' },
        { v1: 'drink', v2: 'drank', v3: 'drunk', translation: 'пить' },
        { v1: 'drive', v2: 'drove', v3: 'driven', translation: 'водить' },
        { v1: 'eat', v2: 'ate', v3: 'eaten', translation: 'есть' },
        { v1: 'fall', v2: 'fell', v3: 'fallen', translation: 'падать' },
        { v1: 'feel', v2: 'felt', v3: 'felt', translation: 'чувствовать' },
        { v1: 'find', v2: 'found', v3: 'found', translation: 'находить' },
        { v1: 'fly', v2: 'flew', v3: 'flown', translation: 'летать' },
        { v1: 'forget', v2: 'forgot', v3: 'forgotten', translation: 'забывать' },
        { v1: 'get', v2: 'got', v3: 'got/gotten', translation: 'получать' },
        { v1: 'give', v2: 'gave', v3: 'given', translation: 'давать' },
        { v1: 'go', v2: 'went', v3: 'gone', translation: 'идти' },
        { v1: 'grow', v2: 'grew', v3: 'grown', translation: 'расти' },
        { v1: 'have', v2: 'had', v3: 'had', translation: 'иметь' },
        { v1: 'hear', v2: 'heard', v3: 'heard', translation: 'слышать' },
        { v1: 'hide', v2: 'hid', v3: 'hidden', translation: 'прятать' },
        { v1: 'hit', v2: 'hit', v3: 'hit', translation: 'ударять' },
        { v1: 'hold', v2: 'held', v3: 'held', translation: 'держать' },
        { v1: 'keep', v2: 'kept', v3: 'kept', translation: 'хранить' },
        { v1: 'know', v2: 'knew', v3: 'known', translation: 'знать' },
        { v1: 'leave', v2: 'left', v3: 'left', translation: 'покидать' },
        { v1: 'let', v2: 'let', v3: 'let', translation: 'позволять' },
        { v1: 'lie', v2: 'lay', v3: 'lain', translation: 'лежать' },
        { v1: 'make', v2: 'made', v3: 'made', translation: 'делать' },
        { v1: 'mean', v2: 'meant', v3: 'meant', translation: 'значить' },
        { v1: 'meet', v2: 'met', v3: 'met', translation: 'встречать' },
        { v1: 'pay', v2: 'paid', v3: 'paid', translation: 'платить' },
        { v1: 'put', v2: 'put', v3: 'put', translation: 'класть' },
        { v1: 'read', v2: 'read', v3: 'read', translation: 'читать' },
        { v1: 'ride', v2: 'rode', v3: 'ridden', translation: 'ездить верхом' },
        { v1: 'ring', v2: 'rang', v3: 'rung', translation: 'звонить' },
        { v1: 'run', v2: 'ran', v3: 'run', translation: 'бежать' },
        { v1: 'say', v2: 'said', v3: 'said', translation: 'говорить' },
        { v1: 'see', v2: 'saw', v3: 'seen', translation: 'видеть' },
        { v1: 'sell', v2: 'sold', v3: 'sold', translation: 'продавать' },
        { v1: 'send', v2: 'sent', v3: 'sent', translation: 'отправлять' },
        { v1: 'set', v2: 'set', v3: 'set', translation: 'устанавливать' },
        { v1: 'shine', v2: 'shone', v3: 'shone', translation: 'светить' },
        { v1: 'show', v2: 'showed', v3: 'shown', translation: 'показывать' },
        { v1: 'sing', v2: 'sang', v3: 'sung', translation: 'петь' },
        { v1: 'sit', v2: 'sat', v3: 'sat', translation: 'сидеть' },
        { v1: 'sleep', v2: 'slept', v3: 'slept', translation: 'спать' },
        { v1: 'speak', v2: 'spoke', v3: 'spoken', translation: 'говорить' },
        { v1: 'spend', v2: 'spent', v3: 'spent', translation: 'тратить' },
        { v1: 'stand', v2: 'stood', v3: 'stood', translation: 'стоять' },
        { v1: 'swim', v2: 'swam', v3: 'swum', translation: 'плавать' },
        { v1: 'take', v2: 'took', v3: 'taken', translation: 'брать' },
        { v1: 'teach', v2: 'taught', v3: 'taught', translation: 'учить' },
        { v1: 'tell', v2: 'told', v3: 'told', translation: 'рассказывать' },
        { v1: 'think', v2: 'thought', v3: 'thought', translation: 'думать' },
        { v1: 'throw', v2: 'threw', v3: 'thrown', translation: 'бросать' },
        { v1: 'understand', v2: 'understood', v3: 'understood', translation: 'понимать' },
        { v1: 'wake', v2: 'woke', v3: 'woken', translation: 'просыпаться' },
        { v1: 'wear', v2: 'wore', v3: 'worn', translation: 'носить' },
        { v1: 'win', v2: 'won', v3: 'won', translation: 'выигрывать' },
        { v1: 'write', v2: 'wrote', v3: 'written', translation: 'писать' }
    ];

    // Show result based on the selected options
    function showResult() {
        const tense = determineTense();
        if (!tense || !tensesData[tense]) {
            return;
        }

        const tenseData = tensesData[tense];

        // Create result content
        let resultHTML = `
            <div class="result-header">
                <div class="result-icon">${tenseData.icon}</div>
                <div class="result-title">${tenseData.name}</div>
                <div class="result-subtitle">${tenseData.translation}</div>
            </div>

            <div class="section-title">Формула построения</div>
            <div class="formula-box">
                <div class="formula-title">Утвердительное предложение:</div>
                <div class="formula-text">${tenseData.formulas.positive}</div>
            </div>

            <div class="formula-box">
                <div class="formula-title">Отрицательное предложение:</div>
                <div class="formula-text">${tenseData.formulas.negative}</div>
            </div>

            <div class="formula-box">
                <div class="formula-title">Вопросительное предложение:</div>
                <div class="formula-text">${tenseData.formulas.question}</div>
            </div>
        `;

        // Add verb examples if we have relevant verbs
        if (tense.includes('perfect') || tense.includes('past-simple')) {
            // Find a common verb to use as example
            const exampleVerb = tense.includes('go') ? 'go' : 'do';
            const verbForms = irregularVerbs.find(v => v.v1 === exampleVerb);

            if (verbForms) {
                resultHTML += `
                    <div class="section-title">Формы глагола "${exampleVerb}" (${verbForms.translation})</div>
                    <div class="verb-form-table-container">
                        <table class="verb-form-table">
                            <thead>
                                <tr>
                                    <th>Базовая форма (V1)</th>
                                    <th>Прошедшее время (V2)</th>
                                    <th>Причастие (V3)</th>
                                    <th>-ing форма</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td>${verbForms.v1}</td>
                                    <td>${verbForms.v2}</td>
                                    <td>${verbForms.v3}</td>
                                    <td>${verbForms.v1}ing</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                    <div class="mobile-scroll-hint">&#8592; Прокрутите таблицу вправо и влево &#8594;</div>
                `;
            }
        }

        // Add examples
        resultHTML += `<div class="section-title">Примеры предложений</div>`;

        tenseData.examples.forEach(example => {
            resultHTML += `
                <div class="example-box">
                    <div class="example-original">${example.original}</div>
                    <div class="example-translation">${example.translation}</div>
                </div>
            `;
        });

        // Add usage
        resultHTML += `
            <div class="section-title">Когда использовать</div>
            <ul class="usage-list">
        `;

        tenseData.usage.forEach(use => {
            resultHTML += `<li>${use}</li>`;
        });

        resultHTML += `</ul>`;

        // Add markers with explanations for special cases
        resultHTML += `
            <div class="section-title">Слова-маркеры</div>
        `;
        
        // Добавим объяснения для маркеров, если это необходимо
        if (tense === 'present-perfect') {
            resultHTML += `
                <p style="font-size: 14px; margin-bottom: 10px;">Эти слова часто указывают на использование Present Perfect:</p>
                <div class="markers-box">
                    <div class="marker-tag" title="Уже, указывает на завершенность действия">already</div>
                    <div class="marker-tag" title="Только что, указывает на недавно завершившееся действие">just</div>
                    <div class="marker-tag" title="Ещё (в вопросах и отрицаниях)">yet</div>
                    <div class="marker-tag" title="Когда-либо, в вопросах об опыте">ever</div>
                    <div class="marker-tag" title="Никогда, в отрицаниях об опыте">never</div>
                    <div class="marker-tag" title="В последнее время, недавно">recently</div>
                    <div class="marker-tag" title="До сих пор, на данный момент">so far</div>
                    <div class="marker-tag" title="Сегодня (когда день еще не закончился)">today</div>
                    <div class="marker-tag" title="На этой неделе (когда неделя еще не закончилась)">this week</div>
                </div>
            `;
        } else if (tense === 'present-perfect-continuous') {
            resultHTML += `
                <p style="font-size: 14px; margin-bottom: 10px;">Эти слова часто указывают на использование Present Perfect Continuous:</p>
                <div class="markers-box">
                    <div class="marker-tag" title="В течение [периода времени] - указывает на продолжительность">for + период времени</div>
                    <div class="marker-tag" title="С [момента начала] - указывает на начало действия">since + момент начала</div>
                    <div class="marker-tag" title="Как долго">how long</div>
                    <div class="marker-tag" title="Весь день">all day</div>
                    <div class="marker-tag" title="Всю неделю">all week</div>
                    <div class="marker-tag" title="В последнее время">recently</div>
                    <div class="marker-tag" title="В последнее время">lately</div>
                </div>
            `;
        } else if (tense === 'future-simple' || tense === 'going-to-future') {
            // Объясним разницу между маркерами для will и going to
            if (tense === 'future-simple') {
                resultHTML += `
                    <p style="font-size: 14px; margin-bottom: 10px;">Эти слова часто используются с Future Simple (will) для предсказаний и спонтанных решений:</p>
                `;
            } else {
                resultHTML += `
                    <p style="font-size: 14px; margin-bottom: 10px;">Эти слова часто используются с Going to Future для запланированных действий:</p>
                `;
            }
            
            resultHTML += `<div class="markers-box">`;
            tenseData.markers.forEach(marker => {
                resultHTML += `<div class="marker-tag">${marker}</div>`;
            });
            resultHTML += `</div>`;
            
        } else {
            // Для остальных времен просто показываем маркеры без дополнительных объяснений
            resultHTML += `<div class="markers-box">`;
            tenseData.markers.forEach(marker => {
                resultHTML += `<div class="marker-tag">${marker}</div>`;
            });
            resultHTML += `</div>`;
        }

        resultHTML += ``;

        // Update result card
        document.getElementById('result-card').innerHTML = resultHTML;

        // Add comparison with similar tense if applicable
        let comparisonTense = null;
        
        if (tense === 'present-perfect') {
            // Сначала сравниваем с Past Simple
            comparisonTense = 'past-simple';
            
            // Позже мы добавим дополнительное сравнение с Present Perfect Continuous
        } else if (tense === 'past-simple') {
            comparisonTense = 'present-perfect';
        } else if (tense === 'present-continuous') {
            comparisonTense = 'present-simple';
        } else if (tense === 'future-simple') {
            comparisonTense = 'going-to-future';
        } else if (tense === 'going-to-future') {
            comparisonTense = 'future-simple';
        } else if (tense === 'present-perfect-continuous') {
            comparisonTense = 'present-perfect';
        }

        if (comparisonTense && tensesData[comparisonTense]) {
            const comparisonData = tensesData[comparisonTense];
            // Создаем объяснения для сравнения времен
            let comparisonExplanation = '';
            
            if (tense === 'present-perfect' && comparisonTense === 'past-simple') {
                comparisonExplanation = 'Present Perfect описывает действие, которое связано с настоящим временем и акцентирует внимание на результате действия, а не на времени его совершения. Past Simple описывает действие, которое произошло в конкретное время в прошлом.';
            } else if (tense === 'past-simple' && comparisonTense === 'present-perfect') {
                comparisonExplanation = 'Past Simple описывает действие, которое произошло в конкретное время в прошлом. Present Perfect описывает действие, которое связано с настоящим временем и акцентирует внимание на результате.';
            } else if (tense === 'present-continuous' && comparisonTense === 'present-simple') {
                comparisonExplanation = 'Present Continuous описывает действие, которое происходит в момент речи или временно. Present Simple описывает регулярные действия или общеизвестные факты.';
            } else if (tense === 'future-simple' && comparisonTense === 'going-to-future') {
                comparisonExplanation = 'Future Simple (will) используется для предсказаний, спонтанных решений или обещаний. Going to Future используется для запланированных действий или намерений.';
            } else if (tense === 'going-to-future' && comparisonTense === 'future-simple') {
                comparisonExplanation = 'Going to Future используется для запланированных действий или намерений. Future Simple (will) используется для предсказаний, спонтанных решений или обещаний.';
            } else if (tense === 'present-perfect-continuous' && comparisonTense === 'present-perfect') {
                comparisonExplanation = 'Present Perfect Continuous акцентирует внимание на процессе и продолжительности действия. Present Perfect акцентирует внимание на результате действия.';
            } else if (tense === 'present-perfect' && comparisonTense === 'present-perfect-continuous') {
                comparisonExplanation = 'Present Perfect акцентирует внимание на результате действия. Present Perfect Continuous акцентирует внимание на процессе и продолжительности действия.';
            }
            
            let comparisonHTML = `
                <div class="section-title">Сравнение с другими временами</div>
                <p>${tenseData.name} vs. ${comparisonData.name}</p>
                <p style="margin-bottom: 15px; font-size: 14px; color: var(--dark);">${comparisonExplanation}</p>
            `;

            // Add example comparison
            comparisonHTML += `
                <div class="example-box">
                    <div class="example-original">${tenseData.examples[0].original} (${tenseData.name})</div>
                    <div class="example-translation">${tenseData.examples[0].translation}</div>
                </div>

                <div class="example-box">
                    <div class="example-original">${comparisonData.examples[0].original} (${comparisonData.name})</div>
                    <div class="example-translation">${comparisonData.examples[0].translation}</div>
                </div>
            `;

            document.getElementById('comparison-card').innerHTML = comparisonHTML;
            
            // Добавляем дополнительное сравнение для Present Perfect vs Present Perfect Continuous
            if (tense === 'present-perfect') {
                const additionalComparisonTense = 'present-perfect-continuous';
                if (tensesData[additionalComparisonTense]) {
                    const additionalComparisonData = tensesData[additionalComparisonTense];
                    const additionalExplanation = 'Present Perfect акцентирует внимание на результате действия. Present Perfect Continuous акцентирует внимание на процессе и продолжительности действия.';
                    
                    let additionalComparisonHTML = `
                        <div class="section-title" style="margin-top: 30px;">Дополнительное сравнение</div>
                        <p>${tenseData.name} vs. ${additionalComparisonData.name}</p>
                        <p style="margin-bottom: 15px; font-size: 14px; color: var(--dark);">${additionalExplanation}</p>
                        
                        <div class="example-box">
                            <div class="example-original">I have read this book. (${tenseData.name})</div>
                            <div class="example-translation">Я прочитал эту книгу. (Акцент на результате - книга прочитана)</div>
                        </div>
                        
                        <div class="example-box">
                            <div class="example-original">I have been reading this book for two hours. (${additionalComparisonData.name})</div>
                            <div class="example-translation">Я читаю эту книгу уже два часа. (Акцент на процессе - чтение всё ещё продолжается)</div>
                        </div>
                    `;
                    
                    // Добавляем дополнительное сравнение к существующему
                    document.getElementById('comparison-card').innerHTML += additionalComparisonHTML;
                }
            }
        } else {
            document.getElementById('comparison-card').innerHTML = '';
        }
    }

    // Load tenses data for the tenses page
    function loadTensesData() {
        // Present tenses
        let presentHTML = '<div class="card-title">Настоящие времена</div>';
        ['present-simple', 'present-continuous', 'present-perfect', 'present-perfect-continuous'].forEach(tense => {
            const tenseData = tensesData[tense];
            presentHTML += `
                <div class="section-title">${tenseData.name} (${tenseData.translation})</div>
                <div style="margin-bottom: 15px;">
                    <p>${tenseData.usage.slice(0, 2).join('. ')}.</p>
                </div>
                <div class="formula-box">
                    <div class="formula-title">Формула:</div>
                    <div class="formula-text">${tenseData.formulas.positive}</div>
                </div>
                <div class="example-box">
                    <div class="example-original">${tenseData.examples[0].original}</div>
                    <div class="example-translation">${tenseData.examples[0].translation}</div>
                </div>
                <div style="margin-top: 10px; margin-bottom: 20px;">
                    <strong>Когда использовать:</strong> 
                    <p style="font-size: 14px; color: var(--dark); margin-top: 5px;">${tenseData.usage.join('. ')}.</p>
                    <div style="margin-top: 5px;">
                        <strong>Слова-маркеры:</strong> <span style="font-size: 14px; color: var(--accent);">${tenseData.markers.slice(0, 5).join(', ')}</span>
                    </div>
                </div>
            `;
        });
        document.getElementById('present-tenses').innerHTML = presentHTML;

        // Past tenses
        let pastHTML = '<div class="card-title">Прошедшие времена</div>';
        ['past-simple', 'past-continuous', 'past-perfect', 'past-perfect-continuous'].forEach(tense => {
            const tenseData = tensesData[tense];
            pastHTML += `
                <div class="section-title">${tenseData.name} (${tenseData.translation})</div>
                <div style="margin-bottom: 15px;">
                    <p>${tenseData.usage.slice(0, 2).join('. ')}.</p>
                </div>
                <div class="formula-box">
                    <div class="formula-title">Формула:</div>
                    <div class="formula-text">${tenseData.formulas.positive}</div>
                </div>
                <div class="example-box">
                    <div class="example-original">${tenseData.examples[0].original}</div>
                    <div class="example-translation">${tenseData.examples[0].translation}</div>
                </div>
                <div style="margin-top: 10px; margin-bottom: 20px;">
                    <strong>Когда использовать:</strong> 
                    <p style="font-size: 14px; color: var(--dark); margin-top: 5px;">${tenseData.usage.join('. ')}.</p>
                    <div style="margin-top: 5px;">
                        <strong>Слова-маркеры:</strong> <span style="font-size: 14px; color: var(--accent);">${tenseData.markers.slice(0, 5).join(', ')}</span>
                    </div>
                </div>
            `;
        });
        document.getElementById('past-tenses').innerHTML = pastHTML;

        // Future tenses
        let futureHTML = '<div class="card-title">Будущие времена</div>';
        ['future-simple', 'future-continuous', 'future-perfect', 'future-perfect-continuous'].forEach(tense => {
            const tenseData = tensesData[tense];
            futureHTML += `
                <div class="section-title">${tenseData.name} (${tenseData.translation})</div>
                <div style="margin-bottom: 15px;">
                    <p>${tenseData.usage.slice(0, 2).join('. ')}.</p>
                </div>
                <div class="formula-box">
                    <div class="formula-title">Формула:</div>
                    <div class="formula-text">${tenseData.formulas.positive}</div>
                </div>
                <div class="example-box">
                    <div class="example-original">${tenseData.examples[0].original}</div>
                    <div class="example-translation">${tenseData.examples[0].translation}</div>
                </div>
                <div style="margin-top: 10px; margin-bottom: 20px;">
                    <strong>Когда использовать:</strong> 
                    <p style="font-size: 14px; color: var(--dark); margin-top: 5px;">${tenseData.usage.join('. ')}.</p>
                    <div style="margin-top: 5px;">
                        <strong>Слова-маркеры:</strong> <span style="font-size: 14px; color: var(--accent);">${tenseData.markers.slice(0, 5).join(', ')}</span>
                    </div>
                </div>
            `;
        });
        document.getElementById('future-tenses').innerHTML = futureHTML;

        // Add tab navigation for tenses page
        document.querySelectorAll('#tenses-page .nav-tab').forEach(tab => {
            tab.addEventListener('click', function() {
                // Remove active class from all tabs and groups
                document.querySelectorAll('#tenses-page .nav-tab').forEach(t => t.classList.remove('active'));
                document.querySelectorAll('.tense-group').forEach(g => g.classList.remove('active'));
                
                // Add active class to clicked tab and corresponding group
                this.classList.add('active');
                document.getElementById(this.getAttribute('data-tab')).classList.add('active');
            });
        });
    }

    // Load irregular verbs for the verbs page
    function loadIrregularVerbs() {
        let tableHTML = '';
        irregularVerbs.forEach(verb => {
            tableHTML += `
                <tr>
                    <td>${verb.v1}</td>
                    <td>${verb.v2}</td>
                    <td>${verb.v3}</td>
                    <td>${verb.translation}</td>
                </tr>
            `;
        });
        document.querySelector('#verb-table tbody').innerHTML = tableHTML;

        // Add search functionality
        document.getElementById('verb-search').addEventListener('input', function() {
            const searchValue = this.value.toLowerCase();
            let tableHTML = '';
            
            const filteredVerbs = irregularVerbs.filter(verb => 
                verb.v1.toLowerCase().includes(searchValue) || 
                verb.v2.toLowerCase().includes(searchValue) || 
                verb.v3.toLowerCase().includes(searchValue) || 
                verb.translation.toLowerCase().includes(searchValue)
            );
            
            filteredVerbs.forEach(verb => {
                tableHTML += `
                    <tr>
                        <td>${verb.v1}</td>
                        <td>${verb.v2}</td>
                        <td>${verb.v3}</td>
                        <td>${verb.translation}</td>
                    </tr>
                `;
            });
            
            document.querySelector('#verb-table tbody').innerHTML = tableHTML;
        });
    }
});