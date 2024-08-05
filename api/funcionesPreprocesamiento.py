import wfdb
from sklearn import preprocessing
from wfdb import processing
import heartpy as hp
import statistics as stats
import numpy as np


# Funcion para llamar los registros
def llamado(registr):
    registro = f'./files/{registr}'
    print(registro)
    size=650000

    registro= str(registro)
    record=wfdb.rdrecord(registro,sampto=size)
    annotation = wfdb.rdann(registro,'atr',sampto=size)

    id_events=annotation.symbol
    raw_data=record.p_signal

    return raw_data,id_events


def filtro(s):
    datosF=[]
    for i in range(len(s)):
        filtered3= hp.filter_signal(s[i], cutoff = [2.7, 12.6], sample_rate = 360.0, order = 3, filtertype='bandpass')
        filtered4=hp.filter_signal(filtered3, cutoff = 0.01, sample_rate = 360.0, filtertype='notch')
        datosF.append(filtered4.tolist())
    return datosF


# Funcion para normalizar la señal
def normalizacion(data):
    data_normal=preprocessing.normalize(data, norm='l2')
    return data_normal

# Funcion para detectar el segmento QRS
def detectorQRS(registr):
    
    registro = f'./files/{registr}'
    record = wfdb.rdrecord(registro, channels=[0], physical=False)
    qrs_locs = processing.gqrs_detect(d_sig=record.d_signal[:,0], fs=record.fs, adc_gain=record.adc_gain[0], adc_zero=record.adc_zero[0])

    return qrs_locs

# Funcion para segmentar la señal, haciendo de los indices obtenidos del detectoe QRS
def segmentacion(data_normal, qrs_locs):
    s=[]
    o=[]
    indices=[]
    p=[]
    for i in range(len(data_normal)):
        for j in range(len(data_normal[i])):
            s.append(data_normal[i][j])

    for k in range(len(qrs_locs)):
        indices.append(qrs_locs[k])

    indices[:0]=[0]
    l=0
    longitud=len(indices)-1

    while l <longitud:
        desde=indices[l]
        hasta=indices[l+1]
        l+=1

        for m in range(desde*2,hasta*2):
            o.append(s[m])
        p.append(o)
        o=[]
    return p

# Funcion para la Binarización de las etiquetas
def Binarizacion(id_events):
    etiquetas1=[]
    lon=len(id_events)

    for i in range(lon):
        if(id_events[i]=='N' or id_events[i]=='+'):
            etiquetas1.append(0)
        else:
            etiquetas1.append(1)
    return etiquetas1

# Funcion para completar las etiquetas y los datos
def completar(etiquetas2,datosSegmentados):
    etq=[]
    dts=[]

    #Filtro de datos
    datosF=filtro(datosSegmentados)

    #se elimina las etiquetas sobrantes de cada registro
    if(len(etiquetas2) - len(datosF)>0):
        value=len(etiquetas2) - len(datosF)
        for i in range(value):
            etiquetas2.pop()
    if(len(datosF) - len(etiquetas2)>0):
        value=len(datosF) - len(etiquetas2)
        for i in range(value):
            datosF.pop()
    else:
        value=len(datosF)

    etq.append(etiquetas2)
    dts.append(datosF)

    return etq, dts

#Funcion para ajustar los segmentos de los datos
def ajusteDatos(dtsCom):
    listaM=[]
    listaCal=[]
    for i in range(len(dtsCom)):
       listaM.append(len(dtsCom[i]))
    prom=int(float(stats.mean(listaM)))
    lon=0
    for j in range(len(dtsCom)):
        lon=len(dtsCom[j])
        while lon < prom:
            desde2=len(dtsCom[j])-3
            hasta2=len(dtsCom[j])
            for k in range(desde2,hasta2):
                listaCal.append(dtsCom[j][k])
                if(k==hasta2-1):
                    dtsCom[j].append(stats.mean(listaCal)+stats.stdev(listaCal))
                    listaCal=[]
                    lon=len(dtsCom[j])


        while lon > prom:
            dtsCom[j]=dtsCom[j][:-1]
            lon=len(dtsCom[j])
    return dtsCom
