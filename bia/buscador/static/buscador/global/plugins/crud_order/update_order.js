var app = new Vue({
  el: '#app',
  created: function(){
    // Para dejar el wizzard en mantenimiento basta comentar el siguiente codigo
    // o bien, concluirlo con this.step = 0

    this.step = undefined;
    this.client_id = parseInt($('#client_id')[0].value);
    this.order_id = parseInt($('#order_id')[0].value);
    this.initial_status = parseInt($('#initial_status')[0].value);
    this.initial_notes = $('#initial_notes')[0].value;
    this.loading = true;
    var self = this;
    fetch(`/administracion/orders/products/client/${this.client_id}`, {
      credentials: 'same-origin',
      headers: {'X-Requested-With': 'XMLHttpRequest'},
    })
    .then(response => {
      if (response.ok){
        return response.json();
      } else {
        throw {}
      }
    })
    .then(object => {
      self.$set(self,'products', object.products);
        self.loading = false;
        self.step = 1;
    })
    .catch(error => {
      self.step = 2;
    });
  },
  data: {
    step: 0,
    cart_mantaince: true,
    status_mantaince: false,
    notes_mantaince: false,
    client_id: undefined,
    order_id: undefined,
    products: {},
    cart_editor: false,
    status_editor: false,
    notes_editor: false,
    loading: false,
    order_cart: {},
    order_status: undefined,
    order_notes: "",
    initial_cart: {},
    initial_status: undefined,
    initial_notes: "",
    cart_msg: "",
    status_msg: "",
    notes_msg: "",
  },
  methods: {
    activate_cart: function(event){
      // TODO: get cart
      this.cart_editor = true;
    },
    activate_status: function(event){
      this.status_msg = "";
      this.order_status = this.initial_status;
      this.status_editor = true;
      var self = this;
      Vue.nextTick(function(){
        self.refresh_picker()
      });
    },
    activate_notes: function(event){
      this.notes_msg = "";
      this.order_notes = this.initial_notes;
      this.notes_editor = true;
      var self = this;
      Vue.nextTick(function(){
          CKEDITOR.instances.order_notes_editor.setData(self.order_notes)
          self.refresh_textarea();
      });
    },
    deactivate_cart: function(event){
      this.cart_editor = false;
      this.order_cart = {};
    },
    deactivate_status: function(event){
      this.status_editor = false;
      this.order_status = this.initial_status;
    },
    deactivate_notes: function(event){
      this.notes_editor = false;
      this.order_notes = this.initial_notes;
    },
    change_status: function(event){
      this.order_status = parseInt(event.target.value);
    },
    change_notes: function(event){
      this.order_notes = CKEDITOR.instances.order_notes_editor.getData();
    },
    refresh_picker: function(){
      $('.selectpicker').selectpicker('refresh');
    },
    refresh_textarea: function(){
      CKEDITOR.instances.order_notes_editor.updateElement();
    },

    // Update's fetched functions
    update_notes: function(){
      this.change_notes();
      data = {
        notes: this.order_notes,
      }
      var datos = JSON.stringify(data);
      var self = this;
      fetch(`/administracion/orders/${self.order_id}/update/notes/`, {
        method: 'POST',
        body: datos,
        credentials: 'same-origin',
        headers: {'X-Requested-With': 'XMLHttpRequest'},
      })
      .then(function(response){
        if (response.ok){
          self.initial_notes = self.order_notes;
          self.notes_msg = "ok";
        } else {
          throw {};
        }
      })
      .catch(function(response){
        self.notes_msg = "error";
      })
    },
    update_status: function(){
      data = {
        status: this.order_status,
      }
      var datos = JSON.stringify(data);
      var self = this;
      fetch(`/administracion/orders/${self.order_id}/update/status/`, {
        method: 'POST',
        body: datos,
        credentials: 'same-origin',
        headers: {'X-Requested-With': 'XMLHttpRequest'},
      })
      .then(function(response){
        if (response.ok){
          self.initial_status = self.order_status;
          self.status_msg = "ok";
        } else {
          throw {};
        }
      })
      .catch(function(response){
        self.status_msg= "error";
      })
    },
    update_cart: function(){}
  },
  computed: {

  }
})
