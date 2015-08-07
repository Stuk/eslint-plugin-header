eslint-plugin-header
====================

ESLint plugin to ensure that files begin with given comment.

Often you will want to have a copyright notice at the top of every file. This ESLint plugin checks that the first comment in every file has the contents defined in the rule settings.

## Usage

This rule takes 2 arguments, the first must be either `"block"` or `"line"` to indiciate what style of comment should be used. The second is either a string (including newlines) of the comment, or an array of each line of the comment.

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