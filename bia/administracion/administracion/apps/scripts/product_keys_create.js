var render_preview = function() {
  return `
    <div class="row form-group">
      <div class="col-md-2"><img width="34" height="34" data-dz-thumbnail></div>
      <div class="col-md-7">
        <small style="display: block; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" ><span data-dz-name></span><br/><span data-dz-size></span></small>
      </div>
      <div class="col-md-2">
        <a data-dz-remove class="btn red btn-outline">
          <i class="fa fa-ban"></i>
        </a>
      </div>
    </div>
    `;
}

var key_preview = function(idx, key) {
  var code = " - "
  if(key.code) code = key.code;

  if(key.image) {
    var reader = new FileReader();
    reader.onload = function(event){
      $($.parseHTML('<img>')).attr('src', event.target.result)
        .attr('width', 34)
        .attr('height', 34)
        .appendTo($(`#confirm-${idx}`).find('.image'))
    };
    reader.readAsDataURL(key.image);
  }

  return `<tr id="confirm-${idx}">
      <td> ${code} </td>
      <td class="image"></td>
      <td> $${key.price_bought} </td>
      <td class="confirm">
        <i class="fa fa-question-circle gray"></i>
        Por confirmar
      </td>
    </tr>`;
}

Dropzone.autoDiscover = false;
$(document).ready(function(){
  var pendingKeys = []
  //Configuración de los campos financieros
  $('#price_bought').autoNumeric('init');
  $('.alert.alert-danger').hide();

  var dropzone = new Dropzone('.dropzone', {
    autoQueue: false,
    previewsContainer: '#previews',
    previewTemplate: render_preview(),
    parallelUploads: 200,
    uploadMultiple: false,
    paramName: 'files',
    acceptedFiles: 'image/*,text/plain,text/csv,application/x-zip-compressed,application/zip',
    thumbnailWidth: 34,
    thumbnailHeight: 34,
  });

  var showKeyConfirm = function() {
    $('#key_upload').hide();
    $('#key_confirm').show();
    $('.alert').hide();
    $('.keys-found').text(pendingKeys.length);
    var table = $('#key_confirm').find('tbody')
    table.empty();
    for(index in pendingKeys) {
      table.append(key_preview(index, pendingKeys[index]));
    }
    $('#back-to-upload').click(function(ev){
      showKeyUpload();
    });
  }

  var showKeyUpload = function() {
    $('#key_upload').show();
    $('#key_confirm').hide();
    $('#price_bought').autoNumeric('init');
    pendingKeys = []
  }

  $("#begin-confirmation").click(function(e) {
    e.preventDefault();
    $('.alert.alert-danger').hide();
    var reference = $('input[name="reference"]').val()
    var price_bought = $('input[name="price_bought"]');
    var textKeyCodes = $('textarea[name="multi_codes"]').val()
    try{
        var v = price_bought.autoNumeric('get');
        price_bought.autoNumeric('destroy');
        price_bought.val(v);
    }catch(err){
        console.log("Not an autonumeric field: " + price_bought.attr("name"));
    }
    price_bought = price_bought.val()
    var active = $('input[name="active"]:checked').length > 0;

    processFileList(dropzone.files, reference,
      price_bought, active).then(function(fileKeys){
        processTextList(textKeyCodes, reference, price_bought,
          active).then(function(textKeys){
            var allKeys = fileKeys.concat(textKeys);
            if (allKeys.length == 0){
              $('.alert.alert-danger').show();
            } else {
              pendingKeys = allKeys;
              showKeyConfirm();
            }
          });
      });
  });

  var sendKeyAndConfirm = function(idx, key, token){
    return new Promise(function(resolve, reject){
      sendKey(key, token, idx).then(function(result){
        var node = $(`#confirm-${result.index}`).find('td.confirm');
        if (result.status && result.uploaded) {
          node.html('<span class="font-green"><i class="fa fa-check-circle"></i> Creado con éxito</span>');
        } else if (!result.status && result.uploaded) {
          node.html('<span class="font-red"><i class="fa fa-times-circle"></i> Posible duplicado</span>');
        } else {
          node.html('<span class="font-yellow-crusta"><i class="fa fa-exclamation-circle"></i> Inténtalo otra vez</span>');
        }
        resolve(result.status && result.uploaded);
      });
    });
  }

  $('#start-upload').click(function(e) {
    var token = $('input[name="csrfmiddlewaretoken"]').val()
    var promises = []
    for (idx in pendingKeys) {
      promises.push(sendKeyAndConfirm(idx, pendingKeys[idx], token));
    }
    Promise.all(promises).then(function(statuses){
      finalStatus = statuses.reduce(function(a,b){
        return a && b;
      }, true);
      if(finalStatus) {
        dropzone.files = [];
        $('textarea[name="multi_codes"]').val("");
        showKeyUpload();
        $('.alert.alert-success').show();
      }
    });
  })
});
