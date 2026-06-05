// Canvas setup
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Game objects
const paddleWidth = 10;
const paddleHeight = 100;
const ballSize = 10;
const winningScore = 10;

let player = {
    x: 20,
    y: canvas.height / 2 - paddleHeight / 2,
    width: paddleWidth,
    height: paddleHeight,
    dy: 0,
    speed: 6
};

let computer = {
    x: canvas.width - paddleWidth - 20,
    y: canvas.height / 2 - paddleHeight / 2,
    width: paddleWidth,
    height: paddleHeight,
    dy: 0,
    speed: 4.5
};

let ball = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    dx: 5,
    dy: 5,
    radius: ballSize,
    speed: 5
};

let scores = {
    player: 0,
    computer: 0
};

let keys = {
    ArrowUp: false,
    ArrowDown: false
};

let mouseY = canvas.height / 2;

// Event listeners
document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowUp') keys.ArrowUp = true;
    if (e.key === 'ArrowDown') keys.ArrowDown = true;
});

document.addEventListener('keyup', (e) => {
    if (e.key === 'ArrowUp') keys.ArrowUp = false;
    if (e.key === 'ArrowDown') keys.ArrowDown = false;
});

canvas.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    mouseY = e.clientY - rect.top;
});

// Update player paddle
function updatePlayer() {
    // Mouse control
    if (mouseY > 0 && mouseY < canvas.height) {
        player.y = mouseY - paddleHeight / 2;
    }
    
    // Keyboard control (arrow keys override or complement mouse)
    if (keys.ArrowUp) {
        player.y -= player.speed;
    }
    if (keys.ArrowDown) {
        player.y += player.speed;
    }
    
    // Boundary collision
    if (player.y < 0) {
        player.y = 0;
    }
    if (player.y + paddleHeight > canvas.height) {
        player.y = canvas.height - paddleHeight;
    }
}

// Update computer paddle (AI)
function updateComputer() {
    const computerCenter = computer.y + paddleHeight / 2;
    const ballCenter = ball.y;
    
    // AI follows the ball with slight delay for difficulty
    if (computerCenter < ballCenter - 35) {
        computer.y += computer.speed;
    } else if (computerCenter > ballCenter + 35) {
        computer.y -= computer.speed;
    }
    
    // Boundary collision
    if (computer.y < 0) {
        computer.y = 0;
    }
    if (computer.y + paddleHeight > canvas.height) {
        computer.y = canvas.height - paddleHeight;
    }
}

// Update ball
function updateBall() {
    ball.x += ball.dx;
    ball.y += ball.dy;
    
    // Top and bottom wall collision
    if (ball.y - ball.radius < 0 || ball.y + ball.radius > canvas.height) {
        ball.dy = -ball.dy;
        ball.y = Math.max(ball.radius, Math.min(canvas.height - ball.radius, ball.y));
    }
    
    // Paddle collision detection
    checkPaddleCollision(player);
    checkPaddleCollision(computer);
    
    // Score and reset
    if (ball.x - ball.radius < 0) {
        scores.computer++;
        resetBall();
    }
    if (ball.x + ball.radius > canvas.width) {
        scores.player++;
        resetBall();
    }
}

// Check paddle collision with ball
function checkPaddleCollision(paddle) {
    if (ball.x - ball.radius < paddle.x + paddle.width &&
        ball.x + ball.radius > paddle.x &&
        ball.y - ball.radius < paddle.y + paddle.height &&
        ball.y + ball.radius > paddle.y) {
        
        // Reflect ball
        ball.dx = -ball.dx;
        
        // Add spin based on where ball hits paddle
        const paddleCenter = paddle.y + paddleHeight / 2;
        const relativeIntersect = ballSize - (paddleCenter - ball.y) / (paddleHeight / 2);
        ball.dy = relativeIntersect * ball.speed * 0.5;
        
        // Increase ball speed slightly
        if (Math.abs(ball.dx) < 8) {
            ball.dx *= 1.05;
        }
        if (Math.abs(ball.dy) < 8) {
            ball.dy *= 1.05;
        }
        
        // Move ball outside paddle to prevent multiple collisions
        ball.x = paddle.x > canvas.width / 2 ? 
                 paddle.x - ball.radius - 1 : 
                 paddle.x + paddle.width + ball.radius + 1;
    }
}

// Reset ball to center
function resetBall() {
    ball.x = canvas.width / 2;
    ball.y = canvas.height / 2;
    ball.dx = (Math.random() > 0.5 ? 1 : -1) * 5;
    ball.dy = (Math.random() - 0.5) * 5;
}

// Draw game objects
function draw() {
    // Clear canvas
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw center line
    ctx.strokeStyle = '#4ade80';
    ctx.setLineDash([5, 5]);
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(canvas.width / 2, 0);
    ctx.lineTo(canvas.width / 2, canvas.height);
    ctx.stroke();
    ctx.setLineDash([]);
    
    // Draw paddles
    ctx.fillStyle = '#4ade80';
    ctx.shadowColor = 'rgba(74, 222, 128, 0.5)';
    ctx.shadowBlur = 10;
    ctx.fillRect(player.x, player.y, player.width, player.height);
    ctx.fillRect(computer.x, computer.y, computer.width, computer.height);
    ctx.shadowColor = 'transparent';
    
    // Draw ball
    ctx.fillStyle = '#fff';
    ctx.shadowColor = 'rgba(255, 255, 255, 0.8)';
    ctx.shadowBlur = 15;
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowColor = 'transparent';
}

// Update score display
function updateScore() {
    document.getElementById('playerScore').textContent = scores.player;
    document.getElementById('computerScore').textContent = scores.computer;
}

// Game loop
function gameLoop() {
    updatePlayer();
    updateComputer();
    updateBall();
    draw();
    updateScore();
    
    // Check for win condition
    if (scores.player >= winningScore) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#4ade80';
        ctx.font = 'bold 48px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('You Win!', canvas.width / 2, canvas.height / 2 - 30);
        ctx.font = '24px Arial';
        ctx.fillText('Refresh to play again', canvas.width / 2, canvas.height / 2 + 30);
        return;
    }
    
    if (scores.computer >= winningScore) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#ff6b6b';
        ctx.font = 'bold 48px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Game Over!', canvas.width / 2, canvas.height / 2 - 30);
        ctx.font = '24px Arial';
        ctx.fillText('Refresh to play again', canvas.width / 2, canvas.height / 2 + 30);
        return;
    }
    
    requestAnimationFrame(gameLoop);
}

// Start the game
gameLoop();
