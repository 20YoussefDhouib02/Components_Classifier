import os
from flask import Flask, request, jsonify, render_template
from util import Util


current_dir = os.path.dirname(os.path.abspath(__file__))

models_dir = os.path.join(current_dir, '..', 'Models')

model_classes_path = os.path.join(models_dir, 'model_classes.json')

app = Flask(__name__, static_folder="public")

@app.route('/classify_image', methods=['GET', 'POST'])
def classify_image():

    image_data = request.form['image_data']

    model = Util(models_dir, model_classes_path)

    response = jsonify(model.classify_image(image_data, None))

    response.headers.add('Access-Control-Allow-Origin', '*')

    return response



def main():

    classes = ['resistor', 'capacitor', 'diode', 'transistor', 'integrated circuit']


    util_obj = Util(models_dir, model_classes_path)

    # print the result
    print(util_obj.classify_image(util_obj, None))



if __name__ == "__main__":

    app.run(port=5000)

