/* eslint-env mocha */
"use strict";

var assert = require("assert");
var commentParser = require("../../lib/comment-parser");

describe("comment parser", function() {
    it("parses block comments", function() {
        var result = commentParser("/* pass1\n pass2 */  ");
        assert.deepEqual(result, ["block", " pass1\n pass2 ", 0]);
    });

    it("parses block comments with Windows EOLs", function() {
        var result = commentParser("/* pass1\r\n pass2 */\r\n\r\n  ");
        assert.deepEqual(result, ["block", " pass1\r\n pass2 ", 2]);
    });

    it("throws an error when a block comment isn't ended", function() {
        assert.throws(function() {
            commentParser("/* fail");
        });
    });

    it("parses line comments", function() {
        var result = commentParser("// pass1\n// pass2\n  ");
        assert.deepEqual(result, ["line", [" pass1", " pass2"], 1]);
    });
});
