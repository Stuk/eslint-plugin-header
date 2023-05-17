eslint-plugin-header
====================

ESLint plugin to ensure that files begin with given comment.

Often you will want to have a copyright notice at the top of every file. This ESLint plugin checks that the first comment in every file has the contents defined in the rule settings.

## Usage

This rule takes 1, 2 or 3 arguments with an optional settings object.

### 1 argument

In the 1 argument form the argument is the filename of a file that contains the comment(s) that should appear at the top of every file:

```json
{
    "plugins": [
        "header"
    ],
    "rules": {
        "header/header": [2, "config/header.js"]
    }
}
```

config/header.js:

```js
// Copyright 2015
// My company
```

Due to limitations in eslint plugins, the file is read relative to the working directory that eslint is executed in. If you run eslint from elsewhere in your tree then the header file will not be found.

### 2 arguments

In the 2 argument form the first must be either `"block"` or `"line"` to indicate what style of comment should be used. The second is either a string (including newlines) of the comment, or an array of each line of the comment.

```json
{
    "plugins": [
        "header"
    ],
    "rules": {
        "header/header": [2, "block", "Copyright 2015\nMy Company"]
    }
}
```

### 3 arguments

The optional third argument which defaults to 1 specifies the number of newlines that are enforced after the header.

Zero newlines:
```json
{
    "plugins": [
        "header"
    ],
    "rules": {
        "header/header": [2, "block", [" Copyright now","My Company "], 0]
    }
}
```
```js
/* Copyright now
My Company */ console.log(1)
```

One newline (default)
```json
{
    "plugins": [
        "header"
    ],
    "rules": {
        "header/header": [2, "block", [" Copyright now","My Company "], 1]
    }
}
```
```js
/* Copyright now
My Company */
console.log(1)
```

two newlines
```json
{
    "plugins": [
        "header"
    ],
    "rules": {
        "header/header": [2, "block", [" Copyright now","My Company "], 2]
    }
}
```
```js
/* Copyright now
My Company */

console.log(1)
```

#### Regular expressions

Instead of a string to be checked for exact matching you can also supply a regular expression. Be aware that you have to escape backslashes:

```json
{
    "plugins": [
        "header"
    ],
    "rules": {
        "header/header": [2, "block", [
            {"pattern": " Copyright \\d{4}"},
            "My Company"
        ]]
    }
}
```

This would match:

```js
/* Copyright 2808
My Company*/
```

When you use a regular expression `pattern`, you can also provide a `template` property, to provide the comment value when using `eslint --fix`:

```json
{
    "plugins": [
        "header"
    ],
    "rules": {
        "header/header": [2, "block", [
            {"pattern": " Copyright \\d{4}", "template": " Copyright 2019"}, 
            "My Company"
        ]]
    }
}
```

### Line Endings

The rule works with both unix and windows line endings. For ESLint `--fix`, the rule will use the line ending format of the current operating system (via the node `os` package). This setting can be overwritten as follows:
```json
"rules": {
    "header/header": [2, "block", ["Copyright 2018", "My Company"], {"lineEndings": "windows"}]
}
```
Possible values are `unix` for `\n` and `windows` for `\r\n` line endings.

### Dynamically manipulate the year in the template

When replacing the header, year can be dynamically manipulate and include using these options
```json
"rules": {
    "header/header": [
        2, 
        "block", 
        [{
            "pattern": " Copyright \\d{4}", 
            "template": " Copyright {{year}}"}, "My Company"
        ],
        {
            "templateOptions": {
                "forceEndYear": false,
                "endYear": 2022,
                "endYearPersist": true,
                "startYear": new Date().getFullYear(),
                "startYearPersist": true,
                "yearRange": true,
                "yearRangeValidations": true
            }
        }
    ]
}
```

| Config | Value Type | Description |
|-|-|-|
| forceEndYear | Boolean | `yearRange` has to be `true`. Will add "-YYYY" if the `endYear` is not equal to `startYear`. But if start year and current year is same it will convert to "YYYY" format |
| endYear | String/Number | `yearRange` has to be `true`. Will ignore if the `endYearPersist` is `true`. |
| endYearPersist | Boolean | `yearRange` has to be `true`. Will extract end year from the previous header and replace in the new header. |
| startYear | String /Number| Will ignore if the `startYearPersist` is `true`. E.g., new Date().getFullYear() |
| startYearPersist | Boolean | Will extract start year from the previous header and replace in the new header |
| yearRange | Boolean | If `true` year format will be "YYYY-YYYY" and if `false` year format will be "YYYY" |
| yearRangeValidations | Boolean | If `true` end date will be removed if it lower than start date. `yearRange` has to be `true` |

## Examples

The following examples are all valid.

`"block", "Copyright 2015, My Company"`:

```js
/*Copyright 2015, My Company*/
console.log(1);
```

`"line", ["Copyright 2015", "My Company"]]`:

```js
//Copyright 2015
//My Company
console.log(1)
```

`"line", [{pattern: "^Copyright \\d{4}$"}, {pattern: "^My Company$"}]]`:

```js
//Copyright 2017
//My Company
console.log(1)
```

### With more decoration

```json
"header/header": [2, "block", [
    "************************",
    " * Copyright 2015",
    " * My Company",
    " ************************"
]
```

```js
/*************************
 * Copyright 2015
 * My Company
 *************************/
 console.log(1);
```

## License

MIT
