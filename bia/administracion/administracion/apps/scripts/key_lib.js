zip.workerScriptsPath = '/static/administracion/apps/deps/zipjs/';


//Retorna una promesa con una lista de códigos la cual ha sido limpiada de
//repeticiones y códigos vacíos. Leerá un código por linea de texto.
function readText(text) {
  return new Promise(function(resolve, reject){
    var lines = text.split('\n');
    var cleanLines = lines.filter((line, index, list) => {
      return line.length > 0 && list.indexOf(line) === index;
    })
    resolve(cleanLines);
  });
}


//Retorna una promesa con una lista de códigos. El archivo de texto es leído
//línea por línea.
function readTextFile(blob) {
  return new Promise(function(resolve, reject){
    var reader = new FileReader();

    reader.addEventListener('load', function(){
      var text = reader.result;
      resolve(readText(text));
    }, false);

    if (blob) {
      reader.readAsText(blob);
    } else {
      reject('no se pudo leer archivo.');
    }
  });
}


//Retorna una promesa con una lista de códigos. Leerá un código por cada celda
//de la primera columna del archivo, el archivo no debe tener cabezal.
function readCSVFile(blob) {
  return new Promise(function(resolve, reject) {
    Papa.parse(blob, {
      header: false,
      complete: function(results) {
        var list = [];
        for (row of results.data) {
          if (row.length > 0 && row[0].length > 0) {
            list.push(row[0]);
          }
        }
        resolve(list);
      },
      error: function(error, file) {
        reject(error);
      }
    });
  });
}


//Retorna el tipo MIME del archivo basado en su extensión. Esto es necesario ya
//que el lector de archivos .zip pierde la información MIME del archivo.
function filenameToType(filename) {
  var file_type = undefined;
  var name = filename.toLowerCase();
  if (name.endsWith('.jpg') || name.endsWith('.jpeg')){
    file_type = 'image/jpg';
  } else if (name.endsWith('.png')){
    file_type = 'image/png';
  } else if (name.endsWith('.gif')){
    file_type = 'image/gif';
  } else if (name.endsWith('.txt')){
    file_type = 'text/plain';
  } else if (name.endsWith('.csv')){
    file_type = 'text/csv';
  }
  return file_type;
}


//Lee una entrada del zip con el tipo de archivo especificado. El archivo
//resultante queda con una referencia a la entrada de zip que lo generó.
function readZipEntryWithType(entry, type){
  return new Promise(function(resolve, reject) {
    entry.getData(new zip.BlobWriter(type), function(blob){
      blob.zipEntry = entry;
      resolve(blob);
    });
  });
}


//Lee una entrada del zip, la relaciona con su tipo y devuelve una promesa
//que se cumple cuando la imagen es leída completamente.
function readImageFromZipEntry(entry) {
  return new Promise(function(resolve, reject) {
    var image_type = filenameToType(entry.filename);
    if (!image_type) resolve(null);
    readZipEntryWithType(entry, image_type).then(resolve);
  })
}


//Retorna una promesa con una lista de imágenes. Ignora las imágenes que están
//puestas dentro de una carpeta.
function readZipFile(blob) {
  return readZipEntryList(blob)
  .then(function(entries){
    return entries.filter(function(elem){
      return !elem.filename.match(/.+\/.+/);
    }).map(function(elem){
      return readImageFromZipEntry(elem);
    });
  })
  .then(function(promises){
    return Promise.all(promises).then(function(imageList){
        return imageList.filter(function(elem){
          return elem != null;
        });
    });
  });
}


//Retorna una promesa con una lista de entradas del zip que cumplan el no ser
//directorios.
function readZipEntryList(zipBlob) {
  return new Promise(function(resolve, reject) {
    zip.createReader(new zip.BlobReader(zipBlob), function(reader) {
      reader.getEntries(function(entries) {
        resolve(entries.filter(entry => !entry.directory));
        //reader.close();
      });
    }, reject);
  });
}


//Retorna un objeto con la forma de una key en el sistema, la cual luego se
//puede convertir fácilmente a datos de formulario.
function prepareKey(reference, code, image, price_bought, active) {
  return {
    'reference': reference,
    'code': code,
    'image': image,
    'price_bought': price_bought,
    'active': active
  }
}


//Retorna una promesa con una lista de keys extraídas de archivos de los tipos
//soportados por el sistema.
function fileToKeyList(file, product, price, active) {
  return new Promise(function(resolve, reject){
    if (file.type.startsWith('image/')) {
      resolve([prepareKey(product, undefined, file, price, active)])
    } else if (file.type.match(/.+zip.*/)) {
      readZipFile(file).then(function(images){
        var keys = images.map(function(image){
          return prepareKey(product, undefined, image, price, active);
        });
        resolve(keys);
      });
    } else if (file.type.endsWith('plain')) {
      readTextFile(file).then(function(codes){
        var keys = codes.map(function(code){
          return prepareKey(product, code, undefined, price, active);
        })
        resolve(keys);
      });
    } else if (file.type.endsWith('csv')) {
      readCSVFile(file).then(function(codes){
        var keys = codes.map(function(code){
          return prepareKey(product, code, undefined, price, active);
        });
        resolve(keys);
      })
    } else {
      resolve(null);
    }
  });
}


//Procesa una lista de códigos que han sido ingresados por el formulario y no
//por un archivo
function processTextList(list, reference, price, active) {
  return readText(list).then((codes) => {
    return codes.map(code => prepareKey(reference, code, null, price, active));
  });
}


//Procesa una lista de archivos (blobs) provenientes de un input.file
function processFileList(list, reference, price, active) {
  var keys = null;
  var promises =
    list.map(file => fileToKeyList(file, reference, price, active));
  return Promise.all(promises)
    .then(lists => lists.reduce((a, b) => a.concat(b), []));
}


//Convierte la key en datos de formulario que pueden ser enviados en una
//solicitud. Este paso es necesario porque en este paso el archivo (blob) se
//codifica como multipart/form-data.
function makeKeyFormData(key, token) {
  var keyData = new FormData();
  for(var k in key){
    keyData.append(k, key[k]);
  }
  keyData.append('csrfmiddlewaretoken', token);
  return keyData;
}


//Envía la key al controlador de nueva key en el servidor. Retorna el estado de
//la solicitud y un índice opcional que hace referencia a este key en una lista
function sendKey(key, csrfToken, idx) {
  var url = `/administracion/products/${key.reference}/keys/new`;
  var result = {index: idx, status: false, uploaded: true};
  return new Promise(function(resolve, reject) {
    fetch(url, {
      method: 'POST',
      body: makeKeyFormData(key, csrfToken),
      cache: 'no-cache',
      credentials: 'same-origin',
      headers: {'X-Requested-With': 'XMLHttpRequest'},
    }).then((response) => {
      result.status = response.ok;
      resolve(result);
    }).catch((error) => {
      result.uploaded = false;
      result.status = true; //solo como manera de notificación.
      resolve(result);
    });
  });
}
