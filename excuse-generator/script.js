(function(){
    const data = {
        en: {
            parts1: [
                "The server", "My code", "The compiler", "JavaScript", "CSS", "HTML", "The database", "The network",
                "My laptop", "The intern", "The browser", "The OS", "The cloud service"
            ],
            parts2: [
                "exploded", "decided to take a nap", "refused to cooperate", "lost its marbles", "stalled", "failed to initialize",
                "compiled into spaghetti", "walked off the job", "went on strike", "became self-aware", "opted for recursion forever",
                "sent an error to Mars"
            ],
            parts3: [
                "because of DNS issues.", "after I refreshed 17 times.", "when I looked away.", "during a standby meeting.",
                "while I was debugging in my dreams.", "due to lunar phase.", "when Murphy was on vacation.",
                "because the coffee machine broke.", "in a parallel universe.", "because I forgot a semicolon.",
                "and then the universe ended.", "without warning during lunchtime."
            ],
            copy: 'Copy 📋',
            copied: 'Copied ✅',
            generate: 'Generate Again 🔁',
            title: '🖥️ Programming Excuse Generator',
            langLabel: 'Language:'
        },
        ru: {
            parts1: [
                "Сервер", "Мой код", "Компилятор", "JavaScript", "CSS", "HTML", "База данных", "Сеть",
                "Мой ноут", "Стажёр", "Браузер", "ОС", "Облачный сервис"
            ],
            parts2: [
                "взорвался", "решил вздремнуть", "отказался сотрудничать", "потерял дар речи", "завис", "не смог инициализироваться",
                "скомпилировался в спагетти", "ушёл с работы", "вступил в забастовку", "обрёл самосознание", "выбрал рекурсию навсегда",
                "отправил ошибку на Марс"
            ],
            parts3: [
                "из-за проблем с DNS.", "после 17 перезагрузок.", "когда я отвлекся.", "во время стендапа.",
                "пока я отлаживал в снах.", "из-за фазы Луны.", "когда Мёрфи был в отпуске.",
                "потому что сломался кофейный автомат.", "в параллельной вселенной.", "потому что забыл точку с запятой.",
                "и тогда вселенная закончилась.", "без предупреждения за обедом."
            ],
            copy: 'Скопировать 📋',
            copied: 'Скопировано ✅',
            generate: 'Сгенерировать снова 🔁',
            title: '🖥️ Генератор оправданий',
            langLabel: 'Язык:'
        }
    };

    let current = 'en';
    let parts1 = data.en.parts1;
    let parts2 = data.en.parts2;
    let parts3 = data.en.parts3;

    const output = document.getElementById('output');
    const copyBtn = document.getElementById('copyBtn');
    const generateBtn = document.getElementById('generateBtn');
    const langSelect = document.getElementById('langSelect');

    function randomItem(arr){
        return arr[Math.floor(Math.random()*arr.length)];
    }

    function buildExcuse(){
        return `${randomItem(parts1)} ${randomItem(parts2)} ${randomItem(parts3)}`;
    }

    function animateText(text){
        output.textContent = '';
        // simple typing effect
        let i = 0;
        output.classList.add('animate');
        const interval = setInterval(()=>{
            if(i<text.length){
                output.textContent += text[i++];
            } else {
                clearInterval(interval);
                output.classList.remove('animate');
            }
        },30);
    }

    function generate(){
        const excuse = buildExcuse();
        animateText(excuse);
        spawnEmojis(8); // drop some emojis each time
    }

    function updateLocale(lang){
        current = lang;
        parts1 = data[lang].parts1;
        parts2 = data[lang].parts2;
        parts3 = data[lang].parts3;
        copyBtn.textContent = data[lang].copy;
        generateBtn.textContent = data[lang].generate;
        document.querySelector('.title').textContent = data[lang].title;
        document.querySelector('label[for="langSelect"]').textContent = data[lang].langLabel;
    }

    langSelect.addEventListener('change',()=>{
        updateLocale(langSelect.value);
        generate();
    });

    generateBtn.addEventListener('click', generate);

    copyBtn.addEventListener('click',()=>{
        const text = output.textContent;
        if(!text) return;
        navigator.clipboard.writeText(text).then(()=>{
            copyBtn.textContent = data[current].copied;
            setTimeout(()=>copyBtn.textContent=data[current].copy,800);
        });
    });

    function spawnEmojis(count){
        const container = document.getElementById('emoji-container');
        for(let i=0;i<count;i++){
            const emoji = document.createElement('div');
            emoji.className='emoji ' + (Math.random()<0.5 ? 'cw' : 'ccw');
            emoji.textContent = '😂';
            // random horizontal position
            emoji.style.left = Math.random()*100+'%';
            // random delay
            emoji.style.animationDelay = (Math.random()*0.5)+'s';
            container.appendChild(emoji);
            // remove after animation
            emoji.addEventListener('animationend',()=>emoji.remove());
        }
    }
    // initial
    window.addEventListener('load',()=>{
        updateLocale(current);
        generate();
    });
}());