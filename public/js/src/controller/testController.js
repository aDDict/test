Ext.define('TestController', {

  extend: 'Controller',

  init: function() { //alert('asdsads');
    /*if(Ext.get("Iddqd") == null)
      this.getData();*/
    //this.view.render({});
    
    var self = this;
    
    var object = {
      "valami": "dehatmi",
      "masvalami": "milehetmég",
      "egyeb": "42"
    };
    
    //{\"valami\":\"dehatmi?\",\"masvalami\":\"mi lehet meg\",\"egyeb\":42}
    
    Proxy.query(object,self.thisCallback);
    
  },
  
  thisCallback: function(resp) {
    console.log(resp);
  },

  ajaxCallback: function(scope){
    this.view.render(scope.data);
  },

  getData : function(){
  }

});