from flask import Flask,request, jsonify
import numpy as np
import pandas as pd
from flask_cors import CORS
import preprocesamiento
import os
import tensorflow as tf
import csv
import wfdb
import json
import io
from funcionesPreprocesamiento import llamado, normalizacion, detectorQRS, Binarizacion, filtro, segmentacion, completar, ajusteDatos


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
    dts, etq =preprocesamiento.inicio(filename)
    
    record = wfdb.rdrecord(os.path.join("files", filename))
    total_samples = record.sig_len
    sampling_frequency = record.fs
    # data = record.p_signal.flatten().tolist()
    data = record.p_signal[:, 0].tolist()

    segment_duration_seconds = 10
    segment_size = segment_duration_seconds * sampling_frequency
    num_segments = int(np.ceil(total_samples / segment_size))
    
    response = {
        'total_samples': total_samples,
        'sampling_frequency': sampling_frequency,
        'segment_size': segment_size,
        'num_segments': num_segments,
        'data': data
    }
    return jsonify({"fileName": filename, "response": response})


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
    
    ecg_data = data.p_signal[:, 0].tolist()
    
    return jsonify(ecg_data)

@app.route('/predict', methods=['POST'])
def fit():
    
    data =  request.get_json()

    file_names = data['fileNames']
    register_name = file_names
    X_new = np.loadtxt(f"./files/datos-{register_name}.dat")
    
    try:
        X_newShape = X_new.reshape((X_new.shape[0], X_new.shape[1], 1))
    except ValueError as e:
        print("Error al reestructurar el array:", e)
        exit(1)

    path="./modelo_CNN1D.h5"
    model= tf.keras.models.load_model(path)
    
    predictions = model.predict(X_newShape)
    
    predicted_classes = np.argmax(predictions, axis=1)
    
    np.savetxt(f'./files/etiquetas-{register_name}.dat',predicted_classes)

    etiquetas = np.loadtxt(f'./files/etiquetas-{register_name}.dat').tolist()
    
    record = wfdb.rdrecord(os.path.join(app.config['UPLOAD_FOLDER'], register_name))
    total_samples = record.sig_len
    sampling_frequency = record.fs
    arrhythmia_data = etiquetas
    segment_duration_seconds = 10
    segment_size = segment_duration_seconds * sampling_frequency
    num_segments = int(np.ceil(total_samples / segment_size))
    
    data = [elemento for fila in X_new for elemento in fila]
      
    response = {
        'total_samples': total_samples,
        'sampling_frequency': sampling_frequency,
        'segment_size': segment_size,
        'num_segments': num_segments,
        'data': data,
        'arrhythmia': arrhythmia_data,
    }

    return jsonify(response)  
    


@app.route('/normalizacion',methods=['POST'])
def normalizar():
    filename = upload_data(request.files['file'])
    filename2 = upload_data(request.files['file2'])
    filename3 = upload_data(request.files['file3'])
    
    raw_data, id_events=llamado(filename)
    data_normal=normalizacion(raw_data)
    
    record = wfdb.rdrecord(os.path.join("files", filename))
    total_samples = record.sig_len
    sampling_frequency = record.fs
    data = record.p_signal[:, 0].tolist()

    segment_duration_seconds = 10
    segment_size = segment_duration_seconds * sampling_frequency
    num_segments = int(np.ceil(total_samples / segment_size))
    
    response = {
        'total_samples': total_samples,
        'sampling_frequency': sampling_frequency,
        'segment_size': segment_size,
        'num_segments': num_segments,
        'data': data
    }
    
    json_data = {
        "response": response,
        "data_normal": data_normal.tolist()
    }
    
    # Guardar el JSON en un archivo
    with open(f'./files/Normalizacion-{filename}.json', 'w') as f:
        json.dump(json_data, f)
      
    id_events = np.array([id_events])
    
    np.savetxt(f'./files/Eventos-{filename}.dat', id_events, fmt='%s')
    name = f'Normalizacion-{filename}.json'
    eventos = f'Eventos-{filename}.dat'
    return jsonify({"fileName": name, "fileEvento":eventos, "response": response}) 


