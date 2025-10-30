class RankingApp {
    constructor() {
        this.canvas = document.getElementById('rankingCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.circles = [];
        this.availableRanks = [];
        this.assignedRanks = [];
        this.participantCount = 0;
        this.circleRadius = 39; // 30% 증가 (30 * 1.3 = 39)
        this.isComplete = false;
        this.participantNames = [];
        
        this.initializeEventListeners();
        this.setupCanvas();
    }

    initializeEventListeners() {
        console.log('=== 이벤트 리스너 초기화 시작 ===');
        
        // 직접입력모드 관련 버튼들
        const nextToNameInputBtn = document.getElementById('nextToNameInputBtn');
        const backToCountBtn = document.getElementById('backToCountBtn');
        const startWithNameBtn = document.getElementById('startWithNameBtn');
        
        console.log('직접입력모드 버튼 요소:', { nextToNameInputBtn, backToCountBtn, startWithNameBtn });
        
        if (nextToNameInputBtn) {
            nextToNameInputBtn.addEventListener('click', () => this.showNameInputStep());
            console.log('nextToNameInputBtn 이벤트 리스너 등록 완료');
        } else {
            console.error('nextToNameInputBtn 요소를 찾을 수 없습니다');
        }
        
        if (backToCountBtn) {
            backToCountBtn.addEventListener('click', () => this.backToCountStep());
            console.log('backToCountBtn 이벤트 리스너 등록 완료');
        } else {
            console.error('backToCountBtn 요소를 찾을 수 없습니다');
        }
        
        if (startWithNameBtn) {
            startWithNameBtn.addEventListener('click', () => this.startGameWithNames());
            console.log('startWithNameBtn 이벤트 리스너 등록 완료');
        } else {
            console.error('startWithNameBtn 요소를 찾을 수 없습니다');
        }
        
        // 캔버스 클릭 이벤트
        this.canvas.addEventListener('click', (e) => this.handleCanvasClick(e));
        
        // 컨트롤 버튼들
        document.getElementById('saveBtn').addEventListener('click', () => this.saveImage());
        document.getElementById('shareBtn').addEventListener('click', () => this.shareResult());
        document.getElementById('resetBtn').addEventListener('click', () => this.resetGame());
        
        // 결과 화면 버튼들
        document.getElementById('resultSaveBtn').addEventListener('click', () => this.saveResultImage());
        document.getElementById('resultResetBtn').addEventListener('click', () => this.resetGame());
        
        // 직접입력모드 Enter 키로 다음 단계
        document.getElementById('nameParticipantCount').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.showNameInputStep();
            }
        });
    }

    setupCanvas() {
        try {
            // 캔버스와 컨텍스트 존재 확인
            if (!this.canvas || !this.ctx) {
                console.error('캔버스 또는 컨텍스트가 존재하지 않습니다');
                return false;
            }

            // 캔버스 크기 설정
            const container = this.canvas.parentElement;
            if (!container) {
                console.error('캔버스 컨테이너가 존재하지 않습니다');
                return false;
            }

            const displayWidth = Math.max(300, container.clientWidth - 40);
            const displayHeight = 500;
            
            // 고해상도 디스플레이 지원 (DPR 제한)
            const dpr = Math.min(window.devicePixelRatio || 1, 2);
            
            // 캔버스 실제 크기 설정
            this.canvas.width = displayWidth * dpr;
            this.canvas.height = displayHeight * dpr;
            
            // CSS 크기 설정
            this.canvas.style.width = displayWidth + 'px';
            this.canvas.style.height = displayHeight + 'px';
            
            // 컨텍스트 스케일 조정
            this.ctx.scale(dpr, dpr);
            
            console.log('캔버스 설정 완료:', {
                displayWidth,
                displayHeight,
                actualWidth: this.canvas.width,
                actualHeight: this.canvas.height,
                dpr
            });
            
            return true;
        } catch (error) {
            console.error('캔버스 설정 중 에러 발생:', error);
            return false;
        }
    }


    generateCircles() {
        const canvasWidth = this.canvas.width / (window.devicePixelRatio || 1);
        const canvasHeight = this.canvas.height / (window.devicePixelRatio || 1);
        
        // 그리드 기반 균등 배치 알고리즘
        this.generateGridCircles(canvasWidth, canvasHeight);
    }

    generateGridCircles(canvasWidth, canvasHeight) {
        const margin = this.circleRadius + 30; // 여백 설정
        const minDistance = this.circleRadius * 3; // 동그라미 간 최소 거리 (반지름의 3배)
        const maxAttempts = 1000; // 최대 시도 횟수
        const positions = [];
        
        console.log(`랜덤 배치 시작: 캔버스 ${canvasWidth}x${canvasHeight}, 최소 거리: ${minDistance}px`);
        
        // 완전 랜덤 배치 알고리즘
        for (let i = 0; i < this.participantCount; i++) {
            let position = null;
            let attempts = 0;
            
            while (attempts < maxAttempts && !position) {
                // 랜덤 위치 생성
                const x = margin + Math.random() * (canvasWidth - 2 * margin);
                const y = margin + Math.random() * (canvasHeight - 2 * margin);
                
                // 다른 동그라미와의 거리 확인
                let isValid = true;
                for (let j = 0; j < positions.length; j++) {
                    const distance = Math.sqrt(
                        Math.pow(x - positions[j].x, 2) + 
                        Math.pow(y - positions[j].y, 2)
                    );
                    
                    if (distance < minDistance) {
                        isValid = false;
                        break;
                    }
                }
                
                if (isValid) {
                    position = { x, y };
                }
                
                attempts++;
            }
            
            if (position) {
                positions.push(position);
                console.log(`동그라미 ${i + 1}: (${position.x.toFixed(1)}, ${position.y.toFixed(1)}) - ${attempts}번 시도`);
            } else {
                console.warn(`동그라미 ${i + 1} 배치 실패: ${maxAttempts}번 시도 후 위치를 찾지 못함`);
                // 실패 시 강제로 배치 (최소한의 간격만 보장)
                const x = margin + Math.random() * (canvasWidth - 2 * margin);
                const y = margin + Math.random() * (canvasHeight - 2 * margin);
                positions.push({ x, y });
            }
        }
        
        // 동그라미 생성
        for (let i = 0; i < positions.length; i++) {
            const pos = positions[i];
            
            const circle = {
                x: pos.x,
                y: pos.y,
                radius: this.circleRadius,
                rank: null,
                color: this.getRandomColor(),
                id: i
            };
            
            this.circles.push(circle);
        }
        
        console.log(`${this.circles.length}개의 동그라미 랜덤 배치 완료`);
        
        // 최종 거리 확인 (디버깅용)
        let minActualDistance = Infinity;
        for (let i = 0; i < this.circles.length; i++) {
            for (let j = i + 1; j < this.circles.length; j++) {
                const distance = Math.sqrt(
                    Math.pow(this.circles[i].x - this.circles[j].x, 2) + 
                    Math.pow(this.circles[i].y - this.circles[j].y, 2)
                );
                minActualDistance = Math.min(minActualDistance, distance);
            }
        }
        console.log(`실제 최소 거리: ${minActualDistance.toFixed(1)}px (목표: ${minDistance}px)`);
    }

    checkCollision(x, y) {
        for (let circle of this.circles) {
            const distance = Math.sqrt(
                Math.pow(x - circle.x, 2) + Math.pow(y - circle.y, 2)
            );
            if (distance < (this.circleRadius * 2 + 10)) {
                return true;
            }
        }
        return false;
    }

    getRandomColor() {
        const colors = [
            '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
            '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E2',
            '#F8B739', '#52B788', '#E76F51', '#F72585', '#7209B7'
        ];
        return colors[Math.floor(Math.random() * colors.length)];
    }

    drawCircles() {
        const canvasWidth = this.canvas.width / (window.devicePixelRatio || 1);
        const canvasHeight = this.canvas.height / (window.devicePixelRatio || 1);
        
        // 캔버스 초기화
        this.ctx.clearRect(0, 0, canvasWidth, canvasHeight);
        
        // 동그라미 그리기
        this.circles.forEach(circle => {
            // 그림자 효과
            this.ctx.shadowColor = 'rgba(0, 0, 0, 0.2)';
            this.ctx.shadowBlur = 10;
            this.ctx.shadowOffsetX = 3;
            this.ctx.shadowOffsetY = 3;
            
            // 일반 동그라미 그리기
            this.ctx.beginPath();
            this.ctx.arc(circle.x, circle.y, circle.radius, 0, Math.PI * 2);
            this.ctx.fillStyle = circle.color;
            this.ctx.fill();
            
            // 테두리
            this.ctx.shadowColor = 'transparent';
            this.ctx.strokeStyle = '#fff';
            this.ctx.lineWidth = 3;
            this.ctx.stroke();
            
            // 순위 텍스트 (순위가 있을 때)
            if (circle.rank !== null) {
                this.ctx.shadowColor = 'transparent';
                
                // 순위 배경
                this.ctx.beginPath();
                this.ctx.arc(circle.x, circle.y, 20, 0, Math.PI * 2);
                this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
                this.ctx.fill();
                
                // 순위 텍스트
                this.ctx.fillStyle = '#fff';
                this.ctx.font = 'bold 18px Arial';
                this.ctx.textAlign = 'center';
                this.ctx.textBaseline = 'middle';
                this.ctx.fillText(circle.rank.toString(), circle.x, circle.y);
            }
            // 이름 텍스트 (순위가 없을 때만 동그라미 안에 표시)
            else if (circle.name) {
                this.ctx.shadowColor = 'transparent';
                this.ctx.fillStyle = '#fff';
                this.ctx.textAlign = 'center';
                this.ctx.textBaseline = 'middle';
                
                // 텍스트 길이에 따라 동적 폰트 크기 조절
                let fontSize = 14;
                const maxTextWidth = circle.radius * 1.6; // 동그라미 지름의 80%
                
                do {
                    this.ctx.font = `bold ${fontSize}px Arial`;
                    const textWidth = this.ctx.measureText(circle.name).width;
                    if (textWidth <= maxTextWidth) break;
                    fontSize -= 1;
                } while (fontSize > 8);
                
                // 텍스트 그림자 효과로 가독성 향상
                this.ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
                this.ctx.shadowBlur = 2;
                this.ctx.shadowOffsetX = 1;
                this.ctx.shadowOffsetY = 1;
                
                // 이름 텍스트 그리기
                this.ctx.fillText(circle.name, circle.x, circle.y);
                
                // 그림자 효과 초기화
                this.ctx.shadowColor = 'transparent';
            }
        });
    }

    handleCanvasClick(event) {
        if (this.isComplete) return;
        
        const rect = this.canvas.getBoundingClientRect();
        const scaleX = this.canvas.width / rect.width / (window.devicePixelRatio || 1);
        const scaleY = this.canvas.height / rect.height / (window.devicePixelRatio || 1);
        
        const x = (event.clientX - rect.left) * scaleX;
        const y = (event.clientY - rect.top) * scaleY;
        
        // 클릭된 동그라미 찾기
        for (let circle of this.circles) {
            const distance = Math.sqrt(
                Math.pow(x - circle.x, 2) + Math.pow(y - circle.y, 2)
            );
            
            if (distance <= circle.radius && circle.rank === null) {
                this.assignRank(circle);
                break;
            }
        }
    }

    assignRank(circle) {
        if (this.availableRanks.length === 0) return;
        
        const rank = this.availableRanks.shift();
        circle.rank = rank;
        this.assignedRanks.push({ circle: circle, rank: rank });
        
        // 즉시 다시 그리기 (애니메이션 제거)
        this.drawCircles();
        
        // 상태 업데이트
        this.updateStatus();
        
        // 완료 체크
        if (this.availableRanks.length === 0) {
            this.completeGame();
        }
    }

    updateStatus() {
        const statusElement = document.getElementById('rankStatus');
        const remaining = this.availableRanks.length;
        const total = this.participantCount;
        const assigned = total - remaining;
        
        statusElement.textContent = `순위 할당: ${assigned}/${total} (남은 순위: ${remaining}개)`;
    }

    completeGame() {
        this.isComplete = true;
        
        // 결과 정렬
        this.assignedRanks.sort((a, b) => a.rank - b.rank);
        
        // 결과 화면 생성
        this.generateResultScreen();
        
        setTimeout(() => {
            this.showScreen('resultScreen');
        }, 1000);
    }

    generateResultScreen() {
        const resultList = document.getElementById('resultList');
        resultList.innerHTML = '';
        
        this.assignedRanks.forEach((assigned, index) => {
            const circle = assigned.circle;
            const rank = assigned.rank;
            
            const resultItem = document.createElement('div');
            resultItem.className = 'result-item';
            
            // 순위 표시
            const rankElement = document.createElement('div');
            rankElement.className = `result-rank rank-${rank}`;
            rankElement.textContent = `${rank}위`;
            
            // 콘텐츠 컨테이너
            const contentElement = document.createElement('div');
            contentElement.className = 'result-content';
            
            // 동그라미 모드
            const circleElement = document.createElement('div');
            circleElement.className = 'result-circle';
            circleElement.style.background = circle.color;
            contentElement.appendChild(circleElement);
            
            // 이름 표시
            const nameElement = document.createElement('div');
            nameElement.className = 'result-name';
            nameElement.textContent = circle.name || `참가자 ${circle.id + 1}`;
            contentElement.appendChild(nameElement);
            
            resultItem.appendChild(rankElement);
            resultItem.appendChild(contentElement);
            resultList.appendChild(resultItem);
        });
    }

    async saveImage() {
        try {
            // 먼저 Canvas API 직접 사용 시도
            const success = this.saveCanvasDirect();
            if (success) return;
            
            // 실패 시 html2canvas 사용
            const canvasContainer = document.getElementById('canvasContainer');
            
            const canvas = await html2canvas(canvasContainer, {
                backgroundColor: '#ffffff',
                scale: 2
            });
            
            // 다운로드 링크 생성
            const link = document.createElement('a');
            link.download = `ranking-result-${Date.now()}.jpg`;
            link.href = canvas.toDataURL('image/jpeg', 0.9);
            link.click();
            
            this.showMessage('이미지가 저장되었습니다.');
        } catch (error) {
            console.error('이미지 저장 실패:', error);
            this.showMessage('이미지 저장에 실패했습니다.');
        }
    }

    // Canvas API 직접 사용한 이미지 저장
    saveCanvasDirect() {
        try {
            // 새 캔버스 생성
            const saveCanvas = document.createElement('canvas');
            const saveCtx = saveCanvas.getContext('2d');
            
            // 고해상도 설정
            const scale = 2;
            const canvasWidth = this.canvas.width / (window.devicePixelRatio || 1);
            const canvasHeight = this.canvas.height / (window.devicePixelRatio || 1);
            
            saveCanvas.width = canvasWidth * scale;
            saveCanvas.height = canvasHeight * scale;
            saveCtx.scale(scale, scale);
            
            // 흰색 배경
            saveCtx.fillStyle = '#ffffff';
            saveCtx.fillRect(0, 0, canvasWidth, canvasHeight);
            
            // 현재 캔버스 내용 복사
            saveCtx.drawImage(this.canvas, 0, 0, canvasWidth, canvasHeight);
            
            // 이미지 다운로드
            saveCanvas.toBlob((blob) => {
                if (blob) {
                    const url = URL.createObjectURL(blob);
                    const link = document.createElement('a');
                    link.download = `ranking-result-${Date.now()}.jpg`;
                    link.href = url;
                    link.click();
                    URL.revokeObjectURL(url);
                    
                    this.showMessage('이미지가 저장되었습니다.');
                }
            }, 'image/jpeg', 0.95);
            
            return true;
        } catch (error) {
            console.error('Canvas 직접 저장 실패:', error);
            return false;
        }
    }

    async saveResultImage() {
        try {
            const resultContainer = document.querySelector('.result-container');
            
            const canvas = await html2canvas(resultContainer, {
                backgroundColor: '#ffffff',
                scale: 2
            });
            
            // 다운로드 링크 생성
            const link = document.createElement('a');
            link.download = `ranking-result-${Date.now()}.jpg`;
            link.href = canvas.toDataURL('image/jpeg', 0.9);
            link.click();
            
            this.showMessage('결과 화면이 저장되었습니다.');
        } catch (error) {
            console.error('결과 화면 저장 실패:', error);
            this.showMessage('결과 화면 저장에 실패했습니다.');
        }
    }

    async shareResult() {
        try {
            const canvasContainer = document.getElementById('canvasContainer');
            
            const canvas = await html2canvas(canvasContainer, {
                backgroundColor: '#ffffff',
                scale: 2
            });
            
            canvas.toBlob(async (blob) => {
                if (navigator.share && navigator.canShare && navigator.canShare({ files: [new File([blob], 'ranking-result.jpg', { type: 'image/jpeg' })] })) {
                    // Web Share API 사용
                    const file = new File([blob], 'ranking-result.jpg', { type: 'image/jpeg' });
                    await navigator.share({
                        title: '순위 매기기 결과',
                        text: '순위 매기기 결과를 공유합니다!',
                        files: [file]
                    });
                } else {
                    // 클립보드에 복사
                    try {
                        await navigator.clipboard.write([
                            new ClipboardItem({ 'image/jpeg': blob })
                        ]);
                        this.showMessage('이미지가 클립보드에 복사되었습니다.');
                    } catch (clipboardError) {
                        // 다운로드로 대체
                        const link = document.createElement('a');
                        link.download = `ranking-result-${Date.now()}.jpg`;
                        link.href = URL.createObjectURL(blob);
                        link.click();
                        this.showMessage('이미지가 다운로드되었습니다.');
                    }
                }
            }, 'image/jpeg', 0.9);
            
        } catch (error) {
            console.error('공유 실패:', error);
            this.showMessage('공유에 실패했습니다.');
        }
    }

    resetGame() {
        console.log('=== resetGame 시작 (단순화 버전) ===');
        
        try {
            // 1. 상태 변수 초기화
            this.circles = [];
            this.availableRanks = [];
            this.assignedRanks = [];
            this.participantCount = 0;
            this.participantNames = [];
            this.isComplete = false;
            
            // 2. 캔버스 초기화
            if (this.canvas && this.ctx) {
                const canvasWidth = this.canvas.width / (window.devicePixelRatio || 1);
                const canvasHeight = this.canvas.height / (window.devicePixelRatio || 1);
                this.ctx.clearRect(0, 0, canvasWidth, canvasHeight);
            }
            
            // 3. 입력 화면으로 전환
            this.showScreen('inputScreen');
            
            // 4. DOM 상태 초기화
            const nameInputsContainer = document.getElementById('nameInputsContainer');
            if (nameInputsContainer) {
                nameInputsContainer.innerHTML = '';
            }
            
            const nameInputStep1 = document.getElementById('nameInputStep1');
            const nameInputStep2 = document.getElementById('nameInputStep2');
            const startWithNameBtn = document.getElementById('startWithNameBtn');
            const nameParticipantCount = document.getElementById('nameParticipantCount');
            
            if (nameInputStep1) nameInputStep1.style.display = 'block';
            if (nameInputStep2) nameInputStep2.style.display = 'none';
            if (startWithNameBtn) {
                startWithNameBtn.disabled = true;
                startWithNameBtn.textContent = '시작하기';
            }
            if (nameParticipantCount) nameParticipantCount.value = '5';
            
            console.log('✅ resetGame 성공적으로 완료');
            
        } catch (error) {
            console.error('❌ resetGame 중 오류 발생:', error);
            this.showMessage('리셋 중 오류가 발생했습니다. 페이지를 새로고침해주세요.');
        }
    }
    

    showScreen(screenId) {
        // 모든 화면 숨기기
        document.querySelectorAll('.screen').forEach(screen => {
            screen.classList.remove('active');
        });
        
        // 선택된 화면 보이기
        document.getElementById(screenId).classList.add('active');
    }

    showMessage(message) {
        // 임시 메시지 표시
        const messageDiv = document.createElement('div');
        messageDiv.style.cssText = `
            position: fixed;
            top: 20px;
            left: 50%;
            transform: translateX(-50%);
            background: rgba(0, 0, 0, 0.8);
            color: white;
            padding: 15px 25px;
            border-radius: 10px;
            z-index: 1000;
            font-size: 16px;
        `;
        messageDiv.textContent = message;
        document.body.appendChild(messageDiv);
        
        setTimeout(() => {
            document.body.removeChild(messageDiv);
        }, 3000);
    }

    shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }


    // 직접입력모드 이름 입력 단계로 전환 (최종 해결 버전)
    showNameInputStep() {
        console.log('=== showNameInputStep 시작 (최종 해결 버전) ===');
        
        try {
            const input = document.getElementById('nameParticipantCount');
            if (!input) {
                console.error('❌ nameParticipantCount 요소를 찾을 수 없음');
                this.showMessage('참여자 수 입력 필드를 찾을 수 없습니다.');
                return;
            }
            
            const count = parseInt(input.value);
            console.log('입력된 참여자 수:', count);
            
            if (isNaN(count) || count < 2 || count > 30) {
                this.showMessage('2에서 30 사이의 숫자를 입력해주세요.');
                return;
            }
            
            this.participantCount = count;
            console.log('참여자 수 설정:', this.participantCount);
            
            // 이름 입력 필드 생성
            console.log('이름 입력 필드 생성 시작...');
            this.generateNameInputs();
            console.log('이름 입력 필드 생성 완료');
            
            // 단계 전환 (가장 단순한 방식)
            console.log('단계 전환 실행...');
            
            const step1 = document.getElementById('nameInputStep1');
            const step2 = document.getElementById('nameInputStep2');
            
            if (step1) {
                step1.style.display = 'none';
                console.log('✅ 1단계 숨김 완료');
            } else {
                console.error('❌ nameInputStep1 요소를 찾을 수 없음');
            }
            
            if (step2) {
                step2.style.display = 'block';
                console.log('✅ 2단계 표시 완료');
            } else {
                console.error('❌ nameInputStep2 요소를 찾을 수 없음');
            }
            
            // 즉시 상태 확인
            console.log('🔍 즉시 상태 확인:');
            console.log('step1 display:', step1?.style.display);
            console.log('step2 display:', step2?.style.display);
            console.log('nameInputsContainer children:', document.getElementById('nameInputsContainer')?.children.length);
            
            // 성공 메시지
            this.showMessage(`${count}명의 이름을 입력해주세요.`);
            
            console.log('✅ showNameInputStep 성공적으로 완료');
            
        } catch (error) {
            console.error('❌ showNameInputStep 중 오류 발생:', error);
            this.showMessage('이름 입력 단계로 전환 중 오류가 발생했습니다.');
        }
    }
    
    // 이름 입력 단계 상태 검증
    verifyNameInputStep() {
        console.log('=== verifyNameInputStep 시작 ===');
        
        const step1 = document.getElementById('nameInputStep1');
        const step2 = document.getElementById('nameInputStep2');
        const container = document.getElementById('nameInputsContainer');
        
        let issues = [];
        
        // 1. 단계 표시 상태 검증
        if (step1 && step1.style.display !== 'none') {
            console.warn('1단계가 숨겨지지 않음, 강제 수정');
            step1.style.display = 'none';
            issues.push('1단계 표시 수정');
        }
        
        if (step2 && step2.style.display !== 'block') {
            console.warn('2단계가 표시되지 않음, 강제 수정');
            step2.style.display = 'block';
            issues.push('2단계 표시 수정');
        }
        
        // 2. 이름 입력 필드 검증
        if (container && container.children.length === 0) {
            console.warn('이름 입력 필드가 없음, 재생성');
            this.generateNameInputs();
            issues.push('이름 입력 필드 재생성');
        }
        
        // 3. 입력 필드 수 검증
        const inputCount = container ? container.querySelectorAll('input').length : 0;
        if (inputCount !== this.participantCount) {
            console.warn(`입력 필드 수 불일치: ${inputCount}개, ${this.participantCount}개 필요, 재생성`);
            this.generateNameInputs();
            issues.push('입력 필드 수 수정');
        }
        
        if (issues.length > 0) {
            console.warn('이름 입력 단계 문제 수정:', issues);
        } else {
            console.log('✅ 이름 입력 단계 상태 정상');
        }
        
        console.log('=== verifyNameInputStep 완료 ===');
    }
    
    // 인원수 입력 단계로 돌아가기
    backToCountStep() {
        document.getElementById('nameInputStep1').style.display = 'block';
        document.getElementById('nameInputStep2').style.display = 'none';
        document.getElementById('startWithNameBtn').disabled = true;
    }
    
    // 이름 입력 필드 생성
    generateNameInputs() {
        const container = document.getElementById('nameInputsContainer');
        container.innerHTML = '';
        
        for (let i = 0; i < this.participantCount; i++) {
            const inputGroup = document.createElement('div');
            inputGroup.className = 'name-input-group';
            
            const label = document.createElement('label');
            label.textContent = `참여자 ${i + 1}`;
            
            const input = document.createElement('input');
            input.type = 'text';
            input.id = `nameInput${i}`;
            input.placeholder = `참석자${i + 1}`;
            input.maxLength = 20;
            
            // 입력 이벤트 리스너
            input.addEventListener('input', () => this.checkNameInputsComplete());
            
            inputGroup.appendChild(label);
            inputGroup.appendChild(input);
            container.appendChild(inputGroup);
        }
    }
    
    // 이름 입력 완료 확인
    checkNameInputsComplete() {
        const inputs = document.querySelectorAll('#nameInputsContainer input');
        const allFilled = Array.from(inputs).every(input => input.value.trim() !== '');
        document.getElementById('startWithNameBtn').disabled = !allFilled;
    }
    
    // 이름과 함께 게임 시작
    startGameWithNames() {
        const names = [];
        for (let i = 0; i < this.participantCount; i++) {
            const input = document.getElementById(`nameInput${i}`);
            names.push(input.value.trim());
        }
        
        this.participantNames = names;
        this.startGameWithNamesData();
    }
    
    // 이름 데이터로 게임 시작
    startGameWithNamesData() {
        console.log('직접입력모드 게임 시작 - 참가자 수:', this.participantCount);
        console.log('참가자 이름:', this.participantNames);
        
        this.circles = [];
        this.availableRanks = [];
        this.assignedRanks = [];
        this.isComplete = false;
        
        // 순위 배열 생성 및 셔플
        for (let i = 1; i <= this.participantCount; i++) {
            this.availableRanks.push(i);
        }
        this.shuffleArray(this.availableRanks);
        
        // 화면 전환
        this.showScreen('gameScreen');
        
        // 캔버스 다시 설정
        this.setupCanvas();
        
        // 동그라미 생성
        this.generateCirclesWithNames();
        
        // 동그라미 그리기
        this.drawCircles();
        
        // 상태 업데이트
        this.updateStatus();
        
        // 안내 메시지 업데이트
        document.querySelector('.info p').textContent = '동그라미를 클릭하여 순위를 매겨주세요';
    }
    
    // 이름이 있는 동그라미 생성
    generateCirclesWithNames() {
        const canvasWidth = this.canvas.width / (window.devicePixelRatio || 1);
        const canvasHeight = this.canvas.height / (window.devicePixelRatio || 1);
        
        // 그리드 기반 균등 배치 알고리즘
        this.generateGridCircles(canvasWidth, canvasHeight);
        
        // 이름 정보 추가
        for (let i = 0; i < this.circles.length; i++) {
            this.circles[i].name = this.participantNames[i];
        }
    }


}

// 단일 인스턴스 패턴
let appInstance = null;

// 앱 초기화
document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 앱 초기화 시작');
    
    try {
        appInstance = new RankingApp();
        
        // 전역 변수로 앱 인스턴스 노출
        window.appInstance = appInstance;
        
        console.log('✅ 앱 인스턴스 생성 완료');
        
        // 페이지 로드 후 1초 뒤 상태 모니터링 시작
        setTimeout(() => {
            console.log('� 자동 상태 모니터링 시작');
            if (appInstance && appInstance.monitorState) {
                appInstance.monitorState();
            }
        }, 1000);
        
    } catch (error) {
        console.error('❌ 앱 초기화 실패:', error);
        console.error('에러 스택:', error.stack);
        
        // 에러 발생 시 사용자에게 알림
        alert('앱 초기화에 실패했습니다. 페이지를 새로고침해주세요.');
    }
});

// 창 크기 조절 시 캔버스 재설정
window.addEventListener('resize', () => {
    if (appInstance) {
        appInstance.setupCanvas();
        if (appInstance.circles.length > 0) {
            appInstance.drawCircles();
        }
    }
});
