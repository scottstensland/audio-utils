#!/usr/bin/env node 

var environment_mode = process.argv[2] || "dev";

console.warn("running code in environment_mode: ", environment_mode);

// var shared_utils = require("../src/node_utils");
var audio_util_obj = require("../src/audio_utils");

var audio_utils = audio_util_obj.audio_utils(environment_mode);

console.log("audio_utils ", audio_utils);

// ------------------------------------------------------------------------------------ //

var spec = {


}

var source_obj = {};



// audio_utils.detect_fundamental_frequency(source_obj);


console.log("<><><>  <><><>  <><><>   end of processing   <><><>  <><><>  <><><>");

