function playMove(coord, player, ko, success, failure) {
    success = success || function() {};
    failure = failure || function() {};
    var play = jboard.playMove(coord, player, ko);
    if (play.success) {
      jboard.setType(coord, player); // play stone
      jboard.setType(play.captures, JGO.CLEAR); // clear opponent's stones

      if (lastMove)
        jboard.setMark(lastMove, JGO.MARK.NONE); // clear previous mark
      if (ko)
        jboard.setMark(ko, JGO.MARK.NONE); // clear previous ko mark

      jboard.setMark(coord, JGO.MARK.CIRCLE); // mark move
      lastMove = coord;

      if (play.ko)
        jboard.setMark(play.ko, JGO.MARK.CIRCLE); // mark ko, too
      ko = play.ko;
      success(play);
    }
    else {
      illegalMove(play.errorMsg);
      failure(play.errorMsg);
    }
}

function illegalMove(errorMsg) {
console.log("Illegal move: " + errorMsg);
alert("Illegal move: " + errorMsg);
}


function postMove(url, data, success) {
    console.log("Sent move to server!");
    console.log(data);
    var xmlhttp;
    xmlhttp = new XMLHttpRequest();
    xmlhttp.open("POST", url, false);
    // Note that we force a synchronous call here, bad karma.
    xmlhttp.onreadystatechange = function() {
    if (xmlhttp.readyState > 3 && xmlhttp.status == 200) {
        success(xmlhttp.responseText);
        console.log("success");
    }
};
xmlhttp.send(JSON.stringify(data));
return xmlhttp;
}


jboard.setType(JGO.util.getHandicapCoordinates(jboard.width, 0), JGO.BLACK);

jsetup.setOptions({
stars: {
  points: 5
}
});


jsetup.create('board1', function(canvas) {

  canvas.addListener('click', function(coord, ev) {
  console.log("Attepting human move:");
  console.log("(" + coord.i + ", " + coord.j + ")");
  var opponent = (player == JGO.BLACK) ? JGO.WHITE : JGO.BLACK;

  if (ev.shiftKey) { // on shift do edit
	if (jboard.getMark(coord) == JGO.MARK.NONE)
	  jboard.setMark(coord, JGO.MARK.SELECTED);
	else
	  jboard.setMark(coord, JGO.MARK.NONE);
	return;
  }

  // clear hover away - it'll be replaced or then it will be an illegal move
  // in any case so no need to worry about putting it back afterwards
  if (lastHover)
	jboard.setType(new JGO.Coordinate(lastX, lastY), JGO.CLEAR);
  lastHover = false;

  playMove(coord, player, ko, function() {
	player = JGO.WHITE;
	coord['uid'] = id;
	postMove('/prediction', coord,
	  function(data) {
		console.log("开始接收数据");
		var botcoord = JSON.parse(data);
		coord.i = botcoord.i;
		coord.j = botcoord.j;
        qipans = botcoord.q; // Add in our stone data
        jboard.probalities = botcoord.p;                  //这里概率可以传过来
        //boardRaw = jboard.getRaw();                 // Use current state (blank) as a template
        //jboard.setRaw(boardRaw);
        $('#cover-1').hide();
        for (var i = 0; i < 10; i++) {
             (function(j) { // j = i
                setTimeout(function() {
                    jsetup1.create('board-show', function(canvas1) {});
                    boardRaw1 = jboard1.getRaw(); // Use current state (blank) as a template
                    boardRaw1.stones = qipans[j];
                    jboard1.setRaw(boardRaw1); // Set it and forget it
                }, 200*j);
               })(i);
        }

        for (var i = 0; i < 4; i++) {
             (function(j) { // j = i
                setTimeout(function() {
                    switch(j) {
                        case 0:
                            break;
                        case 1:
                            $('#cover-s').hide();
                            $('#cover-1').show();
                            break;
                        case 2:
                            $('#cover-s').show();
                            $('#cover-v').hide();
                            break;
                        case 3:
                            $('#cover-v').show();
                    }
                }, 3000*j);
               })(i);
        }


		console.log("Recieved move from server:");
		console.log("(" + coord.i + ", " + coord.j +","+coord.uid+ ")");
		playMove(coord, player, ko);
	  });
  });
  player = JGO.BLACK;
});

  canvas.addListener('mousemove', function(coord, ev) {
  if (coord.i == -1 || coord.j == -1 || (coord.i == lastX && coord.j == lastY))
	return;

  if (lastHover) // clear previous hover if there was one
	jboard.setType(new JGO.Coordinate(lastX, lastY), JGO.CLEAR);

  lastX = coord.i;
  lastY = coord.j;

  if (jboard.getType(coord) == JGO.CLEAR && jboard.getMark(coord) == JGO.MARK.NONE) {
	jboard.setType(coord, player == JGO.WHITE ? JGO.DIM_WHITE : JGO.DIM_BLACK);
	lastHover = true;
  }
  else
	lastHover = false;
});

  canvas.addListener('mouseout', function(ev) {
  if (lastHover)
	jboard.setType(new JGO.Coordinate(lastX, lastY), JGO.CLEAR);

  lastHover = false;
});
});
