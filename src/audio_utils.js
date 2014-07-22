
module.exports.audio_utils = function(environment_mode) { // functional inheritance Crockford 2008 pg 52

/*

    Audio utilities like fundamental frequency detection, populate bufer with sinusoidal curves

*/

var path = require('path');

function resolvePath(str) {
  if (str.substr(0, 2) === '~/') {
    str = (process.env.HOME || process.env.HOMEPATH || process.env.HOMEDIR || process.cwd()) + str.substr(1);
  }
  return path.resolve(str);
}

// -------------------------------------------------------- //

console.log("do_clustering  ....  environment_mode ", environment_mode);

var that = {};
var shared_utils;

switch (environment_mode) {

    case "nubia": // repository owner tinkering mode - ignore it 
        shared_utils  = require(resolvePath("~/Dropbox/Documents/code/github/shared-utils/src/node_utils"));
        break;

    case "dev":
        shared_utils  = require("shared-utils");    // get these modules from global install
        break;

    default :
        shared_utils  = require("shared-utils");
        break;
};

var detect_fundamental_frequency = function(audio_obj) {

// --- iterate across to identify dominate frequency --- //

console.log("detect_fundamental_frequency");
console.log("detect_fundamental_frequency");
console.log("detect_fundamental_frequency");
console.log("detect_fundamental_frequency");
console.log("detect_fundamental_frequency");
console.log("detect_fundamental_frequency");

var minimum_size_subsection = 10;
// var minimum_size_subsection = 25;

var curr_interval = 2;  // take entire input buffer and divide by this looking for similarities between such subsections

var size_subsection;

var count_subsection = 0;

var size_chunks;
var curr_chunk;
var curr_start;
var curr_end;
var curr_sample_left;
var curr_sample_right;

// var curr_sample_space;

var curr_left;
// var min_left;
// var max_left;

var curr_right;
// var min_right;
// var max_right;

var prev_size_subsection = 0;

var max_samples_per_subsection = 30;
var size_increment;
var reconstituted_size_subsection;
// var max_size_subsample_to_do_increment_fixup = 30;
var max_size_subsample_to_do_increment_fixup = max_samples_per_subsection;

// ---

var aggregate_total;
var aggregate_diff;
var subsection_total;
var subsection_diff;
var count_num_iterations;

do {

    size_subsection = ~~(SIZE_BUFFER_SOURCE / curr_interval);

    if (size_subsection == prev_size_subsection) {

        curr_interval++;
        continue;
    }

    if (size_subsection < max_size_subsample_to_do_increment_fixup) {        

        size_increment = 1;

        reconstituted_size_subsection = size_subsection;

    } else {

        size_increment = ~~(size_subsection / max_samples_per_subsection);

        reconstituted_size_subsection = size_increment * max_samples_per_subsection;
    };

    // stens TODO - we may want to compare more than ONE pair ... make it a parm to compare X cycles


    // console.log("size_subsection ", size_subsection, " curr_interval ", curr_interval, 
    //             " size_increment ", size_increment, reconstituted_size_subsection);

    // min_left = 0;
    // max_left = size_subsection;

    // min_right = size_subsection;
    // max_right = size_subsection * 2;

    // console.log("min_left ", min_left, " max_left ", max_left, " min_right ", min_right, " max_right ", max_right);


    subsection_total = 0;
    subsection_diff = 0;
    count_num_iterations = 0;

    for (curr_left = 0; curr_left < reconstituted_size_subsection; curr_left += size_increment) {

        curr_right = curr_left + size_subsection;

        curr_sample_left = audio_obj.buffer[curr_left];
        curr_sample_right = audio_obj.buffer[curr_right];

        subsection_total += curr_sample_right;
        subsection_diff  += Math.abs(curr_sample_left - curr_sample_right);
        count_num_iterations++;

        // console.log("User %s has %d points", userName, userPoints);

        // console.log(reconstituted_size_subsection, curr_left, curr_sample_left, curr_right, curr_sample_right);

        // console.log("aaa %d %d %f %d %f", reconstituted_size_subsection, curr_left, curr_sample_left, curr_right, curr_sample_right);
        // process.stdout.write('aaa %d %d %f %d %f\n', reconstituted_size_subsection, curr_left, curr_sample_left, curr_right, curr_sample_right);
        console.log("" + shared_utils.toFixed(reconstituted_size_subsection, 5),
                    // curr_left, curr_sample_left.toFixed(5), 
                    // curr_right, curr_sample_right.toFixed(5), " vs mine ",
                    shared_utils.toFixed(curr_left, 5), shared_utils.toFixed(curr_sample_left, 5), 
                    shared_utils.toFixed(curr_right, 5), shared_utils.toFixed(curr_sample_right, 5)
                    );
    };

    // console.log("" + size_subsection, samples_per_cycle, count_num_iterations,
    //          " subsection_diff ", subsection_diff/count_num_iterations);


    console.log("" + shared_utils.toFixed(size_subsection, 5),
        shared_utils.toFixed(samples_per_cycle, 5),
        shared_utils.toFixed(count_num_iterations, 5),
             " subsection_diff ", 
              shared_utils.toFixed(subsection_diff/count_num_iterations, 5)
             );



    // ---
    
    prev_size_subsection = size_subsection;
    curr_interval++;

} while (size_subsection > minimum_size_subsection);

};      //      detect_fundamental_frequency

that.detect_fundamental_frequency = detect_fundamental_frequency;


// ------------------------------------------------------------------------ //


var pop_audio_buffer = function (size_buff, given_samples_per_cycle) {

    /*

    value add of how this populates buffer with sinusoidal curve is the
    curve is assured to both start and stop at the zero cross over threshold,
    independent of supplied input parms which control samples per cycle and buffer size.
    This avoids that "pop" which otherwise happens when rendering audio curve
    which begins at say 0.5 of a possible range -1 to 0 to +1

    */

    // give a default value if not supplied by input parm

    var samples_per_cycle = (typeof given_samples_per_cycle != "undefined") ? 
                                    given_samples_per_cycle : 64;

    if (samples_per_cycle > size_buff) {

        console.log("ERROR - SIZE_BUFFER_SOURCE MUST be larger than samples_per_cycle");
        process.exit(1);
    }

    /*

    // stens TODO - verify if we leave this commented OUT the rendered sound has NO audible POP
    
    if (0 != size_buff % samples_per_cycle) {

        console.log("ERROR - samples_per_cycle MUST be a divisor to SIZE_BUFFER_SOURCE");
        process.exit(2);
    }
    */

    var count_num_cycles = size_buff / samples_per_cycle;

    console.log("in pop source buffer  size_buff ", size_buff, 
                " samples_per_cycle ",samples_per_cycle);

    var audio_obj = {};
    
    var source_buffer = new Float32Array(size_buff);

    audio_obj.buffer = source_buffer;
    var running_index = 0;

    var num_samples_per_cycle = size_buff / count_num_cycles;

    console.log("count_num_cycles ", count_num_cycles, 
                " num_samples_per_cycle ", audio_obj.num_samples_per_cycle);

    var incr_theta = (2.0 * Math.PI) / num_samples_per_cycle;

    for (var index = 0; index < count_num_cycles; index++) {

        var index_buff = 0;
        var theta = 0.0;

        do {

            audio_obj.buffer[running_index] = Math.sin(theta);

            theta += incr_theta;
            running_index++;

        } while (++index_buff < num_samples_per_cycle);
    }
    
    return audio_obj;

};       //      pop_audio_buffer

that.pop_audio_buffer = pop_audio_buffer;

return that;

};