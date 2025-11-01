document.addEventListener('DOMContentLoaded', () => {
    // --- DOM 요소 ---
    const initialScreen = document.getElementById('initial-screen');
    const scheduleScreen = document.getElementById('schedule-screen');
    const resultScreen = document.getElementById('result-screen');
    const userSelection = document.getElementById('user-selection');
    const calendarView = document.getElementById('calendar-view');
    const resultView = document.getElementById('result-view');
    const currentMonthTitle = document.getElementById('current-month-title');
    const scheduleTitle = document.getElementById('schedule-title');
    const resultTitle = document.getElementById('result-title');

    // --- 버튼 ---
    const backToInitialBtn = document.getElementById('back-to-initial');
    const viewResultBtn = document.getElementById('view-result');
    const backToScheduleBtn = document.getElementById('back-to-schedule');
    const saveResultBtn = document.getElementById('save-result');

    // --- 데이터 및 상태 ---
    const users = [
        { id: 0, name: '상득', img: 'image/상득.jpg' },
        { id: 1, name: '원호', img: 'image/원호.jpg' },
        { id: 2, name: '찬용', img: 'image/찬용.jpg' },
        { id: 3, name: '한철', img: 'image/한철.jpg' }
    ];
    let scheduleData = {}; // { '2025-11-15': [0, 2], '2025-11-20': [1, 2, 3] }
    let currentUser = null;
    const today = new Date();
    let currentYear = today.getFullYear();
    let currentMonth = today.getMonth();

    // --- 함수 ---

    /** 화면 전환 함수 */
    function showScreen(screenToShow) {
        [initialScreen, scheduleScreen, resultScreen].forEach(screen => {
            screen.classList.add('hidden');
        });
        screenToShow.classList.remove('hidden');
    }

    /** 초기 화면 설정 */
    function setupInitialScreen() {
        const monthName = new Intl.DateTimeFormat('ko-KR', { month: 'long' }).format(new Date(currentYear, currentMonth));
        currentMonthTitle.textContent = `${currentYear}년 ${monthName}`;
        
        userSelection.innerHTML = '';
        users.forEach(user => {
            const userProfile = document.createElement('div');
            userProfile.className = 'user-profile';
            userProfile.innerHTML = `
                <img src="${user.img}" alt="${user.name}">
                <p>${user.name}</p>
            `;
            userProfile.addEventListener('click', () => {
                currentUser = user;
                setupScheduleScreen();
                showScreen(scheduleScreen);
            });
            userSelection.appendChild(userProfile);
        });
        showScreen(initialScreen);
    }

    /** 스케줄 입력 화면 설정 */
    function setupScheduleScreen() {
        const monthName = new Intl.DateTimeFormat('ko-KR', { month: 'long' }).format(new Date(currentYear, currentMonth));
        scheduleTitle.textContent = `${currentUser.name}님의 ${currentYear}년 ${monthName} 스케줄`;
        calendarView.innerHTML = '';

        const firstDay = new Date(currentYear, currentMonth, 1).getDay();
        const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
        const dayNames = ['일', '월', '화', '수', '목', '금', '토'];

        dayNames.forEach(name => {
            const dayNameCell = document.createElement('div');
            dayNameCell.className = 'day-name';
            dayNameCell.textContent = name;
            calendarView.appendChild(dayNameCell);
        });

        for (let i = 0; i < firstDay; i++) {
            const emptyCell = document.createElement('div');
            emptyCell.className = 'day empty';
            calendarView.appendChild(emptyCell);
        }

        for (let day = 1; day <= daysInMonth; day++) {
            const dayCell = document.createElement('div');
            dayCell.className = 'day';
            const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

            const dayNumber = document.createElement('div');
            dayNumber.className = 'day-number';
            dayNumber.textContent = day;
            dayCell.appendChild(dayNumber);

            const lightningBtn = document.createElement('button');
            lightningBtn.className = 'lightning-btn';
            lightningBtn.textContent = '벙개 가능';

            // 현재 사용자가 해당 날짜를 선택했는지 확인
            if (scheduleData[dateStr] && scheduleData[dateStr].includes(currentUser.id)) {
                lightningBtn.classList.add('selected');
            }

            lightningBtn.addEventListener('click', (e) => {
                // 데이터 업데이트
                if (!scheduleData[dateStr]) {
                    scheduleData[dateStr] = [];
                }
                const userIndex = scheduleData[dateStr].indexOf(currentUser.id);
                if (userIndex > -1) {
                    scheduleData[dateStr].splice(userIndex, 1); // 선택 해제
                } else {
                    scheduleData[dateStr].push(currentUser.id); // 선택
                    createSparkles(e); // 애니메이션 효과 추가
                }
                
                // 버튼 스타일 업데이트
                lightningBtn.classList.toggle('selected');
            });

            dayCell.appendChild(lightningBtn);
            calendarView.appendChild(dayCell);
        }
    }

    /** 결과 화면 설정 */
    function setupResultScreen() {
        const monthName = new Intl.DateTimeFormat('ko-KR', { month: 'long' }).format(new Date(currentYear, currentMonth));
        resultTitle.textContent = `${currentYear}년 ${monthName} 벙개 가능일`;
        resultView.innerHTML = '';

        // 최대 참석 인원 계산
        let maxAttendees = 0;
        Object.values(scheduleData).forEach(attendees => {
            if (attendees.length > maxAttendees) {
                maxAttendees = attendees.length;
            }
        });

        const firstDay = new Date(currentYear, currentMonth, 1).getDay();
        const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
        const dayNames = ['일', '월', '화', '수', '목', '금', '토'];

        dayNames.forEach(name => {
            const dayNameCell = document.createElement('div');
            dayNameCell.className = 'day-name';
            dayNameCell.textContent = name;
            resultView.appendChild(dayNameCell);
        });

        for (let i = 0; i < firstDay; i++) {
            const emptyCell = document.createElement('div');
            emptyCell.className = 'day empty';
            resultView.appendChild(emptyCell);
        }

        for (let day = 1; day <= daysInMonth; day++) {
            const dayCell = document.createElement('div');
            dayCell.className = 'day';
            const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

            const dayNumber = document.createElement('div');
            dayNumber.className = 'day-number';
            dayNumber.textContent = day;
            dayCell.appendChild(dayNumber);

            const attendees = document.createElement('div');
            attendees.className = 'attendees';

            const dailyAttendees = scheduleData[dateStr] || [];
            if (dailyAttendees.length > 0) {
                dailyAttendees.forEach(userId => {
                    const user = users.find(u => u.id === userId);
                    if (user) {
                        const userImg = document.createElement('img');
                        userImg.src = user.img;
                        userImg.alt = user.name;
                        userImg.title = user.name;
                        attendees.appendChild(userImg);
                    }
                });
                // 최대 인원일 경우 하이라이트
                if (maxAttendees > 0 && dailyAttendees.length === maxAttendees) {
                    dayCell.classList.add('highlight-day');
                }
            }
            dayCell.appendChild(attendees);
            resultView.appendChild(dayCell);
        }
    }

    // --- 이벤트 리스너 ---
    backToInitialBtn.addEventListener('click', setupInitialScreen);
    
    viewResultBtn.addEventListener('click', () => {
        setupResultScreen();
        showScreen(resultScreen);
    });

    backToScheduleBtn.addEventListener('click', () => {
        // 마지막으로 선택했던 사용자 화면으로 돌아가거나, 사용자 선택 화면으로 이동
        if (currentUser) {
            setupScheduleScreen();
            showScreen(scheduleScreen);
        } else {
            setupInitialScreen();
        }
    });

    saveResultBtn.addEventListener('click', () => {
        html2canvas(resultScreen, {
            useCORS: true,
            backgroundColor: '#ffffff'
        }).then(canvas => {
            const link = document.createElement('a');
            link.download = 'alkong-bunga-plan.jpg';
            link.href = canvas.toDataURL('image/jpeg');
            link.click();
        });
    });


    /** 불꽃 애니메이션 효과 생성 */
    function createSparkles(e) {
        const btn = e.currentTarget;
        for (let i = 0; i < 15; i++) {
            const sparkle = document.createElement('div');
            sparkle.className = 'sparkle';
            const randomX = (Math.random() - 0.5) * 80 + 'px';
            const randomY = (Math.random() - 0.5) * 80 + 'px';
            sparkle.style.setProperty('--x', randomX);
            sparkle.style.setProperty('--y', randomY);
            sparkle.style.left = `${e.offsetX}px`;
            sparkle.style.top = `${e.offsetY}px`;
            btn.appendChild(sparkle);
            setTimeout(() => {
                sparkle.remove();
            }, 700);
        }
    }

    // --- 앱 초기화 ---
    setupInitialScreen();
});
