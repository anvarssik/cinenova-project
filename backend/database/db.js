const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

const dbDir = process.env.RENDER ? '/data' : __dirname;
if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
}
const dbPath = path.join(dbDir, 'project.db');

const db = new sqlite3.Database(dbPath, sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE, (err) => {
    if (err) {
        console.error(err.message);
    } else {
        db.serialize(() => {
            db.run('PRAGMA foreign_keys = ON;');

            const addColumnSafely = (table, column, typeDef) => {
                db.run(`ALTER TABLE ${table} ADD COLUMN ${column} ${typeDef}`, (err) => {
                    if (err && !err.message.includes('duplicate column name')) { }
                });
            };

            addColumnSafely('users', 'avatar_url', "TEXT DEFAULT 'img/avatar1.png'");
            addColumnSafely('users', 'is_private', "INTEGER DEFAULT 0");
            addColumnSafely('tickets', 'movie_title', "TEXT DEFAULT 'Неизвестный фильм'");
        });
    }
});

module.exports = db;