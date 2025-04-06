// src-tauri/src/fetch_all.rs

use rusqlite::{Connection, Result};
use sha2::{Digest, Sha256};
use std::fs;
use tauri::{command, AppHandle, Manager}; // Add Manager import

// Import structs from fetch_hex_data.rs instead of redefining them
use crate::fetch_hex_data::{IChingHexagram, IChingLine};

// Function to fetch all hexagrams from the database
#[command]
pub async fn fetch_all_hexagrams(app: AppHandle) -> Result<Vec<IChingHexagram>, String> {
    // Resolve the database path using the same logic as fetch_hexagram_data
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

    // Open the database connection
    let conn = Connection::open(&db_path_str).map_err(|e| e.to_string())?;

    // Fetch all hexagrams from the iching_hexagram table
    let mut stmt = conn
        .prepare(
            "SELECT id, number, name_zh, name_en, name_pinyin, binary, judgment_zh, judgment_en, judgment_es, judgment_pinyin
             FROM iching_hexagram",
        )
        .map_err(|e| e.to_string())?;

    let hexagram_iter = stmt
        .query_map([], |row| {
            Ok(IChingHexagram {
                id: row.get(0)?,
                number: row.get(1)?,
                name_zh: row.get(2)?,
                name_en: row.get(3)?,
                name_pinyin: row.get(4)?,
                binary: row.get(5)?,
                judgment_zh: row.get(6)?,
                judgment_en: row.get(7)?,
                judgment_es: row.get(8)?,
                judgment_pinyin: row.get(9)?,
                changing_lines: Vec::new(), // We'll fetch these next
            })
        })
        .map_err(|e| e.to_string())?;

    let mut hexagrams: Vec<IChingHexagram> = hexagram_iter
        .collect::<Result<Vec<_>, _>>()
        .map_err(|e| e.to_string())?;

    // Fetch changing lines for each hexagram
    for hexagram in &mut hexagrams {
        let mut line_stmt = conn
            .prepare(
                "SELECT line_number, text_zh, text_en, text_es, text_pinyin
                 FROM iching_line
                 WHERE hexagram_id = ?
                 ORDER BY line_number ASC",
            )
            .map_err(|e| e.to_string())?;

        let lines = line_stmt
            .query_map([hexagram.id], |row| {
                Ok(IChingLine {
                    line_number: row.get(0)?,
                    text_zh: row.get(1)?,
                    text_en: row.get(2)?,
                    text_es: row.get(3)?,
                    text_pinyin: row.get(4)?,
                })
            })
            .map_err(|e| e.to_string())?
            .collect::<Result<Vec<_>, _>>()
            .map_err(|e| e.to_string())?;

        hexagram.changing_lines = lines;
    }

    Ok(hexagrams)
}
