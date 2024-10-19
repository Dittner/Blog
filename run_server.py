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
def isValidTextFile(filePath):
  fileTitle, fileExtension = split(filePath, '.')
  return os.path.isfile(filePath) and not fileTitle.startswith('.') and fileExtension == 'txt'


def split(txt, rdelim):
  ind = txt.find(rdelim)
  if ind == -1:
    return (txt, '')
  return (txt[0:ind], txt[ind + 1:])

def mkdirs(path):
  ind = 0
  dirNames = path.split('/')
  path = ROOT_DIR
  while ind < len(dirNames):
    n = dirNames[ind]
    path += '/' + n
    if n.endswith('.txt'): break
    if not os.path.isdir(path):
      print('Creating new dir:', path)
      os.mkdir(path)
    ind += 1
  pass


@app.route('/api/dir', defaults={'src': ''}, methods=['GET'])
@app.route('/api/dir/<path:src>', methods=['GET'])
def list_dir(src):
  if not os.path.isdir(ROOT_DIR):
    os.mkdir(ROOT_DIR)
    return 'Dir not found: ' + src, 404

  path = ROOT_DIR + '/' + src
  if not os.path.isdir(path):
    return 'Not a dir: ' + src, 404

  files = []
  names = os.listdir(path)

  #print('API::list_dir, src:', src, 'names:', names)

  for name in names:
    if name.startswith('.') or name == 'info.txt': continue
    itemPath = path + '/' + name
    if os.path.isdir(itemPath):
      infoFilePath = path + '/' + name + '/info.txt'
      if isValidTextFile(infoFilePath):
        infoFile = open(infoFilePath, 'rt')
        info = infoFile.read()
        infoFile.close()
        files.append( {'isDirectory':True, 'path':itemPath, 'text':info} )
    elif isValidTextFile(itemPath):
      fileTitle, fileExtension = split(name, '.')
      f = open(itemPath, 'rt')
      fileContent = f.read()
      f.close()
      files.append( {'isDirectory':False, 'path':itemPath, 'text':fileContent} )

  return jsonify(files)  


#---------------
#     file
#---------------

@app.route('/api/file/<path:src>', methods=['GET'])
def read_file(src):
  print('API::read_file, filePath:', src)
  path = ROOT_DIR + '/' + src

  if not os.path.isfile(path):
    return 'File not found: ' + src, 404
  
  file = open(path, 'rt')
  fileContent = file.read()
  file.close()
  return fileContent, 200


@app.route('/api/file/<path:src>', methods=['POST'])
def write_file(src):
  path = ROOT_DIR + '/' + src
  if not src.endswith('.txt'):
    print('Not a file:', path)
    return 'Not a file: ' + src, 400

  mkdirs(src)

  fileDto = request.get_json()
  
  id = fileDto.get('id')
  names = src.split('/')
  count = len(names)

  oldPath = ''
  newPath = ''

  if count > 1 and names[count-1] == 'info.txt':
    fileName = names[count-2]
    if fileName != id:
      names[count-1] = ''
      oldPath = ROOT_DIR + '/' + '/'.join(names)
      names[count-2] = id
      newPath = ROOT_DIR + '/' + '/'.join(names)
      print('New dir path:', newPath)
      if os.path.isdir(newPath):
        print('Dir already exists:', newPath)
        return 'Dir already exists: ' + newPath, 400
  elif count > 0:
    fileName, fileExtension = split(names[count-1], '.')
    if fileName != id:
      names[count-1] = id + '.txt'
      oldPath = path
      newPath = ROOT_DIR + '/' + '/'.join(names)
      print('New file path:', newPath)
      if os.path.isfile(newPath):
        print('File already exists:', newPath)
        return 'File already exists: ' + newPath, 400
  
  text = fileDto.get('text')
  f = open(path, 'wt')
  f.write(text)
  f.close()

  if len(oldPath) > 0 and len(newPath) > 0:
    print('Renaming from:', oldPath, ', to:', newPath)
    os.rename(oldPath, newPath)
  return 'ok', 200


#---------------
#     ASSETS
#---------------
@app.route('/api/asset/<path:src>', methods=['GET'])
def get_image(src):
  path = ROOT_DIR + '/' + src
  print('get_image::path:', path)
  if not os.path.isfile(path):
    return 'Asset not found: ' + src, 404
  
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
  

