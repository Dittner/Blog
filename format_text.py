import argparse
import os
import re

parser = argparse.ArgumentParser()
parser.add_argument('-u', '--url', type=str)
args = parser.parse_args()

def split(txt, rdelim):
  rdelimIndex = txt.rindex(rdelim)
  return (txt[0:rdelimIndex], txt[rdelimIndex + 1:])

url, fileExtention = split(args.url, '.')
dirUrl, fileName = split(url, '/')

#print('dirUrl:', dirUrl)
#print('fileExtention:', fileExtention)
#print('fileName:', fileName)

if len(fileName) == 0:
  print('The file url has not a valid file name!')
  os._exit(1)

if fileExtention.lower() != 'txt':
  print('The file has an extention: ', fileExtention,', but expected: txt!', sep='')
  os._exit(1)

inputFile = open(args.url, 'rt')
content = inputFile.read()
inputFile.close()

content = re.sub(r' +', ' ', content)
content = re.sub(r'\n{3,}', '\n\n', content)
content = re.sub(r' – ', ' — ', content)
content = re.sub(r' - ', ' — ', content)

outputFileUrl = dirUrl + '/' + fileName + '_formatted.txt'
outputFile = open(outputFileUrl, 'wt')
outputFile.write(content)
outputFile.close()
print('Output:', outputFileUrl)