/**
 * Created by nuintun on 2015/11/16.
 */

'use strict';

var electron = require('electron');
var ipc = electron.ipcRenderer;
var util = require('../util');
var Vue = require('../vue/vue');

require('../components/app-configure');
require('../components/window-control');
require('../components/app-nav');
require('../components/app-main');
require('../components/no-data');

// app runtime
window.AppRuntime = {};

// add DOMContentLoaded event
window.addEventListener('DOMContentLoaded', function (){
  var app;

  function init(configure){
    app = new Vue({
      el: '#app',
      data: {
        activeIndex: 0,
        configure: configure
      },
      computed: {
        unique: function (){
          var cache = {};

          this.configure.projects.forEach(function (project){
            cache[project.name] = true;
          });

          return cache;
        }
      },
      events: {
        'change-active': function (index, setting){
          this.activeIndex = index;

          this.$broadcast('setting-toggle', setting);
        },
        'save-configure': function (){
          ipc.send('app-configure', 'save', util.normalize(this.configure));
        }
      }
    });
  }

  ipc.on('app-configure', function (event, command, configure){
    switch (command) {
      case 'ready':
        ipc.send('app-configure', 'read');
        break;
      case 'refresh':
        if (app) {
          app.activeIndex = 0;
          configure.projects = configure.projects || [];
          app.configure = configure;

          app.$broadcast('reset-input');
          app.$broadcast('reset-error');
        } else {
          init(configure);
        }
        break;
    }
  });

  ipc.send('app-configure', 'ready');
}, false);
