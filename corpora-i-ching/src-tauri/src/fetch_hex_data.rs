use rusqlite::{params, Connection, Result};
use serde::Serialize;
use tauri::{AppHandle, Manager};

#[derive(Serialize)]
pub struct IChingHexagram {
    pub id: i32,
    pub number: u32,
    pub chinese_name: String,
    pub pinyin: String,
    pub binary: String,
    pub judgment_zh: String,
    pub judgment_en: String,
    pub judgment_es: String,
    pub english_name: String,
}

/// Query the database by the binary representation of the hexagram.
pub fn get_hexagram_by_binary(db_path: &str, bin: &str) -> Result<IChingHexagram> {
    let conn = Connection::open(db_path)?;
    conn.query_row(
        "SELECT id, number, chinese_name, pinyin, binary, judgment_zh, judgment_en, judgment_es, english_name
         FROM iching_hexagram
         WHERE binary = ?1",
        params![bin],
        |row| {
            Ok(IChingHexagram {
                id: row.get(0)?,
                number: row.get(1)?,
                chinese_name: row.get(2)?,
                pinyin: row.get(3)?,
                binary: row.get(4)?,
                judgment_zh: row.get(5)?,
                judgment_en: row.get(6)?,
                judgment_es: row.get(7)?,
                english_name: row.get(8)?,
            })
        },
    )
}

#[tauri::command]
pub fn fetch_hexagram_data(bin: String, app: AppHandle) -> Result<IChingHexagram, String> {
    let db_path = app
        .path()
        .resolve("resources/db.sqlite3", tauri::path::BaseDirectory::Resource)
        .map_err(|e| format!("Failed to resolve database path: {}", e))?;

    // Log the resolved path for debugging
    println!("Resolved database path: {}", db_path.display());

    // Check if the file exists, and panic if it doesn’t (for dev-time clarity)
    if !db_path.exists() {
        panic!("Database file not found at: {}", db_path.display());
    }

    get_hexagram_by_binary(&db_path.to_string_lossy(), &bin).map_err(|err| {
        format!(
            "Database error: {:#?}\nOccurred in file '{}' at line {}",
            err,
            file!(),
            line!()
        )
    })
}
