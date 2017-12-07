function passStep() {
    $.ajax({
        type: "POST",
        dataType: "json",
        async: false,
        url: "/control",
        data: JSON.stringify({"uid":id,"func":"pass"}),
        success: function (json) {
            playMove(new JGO.Coordinate(json.i, json.j), JGO.WHITE, ko);
        }
    });
}

function showCurrent() {
    $.ajax({
        type: "POST",
        dataType: "json",
        async: false,
        url: "/control",
        data: JSON.stringify({"uid":id,"func":"count"}),
        success: function (json) {
            $('#suspend_title').html("当前棋局");
            $("#custom").attr("href","javascript:hide();");
            showInfo(json);
        }
    });
}

function giveUp() {
    $('#suspend_title').html("你输了");
    $("#custom").attr("href","javascript:restart();");
    var data={};
    data.w_score = data.w_on = data.w_eat = 0;
    data.b_score = data.b_on = data.b_eat = 0;
    showInfo(data);
    $.ajax({
        type: "POST",
        dataType: "json",
        url: "/control",
        data: "uid="+id+"&func=giveup",
        success: function (json) {
            // TODO:定制内容
            $('#suspend_title').html("你输了");
            $("#custom").attr("href","javascript:restart();");
            showInfo(json);
        }
    });
}

function restart() {
    hide();
    // TODO: restart the game
    //暂时以强制刷新代替,后期优化
    location.reload();
}

function hide() {
    $('#suspend_all').hide();
    reScroll();
}

function showInfo(data) {
    $('#score_w').html(data.w_score);
    $('#count_w').html(data.w_on);
    $('#kill_w').html(data.w_eat);
    $('#score_b').html(data.b_score);
    $('#count_b').html(data.b_on);
    $('#kill_b').html(data.b_eat);
    scroll(0,0);
    $('#suspend_all').show();
    banScroll();
}

function banScroll() {
    $('body').css({
        "overflow-x":"hidden",
        "overflow-y":"hidden"
    });
}

function reScroll() {
    $('body').css({
      "overflow-x":"auto",
      "overflow-y":"auto"
    });
}
