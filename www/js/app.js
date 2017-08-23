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

  return {
    HelloWorld: function(){
      return $soap.post(base_url,"HelloWorld");
    },
    
    nsOpen: function(){
      response =  $soap.post(base_url,"nsOpen",{application: '',client_id:''});

      return response;
    },

    nsRead: function(){
      //console.log(base_url);
      return $soap.post(base_url,"nsRead",{client_id:''});

    },

    nsQuery: function(sql){

      var args={
       nsm__db: 'nanoscada',
       nsm__password: 'nanoscada',
       nsm__server :".",
       nsm__sql_sentence:sql,
       nsm__user: 'nanoscada',
     }

     return $soap.post(base_url,"nsQuery",{client_id: '', arg: args});
   },

   nsGetImages: function(){
      //console.log(base_url);
      return $soap.post(base_url,"nsGetImages",{client_id:''});

    },
    nsGetNotifications:function(last_notif){
      console.log('aca:'+last_notif);
      return $soap.post(base_url,'nsGetNotifications',{client_id:'', arg:last_notif});
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

.run(['$ionicPlatform','trsiWS','$timeout','$rootScope',function($ionicPlatform,trsiWS,$timeout,$rootScope) {
 var refresh_time = parseInt(localStorage.getItem('refresh_time'))*1000;
 var last_notif='';


 $rootScope.getNoti = function(last_notif){
      //$scope.getData();


      $timeout(function() {
       trsiWS.nsGetNotifications(last_notif).then(function (result){
                last_notif=result[0];
                 console.log('getNot:'+last_notif);

                 console.log(result);
                 ["2017-08-18 12:41:00.200", "1", "6", "Fecha y Hora", "Normalizacion", "TAG", "Descripcion", "Estado", "Area", "18/08/2017 12:41:00.066", null, "MTR_COIL_002", "Prueba de notificaciones 2", "ALARMA", "AREA1", null]
                  
                  var cant_notif = response[1];
                  var cant_fields = response[2];
                  var notif = new Array();
                  var j=0;

                  for(i=3;i<=cant_fields*cant_notif*2;i++){
                    
                    if(i % 2 != 0){ //titulo
                       images[j]={
                          titulo:'',
                          fimage:''
                        };
                      images[j].titulo = response[i];
                    }else{ //imagen
                      images[j].fimage = response[i];
                      j++;
                    }
                    
                  }

                  // cordova.plugins.notification.local.schedule({
                  //             id: v3,
                  //             title: tmp_vals[v][v2][v3]['tag_desc'],
                  //             text: tmp_vals[v][v2][v3]['tag_name']+' '+tmp_vals[v][v2][v3]['tvalue']+' '+tmp_vals[v][v2][v3]['tag_units'],
                  //             at: Date.now(),
                  //             data: { meetingId:"#123FG8" }
                  //         });
                  //         
                  $rootScope.getNoti(last_notif);
       });
       
     }, refresh_time);
    };

    $rootScope.getNoti(last_notif);

    $ionicPlatform.ready(function() {
    //enable background mode
    cordova.plugins.backgroundMode.setDefaults({
      title: 'NanoScada Mobile',
      text: 'Monitoréo activado',
    icon: 'icon', // this will look for icon.png in platforms/android/res/drawable|mipmap
    color: '#ffce00' // hex format like 'F14F4D'

  });



    cordova.plugins.backgroundMode.enable();
    cordova.plugins.backgroundMode.setEnabled(true);
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
