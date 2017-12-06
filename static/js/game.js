function showCurrent() {
    $.ajax({
        type: "POST",
        dataType: "json",
        url: "/control",
        data: "count",
        success: function (json) {
            // TODO:定制内容
            $('#suspend').show();
        }
    });
}

function giveUp() {
    $.ajax({
        type: "POST",
        dataType: "json",
        url: "/control",
        data: "giveup",
        success: function (json) {
            // TODO:定制内容
            $('#suspend').show();
        }
    });
}

