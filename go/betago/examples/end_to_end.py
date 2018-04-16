#coding:utf-8
from __future__ import print_function
import os
import webbrowser
from keras.models import Sequential
from keras.layers.core import Dense, Dropout, Activation, Flatten
from keras.layers.convolutional import Convolution2D, MaxPooling2D
from keras.utils import np_utils
from betago.model import KerasBot
from betago.processor import SevenPlaneProcessor

batch_size = 128
nb_epoch = 20

nb_classes = 19 * 19  # One class for each position on the board
go_board_rows, go_board_cols = 19, 19  # input dimensions of go board
nb_filters = 32  # number of convolutional filters to use
nb_pool = 2  # size of pooling area for max pooling
nb_conv = 3  # convolution kernel size

# SevenPlaneProcessor loads seven planes (doh!) of 19*19 data points, so we need 7 input channels
processor = SevenPlaneProcessor()
input_channels = processor.num_planes

# Load go data from 1000 KGS games and one-hot encode labels
X, y = processor.load_go_data(num_samples=1000)
# SevenPlaneProcessor(GoDataProcessor)->GoDataProcessor->
# def load_go_data(self, types=['train'], data_dir='data', num_samples=1000)


X = X.astype('float32')

Y = np_utils.to_categorical(y, nb_classes)              #变成 19*19的 0-1 矩阵

# Specify a keras model with two convolutional layers and two dense layers,
# connecting the (num_samples, 7, 19, 19) input to the 19*19 output vector.


model = Sequential()
model.add(Convolution2D(nb_filters, nb_conv, nb_conv, border_mode='valid',
                        input_shape=(input_channels, go_board_rows, go_board_cols)))
model.add(Activation('relu'))
model.add(Convolution2D(nb_filters, nb_conv, nb_conv))
model.add(Activation('relu'))
model.add(MaxPooling2D(pool_size=(nb_pool, nb_pool)))
model.add(Dropout(0.2))
model.add(Flatten())
model.add(Dense(256))
model.add(Activation('relu'))
model.add(Dropout(0.5))
model.add(Dense(nb_classes))
model.add(Activation('softmax'))
model.compile(loss='categorical_crossentropy', optimizer='adadelta', metrics=['accuracy'])

# Fit model to data
model.fit(X, Y, batch_size=batch_size, nb_epoch=nb_epoch, verbose=1)

# Open web frontend
path = os.getcwd().replace('/examples', '')
webbrowser.open('file://' + path + '/ui/demoBot.html', new=2)

# Create a bot from processor and model, then serve it.
go_model = KerasBot(model=model, processor=processor)
go_model.run()
