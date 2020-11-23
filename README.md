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

### Vue support

`eslint-plugin-header` now supports `.vue` files. Please see installation instructions for [eslint-plugin-vue](https://eslint.vuejs.org/user-guide/) before trying to integrate with `eslint-plugin-header`. There are some caveats to be aware of:
* `<script>` tag must be defined within a `.vue` file (even if it is empty), otherwise the linter will crash.
* `<script>` tag must be defined at the top of a `.vue` file, otherwise the linter won't realize the comment is in the file and will inject it multiple times.

## Examples

The following rules are all valid.

`"header/header": [2, "block", "Copyright 2015, My Company"]`:

```js
/*Copyright 2015, My Company*/
console.log(1);
```

`"header/header": [2, "line", ["Copyright 2015", "My Company"]]`:

```js
//Copyright 2015
//My Company
console.log(1);
```

`"header/header": [2, "line", [{pattern: "^Copyright \\d{4}$"}, {pattern: "^My Company$"}]]`:

```js
//Copyright 2017
//My Company
console.log(1);
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

### With Vue support

`"header/header": [2, "block", "Copyright 2015, My Company"]`:

```vue
<script>
/*Copyright 2015, My Company*/
console.log(1);
</script>
```

`"header/header": [2, "line", ["Copyright 2015", "My Company"]]`:

```vue
<script>
//Copyright 2015
//My Company
console.log(1);
</script>
```


## License

MIT
