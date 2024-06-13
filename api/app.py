from flask import Flask,request, jsonify
import numpy as np
import pandas as pd
from flask_cors import CORS
import preprocesamiento
import os
import tensorflow as tf
import csv
import wfdb

app=Flask(__name__)
CORS(app)

UPLOAD_FOLDER = './files'

# Configurar la carpeta de subida en la aplicación
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

@app.route('/',methods=['POST'])
def index():
    filename = upload_data(request.files['file'])
    filename2 = upload_data(request.files['file2'])
    filename3 = upload_data(request.files['file3'])
    # preprocesamiento.inicio()

    return jsonify({"filename": filename})
# return f'The files {filename} uploaded successfully', 200


def upload_data(file):

    if file.filename == '':
        return 'No selected file', 400
    
    print("prueba de que esta en el backend")
    print("el nombre es",file.filename)
    # Guardar el archivo en la carpeta de subidas
    file_path = os.path.join(app.config['UPLOAD_FOLDER'], file.filename)
    print("ruta: ", file_path)
    file.save(file_path)

    return file.filename.split('.')[0]
    
@app.route('/ecg/<filename>', methods=['GET'])
def get_ecg(filename):
    data = wfdb.rdrecord(f'./files/{filename}')
    # data = np.loadtxt("./files/datos-100.dat")
    
    ecg_data = data.p_signal[:, 0].tolist()
    # ecg_data = data[:,1].tolist()
    
    return jsonify(ecg_data)

@app.route('/predict', methods=['POST'])
def fit():
    data =  request.get_json()

    file_names = data['fileNames']
    register_name = file_names[1].split('.')[0]
    print("NOMBRE DEL ARCHIVO",register_name)
    dts, etq =preprocesamiento.inicio( file_names[1].split('.')[0])
    X_new = np.loadtxt(f"./files/datos-{register_name}.dat")

    # Verificar el tamaño del array
    print("Tamaño original de X_new:", X_new.size)
    print("Forma original de X_new:", X_new.shape)
    print("X_new[0]:", X_new.shape[0])
    print("X_new[1]:", X_new.shape[1])

    try:
        X_new = X_new.reshape((X_new.shape[0], X_new.shape[1], 1))
    except ValueError as e:
        print("Error al reestructurar el array:", e)
        # Manejar el error adecuadamente, tal vez ajustando num_samples o las dimensiones objetivo
        exit(1)

    path="./modelo_CNN1D.h5"
    model= tf.keras.models.load_model(path)
    
    predictions = model.predict(X_new)
    
    predicted_classes = np.argmax(predictions, axis=1)
    
    np.savetxt(f'./files/etiquetas-{register_name}.dat',predicted_classes)

# Mostrar las predicciones
    print("Tamaño:", predicted_classes.size)
    cont = 0
    for i in predicted_classes:
        if i==1:
            cont += 1

    print("hay: ", cont )

    nombre_archivo = f'./files/etiquetas-{register_name}.csv'

    predicted_classes = [predicted_classes]
    # Abrir el archivo en modo de escritura y escribir los datos
    with open(nombre_archivo, mode='w', newline='') as file:
        writer = csv.writer(file)
        writer.writerows(predicted_classes)
    

    # return jsonify({"response": "la respuesta es:"})
    return jsonify({"message": "Archivos recibidos", "files": file_names})


if __name__ == '__main__':
    app.run(debug=True, port=5003)