@app.route('/pqrs',methods=['POST'])
def pqrs():
    filename = upload_data(request.files['file'])
    filename2 = upload_data(request.files['file2'])
    filename3 = upload_data(request.files['file3'])
    
    pqrs = detectorQRS(filename)
    
    np.savetxt(f'./files/PQRS-{filename}.dat',pqrs)
    name = f'PQRS-{filename}.dat'
    
    record = wfdb.rdrecord(os.path.join("files", filename))
    total_samples = record.sig_len
    sampling_frequency = record.fs
    data = record.p_signal[:, 0].tolist()

    segment_duration_seconds = 10
    segment_size = segment_duration_seconds * sampling_frequency
    num_segments = int(np.ceil(total_samples / segment_size))
    
    response = {
        'total_samples': total_samples,
        'sampling_frequency': sampling_frequency,
        'segment_size': segment_size,
        'num_segments': num_segments,
        'data': data
    }
    
    return jsonify({"fileName": name, "response": response})  

@app.route('/segmentacionMethod',methods=['POST'])
def segmentacionMethod():
    
    datosSeg=[]
    dts=[]
    datosSegmentados=[]
    etiquetas1=[]
    etiquetas2=[]
    
    normalizacion = upload_data(request.files['normalizacion'])
    pqrs = upload_data(request.files['pqrs'])
    eventos = upload_data(request.files['eventos'])
    
    with open(f'./files/{normalizacion}.json', 'r') as f:
        json_data = json.load(f)
    
    response = json_data['response']
    normalizacion = json_data['data_normal']
    
    id_events = np.loadtxt(f"./files/{eventos}.dat", dtype=str)
    
    pqrs = np.loadtxt(f"./files/{pqrs}.dat")
    pqrs = pqrs.astype(int)
    
    p=segmentacion(normalizacion, pqrs )
    
    datosSeg.append(p)

    for i in range(len(datosSeg)):
        for j in range(len(datosSeg[i])):
            datosSegmentados.append(datosSeg[i][j])

    ll=filtro(datosSegmentados)
    #Binarizacion de las etiquetas
    etiquetas1.append(Binarizacion(id_events))


    for i in range(len(etiquetas1)):
        for j in range(len(etiquetas1[i])):
            etiquetas2.append(etiquetas1[i][j])
            
    etq, dts = completar(etiquetas2, datosSegmentados)

    dtsCom=[]
    etqCom=[]

    #se ubica en una sola lista los datos de todos los regitros, asi mismo con las etiquetas
    for i in range(len(etq)):
        for j in range(len(etq[i])):
            if(etq[i][j]==1):

                dtsCom.append(dts[i][j])
                etqCom.append(1)
            else:

                dtsCom.append(dts[i][j])
                etqCom.append(0)

    #se ajusta los segmentos de datos para que tengan la misma longitud
    dtsCom=ajusteDatos(dtsCom)

    # np.savetxt(f'./files/datos.dat',dtsCom)
    
    json_data = {
        "response": response,
        "datos": dtsCom
    }
    
    # Guardar el JSON en un archivo
    with open(f'./files/datos.json', 'w') as f:
        json.dump(json_data, f)
      
    
    return jsonify({"fileName": "datos.json"})  


@app.route('/predictOnly',methods=['POST'])
def predictOnly():

    register_name = upload_data(request.files['file'])
    
    with open(f'./files/{register_name}.json', 'r') as f:
        json_data = json.load(f)
    
    response = json_data['response']
    X_new = np.array(json_data['datos'])
    
    try:
        X_newShape = X_new.reshape((X_new.shape[0], X_new.shape[1], 1))
    except ValueError as e:
        print("Error al reestructurar el array:", e)
        # Manejar el error adecuadamente, tal vez ajustando num_samples o las dimensiones objetivo
        exit(1)

    path="./modelo_CNN1D.h5"
    model= tf.keras.models.load_model(path)
    
    predictions = model.predict(X_newShape)
    
    predicted_classes = np.argmax(predictions, axis=1)
    
    np.savetxt(f'./files/etiquetas.dat',predicted_classes)
    
    
    data = [elemento for fila in X_new for elemento in fila]
    
    predicted_classes = [predicted_classes]
    
    etiquetas = np.loadtxt(f'./files/etiquetas.dat').tolist()
    
    return jsonify({"fileName": "etiquetas.dat", "response":response, "arrhythmia": etiquetas, "data":data})  


if __name__ == '__main__':
    app.run(debug=True, port=5003)
