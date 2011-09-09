/**
 * static class AJAX
 */
Ext.define('AJAX', {
	statics: {
		/**
		 * @method ajax
		 * simple wrapper for the Ext.Ajax.request
		 * @param {string} 			url
		 * @param {string} 			method
		 * @param {string} (JSON) 	params
		 * @param {reference} 		callback
		 * @param {reference} 		scope
		 */
		ajax: function(url, method, params, callback, scope){
			Ext.Ajax.request({
			    url		: url,
			    scope 	: (typeof scope != "undefined" ? scope : null),
			    method	: method,
			    params	: params,
			    success	: callback
			});
		},
		/**
		 * @method get
		 * ajax get method
		 * @param {string} 			url
		 * @param {JSON}			params
		 * @param {reference} 		callback
		 * @param {reference} 		scope
		 */
		get : function(url, params, callback, scope){
			this.ajax(url, "get", params, callback, scope);
		},
		/**
		 * @method post
		 * ajax post method
		 * @param {string} 			url
		 * @param {JSON}		 	params
		 * @param {reference} 		callback
		 * @param {reference} 		scope
		 */
		post: function(url, params, callback, scope){
			this.ajax(url, "post", params, callback, scope);
		}
	},
	constructor: function() {}
});
/**
 * class Controller
 */
Ext.define('Controller', {
	
	model		: {},
	view		: {},
	
	constructor	: function() {
		this.getData();
	}
});

/**
 * class Model
 */
Ext.define('Model', {
	
	data 		: {},
	router 		: {},
	
	constructor	: function(reference) {
		// storing the relevant controller instance reference for the ajax callback
		this.router = reference;
		this.getAjaxData();
	}
});

/**
 * class View
 */
Ext.define('View', {
	
	render 		: function() {},
	constructor	: function() {}
});

/**
 * class FormBuilder
 */
/*Ext.define('FormBuilder', {
	
	statics     : {
		render 		: function(parent, data, scope) {
		  var form  = data.name,
          cfg   = data.elements;
      
		  Ext.core.DomHelper.append(parent, cfg);
		  console.log(Ext.cache["ext-document"]);
		}
	},
	
	constructor	: function() {
	}
});*/