"use strict";
module.exports = function (grunt) {
    grunt.initConfig({
        pkg: grunt.file.readJSON("package.json"),
        "eslint": {
            options: {
                configFile: ".eslintrc.json"
            },
            target: ["*.js", "lib/**.js"]
        },
        "execute": {
            test: {
                src: ["testrun.js"]
            }
        }
    });

    grunt.loadNpmTasks("grunt-eslint");
    grunt.loadNpmTasks("grunt-execute");
    grunt.registerTask("default", []);
    grunt.registerTask("ci_build", ["eslint", "execute:test"]);
};