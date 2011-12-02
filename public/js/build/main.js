Ext.define("AJAX",{statics:{ajax:function(a,f,d,e,b,c){Ext.Ajax.request({url:a,scope:(typeof b!="undefined"?b:null),form:(typeof c!="undefined"?c:null),method:f,params:d,success:e})},get:function(a,d,e,b,c){this.ajax(a,"get",d,e,b,c)},post:function(a,d,e,b,c){this.ajax(a,"post",d,e,b,c)}},constructor:function(){}});Ext.define("Message",{statics:{alert:function(b,a,c){Ext.Msg.alert(b,a,function(d){if(d=="ok"){c()}})}},constructor:function(){}});Ext.define("Globals",{statics:{DEPO:{}},constructor:function(){}});Ext.define("Controller",{model:{},view:{},data:{},nameSpace:"",fullNameSpace:"",showView:true,getNameSpace:function(){var a=this.$className.match(/(.*)(Controller)/);this.nameSpace=a[1]},getFullNameSpace:function(){var c="",b=Router.routeOrders;if(b.length>0){for(var d=0,a=b.length;d<a;d++){c+=b[d]}}else{c=this.nameSpace}this.fullNameSpace=c},constructor:function(){var self=this;self.getNameSpace();self.getFullNameSpace();self.model=eval(["new ",self.nameSpace,"Model()"].join(""));self.model.router=self;if(this.showView==true){self.view=eval(["new ",self.nameSpace,"View()"].join(""));self.view.scope=self}this.init()}});Ext.define("Model",{data:{},router:{},toJson:function(a){return Ext.decode(a)},constructor:function(){this.init()}});Ext.define("View",{xtypes:{button:"Ext.button.Button",buttongroup:"Ext.container.ButtonGroup",colorpalette:"Ext.picker.Color",component:"Ext.Component",container:"Ext.container.Container",cycle:"Ext.button.Cycle",dataview:"Ext.view.View",datepicker:"Ext.picker.Date",editor:"Ext.Editor",editorgrid:"Ext.grid.plugin.Editing",grid:"Ext.grid.Panel",multislider:"Ext.slider.Multi",panel:"Ext.panel.Panel",progress:"Ext.ProgressBar",slider:"Ext.slider.Single",spacer:"Ext.toolbar.Spacer",splitbutton:"Ext.button.Split",tabpanel:"Ext.tab.Panel",treepanel:"Ext.tree.Panel",viewport:"Ext.container.Viewport",window:"Ext.window.Window",paging:"Ext.toolbar.Paging",toolbar:"Ext.toolbar.Toolbar",tbfill:"Ext.toolbar.Fill",tbitem:"Ext.toolbar.Item",tbseparator:"Ext.toolbar.Separator",tbspacer:"Ext.toolbar.Spacer",tbtext:"Ext.toolbar.TextItem",menu:"Ext.menu.Menu",menucheckitem:"Ext.menu.CheckItem",menuitem:"Ext.menu.Item",menuseparator:"Ext.menu.Separator",menutextitem:"Ext.menu.Item",form:"Ext.form.Panel",checkbox:"Ext.form.field.Checkbox",combo:"Ext.form.field.ComboBox",datefield:"Ext.form.field.Date",displayfield:"Ext.form.field.Display",field:"Ext.form.field.Base",fieldset:"Ext.form.FieldSet",hidden:"Ext.form.field.Hidden",htmleditor:"Ext.form.field.HtmlEditor",label:"Ext.form.Label",numberfield:"Ext.form.field.Number",radio:"Ext.form.field.Radio",radiogroup:"Ext.form.RadioGroup",textarea:"Ext.form.field.TextArea",textfield:"Ext.form.field.Text",timefield:"Ext.form.field.Time",trigger:"Ext.form.field.Trigger",image:"Ext.Img"},scope:{},render:function(){},build:function(g,h){var j=this,d=g,b="",k="",f=(j.date.getTime()*Math.random()).toString().substr(0,2),a=(g.items?g.items:null);d.items=[];if(g.xtype=="viewport"){k="viewport";Globals.DEPO[k]=Ext.create("Ext.container.Viewport",d)}else{b=Ext.create(j.xtypes[g.xtype],d);if(g.id){k=g.id}else{k=[h,f].join("")}Globals.DEPO[h].add(b);Globals.DEPO[k]=b}if(a!=null&&a.length!=0){for(var e=0,c=a.length;e<c;e++){j.build(a[e],k)}}},constructor:function(){this.date=new Date()}});Ext.define("Debug",{statics:{parse:function(b){for(var a in b){console.log(a,b)}}}});Ext.define("IEHH",{statics:{DEPO:"",init:function(){navigator.appName.match("Microsoft")!=null?this.setup():""},setup:function(){var a=document.createElement('<iframe id="thisIframe" style="display:none;" src="about:blank" />'),b=document.getElementsByTagName("body")[0];document.appendChild(a);Ext.TaskManager.start({run:IEHH.checkIframeContent,interval:1000})},changeContent:function(c){var b=document.getElementById("thisIframe"),a=b.contentWindow.document;a.open();a.write(c);a.close();IEHH.DEPO=c},checkIframeContent:function(){var c=document.getElementById("thisIframe"),d=c.contentWindow.document.body.innerHTML;if(window.location.href.match("#")&&d!=""){var b=window.location.href.split("#"),a=["#",b[1]].join("");if(a!=d){window.location.href=[b[0],d].join("")}}},constructor:function(){}}},function(){});Ext.define("Router",{statics:{frontPage:"Main",login:"Login",route:"",routeOrders:[],routeParams:{},routeCache:"",lang:"",init:function(){if(Router.ie){IEHH.setup()}Ext.TaskManager.start({run:Router.getRoute,interval:2000})},getRoute:function(){var a=Router.getOrder();if(a==""){Router.setRoute(Router.frontPage)}if(Router.routeParams.lang){Router.lang=Router.routeParams.lang}else{if(Router.lang==""){Router.lang="hu"}}if(a!=null){if(Router.route!=a){if(typeof Globals.DEPO[[a,"Controller"].join("")]=="undefined"||Globals.DEPO[[a,"Controller"].join("")]==null){try{(new Function(['Globals.DEPO["',a,'Controller"] = new ',a,"Controller();"].join("")))();if(Router.ie){IEHH.changeContent(["#",a].join(""))}if(Ext.get(Router.route)!=null){Ext.get(Router.route).hide()}Router.route=a}catch(b){console.log(b);delete Globals.DEPO[a];Message.alert("Routing error","There is no implemented class with this namespace",function(){Router.setRoute(Router.frontPage)})}}else{if(Router.route!=a){if(Ext.get(Router.route)){Ext.get(Router.route).hide()}if(Ext.get(a)){Ext.get(a).show()}Globals.DEPO[[a,"Controller"].join("")].init();Router.route=a}}}}},setRoute:function(a){window.location.href=[window.location.href.split("#")[0],"#",a].join("")},getOrder:function(){if(Router.routeCache!=window.location.href){Router.routeOrders=[];Router.routeParams={};var e=(window.location.href.match(/(.#)(.*)/)?window.location.href.match(/(.#)(.*)/):null);if(e==null){Router.setRoute(Router.frontPage)}else{route=e[2];if(route.match(/\//)){var d=route.split("/"),b;for(var c=0,a=d.length;c<a;c++){if(d[c].match(/=/)){b=d[c].split("=");Router.routeParams[b[0]]=b[1]}else{Router.routeOrders.push(d[c])}}route=Router.routeOrders[0]}Router.routeCache=window.location.href;return route}}else{return Router.routeOrders[0]}},constructor:function(){}}},function(){if(navigator.appVersion.match(/MSIE/)){Router.ie=1}Router.init()});Ext.define("GroupController",{extend:"Controller",init:function(){this.getData()},ajaxCallback:function(a){this.data=a.data;this.view.render(this.data)},getData:function(){var a=this;Globals.DEPO.GroupModel=new GroupModel(a)}});Ext.define("TestController",{extend:"Controller",init:function(){},ajaxCallback:function(a){this.view.render(a.data)},getData:function(){}});Ext.define("MainController",{extend:"Controller",init:function(){if(Ext.get("Main")==null){this.getData()}},ajaxCallback:function(a){this.view.render(a.data)},main:function(){this.view.render({})},getData:function(){}});Ext.define("IddqdController",{extend:"Controller",init:function(){try{if(typeof Globals.DEPO[[this.fullNameSpace,"Controller"].join("")]=="undefined"){(new Function(['Globals.DEPO["',this.fullNameSpace,'Controller"] = new ',this.fullNameSpace,"Controller();"].join("")))()}else{Globals.DEPO[[this.fullNameSpace,"Controller"].join("")].init()}}catch(a){console.log(a);Message.alert("Routing error","There is no implemented class in the namespace",function(){Router.setRoute(Router.frontPage)})}},ajaxCallback:function(a){this.view.render(a.data)},getData:function(){}});Ext.define("IddqdTranslateController",{extend:"Controller",init:function(){},ajaxCallback:function(a){this.view.render(a.data)},getData:function(){}});Ext.define("LoginController",{extend:"Controller",init:function(){this.getData()},auth:function(){var a=Globals.DEPO.LoginController;a.model.authentication(a)},authCallback:function(b,d){var a=Globals.DEPO.LoginController,c=a.model.toJson(b.responseText);if(c.username==null){Ext.getCmp("loginForm").getForm().setValues({username:"",password:""});Ext.Msg.alert("Login failed","Try again!")}else{Ext.getCmp("LoginForm").hide();Router.setRoute(Router.frontPage)}},ajaxCallback:function(a){Globals.DEPO.LogoutController=null;this.data=a.data;if(this.data.username){Router.setRoute(Router.frontPage)}else{if(Ext.get("LoginForm")==null){this.view.render(this.data)}}},getData:function(){if(this.data.username){Router.setRoute(Router.frontPage)}}});Ext.define("LogoutController",{extend:"Controller",showView:false,init:function(){this.getData()},ajaxCallback:function(a){Globals.DEPO.LoginController=null;Router.setRoute(Router.login)},getData:function(){if(this.data.username){Router.setRoute(Router.login)}}});Ext.define("GroupView",{extend:"View",render:function(a){Ext.create("Ext.data.Store",{storeId:"groups",fields:["title","realname"],data:{items:a},proxy:{type:"memory",reader:{type:"json",root:"items"}}});Ext.create("Ext.window.Window",{title:"Csoportok:",id:"",renderTo:Ext.getBody(),resizable:true,height:600,width:420,layout:"fit",layout:"column",items:{xtype:"grid",store:Ext.data.StoreManager.lookup("groups"),columns:[{header:"Title",dataIndex:"realname"},{header:"Realname",dataIndex:"title"}],id:"",layout:"fit",height:550,width:400}}).show()}});Ext.define("TestView",{extend:"View",render:function(data){var self=this;cfg=eval("("+data+")");self.build(cfg)}});Ext.define("LoginView",{extend:"View",render:function(b){var a=this;Ext.create("Ext.window.Window",{title:"Login",id:"LoginForm",renderTo:Ext.getBody(),resizable:false,height:180,width:250,layout:"fit",layout:"column",items:{xtype:"form",id:"loginForm",height:145,width:237,items:b.items,buttons:[{text:"login",handler:a.scope.auth}]}}).show()}});Ext.define("IddqdView",{extend:"View",render:function(a){}});Ext.define("IddqdTranslateView",{extend:"View",modal:function(b){var a=this;a.modalWindow=Ext.create("Ext.window.Window",{title:"",id:"modal",modal:true,items:[{xtype:"container",height:100,width:300,id:"manager",layout:"fit"}]}).show();switch(b){case"langComboAdd":a.addLangField=Ext.create("Ext.container.Container",{layout:"fit",renderTo:Ext.get("manager"),layout:"fit",margin:0,items:[{fieldLabel:"new language",xtype:"field",id:"addLang",},{xtype:"button",text:"add",handler:function(){a.scope.model.addLanguage(a.addLangField.items.items[0].value)}}]});break;case"langComboDel":a.delLangCombobox=Ext.create("Ext.form.ComboBox",{id:"delLang",fieldLabel:"Choose language",store:a.scope.model.langStore,queryMode:"local",height:200,margin:0,displayField:"lang",valueField:"langval",triggerAction:"all",layout:"fit",renderTo:Ext.get("manager"),listeners:{select:function(){a.scope.model.deleteLanguage(this.getValue())}}});break;case"catComboAdd":a.addCatField=Ext.create("Ext.container.Container",{layout:"fit",fieldLabel:"Add new cat",renderTo:Ext.get("manager"),margin:0,items:[{fieldLabel:"new category",xtype:"field",id:"addLang",},{xtype:"button",text:"add",handler:function(){a.scope.model.addCategory(a.addCatField.items.items[0].value)}}]});break;case"catComboDel":a.delCatField=Ext.create("Ext.form.ComboBox",{id:"delCat",xtype:"combo",fieldLabel:"Choose category",store:a.scope.model.catStore,queryMode:"local",displayField:"cat",valueField:"catval",triggerAction:"all",renderTo:Ext.get("manager"),listeners:{select:function(){a.scope.model.deleteCategory(this.getValue())}}});break;case"varComboAdd":a.addVarField=Ext.create("Ext.container.Container",{layout:"fit",fieldLabel:"Add new variable",renderTo:Ext.get("manager"),layout:"fit",margin:0,items:[{fieldLabel:"new variable",xtype:"field",id:"addVarnew",},{fieldLabel:"orig expression",xtype:"field",id:"addVarExp",},{xtype:"button",text:"add",handler:function(){a.scope.model.addVariable(a.addVarField.items.items[0].value,a.addVarField.items.items[1].value)}}]});break;case"varComboDel":a.delVarField=Ext.create("Ext.form.ComboBox",{id:"delVar",xtype:"combo",fieldLabel:"Choose variable",store:a.scope.model.variableStore,queryMode:"local",displayField:"var",valueField:"varval",triggerAction:"all",renderTo:Ext.get("manager"),listeners:{select:function(){a.scope.model.deleteVariable(this.getValue())}}});a.scope.model.variableStore.proxy.url=["lang/vars?cat=",a.scope.model.variableStoreCat].join("");a.scope.model.variableStore.load();break}},renderer:function(a){return['<span style="font-weight:bold;">',a,"</span>"].join("")},render:function(data){if(!Ext.get("Iddqd")){var self=this;cfg=eval("("+data+")");self.build(cfg);self.langCombo=Globals.DEPO.langCombo;self.langComboAdd=Globals.DEPO.langComboAdd;self.langComboDel=Globals.DEPO.langComboDel;self.catCombo=Globals.DEPO.catCombo;self.catComboAdd=Globals.DEPO.catComboAdd;self.catComboDel=Globals.DEPO.catComboDel;self.varCombo=Globals.DEPO.varCombo;self.varComboAdd=Globals.DEPO.varComboAdd;self.varComboDel=Globals.DEPO.varComboDel;self.varComboAdd.addListener({click:function(){self.modal("varComboAdd")}});self.varComboDel.addListener({click:function(){self.modal("varComboDel")}});self.langComboAdd.addListener({click:function(){self.modal("langComboAdd")}});self.langComboDel.addListener({click:function(){self.modal("langComboDel")}});self.catComboAdd.addListener({click:function(){self.modal("catComboAdd")}});self.catComboDel.addListener({click:function(){self.modal("catComboDel")}});self.langCombo.addListener({select:function(){self.scope.model.language=this.getValue();self.scope.model.store.proxy.url=["lang?lang=",self.scope.model.language,"&cat=",self.scope.model.cat].join("");self.scope.model.store.load()}});self.catCombo.addListener({select:function(){self.scope.model.cat=this.getValue();self.scope.model.store.proxy.url=["lang?lang=",self.scope.model.language,"&cat=",self.scope.model.cat].join("");self.scope.model.store.load()}});self.varCombo.addListener({select:function(){self.scope.model.variableStoreCat=this.getValue()}})}}});Ext.define("MainView",{extend:"View",render:function(data){var self=this;self.cfg=eval("("+data+")");self.build(self.cfg);self.languageChooser=Globals.DEPO.languages;self.languageChooser.addListener({arrowclick:function(){console.log(this.getState());alert("asdad")}})}});Ext.define("GroupModel",{extend:"Model",init:function(){this.getAjaxData()},mapper:function(b){var a=this;a.data=a.toJson(b.responseText);a.router.ajaxCallback(a)},getAjaxData:function(){var a=this;AJAX.post("group/","",this.mapper,a)}});Ext.define("TestModel",{extend:"Model",init:function(){var a=this;if(Ext.get("Iddqd")==null){a.getAjaxData()}},mapper:function(b){var a=this;a.data=b.responseText;a.router.ajaxCallback(a)},getAjaxData:function(){var a=this;AJAX.get("ext-template/test","",this.mapper,a)}});Ext.define("MainModel",{extend:"Model",language:"hu",init:function(){this.getAjaxData()},mapper:function(b){var a=this;a.data=b.responseText;a.router.ajaxCallback(a)},getAjaxData:function(){var a=this;AJAX.get(["ext-template?lang=",a.language].join(""),"",this.mapper,a)}});Ext.define("LoginModel",{extend:"Model",init:function(){this.getAjaxData()},mapper:function(b){var a=this;a.data=a.toJson(b.responseText);a.router.ajaxCallback(a)},authentication:function(a){AJAX.post(a.data.action,Ext.getCmp("loginForm").getValues(),a.authCallback,self)},getAjaxData:function(){var a=this;AJAX.get("login/","",this.mapper,a)}});Ext.define("IddqdModel",{extend:"Model",init:function(){},mapper:function(b){var a=this;a.data=a.toJson(b.responseText);a.router.ajaxCallback(a)},getAjaxData:function(){}});Ext.define("IddqdTranslateModel",{extend:"Model",reload:function(){var a=this;a.router.view.modalWindow.destroy();a.cat=a.variableStoreCat;a.store.proxy.url=["lang?lang=",a.language,"&cat=",a.cat].join("");a.store.load();a.langStore.load();a.catStore.load();a.variableStore.load();a.router.view.langCombo.setValue(a.language);a.router.view.catCombo.setValue(a.cat);a.router.view.varCombo.setValue(a.cat)},init:function(){var a=this;if(Ext.get("Iddqd")==null){a.getAjaxData()}a.loader=new Ext.LoadMask(Ext.getBody(),{msg:"loading"});a.itemsPerPage=10;a.language="hu";a.cat="8";a.variableStoreCat="8";a.store=Ext.create("Ext.data.Store",{storeId:"translate",fields:["id","category","variable","word","foreign_word"],proxy:{type:"ajax",url:["lang?lang=",a.language,"&cat=",a.cat].join(""),reader:{type:"json",root:"rows",totalProperty:"results",}}});a.langStore=Ext.create("Ext.data.Store",{fields:["langval","lang"],autoLoad:true,proxy:{type:"ajax",url:"lang/groups",reader:{type:"json",root:"rows",totalProperty:"results"}},listeners:{load:function(c,b,d){a.router.view.langCombo.setValue(a.language)}}});a.catStore=Ext.create("Ext.data.Store",{fields:["catval","cat"],autoLoad:true,value:0,proxy:{type:"ajax",url:"lang/cats",reader:{type:"json",root:"rows",totalProperty:"results"}},listeners:{load:function(c,b,d){a.router.view.catCombo.setValue(a.cat);a.router.view.varCombo.setValue(a.cat)}}});a.variableStore=Ext.create("Ext.data.Store",{fields:["varval","var"],autoLoad:true,value:0,proxy:{type:"ajax",url:["lang/vars?cat=",a.variableStoreCat].join(""),reader:{type:"json",root:"rows",totalProperty:"results"}},listeners:{load:function(c,b,d){}}});a.store.on("beforeload",function(){this.pageSize=a.itemsPerPage;this.limit=a.itemsPerPage});a.store.load({start:0,limit:a.itemsPerPage});a.rowEditing=Ext.create("Ext.grid.plugin.RowEditing",{clicksToEdit:1});a.rowEditing.on({scope:this,afteredit:function(c,d,b,e){a.updateRow(c,d)}})},updateRow:function(a,c){var b=this;b.roweditor=a;b.scope=c;this.loader.show();AJAX.post("lang/update",["field=",a.field,"&id=",a.record.get("id"),"&val=",a.record.get(a.field),"&lang=",b.language].join(""),function(){b.roweditor.record.commit();b.store.load();b.loader.hide()},b)},addLanguage:function(b){var a=this;AJAX.post(["lang/addlanguage"].join(""),["lang=",b].join(""),function(c){a.language=b.substring(0,2);a.reload()},a)},deleteLanguage:function(b){var a=this;AJAX.get(["lang/deletelanguage?id=",b].join(""),"",function(c){a.reload()},a)},deleteCategory:function(b){var a=this;AJAX.get(["lang/deletecategory?id=",b].join(""),"",function(c){a.reload()},a)},addCategory:function(b){var a=this;AJAX.post(["lang/addcategory"].join(""),["cat=",b].join(""),function(c){a.reload()},a)},addVariable:function(b,c){var a=this;AJAX.post(["lang/addvariable"].join(""),["var=",b,"&cat=",a.variableStoreCat,"&expr=",c].join(""),function(d){a.reload()},a)},deleteVariable:function(b){var a=this;AJAX.post(["lang/deletevariable"].join(""),["id=",b].join(""),function(c){a.reload()},a)},mapper:function(b){var a=this;a.data=b.responseText;a.router.ajaxCallback(a)},getAjaxData:function(){var a=this;AJAX.get("ext-template/translate","",this.mapper,a)}});Ext.define("LogoutModel",{extend:"Model",init:function(){this.getAjaxData()},mapper:function(b){var a=this;this.data=Ext.JSON.decode(b.responseText);this.router.ajaxCallback(this)},getAjaxData:function(){var a=this;AJAX.get("login/logout/","",this.mapper,a)}});