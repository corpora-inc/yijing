use rusqlite::{params, Connection, Result};
use serde::Serialize;
use tauri::{AppHandle, Manager};

#[derive(Serialize)]
pub struct IChingLine {
    pub line_number: u32,
    pub text_zh: String,
    pub text_en: String,
    pub text_es: String,
    pub text_pinyin: String,
}

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
    pub judgment_pinyin: String,
    pub english_name: String,
    pub changing_lines: Vec<IChingLine>,
}

/// Query the database by the binary representation of the hexagram.
pub fn get_hexagram_by_binary(db_path: &str, bin: &str) -> Result<IChingHexagram> {
    let conn: Connection = Connection::open(db_path)?;
    // Fetch the hexagram data from the iching_hexagram table.
    let hexagram = conn.query_row(
        "SELECT id, number, chinese_name, pinyin, binary, judgment_zh, judgment_en, judgment_es, english_name, judgment_pinyin
         FROM iching_hexagram
         WHERE binary = ?1",
        params![bin],
        |row: &rusqlite::Row<'_>| {
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
                judgment_pinyin: row.get(9)?,
                // Initialize with an empty vector; we will fill this in below.
                changing_lines: Vec::new(),
            })
        },
    )?;

    // Fetch the associated line texts from the iching_line table.
    let mut stmt: rusqlite::Statement<'_> = conn.prepare(
        "SELECT line_number, text_zh, text_en, text_es, text_pinyin
         FROM iching_line
         WHERE hexagram_id = ?1
         ORDER BY line_number ASC",
    )?;
    let line_iter = stmt.query_map(params![hexagram.id], |row| {
        Ok(IChingLine {
            line_number: row.get(0)?,
            text_zh: row.get(1)?,
            text_en: row.get(2)?,
            text_es: row.get(3)?,
            text_pinyin: row.get(4)?,
        })
    })?;

    let mut changing_lines: Vec<_> = Vec::new();
    for line_result in line_iter {
        changing_lines.push(line_result?);
    }

    // Return the hexagram with its line data.
    Ok(IChingHexagram {
        changing_lines,
        ..hexagram
    })
}

#[tauri::command]
pub fn fetch_hexagram_data(bin: String, app: AppHandle) -> Result<IChingHexagram, String> {
    let db_path: std::path::PathBuf = app
        .path()
        .resolve("resources/db.sqlite3", tauri::path::BaseDirectory::Resource)
        .map_err(|e: tauri::Error| format!("Failed to resolve database path: {}", e))?;

    // Log the resolved path for debugging
    println!("Resolved database path: {}", db_path.display());

    // Check if the file exists, and panic if it doesn’t (for dev-time clarity)
    if !db_path.exists() {
        panic!("Database file not found at: {}", db_path.display());
    }

    get_hexagram_by_binary(&db_path.to_string_lossy(), &bin).map_err(|err: rusqlite::Error| {
        format!(
            "Database error: {:#?}\nOccurred in file '{}' at line {}",
            err,
            file!(),
            line!()
        )
    })
}
