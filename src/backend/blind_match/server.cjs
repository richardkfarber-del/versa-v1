const express = require('express');
const app = express();
const matchRoutes = require('./routes/routes.cjs');

app.use(express.json());
app.use('/api', matchRoutes);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Blind Match Engine running on http://localhost:${PORT}`);
});
