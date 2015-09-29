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

            function fixerCallback(fixer) {
                return fixer.insertTextBefore(node, text + "\n");
            }

            if (!leadingComments.length) {
                context.report({
                    node: node,
                    message: "missing header",
                    fix: fixerCallback
                });
            } else if (leadingComments[0].type.toLowerCase() !== commentType) {
                context.report(node, "header should be a " + commentType + " comment");
            } else {
                if (commentType === "line") {
                    for (var i = 0; i < headerLines.length; i++) {
                        if (leadingComments[i].value !== headerLines[i]) {
                            context.report({
                                node: node,
                                message: "incorrect header"
                            });
                            return;
                        }
                    }
                } else if (leadingComments[0].value !== header) {
                    context.report({
                        node: node,
                        message: "incorrect header",
                        fix: fixerCallback
                    });
                }
            }
        }
    };
};
