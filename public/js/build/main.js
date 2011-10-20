/*
 * Maxima Javascript Engine Built on ExtJs 4.0, @author robThot, hirekmedia
 */
Ext.define("AJAX",{statics:{ajax:function(a,f,d,e,b,c){Ext.Ajax.request({url:a,scope:(typeof b!="undefined"?b:null),form:(typeof c!="undefined"?c:null),method:f,params:d,success:e})},get:function(a,d,e,b,c){this.ajax(a,"get",d,e,b,c)},post:function(a,d,e,b,c){this.ajax(a,"post",d,e,b,c)}},constructor:function(){}});Ext.define("Globals",{statics:{DEPO:{}},constructor:function(){}});Ext.define("Controller",{model:{},view:{},data:{},showView:true,constructor:function(){this.getData()}});Ext.define("Model",{data:{},router:{},toJson:function(a){return Ext.decode(a)},constructor:function(a){this.router=a;this.getAjaxData()}});Ext.define("View",{scope:{},render:function(){},constructor:function(a){this.scope=a}});Ext.define("Debug",{statics:{parse:function(b){for(var a in b){console.log(a,b)}}},constructor:function(){}});Ext.define("IEHH",{statics:{DEPO:"",init:function(){navigator.appName.match("Microsoft")!=null?this.setup():""},setup:function(){var a=document.createElement('<iframe id="thisIframe" style="display:none;" src="about:blank" />'),b=document.getElementsByTagName("body")[0];document.appendChild(a);Ext.TaskManager.start({run:IEHH.checkIframeContent,interval:1000})},changeContent:function(c){var b=document.getElementById("thisIframe"),a=b.contentWindow.document;a.open();a.write(c);a.close();IEHH.DEPO=c},checkIframeContent:function(){var c=document.getElementById("thisIframe"),d=c.contentWindow.document.body.innerHTML;if(window.location.href.match("#")&&d!=""){var b=window.location.href.split("#"),a=["#",b[1]].join("");if(a!=d){window.location.href=[b[0],d].join("")}}},constructor:function(){}}},function(){});Ext.define("Router",{statics:{frontPage:"Main",login:"Login",route:"",init:function(){if(Router.ie){IEHH.setup()}Ext.TaskManager.start({run:Router.getRoute,interval:2000})},getRoute:function(){if(window.location.href.match(/(.#)(.*)/)){var a=window.location.href.match(/(.#)(.*)/)[2]}else{Router.setRoute(Router.frontPage)}if(a==""){Router.setRoute(Router.frontPage)}if(a!=null){if(Router.route!=a){if(typeof Globals.DEPO[[a,"Controller"].join("")]=="undefined"||Globals.DEPO[[a,"Controller"].join("")]==null){try{(new Function(['Globals.DEPO["',a,'Controller"] = new ',a,"Controller();"].join("")))();if(Globals.DEPO[[a,"Controller"].join("")].showView){(new Function(['Globals.DEPO["',a,'Controller"].view = new ',a,'View(Globals.DEPO["'+a+'Controller"]);'].join("")))()}if(Router.ie){IEHH.changeContent(["#",a].join(""))}Router.route=a}catch(b){console.log(b);delete Globals.DEPO[a];Router.setRoute(Router.frontPage)}}else{Globals.DEPO[[a,"Controller"].join("")].getData()}}}},setRoute:function(a){window.location.href=[window.location.href.split("#")[0],"#",a].join("")},constructor:function(){}}},function(){if(navigator.appVersion.match(/MSIE/)){Router.ie=1}Router.init()});Ext.define("GroupController",{extend:"Controller",ajaxCallback:function(a){this.data=a.data;this.view.render(this.data)},getData:function(){var a=this;Globals.DEPO.GroupModel=new GroupModel(a)}});Ext.define("MainController",{extend:"Controller",ajaxCallback:function(a){Debug.parse(Globals);this.data=a.data},getData:function(){var a=this;Globals.DEPO.MainModel=new MainModel(a)}});Ext.define("LoginController",{extend:"Controller",auth:function(){var a=Globals.DEPO.LoginController;Globals.DEPO.LoginController.model.authentication(a)},authCallback:function(b,d){var a=Globals.DEPO.LoginController;var c=a.model.toJson(b.responseText);if(c.username==null){Ext.getCmp("loginForm").getForm().setValues({username:"",password:""});Ext.Msg.alert("Login failed","Try again!")}else{Ext.getCmp("LoginBody").hide();Router.setRoute(Router.frontPage)}},ajaxCallback:function(a){Globals.DEPO.LogoutController=null;this.data=a.data;if(this.data.username){Router.setRoute(Router.frontPage)}else{this.view.render(this.data)}},getData:function(){if(this.data.username){Router.setRoute(Router.frontPage)}else{var a=this;Globals.DEPO.LoginModel=new LoginModel(a)}}});Ext.define("LogoutController",{extend:"Controller",showView:false,ajaxCallback:function(a){Globals.DEPO.LoginController=null;this.data=a.data},getData:function(){if(this.data.username){Router.setRoute(Router.login)}else{var a=this;new LogoutModel(a)}}});Ext.define("GroupView",{extend:"View",render:function(a){Ext.create("Ext.data.Store",{storeId:"groups",fields:["title","realname"],data:{items:a},proxy:{type:"memory",reader:{type:"json",root:"items"}}});Ext.create("Ext.window.Window",{title:"Csoportok:",id:"",renderTo:Ext.getBody(),resizable:true,height:600,width:420,layout:"fit",layout:"column",items:{xtype:"grid",store:Ext.data.StoreManager.lookup("groups"),columns:[{header:"Title",dataIndex:"realname"},{header:"Realname",dataIndex:"title"}],id:"",layout:"fit",height:550,width:400}}).show()}});Ext.define("LoginView",{extend:"View",render:function(b){var a=this;Ext.create("Ext.window.Window",{title:"Login",id:"LoginBody",renderTo:Ext.getBody(),resizable:false,height:180,width:250,layout:"fit",layout:"column",items:{xtype:"form",id:"loginForm",height:145,width:237,items:b.items,buttons:[{text:"login",handler:a.scope.auth}]}}).show()}});Ext.define("MainView",{extend:"View",render:function(a){alert("MainView")}});Ext.define("GroupModel",{extend:"Model",mapper:function(b){var a=this;a.data=a.toJson(b.responseText);a.router.ajaxCallback(a)},getAjaxData:function(){var a=this;AJAX.post("group/","",this.mapper,a)}});Ext.define("MainModel",{extend:"Model",mapper:function(b){var a=this;a.data={};a.router.ajaxCallback(a)},authentication:function(a){},getAjaxData:function(){this.mapper()}});Ext.define("LoginModel",{extend:"Model",mapper:function(b){var a=this;a.data=a.toJson(b.responseText);a.router.ajaxCallback(a)},authentication:function(a){AJAX.post(a.data.action,Ext.getCmp("loginForm").getValues(),a.authCallback,self)},getAjaxData:function(){var a=this;AJAX.get("login/","",this.mapper,a)}});Ext.define("LogoutModel",{extend:"Model",mapper:function(b){var a=this;a.data=Ext.JSON.decode(b.responseText);a.router.ajaxCallback(a)},getAjaxData:function(){var a=this;AJAX.get("login/logout/","",this.mapper,a)}});