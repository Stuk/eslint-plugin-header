"use strict";

var fs = require("fs");
var commentParser = require("../comment-parser");

module.exports = function(context) {
    var options = context.options;

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
            headerLines = options[1];
        } else if (typeof options[1] === "object" && options[1].hasOwnProperty('pattern')) {
            headerLines = [options[1]];
        } else {
            // TODO split on \r as well
            headerLines = options[1].split("\n");
        }
    } else {
        if (Array.isArray(options[1])) {
            header = options[1].join("\n");
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
                context.report(node, "missing header");
            } else if (leadingComments[0].type.toLowerCase() !== commentType) {
                context.report(node, "header should be a " + commentType + " comment");
            } else {
                var match;
                if (commentType === "line") {
                    if (leadingComments.length < headerLines.length) {
                        context.report(node, "incorrect header");
                        return;
                    }
                    for (var i = 0; i < headerLines.length; i++) {
                        match = (typeof headerLines[i] === 'object' &&
                                 headerLines[i].hasOwnProperty('pattern')) ?
                                leadingComments[i].value.match(new RegExp(headerLines[i].pattern)) :
                                leadingComments[i].value === headerLines[i];
                        if (!match) {
                            context.report(node, "incorrect header");
                            return;
                        }
                    }
                } else {
                    match = (typeof header === 'object' && header.hasOwnProperty('pattern')) ?
                            leadingComments[0].value.match(new RegExp(header.pattern)) :
                            leadingComments[0].value === header;
                    if (!match) {
                        context.report(node, "incorrect header");
                    }
                }
            }
        }
    };
};
