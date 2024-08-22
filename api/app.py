from flask import Flask,request, jsonify
import numpy as np
import pandas as pd
from flask_cors import CORS
import preprocesamiento
import os
import tensorflow as tf
import wfdb
from wfdb import processing
import json
from funcionesPreprocesamiento import llamado, normalizacion, detectorQRS, Binarizacion, filtro, segmentacion, completar, ajusteDatos

app=Flask(__name__)
CORS(app)

UPLOAD_FOLDER = './files/'
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

os.makedirs(UPLOAD_FOLDER, exist_ok=True)

@app.route('/api/upload',methods=['POST'])
def upload_files():
    files = request.files.to_dict()
    uploaded_files = []

    for filename, file in files.items():
        uploaded_filename = upload_data(file)
        uploaded_files.append(uploaded_filename)
    
    return jsonify({"filename": uploaded_files})

def upload_data(file):
    if file.filename == '':
        return 'No hay archivo selecionado', 400
    
    file_path = os.path.join(app.config['UPLOAD_FOLDER'], file.filename)
    
    file.save(file_path)
    
    return file.filename.split('.')[0]

@app.route('/api/ecg/<filename>', methods=['GET'])
def ecg_signal(filename):
    record = wfdb.rdrecord(os.path.join(app.config['UPLOAD_FOLDER'], filename))
    
    total_samples = record.sig_len
    ecg_signal = record.p_signal[:, 0]
    sampling_frequency = record.fs
    qrs_indices = processing.gqrs_detect(sig=ecg_signal, fs=sampling_frequency)
    num_segments = len(qrs_indices)

    response = {
        'total_samples': total_samples,
        'sampling_frequency': sampling_frequency,
        'num_segments': num_segments,
        'data': ecg_signal.tolist()
    }

    return jsonify(response)

@app.route('/api/predict/<filename>', methods=['GET'])
def predict(filename):
    _, _ = preprocesamiento.inicio(filename)

    X_new = np.loadtxt(os.path.join(app.config['UPLOAD_FOLDER'], f"/datos-{filename}.dat"))
    
    try:
        X_newShape = X_new.reshape((X_new.shape[0], X_new.shape[1], 1))
    except ValueError as e:
        print("Error al reestructurar el array:", e)
        exit(1)

    path="./modelo_CNN1D.h5"
    model= tf.keras.models.load_model(path)
    
    predictions = model.predict(X_newShape)
    
    predicted_classes = np.argmax(predictions, axis=1)
    
    np.savetxt(os.path.join(app.config['UPLOAD_FOLDER'], f'/etiquetas-{filename}.dat'), predicted_classes)

    etiquetas = np.loadtxt(os.path.join(app.config['UPLOAD_FOLDER'], f'/etiquetas-{filename}.dat')).tolist()

    ecg_signal = X_new.flatten().tolist()

    response = {
        'data': ecg_signal,
        'arrhythmia': etiquetas,
    }

    return jsonify(response)

@app.route('/api/normalize/<filename>', methods=['GET'])
def normalize(filename):
    raw_data, id_events = llamado(filename)
    data_normal = normalizacion(raw_data)

    normalization_name = f'normalizacion-{filename}.norx'
    event_name =f'eventos-{filename}.evtx'

    np.savetxt(os.path.join(app.config['UPLOAD_FOLDER'], normalization_name), data_normal, fmt='%f')
    np.savetxt(os.path.join(app.config['UPLOAD_FOLDER'], event_name), id_events, fmt='%s')

    response = {
        'normalizacion': normalization_name,
        'event': event_name,
    }

    return jsonify(response)

@app.route('/api/qrs/<filename>', methods=['GET'])
def qrs(filename):
    qrs_locs,fs=detectorQRS(filename)

    data = {
        'filename': filename,
        'fs': fs,
        'qrs': qrs_locs.tolist(),
    }

    qrs_name = f'qrs-{filename}.qrsx'

    with open(os.path.join(app.config['UPLOAD_FOLDER'], qrs_name), 'w') as file:
        json.dump(data, file)

    response = {
        'qrs': qrs_name,
    }

    return jsonify(response)

@app.route('/api/normalized/<filename>', methods=['GET'])
def normalized_signal(filename):
    normalizacion = filename.split(",")[0]
    qrs = filename.split(",")[2]

    data_normal = np.loadtxt(os.path.join(app.config['UPLOAD_FOLDER'], f"{normalizacion}.norx"), dtype=float)

    with open(os.path.join(app.config['UPLOAD_FOLDER'], f"{qrs}.qrsx"), 'r') as file:
        data = json.load(file)

    qrs_locs = np.array(data['qrs'])
    fs = data['fs']
    
    total_samples = len(data_normal)
    normalized_signal = data_normal.flatten().tolist()
    sampling_frequency = fs
    num_segments = len(qrs_locs)

    response = {
        'total_samples': total_samples,
        'sampling_frequency': sampling_frequency,
        'num_segments': num_segments,
        'data': normalized_signal
    }

    return jsonify(response)

