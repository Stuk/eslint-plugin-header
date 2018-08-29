"use strict";

var fs = require("fs");
var commentParser = require("../comment-parser");
var os = require("os");

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
    return comments.filter(function(comment) {
        return comment.type !== "Shebang";
    });
}

function getLeadingComments(context, node) {
    return node.body.length ?
        context.getComments(node.body[0]).leading :
        context.getComments(node).leading;
}

function genCommentBody(commentType, textArray, eol) {
    if (commentType === "block") {
        return "/*" + textArray[0] + "*/" + eol;
    } else {
        return "//" + textArray.join(eol + "//") + eol;
    }
}

function genCommentsRange(context, comments, eol) {
    var start = comments[0].range[0];
    var end = comments.slice(-1)[0].range[1];
    if (context.getSourceCode().text[end] === eol) {
        end += eol.length;
    }
    return [start, end];
}

function genPrependFixer(commentType, node, headerLines, eol) {
    return function(fixer) {
        return fixer.insertTextBefore(
            node,
            genCommentBody(commentType, headerLines, eol)
        );
    };
}

function genReplaceFixer(commentType, context, leadingComments, headerLines, eol) {
    return function(fixer) {
        return fixer.replaceTextRange(
            genCommentsRange(context, leadingComments, eol),
            genCommentBody(commentType, headerLines, eol)
        );
    };
}

function findSettings(options) {
    var lastOption = options.length > 0 ? options[options.length - 1] : null;
    if (typeof lastOption === "object" && !Array.isArray(lastOption) && lastOption !== null && !lastOption.hasOwnProperty("pattern")) {
        return lastOption;
    }
}

function getEOL(options) {
    var settings = findSettings(options);
    if (settings && settings.lineEndings === "unix") {
        return "\n";
    }
    if (settings && settings.lineEndings === "windows") {
        return "\r\n";
    }
    return os.EOL;
}

module.exports = function(context) {
    var options = context.options;

    var eol = getEOL(options);

    // If just one option then read comment from file
    if (options.length === 1 || (options.length === 2 && findSettings(options))) {
        var text = fs.readFileSync(context.options[0], "utf8");
        options = commentParser(text);
    }

    var commentType = options[0];
    // If commentType is line then we want an array of the lines,
    // but if block then we want just a string
    var header, headerLines;
    // If any of the lines are regular expressions, then we can't
    // automatically fix them. We set this to true below once we
    // ensure none of the lines are of type RegExp
    var canFix = false;
    if (commentType === "line") {
        if (Array.isArray(options[1])) {
            canFix = true;
            headerLines = options[1].map(function(line) {
                var isRegex = isPattern(line);
                if (isRegex) {
                    canFix = false;
                }
                return isRegex ? new RegExp(line.pattern) : line;
            });
        } else if (isPattern(options[1])) {
            headerLines = [new RegExp(options[1].pattern)];
        } else {
            canFix = true;
            headerLines = options[1].split(/\r?\n/);
        }
    } else {
        if (Array.isArray(options[1])) {
            canFix = true;
            header = options[1].join(eol);
        } else if (isPattern(options[1])) {
            header = new RegExp(options[1].pattern);
        } else {
            canFix = true;
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
                    fix: canFix ? genPrependFixer(commentType, node, header ? [header] : headerLines, eol) : null
                });
            } else if (leadingComments[0].type.toLowerCase() !== commentType) {
                context.report({
                    loc: node.loc,
                    message: "header should be a {{commentType}} comment",
                    data: {
                        commentType: commentType
                    },
                    fix: canFix ? genReplaceFixer(commentType, context, leadingComments, header ? [header] : headerLines, eol) : null
                });
            } else {
                if (commentType === "line") {
                    if (leadingComments.length < headerLines.length) {
                        context.report({
                            loc: node.loc,
                            message: "incorrect header",
                            fix: canFix ? genReplaceFixer(commentType, context, leadingComments, headerLines, eol) : null
                        });
                        return;
                    }
                    for (var i = 0; i < headerLines.length; i++) {
                        if (!match(leadingComments[i].value, headerLines[i])) {
                            context.report({
                                loc: node.loc,
                                message: "incorrect header",
                                fix: canFix ? genReplaceFixer(commentType, context, leadingComments, headerLines, eol) : null
                            });
                            return;
                        }
                    }
                } else {
                    if (!match(leadingComments[0].value, header)) {
                        context.report({
                            loc: node.loc,
                            message: "incorrect header",
                            fix: canFix ? genReplaceFixer(commentType, context, leadingComments, [header], eol) : null
                        });
                    }
                }
            }
        }
    };
};
