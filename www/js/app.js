// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.controllers' is found in controllers.js
// 
angular.module('starter', ['ionic', 'starter.controllers','angularSoap','chart.js'])

.factory("trsiWS", ['$soap',function($soap){

  var base_url = "http://"+localStorage.getItem('host')+":"+localStorage.getItem('port')+"/NanoScada.svc";
  var refresh_time = localStorage.getItem('refresh_time');
  var application = localStorage.getItem('appId');
  var client_id = localStorage.getItem('clientId');
  var username = localStorage.getItem('username');
  var password = localStorage.getItem('password');

  return {
    HelloWorld: function(){
      return $soap.post(base_url,"HelloWorld");
    },
    
    nsOpen: function(){
      response =  $soap.post(base_url,"nsOpen",{application: application,client_id:client_id,password:password,user:username});

      return response;
    },

    nsRead: function(){
      //console.log(base_url);
      return $soap.post(base_url,"nsRead",{client_id:client_id});

    },

    nsQuery: function(sql){

      var args={
       nsm__db: username,//'nanoscada',
       nsm__password: password,//'nanoscada',
       nsm__server :".",
       nsm__sql_sentence:sql,
       nsm__user: username,//'nanoscada',
     }

     return $soap.post(base_url,"nsQuery",{client_id: client_id, arg: args});
   },

   nsGetImages: function(){
      //console.log(base_url);
      return $soap.post(base_url,"nsGetImages",{client_id:client_id});

    },
    nsGetNotifications:function(last_notif){
      return $soap.post(base_url,'nsGetNotifications',{client_id:client_id, arg:last_notif});
    },
    setHost: function(){
      base_url = "http://"+localStorage.getItem('host')+":"+localStorage.getItem('port')+"/NanoScada.svc";

    },


    getSortedResult: function(result){

      var tag_type_names={
        'v77':'Medición',
        'v67':'Contador',
        'v73':'Valor entero',
        'v68':'Digital',
        'v82':'Valor decimal',
        'v84':'Texto'
      };

      sorted=new Array();
      for(i=0;i<result.length;i++){
        v_name='v'+result[i].tag_type;
        tag_name=tag_type_names[v_name];

        if("undefined" === typeof sorted[v_name]){
          sorted[v_name]={'tag_name':tag_name,'values':[]};
        }
        sorted[v_name].values.push(result[i]);

      }
      var newArr = [];

      for(var v in sorted) {
        newArr.push(sorted[v]); 

      }

      return newArr;
    }
  }

}])

