const express = require('express');
const apiRoutes = require('./routes/api');

const app = express();
const PORT = 3000;

app.use('/api', apiRoutes);

app.get('/', (req, res) => {
    res.send('Server is running');
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});