document.addEventListener('DOMContentLoaded', function() {
    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');
    const box = 20;
    const canvasSize = 400;
    let snake = [{ x: 9 * box, y: 10 * box }];
    let direction = 'RIGHT'; // 시작 방향을 오른쪽으로 고정
    let food = randomPosition();
    let score = 0;
    let gameInterval = null;
    let isGameOver = false;

    function randomPosition() {
        return {
            x: Math.floor(Math.random() * (canvasSize / box)) * box,
            y: Math.floor(Math.random() * (canvasSize / box)) * box
        };
    }

    function draw() {
        // 더 진한 배경
        ctx.fillStyle = '#111a22';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Draw snake
        for (let i = 0; i < snake.length; i++) {
            ctx.fillStyle = i === 0 ? '#4caf50' : '#8bc34a';
            ctx.fillRect(snake[i].x, snake[i].y, box, box);
            ctx.strokeStyle = '#222';
            ctx.strokeRect(snake[i].x, snake[i].y, box, box);
        }

        // Draw food
        ctx.fillStyle = '#ff5252'; // 더 밝은 빨강
        ctx.fillRect(food.x, food.y, box, box);

        // Draw score
        document.getElementById('score').textContent = `점수: ${score}`;
    }

    function moveSnake() {
        let head = { ...snake[0] };
        if (direction === 'LEFT') head.x -= box;
        if (direction === 'UP') head.y -= box;
        if (direction === 'RIGHT') head.x += box;
        if (direction === 'DOWN') head.y += box;

        // 벽 충돌
        if (
            head.x < 0 || head.x >= canvasSize ||
            head.y < 0 || head.y >= canvasSize
        ) {
            gameOver();
            return;
        }

        // 자기 몸 충돌
        for (let i = 0; i < snake.length; i++) {
            if (head.x === snake[i].x && head.y === snake[i].y) {
                gameOver();
                return;
            }
        }

        // 먹이 먹기
        if (head.x === food.x && head.y === food.y) {
            score++;
            food = randomPosition();
        } else {
            snake.pop();
        }
        snake.unshift(head);
    }

    function gameOver() {
        clearInterval(gameInterval);
        isGameOver = true;
        ctx.fillStyle = 'rgba(0,0,0,0.7)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#fff';
        ctx.font = '32px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('게임 오버!', canvas.width / 2, canvas.height / 2);
        ctx.font = '20px sans-serif';
        ctx.fillText(`최종 점수: ${score}`, canvas.width / 2, canvas.height / 2 + 40);
        ctx.font = '16px sans-serif';
        ctx.fillText('스페이스바를 눌러 재시작', canvas.width / 2, canvas.height / 2 + 70);
    }

    function gameLoop() {
        if (!isGameOver) {
            moveSnake();
            draw();
        }
    }

    document.addEventListener('keydown', e => {
        if (e.key === 'ArrowLeft' && direction !== 'RIGHT') direction = 'LEFT';
        else if (e.key === 'ArrowUp' && direction !== 'DOWN') direction = 'UP';
        else if (e.key === 'ArrowRight' && direction !== 'LEFT') direction = 'RIGHT';
        else if (e.key === 'ArrowDown' && direction !== 'UP') direction = 'DOWN';
        // 게임 재시작
        if (e.key === ' ' && isGameOver) restartGame();
    });

    function restartGame() {
        snake = [{ x: 9 * box, y: 10 * box }];
        direction = 'RIGHT';
        food = randomPosition();
        score = 0;
        isGameOver = false;
        draw();
        clearInterval(gameInterval);
        gameInterval = setInterval(gameLoop, 100);
    }

    // 초기화면 2번 그리기(혹시 모를 렌더링 문제 방지)
    draw();
    setTimeout(draw, 10);
    gameInterval = setInterval(gameLoop, 100);
});
