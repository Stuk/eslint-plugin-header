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

function excludeShebangs(comments) {
    return comments.filter(function(comment) { return comment.type !== "Shebang"; });
}

function getLeadingComments(context, node) {
    return node.body.length ?
        context.getComments(node.body[0]).leading :
        context.getComments(node).leading;
}

function genCommentBody(commentType, textArray) {
    if (commentType === "block") {
        return "/*" + textArray[0] + "*/\n";
    } else {
        return "//" + textArray.join("\n//") + "\n";
    }
}

function genCommentsRange(context, comments) {
    var start = comments[0].range[0];
    var end = comments.slice(-1)[0].range[1];
    if (context.getSourceCode().text[end] === "\n") {
        end++;
    }
    return [start, end];
}

function genPrependFixer(commentType, context, node, headerLines) {
    return function(fixer) {
        return fixer.insertTextBefore(
            node,
            genCommentBody(commentType, headerLines)
        );
    };
}

function genReplaceFixer(commentType, context, leadingComments, headerLines) {
    return function(fixer) {
        return fixer.replaceTextRange(
            genCommentsRange(context, leadingComments),
            genCommentBody(commentType, headerLines)
        );
    };
}

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
    var shouldFix = false;
    if (commentType === "line") {
        if (Array.isArray(options[1])) {
            shouldFix = true;
            headerLines = options[1].map(function(line) {
                var isRegex = isPattern(line);
                if (isRegex) {
                    shouldFix = false;
                }
                return isRegex ? new RegExp(line.pattern) : line;
            });
        } else if (isPattern(options[1])) {
            headerLines = [new RegExp(options[1].pattern)];
        } else {
            shouldFix = true;
            // TODO split on \r as well
            headerLines = options[1].split("\n");
        }
    } else {
        if (Array.isArray(options[1])) {
            shouldFix = true;
            header = options[1].join("\n");
        } else if (isPattern(options[1])) {
            header = new RegExp(options[1].pattern);
        } else {
            shouldFix = true;
            header = options[1];
        }
    }

    return {
        Program: function(node) {
            var leadingComments = excludeShebangs(getLeadingComments(context, node));

            if (!leadingComments.length) {
                context.report({
                    loc: node.loc,
                    message: "missing header",
                    fix: shouldFix ? genPrependFixer(commentType, context, node, header ? [header] : headerLines) : null
                });
            } else if (leadingComments[0].type.toLowerCase() !== commentType) {
                context.report({
                    loc: node.loc,
                    message: "header should be a {{commentType}} comment",
                    data: {
                        commentType: commentType
                    },
                    fix: shouldFix ? genReplaceFixer(commentType, context, leadingComments, header ? [header] : headerLines) : null
                });
            } else {
                if (commentType === "line") {
                    if (leadingComments.length < headerLines.length) {
                        context.report({
                            loc: node.loc,
                            message: "incorrect header",
                            data: {
                                commentType: commentType
                            },
                            fix: shouldFix ? genReplaceFixer(commentType, context, leadingComments, headerLines) : null
                        });
                        return;
                    }
                    for (var i = 0; i < headerLines.length; i++) {
                        if (!match(leadingComments[i].value, headerLines[i])) {
                            context.report({
                                loc: node.loc,
                                message: "incorrect header",
                                data: {
                                    commentType: commentType
                                },
                                fix: shouldFix ? genReplaceFixer(commentType, context, leadingComments, headerLines) : null
                            });
                            return;
                        }
                    }
                } else {
                    if (!match(leadingComments[0].value, header)) {
                        context.report({
                            loc: node.loc,
                            message: "incorrect header",
                            data: {
                                commentType: commentType
                            },
                            fix: shouldFix ? genReplaceFixer(commentType, context, leadingComments, [header]) : null
                        });
                    }
                }
            }
        }
    };
};
