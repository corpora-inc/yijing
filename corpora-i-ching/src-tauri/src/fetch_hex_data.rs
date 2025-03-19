use rusqlite::{params, Connection, Result};
use serde::Serialize;
use sha2::{Digest, Sha256};
use std::fs;
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
    pub name_zh: String,
    pub name_en: String,
    pub pinyin: String,
    pub binary: String,
    pub judgment_zh: String,
    pub judgment_en: String,
    pub judgment_es: String,
    pub judgment_pinyin: String,
    pub changing_lines: Vec<IChingLine>,
}

/// Query the database by the binary representation of the hexagram.
pub fn get_hexagram_by_binary(db_path: &str, bin: &str) -> Result<IChingHexagram> {
    let conn: Connection = Connection::open(db_path)?;
    let hexagram = conn.query_row(
        "SELECT id, number, name_zh, pinyin, binary, judgment_zh, judgment_en, judgment_es, name_en, judgment_pinyin
         FROM iching_hexagram
         WHERE binary = ?1",
        params![bin],
        |row: &rusqlite::Row<'_>| {
            Ok(IChingHexagram {
                id: row.get(0)?,
                number: row.get(1)?,
                name_zh: row.get(2)?,
                pinyin: row.get(3)?,
                binary: row.get(4)?,
                judgment_zh: row.get(5)?,
                judgment_en: row.get(6)?,
                judgment_es: row.get(7)?,
                name_en: row.get(8)?,
                judgment_pinyin: row.get(9)?,
                changing_lines: Vec::new(),
            })
        },
    )?;

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

    Ok(IChingHexagram {
        changing_lines,
        ..hexagram
    })
}

#[tauri::command]
pub async fn fetch_hexagram_data(bin: String, app: AppHandle) -> Result<IChingHexagram, String> {
    let resource_path = app
        .path()
        .resource_dir()
        .map_err(|e| format!("Failed to get resource directory: {}", e))?
        .join("resources/db.sqlite3");
    println!("Resolved resource path: {}", resource_path.display());

    let db_path_str = if resource_path.to_string_lossy().starts_with("asset://") {
        let data_dir = app
            .path()
            .app_data_dir()
            .map_err(|e| format!("Failed to get app data dir: {}", e))?;
        let db_path = data_dir.join("db.sqlite3");
        let db_bytes = include_bytes!("../resources/db.sqlite3"); // From src-tauri/src/
        let embedded_hash = {
            let mut hasher = Sha256::new();
            hasher.update(db_bytes);
            format!("{:x}", hasher.finalize())
        };
        let should_overwrite = if db_path.exists() {
            let disk_bytes =
                fs::read(&db_path).map_err(|e| format!("Failed to read existing DB: {}", e))?;
            let disk_hash = {
                let mut hasher = Sha256::new();
                hasher.update(&disk_bytes);
                format!("{:x}", hasher.finalize())
            };
            embedded_hash != disk_hash
        } else {
            true
        };
        if should_overwrite {
            println!(
                "DB at {} missing or outdated (embedded hash: {}, disk hash: {}), embedding from binary",
                db_path.display(),
                embedded_hash,
                if db_path.exists() {
                    let disk_bytes = fs::read(&db_path).unwrap();
                    let mut hasher = Sha256::new();
                    hasher.update(&disk_bytes);
                    format!("{:x}", hasher.finalize())
                } else {
                    "none".to_string()
                }
            );
            fs::create_dir_all(&data_dir)
                .map_err(|e| format!("Failed to create data dir: {}", e))?;
            fs::write(&db_path, db_bytes).map_err(|e| format!("Failed to write DB: {}", e))?;
            println!("Embedded DB to: {}", db_path.display());
        } else {
            println!("DB already exists and matches at: {}", db_path.display());
        }
        db_path.to_string_lossy().to_string()
    } else {
        if !resource_path.exists() {
            return Err(format!("DB file not found at: {}", resource_path.display()));
        }
        resource_path.to_string_lossy().to_string()
    };

    println!("Using DB at: {}", db_path_str);
    get_hexagram_by_binary(&db_path_str, &bin).map_err(|err| format!("Database error: {:?}", err))
}
