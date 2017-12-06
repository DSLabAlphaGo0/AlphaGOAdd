function showCurrent() {
    $.ajax({
        type: "POST",
        dataType: "json",
        url: "/counting",
        data: JSON.stringify({"uid":id}),
        success: function (data) {
            // TODO:定制内容
            //$('#suspend').show();
            var black = data.black;
            var white = data.white;
            console.log(data);
            alert("Current status:\n" + "white:"+white+"\tblack:"+black);
        }
    });
}

function giveUp() {
    $.ajax({
        type: "POST",
        dataType: "json",
        url: "/control",
        data: JSON.stringify({"uid":id}),
        success: function (json) {
            // TODO:定制内容
            $('#suspend').show();
        }
    });
}
