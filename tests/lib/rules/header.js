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
        },
        {
            code: "/*************************\n * Copyright 2015\n * My Company\n *************************/\nconsole.log(1)",
            options: ["block", [
                "************************",
                " * Copyright 2015",
                " * My Company",
                " ************************"
            ]]
        },
        {
            code: "/*\nCopyright 2015\nMy Company\n*/\nconsole.log(1)",
            options: ["tests/support/block.js"]
        },
        {
            code: "// Copyright 2015\n// My Company\nconsole.log(1)",
            options: ["tests/support/line.js"]
        },
        {
            code: "//Copyright 2015\n//My Company\n/* DOCS */",
            options: ["line", "Copyright 2015\nMy Company"]
        },
        {
            code: "// Copyright 2017",
            options: ["line", {pattern: "^ Copyright \\d+$"}]
        },
        {
            code: "// Copyright 2017\n// Author: abc@example.com",
            options: ["line", [{pattern: "^ Copyright \\d+$"}, {pattern: "^ Author: \\w+@\\w+\\.\\w+$"}]]
        },
        {
            code: "/* Copyright 2017\n Author: abc@example.com */",
            options: ["block", {pattern: "^ Copyright \\d{4}\\n Author: \\w+@\\w+\\.\\w+ $"}]
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
        },
        {
            code: "//Copyright 2015",
            options: ["line", "Copyright 2015\nMy Company"],
            errors: [
                {message: "incorrect header"}
            ]
        },
        {
            code: "// Copyright 2017 trailing",
            options: ["line", {pattern: "^ Copyright \\d+$"}],
            errors: [
                {message: "incorrect header"}
            ]
        },
        {
            code: "// Copyright 2017\n// Author: ab-c@example.com",
            options: ["line", [{pattern: "Copyright \\d+"}, {pattern: "^ Author: \\w+@\\w+\\.\\w+$"}]],
            errors: [
                {message: "incorrect header"}
            ]
        },
        {
            code: "/* Copyright 2017-01-02\n Author: abc@example.com */",
            options: ["block", {pattern: "^ Copyright \\d+\\n Author: \\w+@\\w+\\.\\w+ $"}],
            errors: [
                {message: "incorrect header"}
            ]
        },
        {
            code: "/* Copyright 20\n Author: abc@example.com */",
            options: ["block", {pattern: "^\\s*Copyright \\(c\\) \\d{4} ABC Inc. All rights reserved.\\s*$"}, "Copyright information error. Please add below line to your file.\n\tCopyright (c) " + new Date().getFullYear() + " ABC Inc. All rights reserved"],
            errors: [
                {message: "Copyright information error. Please add below line to your file.\n\tCopyright (c) " + new Date().getFullYear() + " ABC Inc. All rights reserved"}
            ]
        }
    ]
});
