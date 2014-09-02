
module.exports.audio_utils = function() {

// Audio utilities like fundamental frequency detection, populate buffer with sinusoidal curves

var that = {};
var shared_utils = require("shared-utils");

// ---

var play_detect_frequency = function(audio_obj, spec) {   // this is a new version of detect_fundamental_frequency

// --- iterate across to identify dominate frequency --- //

// http://stackoverflow.com/questions/65268/how-do-you-analyse-the-fundamental-frequency-of-a-pcm-or-wav-sample

console.log("raw spec ", spec);

var default_min_error_thresold = 0.1;
var default_minimum_size_subsection = 6;
var default_max_samples_per_subsection = 30;

var subsection_mode_decimation = "decimation"; // keep dividing buffer size by incrementing counter
var subsection_mode_continuous = "continuous"; // continuously slide left/right center point closer to start

var default_subsection_mode = subsection_mode_decimation;
// var default_subsection_mode = subsection_mode_continuous;

var spec = spec || {

            min_error_thresold : default_min_error_thresold,
       minimum_size_subsection : default_minimum_size_subsection,
    max_samples_per_subsection : default_max_samples_per_subsection,
               subsection_mode : default_subsection_mode
};

var min_error_thresold         = spec.min_error_thresold         || default_min_error_thresold;
var minimum_size_subsection    = spec.minimum_size_subsection    || default_minimum_size_subsection;
var max_samples_per_subsection = spec.max_samples_per_subsection || default_max_samples_per_subsection;
var subsection_mode = spec.subsection_mode || default_subsection_mode;


console.log("min_error_thresold ", min_error_thresold);

spec.all_low_error_sample_sizes = [];

var SIZE_BUFFER_SOURCE = audio_obj.buffer.length;

spec.SIZE_BUFFER_SOURCE = SIZE_BUFFER_SOURCE;


console.log("play_detect_frequency SIZE_BUFFER_SOURCE ", SIZE_BUFFER_SOURCE);
console.log("play_detect_frequency SIZE_BUFFER_SOURCE ", SIZE_BUFFER_SOURCE);
console.log("play_detect_frequency SIZE_BUFFER_SOURCE ", SIZE_BUFFER_SOURCE);


// shared_utils.show_object(audio_obj, 
//     "DFF audio_obj  DFF", "total", 10);


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

// var max_samples_per_subsection = 30;
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

var loop_counter = 0;
var init_size_subsection = ~~(SIZE_BUFFER_SOURCE / curr_interval); // for continuous mode

console.log("subsection_mode ", subsection_mode);

do {

    if (subsection_mode == subsection_mode_decimation) {

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

    } else if (subsection_mode == subsection_mode_continuous) {

        size_subsection = init_size_subsection - (loop_counter * 2);
        reconstituted_size_subsection = size_subsection;
        size_increment = 1;

    } else {

        console.error("ERROR - invalid subsection_mode : ", subsection_mode);
        process.exit(8);
    }

    // ------------------------------------------------------------------------------------


    // stens TODO - we may want to compare more than ONE pair ... make it a parm to compare X cycles

    // console.log("size_subsection ", size_subsection, " curr_interval ", curr_interval, 
    //             " size_increment ", size_increment, reconstituted_size_subsection);

    console.log("subsection size ", size_subsection, " recon ", reconstituted_size_subsection,
                " step size ", size_increment);

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

        /*
        console.log("" + shared_utils.toFixed(reconstituted_size_subsection, 5),
                    // curr_left, curr_sample_left.toFixed(5), 
                    // curr_right, curr_sample_right.toFixed(5), " vs mine ",
                    shared_utils.toFixed(curr_left, 5), shared_utils.toFixed(curr_sample_left, 5), 
                    shared_utils.toFixed(curr_right, 5), shared_utils.toFixed(curr_sample_right, 5)
                    );
        */
    };

    // console.log("" + size_subsection, samples_per_cycle, count_num_iterations,
    //          " subsection_diff ", subsection_diff/count_num_iterations);

    aggregate_diff = subsection_diff/count_num_iterations;

    if (aggregate_diff < min_error_thresold) {

        var this_goodie = {};

        this_goodie.aggregate_diff = aggregate_diff;
        this_goodie.size_subsection = size_subsection;

        spec.all_low_error_sample_sizes.push(this_goodie);
    }

    /*
    console.log("" + shared_utils.toFixed(size_subsection, 5),
        // shared_utils.toFixed(samples_per_cycle, 5),
        shared_utils.toFixed(count_num_iterations, 5),
             " subsection_diff ", 
              // shared_utils.toFixed(subsection_diff/count_num_iterations, 5)
              shared_utils.toFixed(aggregate_diff, 5)
             );
    */

    // ---
    
    prev_size_subsection = size_subsection;
    curr_interval++;
    loop_counter++;

} while (size_subsection > minimum_size_subsection);

};      //      play_detect_frequency

that.play_detect_frequency = play_detect_frequency;


// ---

// var detect_fundamental_frequency = function(audio_obj, SIZE_BUFFER_SOURCE, samples_per_cycle) {
var detect_fundamental_frequency = function(audio_obj, spec) {

// --- iterate across to identify dominate frequency --- //

var default_min_error_thresold = 0.1;

var spec = spec || {

    min_error_thresold : default_min_error_thresold
};

var min_error_thresold = spec.min_error_thresold || default_min_error_thresold;

console.log("min_error_thresold ", min_error_thresold);

spec.all_low_error_sample_sizes = [];

var SIZE_BUFFER_SOURCE = audio_obj.buffer.length;

spec.SIZE_BUFFER_SOURCE = SIZE_BUFFER_SOURCE;


console.log("detect_fundamental_frequency SIZE_BUFFER_SOURCE ", SIZE_BUFFER_SOURCE);
console.log("detect_fundamental_frequency SIZE_BUFFER_SOURCE ", SIZE_BUFFER_SOURCE);
console.log("detect_fundamental_frequency SIZE_BUFFER_SOURCE ", SIZE_BUFFER_SOURCE);


shared_utils.show_object(audio_obj, 
    "DFF audio_obj  DFF", "total", 10);



// var minimum_size_subsection = 4;
var minimum_size_subsection = 6;
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

    aggregate_diff = subsection_diff/count_num_iterations;

    if (aggregate_diff < min_error_thresold) {

        var this_goodie = {};

        this_goodie.aggregate_diff = aggregate_diff;
        this_goodie.size_subsection = size_subsection;

        spec.all_low_error_sample_sizes.push(this_goodie);
    }

    console.log("" + shared_utils.toFixed(size_subsection, 5),
        // shared_utils.toFixed(samples_per_cycle, 5),
        shared_utils.toFixed(count_num_iterations, 5),
             " subsection_diff ", 
              // shared_utils.toFixed(subsection_diff/count_num_iterations, 5)
              shared_utils.toFixed(aggregate_diff, 5)
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

    output sinusoidal curve is assured to both start and stop at the zero cross over threshold,
    independent of supplied input parms which control samples per cycle and buffer size.
    This avoids that "pop" which otherwise happens when rendering audio curves
    which begins at say 0.5 of a possible range -1 to 0 to +1

    */

    // give a default value if not supplied by input parm

    // var samples_per_cycle = (typeof given_samples_per_cycle != "undefined") ? 
    //                                 given_samples_per_cycle : 64;


    var samples_per_cycle = given_samples_per_cycle || 64;

    console.log("samples_per_cycle ", samples_per_cycle);
    console.log("given_samples_per_cycle ", given_samples_per_cycle);

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