@app.route('/api/segment/<filename>', methods=['GET'])
def segment(filename):
    # se definen las variables
    etq=[]
    dts=[]
    etiquetas1=[]
    etiquetas2=[]
    datosSeg=[]
    datosSegmentados=[]

    normalizacion = filename.split(",")[0]
    eventos = filename.split(",")[1]
    qrs = filename.split(",")[2]
    
    data_normal = np.loadtxt(os.path.join(app.config['UPLOAD_FOLDER'], f"{normalizacion}.norx"), dtype=float)
    id_events = np.loadtxt(os.path.join(app.config['UPLOAD_FOLDER'], f"{eventos}.evtx"), dtype=str)

    with open(os.path.join(app.config['UPLOAD_FOLDER'], f"{qrs}.qrsx"), 'r') as file:
        data = json.load(file)

    qrs_locs = np.array(data['qrs'])
    fs = data['fs']

    #se hace uso de los indices arrojados por el detector QRS
    p=segmentacion(data_normal, qrs_locs)

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
    """
    se completan los datos y las etiquetas con el fin de que tengan la misma
    la misma longitud y se realiza el filtro de los mismos
    """
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

    total_samples = len(data_normal)
    sampling_frequency = fs
    num_segments = len(qrs_locs)

    segmentation_name = f'segmentacion-{data['filename']}.segx'

    data = {
        'filename': data['filename'],
        'total_samples': total_samples,
        'sampling_frequency': sampling_frequency,
        'num_segments': num_segments,
        'data_segment': np.array(dtsCom)
    }

    data['data_segment'] = data['data_segment'].tolist()

    with open(os.path.join(app.config['UPLOAD_FOLDER'], segmentation_name), 'w') as file:
        json.dump(data, file)

    response = {
        'segmentation': segmentation_name,
    }

    return jsonify(response)

@app.route('/api/segmented/<filename>', methods=['GET'])
def segmented_signal(filename):
    segmentacion = filename.split(",")[0]

    with open(os.path.join(app.config['UPLOAD_FOLDER'], f"{segmentacion}.segx"), 'r') as file:
        data = json.load(file)
    
    total_samples = data['total_samples']
    segmented_signal = np.array(data['data_segment'])
    sampling_frequency = data['sampling_frequency']
    num_segments = data['num_segments']

    response = {
        'total_samples': total_samples,
        'sampling_frequency': sampling_frequency,
        'num_segments': num_segments,
        'data': segmented_signal.flatten().tolist()
    }

    return jsonify(response)

@app.route('/api/predictonly/<filename>', methods=['GET'])
def predictonly(filename):
    segmentacion = filename.split(",")[0]

    with open(os.path.join(app.config['UPLOAD_FOLDER'], f"{segmentacion}.segx"), 'r') as file:
        data = json.load(file)

    X_new = np.array(data['data_segment'])
    
    try:
        X_newShape = X_new.reshape((X_new.shape[0], X_new.shape[1], 1))
    except ValueError as e:
        print("Error al reestructurar el array:", e)
        exit(1)

    path="./modelo_CNN1D.h5"
    model= tf.keras.models.load_model(path)
    
    predictions = model.predict(X_newShape)
    
    predicted_classes = np.argmax(predictions, axis=1)

    prediction_name = f'prediccion-{data['filename']}.prdx'
    
    np.savetxt(os.path.join(app.config['UPLOAD_FOLDER'], prediction_name),predicted_classes)

    response = {
        'prediction': prediction_name,
    }

    return jsonify(response)

@app.route('/api/graph/<filename>', methods=['GET'])
def graph(filename):
    segmentacion = filename.split(",")[0]
    prediccion = filename.split(",")[1]

    with open(os.path.join(app.config['UPLOAD_FOLDER'], f"{segmentacion}.segx"), 'r') as file:
        data = json.load(file)
    
    total_samples = data['total_samples']
    segmented_signal = np.array(data['data_segment'])
    sampling_frequency = data['sampling_frequency']
    num_segments = data['num_segments']

    predict = np.loadtxt(os.path.join(app.config['UPLOAD_FOLDER'], f"{prediccion}.prdx")).tolist()

    response = {
        'total_samples': total_samples,
        'sampling_frequency': sampling_frequency,
        'num_segments': num_segments,
        'data': segmented_signal.flatten().tolist(),
        'arrhythmia': predict,
    }

    return jsonify(response)

if __name__ == '__main__':
    app.run(debug=True, port=5003)