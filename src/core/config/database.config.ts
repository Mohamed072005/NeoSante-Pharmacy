export default () => ({
    mongoURI: process.env.DB_URI || 'mongodb://localhost:27017/neosante-pharmacy',
})