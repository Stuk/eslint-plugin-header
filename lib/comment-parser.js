"use strict";

// This is a really simple and dumb parser, that looks just for a
// single kind of comment. It won't detect multiple block comments.

module.exports = function commentParser(text) {
    // @see https://stackoverflow.com/a/20060315
    var trailingNewLinesMatches = text.match(/\n(?=\s*$)/g);
    var trailingNewLinesCount = 1;

    if (trailingNewLinesMatches) {
        trailingNewLinesCount += trailingNewLinesMatches.length;
    }

    text = text.trim();

    if (text.substr(0, 2) === "//") {
        return [
            "line",
            text.split(/\r?\n/).map(function(line) {
                return line.substr(2);
            }),
            trailingNewLinesCount
        ];
    } else if (
        text.substr(0, 2) === "/*" &&
        text.substr(-2) === "*/"
    ) {
        return ["block", text.substring(2, text.length - 2), trailingNewLinesCount];
    } else {
        throw new Error("Could not parse comment file: the file must contain either just line comments (//) or a single block comment (/* ... */)");
    }
};
