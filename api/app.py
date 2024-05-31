from flask import Flask,request, jsonify
import numpy as np
import pandas as pd
import joblib
from flask_cors import CORS
import preprocesamiento
import os
import tensorflow as tf

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
    register_name = file_names[1].split('.')[0]
    print("NOMBRE DEL ARCHIVO",register_name)
    dts, etq =preprocesamiento.inicio( file_names[1].split('.')[0])
    X_new = np.loadtxt(f"C:/wamp64/www/Detector-de-arritmias/files/datos-{register_name}.dat")

    num_shape = X_new.shape[0]

    # Verificar el tamaño del array
    print("Tamaño original de X_new:", X_new.size)
    print("Forma original de X_new:", X_new.shape)
    print("X_new[0]:", X_new.shape[0])
    print("X_new[1]:", X_new.shape[1])

        
    # num_samples = X_new.size // (599 * 1)
    # print("Número de muestras calculadas:", num_samples)

    # X_new = X_new.reshape((num_samples, 599, 1))

    try:
        X_new = X_new.reshape((X_new.shape[0], X_new.shape[1], 1))
    except ValueError as e:
        print("Error al reestructurar el array:", e)
        # Manejar el error adecuadamente, tal vez ajustando num_samples o las dimensiones objetivo
        exit(1)

    # etq = "C:/wamp64/www/Detector-de-arritmias/files/etiquetas.dat"

    # dts = np.array(dts)
    # etq = np.array(etq)

    path="C:/wamp64/www/Detector-de-arritmias/api/modelo_CNN1D.h5"
    model= tf.keras.models.load_model(path)
    
    print("X_New:",X_new)
    predictions = model.predict(X_new)
    
    predicted_classes = np.argmax(predictions, axis=1)

    # Mostrar las predicciones
    print("Tamaño:", predicted_classes.size)
    cont = 0
    for i in predicted_classes:
        if i==1:
            cont += 1

    print("hay: ", cont )

    # # df=pd.DataFrame([dts], dtype=etq)

    # predict=model.predict(df)
    # print("Esto es aleatorio:",predict)
    # return str(round(predict[0], 2))
    
    # return jsonify({"response": "la respuesta es:"})
    return jsonify({"message": "Archivos recibidos", "files": file_names})


if __name__ == '__main__':
    app.run(debug=True, port=5003)
