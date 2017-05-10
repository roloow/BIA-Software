function exec_request(request) {
  return request.then((response) => {
    if(response.ok) return response.json();
    else return null;
  })
  .then((data) => {
    if (data != null) {
      for(method of data) {
        method.isDisabled = true;
        for(group in method.enabled) {
          if (method.enabled[group]) {
            method.isDisabled = false;
          }
        }
      }
      app.$set(app, 'methods', data);
    } else {
      app.error = true;
    }
    app.loading = false;
  })
  .catch((error) =>{
    app.loading = false;
    app.error = true;
  })
}

Vue.component('method-row', {
  props: ['method'],
  template: '#method-row',
  methods: {
    disableMethod: function(ev){
      var self = this;
      var request = fetch(`/payment/${this.method.label}/disable`, {
        credentials: 'same-origin',
        headers: {'X-Requested-With': 'XMLHttpRequest'},
      })
      exec_request(request);
    }
  }
})

Vue.component('group-row', {
  props: ['method'],
  template: '#group-row',
  data: function(){
    return {
      requesting: false,
    }
  },
  methods: {
    toggleEnabled: function(label, key) {
      var self = this;
      self.requesting = true;
      var request = fetch(`/payment/${this.method.label}/toggle/${key}`, {
        credentials: 'same-origin',
        headers: {'X-Requested-With': 'XMLHttpRequest'},
      })
      exec_request(request)
      .then(function(){
        self.requesting = false;
      });
    }
  }
})

var app = new Vue({
  el: '#app',
  data: {
    methods: [],
    loading: false,
    error: false,
  },
  created: function(){
    this.loading = true;
    var self = this;
    var request = fetch('/payment/available_methods', {
      credentials: 'same-origin',
      headers: {'X-Requested-With': 'XMLHttpRequest'},
    });
    exec_request(request);
  }
})
