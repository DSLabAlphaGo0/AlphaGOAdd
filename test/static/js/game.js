
function passStep() {
    console.log(id+"放弃一手");
    $.ajax({
        type: "POST",
        dataType: "json",
        async: false,
        url: "/control",
        data: JSON.stringify({"uid":id,"func":'pass'}),
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
        data: JSON.stringify({"uid":id,"func":'count'}),
        success: function (json) {
            $('#suspend_title').html("当前棋局");
            $("#custom").attr("href","javascript:hide();");
            showInfo(json);
        }
    });
}

function giveUp() {
    $.ajax({
        type: "POST",
        dataType: "json",
        url: "/control",
        data: JSON.stringify({"uid":id,"func":'giveup'}),
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
    $('#score_w').html(data.black);
    $('#count_w').html(data.w_on);
    $('#kill_w').html(data.w_eat);
    $('#score_b').html(data.white);
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

// var list_standard = ["高级", "中级", "低级"];
var list_standard = ["低级", "中级", "高级"];
var standard = 1;

function addSta() {
    if(standard < 2) {
        $("#choose_sta").val(list_standard[++standard]);
    }
}

function decSta() {
    if(standard > 0) {
        $("#choose_sta").val(list_standard[--standard]);
    }
}

function addNum() {
    if($("#allow_num").val() < 8) {
        $("#allow_num").val(parseInt($("#allow_num").val()) + 2);
    }
    else {
        $("#allow_num").value = 8;
    }
}

function decNum() {
    if($("#allow_num").val() <= 0) {
        $("#allow_num").val(0);
    }
    else {
        $("#allow_num").val(parseInt($("#allow_num").val()) - 2);
    }
}

function gameConfig() {
    $.ajax({
        type: "POST",
        dataType: "json",
        url: "/config",
        data : {
            "stone" : $('input:radio[name="stone"]').val(),
            "standard" : standard,
            "allow" : parseInt($('#allow_num').val())
        },
        success : function () {
            reScroll();
            $('#begin_all').hide();
            reScroll();
            //TODO:
            startGame();
        },
        error : function () {
            alert("网络传输失败,请检查网络")
        }
    });
}
