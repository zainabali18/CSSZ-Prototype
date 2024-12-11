module.exports = {
    transform: {
        "^.+\\.jsx?$": "babel-jest", // Use Babel to transform JavaScript files
    },
    testEnvironment: "node", // Use Node.js environment for tests
    testPathIgnorePatterns: ['/node_modules/', '/public/styles/'], // Exclude unnecessary folders
    moduleNameMapper: {
        "^axios$": "axios/dist/node/axios.cjs" // Map axios to CommonJS version
    }
};
