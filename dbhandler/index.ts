import { logger } from "../logger";

const sqlite3 = require('sqlite3').verbose();

const dbpath = "./db.sqlite"

let db = new sqlite3.Database(dbpath, (err: { message: any; }) => {
    if (err) {
        console.error(err.message);
    }
    console.log('Connected to the SQLite database.');
});

export async function addToDB(hash:string, data:string){
    const sql = `INSERT INTO blobpool ('${hash}', '${JSON.stringify(data)}') VALUES (?, ?)`;
    db.run(sql)
}

export default db;