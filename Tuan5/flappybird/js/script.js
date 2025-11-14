$(function () {
    var container = $('#container');
    var bird = $('#bird');
    var score_display = $('#score_span');
    var level_display = $('#level_display');

    var container_width = container.width();
    var container_height = container.height();
    var bird_left = parseInt(bird.css('left'));
    var bird_height = bird.height();
    var speed = 10;

    var go_up = false;
    var go_down_interval;
    var game_over = false;

    // Cài đặt Level & Interval
    var current_score = 0;
    var current_level = 1;
    var level_intervals = {1: 40, 2: 30, 3: 25, 4: 20};
    var game_loop_interval = level_intervals[1];
    var the_game;

    // Mảng quản lý cặp ống
    var poles = [
        {top: $('#pole_1'), bottom: $('#pole_2'), scoreAdded: false},
        {top: $('#pole_3'), bottom: $('#pole_4'), scoreAdded: false},
        {top: $('#pole_5'), bottom: $('#pole_6'), scoreAdded: false}
    ];

    // Khởi tạo vị trí ống
    poles.forEach(function(p, index){
        var offset = index * 300; // Khoảng cách giữa các cặp ống
        p.top.css('right', -64 - offset);
        p.bottom.css('right', -64 - offset);
    });

    function checkLevelUp() {
        if(current_score >= 5 * poles.length){ // Thắng sau khi vượt tất cả cặp ống
            stop_the_game(true);
            return;
        }

        var new_level = current_level;
        if(current_score >= 40) new_level = 4;
        else if(current_score >= 20) new_level = 3;
        else if(current_score >= 5) new_level = 2;
        else new_level = 1;

        if(new_level !== current_level){
            current_level = new_level;
            game_loop_interval = level_intervals[current_level];
            level_display.text('Level: ' + current_level);
            clearInterval(the_game);
            playGame(game_loop_interval);
        }
    }

    function playGame(interval){
        the_game = setInterval(function(){
            if(parseInt(bird.css('top')) <= 0 || parseInt(bird.css('top')) >= container_height - bird_height){
                stop_the_game(false);
            } else {
                poles.forEach(function(p){
                    var pos = parseInt(p.top.css('right'));

                    // Di chuyển ống
                    p.top.css('right', pos + speed);
                    p.bottom.css('right', pos + speed);

                    // Tính điểm
                    if(!p.scoreAdded && pos > container_width - bird_left){
                        current_score += 1;
                        score_display.text(current_score);
                        p.scoreAdded = true;
                        checkLevelUp();
                    }

                    // Reset ống khi ra ngoài
                    if(pos > container_width){
                        var new_height = parseInt(Math.random() * 100);
                        p.top.css('height', 170 + new_height);
                        p.bottom.css('height', 170 - new_height);
                        p.top.css('right', -64);
                        p.bottom.css('right', -64);
                        p.scoreAdded = false;
                    }

                    // Kiểm tra va chạm
                    if(collision(bird, p.top) || collision(bird, p.bottom)){
                        stop_the_game(false);
                    }
                });
            }
        }, interval);
    }

    function go_down(){
        if(go_down_interval) clearInterval(go_down_interval);
        go_down_interval = setInterval(function(){
            bird.css('top', parseInt(bird.css('top')) + 10);
            bird.css('transform', 'rotate(50deg)');
        }, 40);
    }

    function up(){
        if(go_down_interval) clearInterval(go_down_interval);
        bird.css('top', parseInt(bird.css('top')) - 20);
        bird.css('transform', 'rotate(-10deg)');
    }

    $(document).keydown(function(e){
        if(e.keyCode === 40 && !game_over){
            clearInterval(go_down_interval);
            go_up = setInterval(up, 40);
        }
    });

    $(document).keyup(function(e){
        if(e.keyCode === 40){
            clearInterval(go_up);
            go_up = false;
            if(!game_over) go_down();
        }
    });

    $('#play_btn').click(function(){
        $(this).hide();
        level_display.text('Level: ' + current_level);
        setTimeout(function(){
            playGame(game_loop_interval);
            if(!go_up) go_down();
        }, 5000);
    });

    function stop_the_game(isWin){
        clearInterval(the_game);
        clearInterval(go_down_interval);
        clearInterval(go_up);
        game_over = true;

        if(isWin){
            container.append('<div id="win_message" style="position:absolute; top:50%; left:50%; transform:translate(-50%, -50%); background:#28a745; color:white; padding:20px; border-radius:10px; font-size:24px; font-weight:bold; z-index:10;"> CHÚC MỪNG, BẠN ĐÃ CHIẾN THẮNG! </div>');
        }
        $('#restart_btn').slideDown();
    }

    $('#restart_btn').click(function(){
        location.reload();
    });

    function collision($div1, $div2){
        var x1 = $div1.offset().left;
        var y1 = $div1.offset().top;
        var h1 = $div1.outerHeight(true);
        var w1 = $div1.outerWidth(true);
        var b1 = y1 + h1;
        var r1 = x1 + w1;

        var x2 = $div2.offset().left;
        var y2 = $div2.offset().top;
        var h2 = $div2.outerHeight(true);
        var w2 = $div2.outerWidth(true);
        var b2 = y2 + h2;
        var r2 = x2 + w2;

        return !(b1 < y2 || y1 > b2 || r1 < x2 || x1 > r2);
    }
});
