'use strict';


// or more concisely
const sys = require('sys')
const exec = require('child_process').exec;
const puts = (error, stdout, stderr) => { sys.puts(stdout) }
exec("mkdir ghost", puts);
exec("cd ghost", puts);