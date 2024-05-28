from flask import Flask,request, jsonify
import numpy as np
import pandas as pd
import joblib
from flask_cors import CORS
import preprocesamiento
import os

app=Flask(__name__)
CORS(app)

UPLOAD_FOLDER = 'C:/wamp64/www/Detector-de-arritmias/files'

# Configurar la carpeta de subida en la aplicación
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

# @app.route('/suma', methods=['GET'])
# def index():
#     # a = funcionesPreprocesamiento.suma(1,5)
#     a=3
#     if(request.method == "GET"):
#         return jsonify({"response": "la respuesta es:"+str(a)})
    


@app.route('/',methods=['POST'])
def index():
    # file = request.files['file']
    # if file.filename == '':
    #     return 'No selected file', 400
    
    # # upload_data()
    # # preprocesamiento.inicio()
    # print("prueba de que esta en el backend")
    # print("el nombre es",file.filename)
    # # Guardar el archivo en la carpeta de subidas
    # file_path = os.path.join(app.config['UPLOAD_FOLDER'], file.filename)
    # print("ruta: ", file_path)
    # file.save(file_path)
    filename = upload_data(request.files['file'])
    filename2 = upload_data(request.files['file2'])
    filename3 = upload_data(request.files['file3'])
    # preprocesamiento.inicio()

    return jsonify({"message": "Archivos recibidos", "fileName1": filename, "fileName2": filename2, "fileName3": filename3})
    # return f'The files {filename} uploaded successfully', 200


def upload_data(file):
    # file = request.files['file']
    # file = file['file']
    if file.filename == '':
        return 'No selected file', 400
    
    # upload_data()
    # preprocesamiento.inicio()
    print("prueba de que esta en el backend")
    print("el nombre es",file.filename)
    # Guardar el archivo en la carpeta de subidas
    file_path = os.path.join(app.config['UPLOAD_FOLDER'], file.filename)
    print("ruta: ", file_path)
    file.save(file_path)
    # return f'File {file.filename} uploaded successfully', 200
    return file.filename
    

@app.route('/predict', methods=['POST'])
def fit():
    data =  request.get_json()

    file_names = data['fileNames']
    preprocesamiento.inicio()
    # path="./model_CNN1D.model"
    # model=joblib.load(path)
    # predict=model.predict(df)
    # print("Esto es aleatorio:",predict)
    # return str(round(predict[0], 2))
    # return jsonify({"response": "la respuesta es:"})
    return jsonify({"message": "Archivos recibidos", "files": file_names})


if __name__ == '__main__':
    app.run(debug=True, port=5003)
