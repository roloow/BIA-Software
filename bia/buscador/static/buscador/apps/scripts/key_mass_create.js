//Obtiene la referencia (o nombre corto) de un archivo, a partir de la lista de
//referencias contenida en el root de la aplicación.
var getReference = function(name) {
  var parts = name.split('/');
  if (parts.length > 2) return undefined;
  var relevantName = parts[0];
  if (parts.length == 1) {
    relevantName = parts[0].split('.')
    if (relevantName.length > 2) {
      relevantName = relevantName.slice(0, relevantName.length-1).join("");
    } else {
      relevantName = relevantName[0];
    }
  }
  var findReference = app.references.filter(x => x == relevantName);
  if (findReference.length > 0) return relevantName;
  return undefined;
}

//Retorna true si es que la entrada debería ser ignorada.
var isEntryIgnored = function(rawEntry) {
  if (rawEntry.directory) return true;
  var reference = getReference(rawEntry.filename);
  if (!reference) return true;
  var justFile = rawEntry.filename.replace(reference+'/', "");
  if (justFile.startsWith('.')) return true;
  return false;
}

//Agrega los parámetros adicionales a la entrada de zip, para poder ser
//correctamente convertida en un key.
var rawToPendingEntry = function(rawEntry) {
  rawEntry.price = undefined;
  rawEntry.reference = undefined;
  rawEntry.ignored = isEntryIgnored(rawEntry);
  rawEntry.fileType = filenameToType(rawEntry.filename);
  rawEntry.reference =
    rawEntry.ignored ? undefined : getReference(rawEntry.filename);
  rawEntry.valid = rawEntry.fileType && rawEntry.reference
    && !rawEntry.ignored;
  return rawEntry;
}

//Controla el botón para pasar al paso dos. Lee el archivo zip a la memoria y
//luego decora las entradas con la información necesaria para convertirla en key
var zipFileListener = function(event) {
  var files = document.getElementById('fileInput').files
  var instance = this;
  var zipBlob = files[0];
  instance.loading = true;
  readZipEntryList(zipBlob)
  .then(function(list){
    var pendingEntries = list.map(rawToPendingEntry);
    instance.validEntries =
      pendingEntries.filter(e => e.valid).sort((a, b) => {
        if (a.reference > b.reference) return 1;
        else if (a.reference < b.reference) return -1;
        return 0;
      });
    instance.invalidEntries = pendingEntries.filter(e => !e.valid);
    instance.step = 2;
    instance.loading = false;
  });
}

//Controla el botón que permite pasar al paso tres. Convierte las entradas
//válidas del zip en archivos y luego cada entrada de esos archivos en keys.
var pricesListener = function(event) {
  var promises = []
  var instance = this;
  instance.loading = true;
  for (var entry of app.validEntries) {
    promises.push(readZipEntryWithType(entry, entry.fileType))
  }
  Promise.all(promises)
  .then(function(files){
    var promises = files.map((file) => {
      return fileToKeyList(file, file.zipEntry.reference,
                           file.zipEntry.price, true);
    });
    return Promise.all(promises).then(function(keyLists){
      instance.pendingKeys = keyLists.reduce((a, b) => a.concat(b), []);
      instance.step = 3;
      instance.loading = false;
    });
  });
}


//Envuelve el envío de la key en una promesa que al resolverse cambia el estado
//del modelo de key, indicando si la key se subió o no.
var sendKeyAndConfirm = function(key, token, index) {
  return new Promise(function(resolve, reject) {
    sendKey(key, token, index)
    .then(function(result) {
      var pendingKey = app.pendingKeys[result.index];
      app.$set(pendingKey, 'uploaded', result.uploaded);
      app.$set(pendingKey, 'status', result.status);
      resolve(result.status && result.upload);
    });
  });
}


//Controla el botón que envía las keys extraídas al servidor. Convierte las keys
//en información de formulario y hace la llamada asíncrona que las confirma.
//Luego cambia el estado de confirmación en el modelo de datos.
var sendKeysListener = function(event) {
  var token = $('input[name="csrfmiddlewaretoken"]').val()
  var promises = [];
  var instance = this;
  instance.loading = true;
  for (var index in instance.pendingKeys) {
    var key = instance.pendingKeys[index];
    promises.push(sendKeyAndConfirm(key, token, index));
  }
  Promise.all(promises)
  .then(function(statuses){
    instance.loading = false;
    var status = statuses.reduce((a,b) => a && b, true);
    if (status) {
      resetState();
      instance.uploadSuccess = true;
    }
  });
}

//Vuelve al estado de subir archivos, eliminando de la memoria las entradas ya
//leídas y validadas.
var backToUploadListener = function(event) {
  this.validEntries = [];
  this.invalidEntries = [];
  this.step = 1;
}


//Vuelve al estado de definir precios, eliminando de la memoria los keys
//extraídos.
var backToPricesListener = function(event) {
  this.pendingKeys = [];
  this.step = 2;
}


//Vuelve al root de la aplicación al estado inicial. Usado en casos de éxito.
var resetState = function() {
  app.step = 1;
  app.loading = false;
  app.zipSelected = false;
  app.uploadSuccess = false;
  app.validEntries = [];
  app.invalidEntries = [];
  app.pendingKeys = [];
}

