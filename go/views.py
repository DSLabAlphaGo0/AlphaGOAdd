# -*- coding: utf-8 -*-
#from __future__ import unicode_literals


from django.shortcuts import render
from django.http import HttpResponse
import yaml
import json
import re
import numpy as np
from keras.models import model_from_yaml
from betago.model import KerasBot
from betago.processor import SevenPlaneProcessor
from django.views.decorators.csrf import csrf_exempt
from django.contrib.staticfiles.urls import staticfiles_urlpatterns
from django.views.decorators.csrf import ensure_csrf_cookie
#from django.http import JsonResponse
# Create your views here.

class My_Go(object):
    
    def __init__(self):
        bot_name = 'demo'
        model_file = 'static/model_zoo/' + bot_name + '_bot.yml'
        weight_file = 'static/model_zoo/' + bot_name + '_weights.hd5'
        with open(model_file, 'r') as f:
            yml = yaml.load(f)
            self.model = model_from_yaml(yaml.dump(yml))
            # Note that in Keras 1.0 we have to recompile the model explicitly
            self.model.compile(loss='categorical_crossentropy', optimizer='adadelta', metrics=['accuracy'])
            self.model.load_weights(weight_file)
        self.model.predict(np.zeros([1, 7,19,19]))
        self.count=0
        self.bots = {}

    def home(self,request):
        self.processor = SevenPlaneProcessor()
        self.bot = KerasBot(model=self.model, processor=self.processor)
        
        board_init = 'initialBoard = ""'
        board = {}
        for row in range(19):
            board_row = {}
            for col in range(19):
                cell = str(self.bot.go_board.board.get((col, row)))
                cell = cell.replace('None', '0')
                cell = cell.replace('b', '1')
                cell = cell.replace('w', '2')
                board_row[col] = int(cell)
            board[row] = board_row
        board_init = str(board)
        post = board_init
        self.count += 1;
        self.bots[self.count] = self.bot
        return render(request, 'demoBot.html', {'post':post, 'uid':self.count})

    @csrf_exempt
    def prediction(self,request):
        result = re.findall('\d+',request.body)
        col = int(result[0])
        row = int(result[1])
        id  = int(result[2])
#        print('Received move:')
#        print((col, row),id)
        self.bots[id].apply_move('b', (row, col))
        bot_row, bot_col = self.bots[id].select_move('w')
#        print('Prediction:')
#        print((bot_col, bot_row))
        result = {'i': bot_col, 'j': bot_row}
        return HttpResponse(json.dumps(result))












