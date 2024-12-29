import os

UPLOAD_FOLDER = './app/views/static/storage/'
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

def delete_old_files():
    for file in os.listdir(UPLOAD_FOLDER):
        file_path = os.path.join(UPLOAD_FOLDER, file)
        try:
            if os.path.isfile(file_path) or os.path.islink(file_path):
                os.unlink(file_path)
            elif os.path.isdir(file_path):
                shutil.rmtree(file_path)
        except Exception as e:
            print(f'No se pudo eliminar {file_path}.error: {e}')

def save_file(file):
    if file.filename == '':
        return 'No hay archivo seleccionado', 400

    file_path = os.path.join(UPLOAD_FOLDER, file.filename)
    file.save(file_path)
    return file.filename.split('.')[0]