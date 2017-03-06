"use strict";

var fs = require("fs");
var commentParser = require("../comment-parser");

function isPattern(object) {
    return typeof object === "object" && object.hasOwnProperty("pattern");
}

function match(actual, expected) {
    if (expected.test) {
        return expected.test(actual);
    } else {
        return expected === actual;
    }
}


module.exports = function(context) {
    var options = context.options;

    // get error message form user config
    var errorMessage = options[2] && typeof options[2] === 'string' ? options[2] : 'incorrect header';

    // If just one option then read comment from file
    if (options.length === 1) {
        var text = fs.readFileSync(context.options[0], "utf8");
        options = commentParser(text);
    }

    var commentType = options[0];
    // If commentType is line then we want an array of the lines,
    // but if block then we want just a string
    var header, headerLines;
    if (commentType === "line") {
        if (Array.isArray(options[1])) {
            headerLines = options[1].map(function(line) {
                return isPattern(line) ? new RegExp(line.pattern) : line;
            });
        }
        else if (isPattern(options[1])) {
            headerLines = [new RegExp(options[1].pattern)];
        } 
        else {
            // TODO split on \r as well
            headerLines = options[1].split("\n");
        }
    } else {
        if (Array.isArray(options[1])) {
            header = options[1].join("\n");
        } else if (isPattern(options[1])) {
            header = new RegExp(options[1].pattern);
        } else {
            header = options[1];
        }
    }

    return {
        Program: function(node) {
            var leadingComments;
            if (node.body.length) {
                leadingComments = context.getComments(node.body[0]).leading;
            } else {
                leadingComments = context.getComments(node).leading;
            }

            if (!leadingComments.length) {
                context.report(node, errorMessage);
            } else if (leadingComments[0].type.toLowerCase() !== commentType) {
                context.report(node, "header should be a " + commentType + " comment");
            } else {
                if (commentType === "line") {
                    if (leadingComments.length < headerLines.length) {
                        context.report(node, errorMessage);
                        return;
                    }
                    for (var i = 0; i < headerLines.length; i++) {
                        if (!match(leadingComments[i].value, headerLines[i])) {
                            context.report(node, errorMessage);
                            return;
                        }
                    }
                } else {
                    if (!match(leadingComments[0].value, header)) {
                        context.report(node, errorMessage);
                    }
                }
            }
        }
    };
};
