module.exports = {
    "parser": "babel-eslint",
    "parserOptions": {
        "sourceType": "module",
        "ecmaVersion": 8
    },
    "extends": [
        "eslint:recommended",
        "plugin:react/recommended"
    ],
    "env": {
        "browser": true,
        "es6": true
    },
    "rules": {
        "indent": ["error", 4, {
            "SwitchCase": 0
        }],
        "no-trailing-spaces": "error",
        "no-unused-vars": ["warn", {"args": "none"}],
        "space-infix-ops": "error",
        "space-in-parens": ["error", "never"],
        "react/prop-types": "warn"
    }
};