module.exports = {
    env: {
        browser: true,
        node: true,
    },
    extends: ['eslint:recommended'],
    parser: 'babel-eslint',
    parserOptions: {
        ecmaVersion: 8,
        sourceType: "module"
    },
    rules: {
        'comma-dangle': 0,
        'no-underscore-dangle': 0,
        'no-param-reassign': 0,
        'no-plusplus': 0,
        'no-func-assign': 0,
        'no-use-before-define': 0,
        'func-names': 0,
    },
};