.run(['$ionicPlatform','trsiWS','$timeout','$rootScope','$ionicPopup',function($ionicPlatform,trsiWS,$timeout,$rootScope,$ionicPopup) {
  var refresh_time = parseInt(localStorage.getItem('refresh_time'))*1000;
  var refresh_time_notification = parseInt(localStorage.getItem('refresh_time_notification'))*1000;
var last_notif='';


$rootScope.showAlert = function() {
   var alertPopup = $ionicPopup.alert({
     title: 'Error de conexión',
     template: 'Verifique los datos ingresados e intente nuevamente.'
   });

   alertPopup.then(function(res) {
     //console.log('Thank you for not eating my delicious ice cream cone');
   });
 };

 $rootScope.parseNotification=function (fields,data){
    var keys = Object.keys( data );
    notificacion='';
    for(i=0;i<fields.length;i++){
      notificacion+=fields[i]+':'+data[keys[i]]+'\r\n';
    }
    return notificacion;
 }

 $rootScope.getNoti = function(last_notif){
      //$scope.getData();


      $timeout(function() {
       trsiWS.nsGetNotifications(last_notif).catch(function(response){
        console.log('sin conexion');
        console.log(response);
        $rootScope.showAlert();
        $rootScope.getNoti(last_notif);
    }).then(function (result){
                 
                
                 

                  var last_notif=result[0];
                 
                  
                  var cant_notif = parseInt(result[1]);
                  var cant_fields = parseInt(result[2]);
                  var notif = new Array();
                  var j=0;
                  //levanto los campos
                  var fields= new Array();
                  var offset_notificaciones=cant_fields+3;

                  for(i=3;i<offset_notificaciones;i++){
                    fields.push(result[i]);                   
                  }
                 
                  result.splice(0,3+cant_fields);

                  var Notificaciones= new Array();
                  var j=-1;
                  for (i=0;i<=cant_notif*cant_fields;i++){
                    index=((i)%cant_fields);
                    if(!index){
                      if(Notificaciones[j])
                      Notificaciones[j]=Notificaciones[j].replace(/(^,)|(,$)/g, "")+'}';

                      j++;
                      Notificaciones[j]='{';
                    }
                    Notificaciones[j]=Notificaciones[j]+'"'+[fields[index]]+'":"'+result[i]+'",';


                  }
                
               
                  var notificaciones_parseadas=new Array();
                  for(i=0;i<Notificaciones.length-1;i++){
                    notificaciones_parseadas[i]=JSON.parse(Notificaciones[i]);
                  }
                  console.log(notificaciones_parseadas);

                  for(n=0;n<notificaciones_parseadas.length;n++){
                    console.log($rootScope.parseNotification(fields,notificaciones_parseadas[n]));
                    cordova.plugins.notification.local.schedule({
                       id: Math.ceil(Math.random()*100),
                       title: notificaciones_parseadas[n].Descripcion,
                       text: $rootScope.parseNotification(fields,notificaciones_parseadas[n]),
                       at: Date.now(),
                       data: { meetingId:"#123F"+n }
                    });
                  }



                  $rootScope.getNoti(last_notif);
       });
       
     }, refresh_time_notification);
    };

    $rootScope.getNoti(last_notif);

    $ionicPlatform.ready(function() {
      
  cordova.plugins.autoStart.enable();
      

    //enable background mode
    
    cordova.plugins.backgroundMode.setDefaults({
      title: 'NanoScada Mobile',
      text: 'Monitoréo activado',
    icon: 'icon', // this will look for icon.png in platforms/android/res/drawable|mipmap
    color: '#ffce00' // hex format like 'F14F4D'

  });

    


    cordova.plugins.backgroundMode.enable();
    cordova.plugins.backgroundMode.setEnabled(true);
    cordova.plugins.backgroundMode.excludeFromTaskList();
   // cordova.plugins.backgroundMode.overrideBackButton();
   // 
   // Disable BACK button on home
  $ionicPlatform.registerBackButtonAction(function(event) {
    if (true) { // your check here
      cordova.plugins.backgroundMode.moveToBackground();
      // $ionicPopup.confirm({
      //   title: 'Advertencia',
      //   template: '¿Seguro quiere cerrar la app y dejar de recibir notificaciones?'
      // }).then(function(res) {
      //   if (res) {
      //     ionic.Platform.exitApp();
      //   }else{

      //   }
      // })
    }
  }, 100);
    console.log('background:'+cordova.plugins.backgroundMode.isActive());
    //cordova.plugins.backgroundMode.moveToBackground();

    cordova.plugins.backgroundMode.on('activate', function() {
      console.log('activate');
    });
    cordova.plugins.backgroundMode.on('disable', function() {
      console.log('disable');
    });
    cordova.plugins.backgroundMode.on('enable', function() {
      console.log('enable');
    });
    cordova.plugins.backgroundMode.on('deactivate', function() {
      console.log('deactivate');
    });


    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if (window.cordova && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
      cordova.plugins.Keyboard.disableScroll(true);

    }
    if (window.StatusBar) { 
      // org.apache.cordova.statusbar required
      StatusBar.styleDefault();
    }

  });
  }])

.config(function($stateProvider, $urlRouterProvider) {

  $stateProvider

  .state('app', {
    url: '/app',
    abstract: true,
    templateUrl: 'templates/menu.html',
    controller: 'AppCtrl'
  })


  // .state('app.browse', {
  //   url: '/browse',
  //   views: {
  //     'menuContent': {
  //       templateUrl: 'templates/browse.html'
  //     }
  //   }
  // })
  .state('app.playlists', {
    url: '/playlists',
    views: {
      'menuContent': {
        templateUrl: 'templates/playlists.html',
        controller: 'PlaylistsCtrl'
      }
    }
  })
  .state('app.tendencias', {
    url: '/tendencias',
    views: {
      'menuContent': {
        templateUrl: 'templates/tendencias.html',
        controller: 'TendenciasCtrl'
      }
    }
  })
  .state('app.alarms', {
    url: '/alarms',
    views: {
      'menuContent': {
        templateUrl: 'templates/alarms.html',
        controller: 'AlarmsCtrl'
      }
    }
  })
  .state('app.mimics', {
    url: '/mimics',
    views: {
      'menuContent': {
        templateUrl: 'templates/mimics.html',
        controller: 'MimicsCtrl'
      }
    }
  });

  
  // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('/app/playlists');
});
