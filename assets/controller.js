(function() {

    const KEY_UP       = 87;
    const KEY_DOWN     = 83;
    const KEY_SPACEBAR = 32;

    const GAME_SIZE_WIDTH = 640;
    const GAME_SIZE_HEIGHT = 480;

    const PLAYER_JUMP_SPEED = 4;
    const PLAYER_POS_X = 50;
    const PLAYER_POS_Y = 150;
    const PLAYER_SIZE_WIDTH = 114;
    const PLAYER_SIZE_HEIGHT = 70;
    const PLAYER_MIDPOINT = PLAYER_POS_X + (PLAYER_SIZE_WIDTH / 2)

    const ENEMY_STARTING_POS_X = 680;
    const ENEMY_STARTING_POS_Y = 375;
    const ENEMY_SIZE_WIDTH = 114;
    const ENEMY_SIZE_HEIGHT = 70;
    const ENEMY_MOVE_SPEED = 4;

    const LASER_SIZE_WIDTH = 28;
    const LASER_SIZE_HEIGHT = 12;
    const LASER_MOVE_SPEED = 8;

    const TEXT_POS_X = 20;
    const TEXT_POS_Y = 40;

    const MAX_ENEMYS = 4;
    const MIN_ENEMY_DISTANCE = GAME_SIZE_WIDTH;

    const canvas = document.getElementById('game-surface');
    const context = canvas.getContext("2d");

    const SPRITE_SPENSAUR = document.getElementById('spensaur');
    const SPRITE_ENEMY = document.getElementById('enemy');
    const SPRITE_LASER = document.getElementById('laser');

    var enemys = [];
    var lasers = [];

    var isGameFinished = false;
    var isPlayerJumping = false;

    var isKeyPressed = false;
    var currentPlayerPositionY = PLAYER_POS_Y;
    var playerScore = 0;
    var timeLock = null;

    function startGame() {
        registerControls();
        requestAnimationFrame(doFrameRender);
    };

    function registerControls() {
        window.onkeydown = function(e) {
            if (!isValidEvent(e)) {
                return;
            }
            onMove(e.keyCode || e.which);
        };
    };

    function onMove(key) {
        switch (key) {
            case KEY_UP:
                currentPlayerPositionY -= PLAYER_JUMP_SPEED;
                break;
            case KEY_DOWN:
                currentPlayerPositionY += PLAYER_JUMP_SPEED;
                break;
            case KEY_SPACEBAR:
                fireLaser();
                break;
        }
    };

    function isValidEvent(e) {
        let key = e.keyCode ? e.keyCode : e.which;
        return (
            KEY_SPACEBAR == key
            || KEY_UP == key
            || KEY_DOWN == key
        );
    };

    function fireLaser() {
        lasers.push({
            x: PLAYER_MIDPOINT,
            y: currentPlayerPositionY + 20
        });
    };

    function doFrameRender() {
        if (isGameFinished) {
            canvas.className = "side-scrolling-bg";
            return;
        }

        updateState();
        renderCanvas();
        requestAnimationFrame(doFrameRender);
    };

    function updateState() {
        if (playerHasCollision()) {
            isGameFinished = true;
            return;
        }

        moveEnemys();
        moveLasers();
        clearInactiveEnemys();
        clearInactiveLasers();

        if (isReadyForNextEnemy()) {
            addEnemy();
        }
    };

    function playerHasCollision() {
        for (let index=0; index < enemys.length; index++) {
            if (isCollision(enemys[index])) {
                return true;
            }
        }
        return false;
    };

    function isCollision(enemy) {
        return isNearEnemy(enemy) && isVerticallyNearEnemy(enemy);
    };

    function isNearEnemy(enemy) {
        return PLAYER_MIDPOINT <= (enemy.x + ENEMY_SIZE_WIDTH) && PLAYER_MIDPOINT >= enemy.x;
    };

    function isVerticallyNearEnemy(enemy) {
        return (currentPlayerPositionY + PLAYER_SIZE_HEIGHT) >= enemy.y && (currentPlayerPositionY - PLAYER_SIZE_HEIGHT) <= enemy.y;
    };

    function isLaserCollision(laser, enemy) {
        return (
            enemy.x <= laser.x
            && (enemy.x + ENEMY_SIZE_WIDTH) >= laser.x
            && enemy.y <= laser.y
            && (enemy.y + ENEMY_SIZE_HEIGHT) >= laser.y
        );
    };

    function moveEnemys() {
        for (var index=0; index < enemys.length; index++) {
            enemys[index].x -= ENEMY_MOVE_SPEED;
        }
    };

    function moveLasers() {
        for (var index=0; index < lasers.length; index++) {
            lasers[index].x += LASER_MOVE_SPEED;
        }
    };

    function clearInactiveEnemys() {
        if (!enemys.length) {
            return;
        }

        let firstEnemy = enemys.shift();
        if (firstEnemy.x + ENEMY_SIZE_WIDTH >= 0) {
            enemys.unshift(firstEnemy);
        }
    };

    function clearInactiveLasers() {
        if (!enemys.length || !lasers.length) {
            return;
        }

        let firstLaser = lasers.shift();
        if (firstLaser.x + LASER_SIZE_WIDTH >= 0) {
            lasers.unshift(firstLaser);
        }

        for (let x=0; x < enemys.length; x++) {
            for (let y=0; y < lasers.length; y++) {
                if (isLaserCollision(lasers[y], enemys[x])) {
                    enemys.splice(x, 1);
                    lasers.splice(y, 1);
                    playerScore += 10;
                    return;
                }
            }
        }
    };

    function isReadyForNextEnemy() {
        let randomNumber = Math.floor(Math.random() * 100);
        let lastEnemyDistance = MIN_ENEMY_DISTANCE;
        if (enemys.length > 0) {
            lastEnemyDistance = enemys[enemys.length - 1].x;
        }

        if (randomNumber < 4 && lastEnemyDistance >= MIN_ENEMY_DISTANCE) {
            return true;
        }
        return false;
    };

    function addEnemy() {
        if (enemys.length >= MAX_ENEMYS) {
            return;
        }

        let y = Math.floor(Math.random() * (GAME_SIZE_HEIGHT - 150));

        enemys.push({
            x: ENEMY_STARTING_POS_X,
            y: y
        });
    };

    function renderCanvas() {
        context.clearRect(0, 0, GAME_SIZE_WIDTH, GAME_SIZE_HEIGHT);

        context.font = "30px Arial";
        context.fillStyle = "blue";
        context.fillText(playerScore, TEXT_POS_X, TEXT_POS_Y);

        context.drawImage(SPRITE_SPENSAUR, PLAYER_POS_X, currentPlayerPositionY, PLAYER_SIZE_WIDTH, PLAYER_SIZE_HEIGHT);

        for (var index=0; index < enemys.length; index++) {
            context.drawImage(SPRITE_ENEMY, enemys[index].x, enemys[index].y, ENEMY_SIZE_WIDTH, ENEMY_SIZE_HEIGHT);
        }

        for (var index=0; index < lasers.length; index++) {
            context.drawImage(SPRITE_LASER, lasers[index].x, lasers[index].y, LASER_SIZE_WIDTH, LASER_SIZE_HEIGHT);
        }
    };

    window.onload = function() {
        startGame();
    };

})();
