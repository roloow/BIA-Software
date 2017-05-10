Vue.component('list-products', {
  props: ['products', 'd_val', 'd_perc', 'subtotal', 'total'],
  template: '#list-products',
  computed: {
    discount_per: function(){
      return `${this.d_perc} %`;
    },
    discount_val: function(){
      return `- ${this.d_val}`;
    }
  }
});

Vue.component('product-item', {
  props: ['products', 'item', 'index'],
  mounted: function(){
    $(this.$el.querySelector('select')).selectpicker('refresh');
  },
  data: function(){
    return {'product': {'stock': 0, 'price': 0}}
  },
  methods: {
    select_change: function(event){
      var self = this;
      self.product_select(event);
      self.product_info_obtain(event);
    },
    product_info_obtain: function(event){
      var self = this;
      if (this.item.product_id != 'undefined'){
        fetch(`/administracion/orders/products/client/${app.selected_id}/info/${this.item.product_id}`, {
          credentials: 'same-origin',
          headers: {'X-Requested-With': 'XMLHttpRequest'},
        })
        .then(response => response.json())
        .then(object => {self.$set(self,'product', {'stock': object.available_stock, 'price': object.price});
        this.item.price = this.product.price;
        this.item.stock = this.product.stock;
        });
      } else {
        this.product.stock = 0;
        this.product.price = 0;
        this.item.price = 0;
        this.item.stock = 0;
      };
    },
    assign_quantity: function(event){
      this.item.quantity = parseInt(event.target.value);
    },
    delete_item: function(event){
        app.$emit('delete_item', {'index': this.index});
    },
    product_select: function(event){
      if (event.target.value != 'undefined'){
        this.item.product_id = parseInt(event.target.value);
        this.item.product_name = event.target.selectedOptions[0].firstChild.data;
      } else {
        this.item.product_id = 'undefined';
        this.item.product_name = 'undefined';
      }
    }
  },
  template: '#product-selection',
  updated: function(){
    $(this.$el.querySelector('select')).selectpicker('refresh');
  }
});

