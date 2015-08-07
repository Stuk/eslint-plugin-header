"use strict";

module.exports = function(context) {
    var commentType = context.options[0];

    // If commentType is line then we want an array of the lines,
    // but if block then we want just a string
    var header, headerLines;
    if (commentType === "line") {
        if (Array.isArray(context.options[1])) {
            headerLines = context.options[1];
        } else {
            // TODO split on \r as well
            headerLines = context.options[1].split("\n");
        }
    } else {
        if (Array.isArray(context.options[1])) {
            header = context.options[1].join("\n");
        } else {
            header = context.options[1];
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
                if (commentType === "line") {
                    for (var i = 0; i < headerLines.length; i++) {
                        if (leadingComments[i].value !== headerLines[i]) {
                            context.report(node, "incorrect header");
                            return;
                        }
                    }
                } else if (leadingComments[0].value !== header) {
                    context.report(node, "incorrect header");
                }
            }
        }
    };
};
