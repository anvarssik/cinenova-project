const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'project.db');
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error(err.message);
    } else {
        console.log('Connected to project.db');
    }
});

db.run('PRAGMA foreign_keys = ON;');

module.exports = db;