//Un componente que muestra el nombre de archivo, la validez y un campo para
//especificar un precio para una entrada del archivo zip.
Vue.component('zip-entry', {
  props: ['entry', 'index'],
  computed: {
    validity: function() {
      var result = ['red', 'times', 'Inválido'];
      //primero verifica si cumple con las reglas de validez
      if (this.entry.valid){
        result = ['green', 'check', 'Válido'];
      }
      //luego verifica si es que es un archivo ignorado
      if (this.entry.ignored) {
        result = ['grey-salt', 'question', 'Ignorado'];
      }
      //si todo falla, es un archivo inválido
      return `<span class='font-${result[0]}'>
                <i class='fa fa-${result[1]}-circle'></i>
                ${result[2]}
              </span>`;
    }
  },
  methods: {
    updatePrice: function(value) {
      var price = $.fn.autoUnformat(value, app.usdMask);
      app.$emit('price-'+this.entry.reference, price);
    }
  },
  mounted: function(){
    //crear campo financiero
    if (this.entry.valid) {
      $('.usd-mask-'+this.index).autoNumeric('init', app.usdMask);
      var self = this;
      app.$on('price-'+this.entry.reference, function(amount){
        self.entry.price = amount;
      });
    }
  },
  template: "\
    <tr>\
      <td>{{ entry.filename }}</td>\
      <td>{{ entry.reference }}</td>\
      <td v-html='validity'></td>\
      <td>\
        <input v-bind:class='\"usd-mask-\"+index'\
               v-if='entry.valid'\
               v-bind:name='entry.filename'\
               v-on:keyup='updatePrice($event.target.value)'\
               v-bind:value='entry.price'>\
      </td>\
    </tr>",
});

//Componente que corresponde a un key candidato a entrar al sistema, muentra el
//contenido del código, el producto al cual se asignará, el precio de compra y
//su estado de confirmación.
Vue.component('key-entry', {
  props: ['entry', 'index'],
  data: function(){
    return {
      imageURL: undefined,
    }
  },
  computed: {
    status: function() {
      var result = ['grey-salt', 'question', 'Por confirmar'];
      if (this.entry.uploaded) {
        if (this.entry.status) {
          result = ['green', 'check', 'Confirmado'];
        } else {
          result = ['red', 'times', 'Posible duplicado'];
        }
      } else {
        if (this.entry.status) {
          result = ['yellow-crusta', 'exclamation', 'Inténtalo otra vez']
        }
      }
      return `<span class='font-${result[0]}'>
                <i class='fa fa-${result[1]}-circle'></i>
                ${result[2]}
              </span>`;
    },
    code: function() {
      return this.entry.code ? this.entry.code : '-';
    },
    priceUSD: function() {
      return $.fn.autoFormat(this.entry.price_bought, app.usdMask);
    },
    image: function() {
      if(this.entry.image){
        this.imageURL = URL.createObjectURL(this.entry.image);
        return `<a href="${this.imageURL}" target="_blank">
                  <img src="${this.imageURL}" width="34" height="34">
                </a>`;
      } else {
        return "";
      }
    }
  },
  beforeDestroy: function() {
    if (this.imageURL) {
      URL.revokeObjectURL(this.imageURL);
    }
  },
  template: "\
    <tr>\
      <td>{{ code }}</td>\
      <td v-html='image'></td>\
      <td>{{ entry.reference }}</td>\
      <td>${{ priceUSD }}</td>\
      <td v-html='status'></td>\
    </tr>",
});

//El root de la aplicación, guarda el estado de la aplicación y contiene los
//eventos que controlan el flujo de datos. También sirve de enrutador de
//mensajes entre los componentes.
var app = new Vue({
  el: '#app',
  data: {
    step: 0,
    loading: false,
    zipSelected: false,
    uploadSuccess: false,
    validEntries: [],
    invalidEntries: [],
    pendingKeys: [],
    references: [],
    usdMask: { aSign: ' USD', pSign: 's', vMin: 0, mDec: 2 }
  },
  computed: {
    sortedEntries: function() {
      return this.validEntries.concat(this.invalidEntries);
    },
    sortedKeys: function() {
      return this.pendingKeys.sort((a, b) => {
        if (a.reference > b.reference) return 1;
        if (a.reference < b.reference) return -1;
        return 0;
      })
    },
    allPrices: function() {
      for(var entry of this.validEntries){
        if(entry.price == undefined || entry.price == "") {
          return false;
        }
      }
      return true;
    },
    loadingOrNext: function() {
      return {
        'fa-arrow-circle-right': !this.loading,
        'fa-refresh': this.loading,
        'fa-spin': this.loading,
      }
    }
  },
  methods: {
    changeZip: function(event) {
      if(event.target.files.length > 0) {
        this.zipSelected = true;
      } else {
        this.zipSelected = false;
      }
    },
    fetchData: function(event) {
      var self = this;
      fetch('/administracion/products/attr?value=reference', {
        credentials: 'same-origin',
        headers: {'X-Requested-With': 'XMLHttpRequest'},
      })
      .then(response => response.json())
      .then(references => {
        self.$set(self, 'references', references);
        self.step = 1;
      });
    },
    readZip: zipFileListener,
    readPrices: pricesListener,
    sendKeys: sendKeysListener,
    backToPrices: backToPricesListener,
    backToUpload: backToUploadListener
  },
  created: function() {
    this.fetchData();
  }
});
