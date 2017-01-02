eslint-plugin-header
====================

ESLint plugin to ensure that files begin with given comment.

Often you will want to have a copyright notice at the top of every file. This ESLint plugin checks that the first comment in every file has the contents defined in the rule settings.

## Usage

This rule takes 1 or 2 arguments.

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

In the 2 argument form the first must be either `"block"` or `"line"` to indiciate what style of comment should be used. The second is either a string (including newlines) of the comment, or an array of each line of the comment.

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

Instead of a string to be checked for exact matching you can also supply a regular expression (beware that you have to quote backslashes):

```json
{
    "plugins": [
        "header"
    ],
    "rules": {
        "header/header": [2, "block", {"pattern": "^ Copyright \\d{4}\\n My Company$"}]
    }
}
```

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