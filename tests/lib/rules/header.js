"use strict";

var rule = require("../../../lib/rules/header");
var RuleTester = require("eslint").RuleTester;

var ruleTester = new RuleTester();
ruleTester.run("header", rule, {
    valid: [
        {
            code: "/*Copyright 2015, My Company*/\nconsole.log(1);",
            options: ["block", "Copyright 2015, My Company"]
        },
        {
            code: "//Copyright 2015, My Company\nconsole.log(1);",
            options: ["line", "Copyright 2015, My Company"]
        },
        {
            code: "/*Copyright 2015, My Company*/",
            options: ["block", "Copyright 2015, My Company"]
        },
        {
            code: "//Copyright 2015\n//My Company\nconsole.log(1)",
            options: ["line", "Copyright 2015\nMy Company"]
        },
        {
            code: "//Copyright 2015\n//My Company\nconsole.log(1)",
            options: ["line", ["Copyright 2015", "My Company"]]
        },
        {
            code: "/*Copyright 2015\nMy Company*/\nconsole.log(1)",
            options: ["block", ["Copyright 2015", "My Company"]]
        }
    ],
    invalid: [
        {
            code: "console.log(1);",
            options: ["block", "Copyright 2015, My Company"],
            errors: [
                {message: "missing header"}
            ]
        },
        {
            code: "//Copyright 2014, My Company\nconsole.log(1);",
            options: ["block", "Copyright 2015, My Company"],
            errors: [
                {message: "header should be a block comment"}
            ]
        },
        {
            code: "/*Copyright 2014, My Company*/\nconsole.log(1);",
            options: ["line", "Copyright 2015, My Company"],
            errors: [
                {message: "header should be a line comment"}
            ]
        },
        {
            code: "/*Copyright 2014, My Company*/\nconsole.log(1);",
            options: ["block", "Copyright 2015, My Company"],
            errors: [
                {message: "incorrect header"}
            ]
        },
        {
            code: "//Copyright 2014\n//My Company\nconsole.log(1)",
            options: ["line", "Copyright 2015\nMy Company"],
            errors: [
                {message: "incorrect header"}
            ]

        }
    ]
});
