# Before run the server install flask lib:
# $ pip3 install flask
# $ python3 pip install flask
# server: http://127.0.0.1:5005
# type to run:
# $ cd PROJECT_DIR
# $ python3 run_server.py

from flask import Flask, jsonify, request, send_file
import os
import json

PORT_NUMBER = 5005
ROOT_DIR = 'data'


#---------------
#     INIT
#---------------

app = Flask(__name__)

#---------------
#     API
#---------------

@app.route('/api')
def isReady():
  return 'Server is ready!', 200

#---------------
#     dir
#---------------
@app.route('/api/dirs', methods=['GET'])
def read_all_dirs():
  res = {}
  if os.path.isdir(ROOT_DIR):
    dirs = os.listdir(ROOT_DIR)
    for dirTitle in dirs:
      dirPath = ROOT_DIR + '/' + dirTitle
      if not dirTitle.startswith('.') and os.path.isdir(dirPath):
        authorsFilePath = dirPath + '/author.txt'
        if isValidTextFile(authorsFilePath):
          file = open(authorsFilePath, 'rt')
          fileContent = file.read()
          file.close()
          res[dirTitle] = fileContent
        else:
          return 'File not found: ' + authorsFilePath, 500
  else:
    os.mkdir(ROOT_DIR)
  return jsonify(res)

def isValidTextFile(filePath):
  fileTitle, fileExtension = split(filePath, '.')
  return os.path.isfile(filePath) and not fileTitle.startswith('.') and fileExtension == 'txt'

def split(txt, rdelim):
  ind = txt.find(rdelim)
  if ind == -1:
    return (txt, '')
  return (txt[0:ind], txt[ind + 1:])

#---------------
#     file
#---------------
@app.route('/api/dir/<dirName>', methods=['GET'])
def read_all_files(dirName):
  res = {}
  if os.path.isdir(ROOT_DIR):
    dirPath = ROOT_DIR + '/' + dirName
    if not dirName.startswith('.') and os.path.isdir(dirPath):
      files = os.listdir(dirPath)
      for file in files:
        fileName, fileExtension = split(file, '.')
        filePath = ROOT_DIR + '/' + dirName + '/' + file

        if fileName != 'author' and isValidTextFile(filePath):
          f = open(filePath, 'rt')
          fileContent = f.read()
          f.close()
          res[fileName] = fileContent
    else:
      return 'Dir not found: ' + dirPath, 500
  else:
    os.mkdir(ROOT_DIR)
  return jsonify(res)

@app.route('/api/dir/<dirName>/file/<fileName>', methods=['GET'])
def read_file(dirName, fileName):
  filePath = ROOT_DIR + '/' + dirName + '/' + fileName
  print('API::read_file, filePath:', filePath)
  file = open(filePath, 'wt')
  fileContent = file.read()
  file.close()
  return fileContent, 200


@app.route('/api/dir/<dirName>/file/<fileName>', methods=['PUT'])
def write_file(dirName, fileName):
  filePath = ROOT_DIR + '/' + dirName + '/' + fileName
  fileContent = request.get_data(as_text=True)
  f = open(filePath, 'wt')
  f.write(fileContent)
  f.close()
  return 'ok', 200


#---------------
#     ASSETS
#---------------
@app.route('/api/assets/<path:src>', methods=['GET'])
def get_image(src):
  path = ROOT_DIR + '/' + src
  print('get_image::path:', path)
  return send_file(path, mimetype='image')


#---------------
#     HEADERS
#---------------

@app.after_request
def apply_caching(response):
  response.headers["Access-Control-Allow-Origin"] = "*"
  response.headers["Access-Control-Allow-Methods"] = "POST, PUT, GET, OPTIONS, DELETE"
  response.headers["Access-Control-Allow-Headers"] = "Origin, X-Requested-With, Content-Type, Accept,"
  return response


if __name__ == '__main__':
  app.run(debug=True, port=PORT_NUMBER)
  

