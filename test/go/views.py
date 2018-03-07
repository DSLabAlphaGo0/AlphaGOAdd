# -*- coding: utf-8 -*-
#from __future__ import unicode_literals


from django.shortcuts import render
from django.http import HttpResponse
import yaml
import json
import re
import numpy as np
from betago.betago import scoring
from betago.betago.dataloader import goboard
from keras.models import model_from_yaml
from betago.betago.model import KerasBot
from betago.betago.processor import SevenPlaneProcessor
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
        self.col=0
        self.row=0

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
        return render(request, 'demoBot.html',{'post':post,'uid':self.count})

    @csrf_exempt
    def prediction(self,request):
        body_unicode = request.body.decode('utf-8')
        body_data = json.loads(body_unicode)
#        print(body_data.get('i'))
#        print(body_data.get('j'))
#        print(body_data.get('uid'))
#        result = re.findall('\d+',request.body)
        col = body_data.get('i')
        row = body_data.get('j')
        id  = body_data.get('uid')
#        print('Received move:')
#        print((col, row),id)
        self.bots[id].apply_move('b', (row, col))
        bot_row, bot_col = self.bots[id].select_move('w')
#        print('Prediction:')
#        print((bot_col, bot_row))
        result = {'i': bot_col, 'j': bot_row}
        return HttpResponse(json.dumps(result))
    
    @csrf_exempt
    def control(self,request):
        body_unicode = request.body.decode('utf-8')
        body_data = json.loads(body_unicode)
        id  = body_data.get('uid')
        context = body_data.get('func')
        if context=='pass':
            bot_row, bot_col = self.bots[id].select_move('w')
            print(bot_row,bot_col)
            result = {'i': bot_col, 'j': bot_row}
            return HttpResponse(json.dumps(result))
        else:
            status = scoring.evaluate_territory(self.bots[id].go_board)
            black_area = status.num_black_territory + status.num_black_stones
            white_area = status.num_white_territory + status.num_white_stones
            white_score = white_area + 5.5
            result = {"black":black_area,"white":white_score}
            print(result)
            return HttpResponse(json.dumps(result))

    @csrf_exempt
    def counting(self,request):
        body_unicode = request.body.decode('utf-8')
        body_data = json.loads(body_unicode)
        id  = body_data.get('uid')
        print(id)
        print('counting:')
        status = scoring.evaluate_territory(self.bots[id].go_board)
        black_area = status.num_black_territory + status.num_black_stones
        white_area = status.num_white_territory + status.num_white_stones
        white_score = white_area + 5.5
        result = {"black":black_area,"white":white_score}
        print(result)
        return HttpResponse(json.dumps(result))










