import base64
import time
from io import BytesIO
import json
import cv2
import numpy as np
import tensorflow as tf
from tensorflow import keras

# NOTE: credits to codebasics, I used this channel's code as a reference for this class


class Util():

    def __init__(self, model_path, classes):
        self.classes = classes
        self.model_path = model_path
        self.model = None
        self.__class_name_to_number = {}
        self.__class_number_to_name = {}


    def img_to_base64(self, image_file):

        with open(image_file, "rb") as image:
            encoded_string = base64.b64encode(image.read())
            assert isinstance(encoded_string, object)
            # print(type(encoded_string))
        return encoded_string


    def classify_image(self, image_base64_data, file_path=None):

        self.load_model_()

        if file_path:
            imgs = cv2.imread(file_path)
        else:
            imgs = self.get_cv2_image_from_base64_string(image_base64_data)

        result = []
        
        image = cv2.resize(imgs, (360, 480))
        image = tf.reshape(image, (1, 360, 480, 3))

        raw_predictions = tf.convert_to_tensor(self.model.predict(image))
        probabilities = np.around(keras.activations.softmax(raw_predictions)*100).tolist()[0]
        # print(keras.activations.softmax(raw_predictions))
        result.append({
            'class': self.class_number_to_name(raw_predictions.numpy().argmax()),
            'class_probability': probabilities,
            'class_dictionary': self.__class_name_to_number,
        })
        print(result)
        return result


    def class_number_to_name(self, class_num):

        return self.__class_number_to_name[class_num]
    
    
    def load_model_(self):

        print("loading model...start")

        time.sleep(3)

        with open(self.classes, "r") as json_file:
            self.__class_name_to_number = json.load(json_file)
            self.__class_number_to_name = {v:k for k,v in self.__class_name_to_number.items()}

        self.model = keras.models.load_model(self.model_path)

        print("loading model...done")


    def get_cv2_image_from_base64_string(self, b64str):

        if isinstance(b64str, str):
            encoded_data = b64str.split(',')[1]
        else:
            encoded_data = b64str

        nparr = np.frombuffer(base64.b64decode(encoded_data), np.uint8)
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        return img