var app = new Vue({
  el: '#app',
  created: function(){
    this.$on('delete_item', function(data){
      this.cartproducts.splice(data.index, 1);
    });
  },
  data: {
    step: 0,
    order_id: undefined,
    fully_reserved: undefined,
    loading: false,
    selected_id: "undefined",
    allproducts: [],
    cartproducts: [],
    total: 0,
    precio_final: 0,
    valid: true,
    discount_value: 0,
    discount_percentage: 0,
    status_order: 0,
  },
  methods: {
    end: function(){
      this.step = undefined;
      this.loading = true;
      var data = {
        cartproducts: this.cartproducts,
        total: this.total,
        precio_final: this.precio_final,
        discount_value: this.discount_value,
        discount_percentage: this.discount_percentage,
        status_order: this.status_order,
        selected_id: this.selected_id,
        order_id: this.order_id
      }
      var datos = JSON.stringify(data);
      var self = this;
      fetch(`/administracion/orders/resolve/step/2/`, {
        method: 'POST',
        body: datos,
        credentials: 'same-origin',
        headers: {'X-Requested-With': 'XMLHttpRequest'},
      })
      .then(function(response){
        if (response.ok){
          self.loading = false;
          self.step = 4;
        } else {
          self.loading = false;
          self.step = 5;
        }
      })
      .catch(function(response){
        self.loading = false;
        self.step = 5;
      })
    },
    back: function(event){
      var new_step = --this.step;
      this.step = undefined;
      this.loading = true;
      if (new_step == 0){
        this.cartproducts = [];
      } else if (new_step == 1) {
        this.discount_value = 0;
        this.discount_percentage = 0;
      } else if (new_step == 2) {
        var data = {
          order_id: this.order_id,
        }
        var datos = JSON.stringify(data);
        var self = this;
        fetch(`/administracion/orders/resolve/step/0/`, {
          method: 'POST',
          body: datos,
          credentials: 'same-origin',
          headers: {'X-Requested-With': 'XMLHttpRequest'},
        })
        .then(function(response){
        })
        .catch(function(response){
          self.loading = false;
          self.step = 5;
        })
      }
      this.loading = false;
      this.step = new_step;
    },
    update_final_price: function(){
      this.precio_final = (this.total - this.discount_value)
      this.precio_final = (this.precio_final - (this.precio_final * (this.discount_percentage / 100)))
    },
    d_value_change: function(event){
      var new_price = event.target.value;
      if (new_price >= 0){
          if (new_price <= this.total){
            this.discount_value = new_price;
            this.update_final_price();
            this.valid = true;
          } else {
            this.discount_value = 0;
            this.update_final_price();
            this.valid = false;
          }
      } else {
        this.discount_value = 0;
        this.update_final_price();
        this.valid = false;
      }
    },
    d_percentage_change: function(event){
      var new_price = event.target.value;
      if (new_price >= 0){
          if (new_price <= 100){
            this.discount_percentage = new_price;
            this.update_final_price();
            this.valid = true;
          } else {
            this.discount_percentage = 0;
            this.update_final_price();
            this.valid = false;
          }
      } else {
        this.discount_percentage = 0;
        this.update_final_price();
        this.valid = false;
      }
    },
    discounts: function(){
      this.step = undefined;
      this.loading = true;
      this.clean_cart();
      this.total_amount();
      this.update_final_price();
      this.loading = false;
      this.step = 2
    },
    confirm_cart: function(){
      this.step = undefined;
      this.loading = true;
      var order;
      if (this.order_id == undefined){
        order = "undefined";
      } else {
        order = this.order_id;
      }

      var data = {
        cartproducts: this.cartproducts,
        total: this.total,
        precio_final: this.precio_final,
        discount_value: this.discount_value,
        discount_percentage: this.discount_percentage,
        status_order: this.status_order,
        order_id: order,
        selected_id: this.selected_id
      }
      var datos = JSON.stringify(data);
      var self = this;
      fetch(`/administracion/orders/resolve/step/1/`, {
        method: 'POST',
        body: datos,
        credentials: 'same-origin',
        headers: {'X-Requested-With': 'XMLHttpRequest'},
      })
      .then(function(response){
        if (response.ok){
          return response.json();
        } else {
          self.loading = false;
          self.step = 5;
        }
      })
      .then(function(data){
        self.order_id = data.order_id;
        self.fully_reserved = data.fully_reserved;
        self.loading = false;
        self.step = 3;
      })
    },
    clean_cart: function(){
      cart = this.cartproducts;
      this.cartproducts = cart.filter(function(item){
        if (item.product_id != 'undefined'){
          if (item.quantity > 0){
            if (item.quantity <= item.stock){
                return true;
            }
          }
        }
        return false;
      });
    },
    total_amount: function(){
      cart = this.cartproducts;
      var i;
      var total = 0;
      for (i = 0; i < cart.length; i++) {
        item = cart[i];
        total += item.price * item.quantity;
      }
      this.total = total;
    },
    id_changer: function(event){
      this.selected_id = event.target.value;
    },
    status_change: function(event){
      this.status_order = event.target.value;
    },
    new_item: function(event){
      this.cartproducts.push({'quantity': 0, 'product_id': 'undefined', 'product_name': 'undefined', 'price': 0, 'stock': 0});
    },
    products_obtain: function(event){
      var self = this;
      self.step = undefined;
      self.loading = true;
      fetch(`/administracion/orders/products/client/${this.selected_id}`, {
        credentials: 'same-origin',
        headers: {'X-Requested-With': 'XMLHttpRequest'},
      })
      .then(response => response.json())
      .then(object => {self.$set(self,'allproducts', object.products);
      self.loading = false;
      self.step = 1;
      });
    },
  },
  computed: {
    cart_empty: function(){
      if (this.cartproducts.length == 0){
        return true;
      } else {
        var i;
        for (i = 0; i < this.cartproducts.length; i++) {
          var item = this.cartproducts[i]
          if (item.product_id != 'undefined'){
            if(item.quantity > 0){
              if (item.quantity <= item.stock){
                return false;
              }
            }
          }
        }
        return true;
      }
    },
    user_selected: function(){
      return this.selected_id != "undefined";
    }
  }
})
