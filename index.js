var ghost = require('ghost');
var path = require('path');

ghost().then(function (ghostServer) {
    ghostServer.start();
});