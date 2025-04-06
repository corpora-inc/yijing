// src/fetch_consultation_interpretation.rs
use rusqlite::{params, Connection, Result};
use serde::Serialize;
use sha2::{Digest, Sha256};
use std::fs;
use tauri::{AppHandle, Manager};

#[derive(Serialize)]
pub struct ConsultationInterpretation {
    pub text: String,
    pub attribution: String,
}

/// Fetches the consultation interpretation for a given consultation code from the database.
pub fn fetch_consultation_interpretation(
    app: AppHandle,
    consultation_code: &str,
) -> Result<Option<ConsultationInterpretation>, String> {
    // Resolve the database path using the same logic as fetch_hexagram_data and fetch_all
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
    let conn =
        Connection::open(&db_path_str).map_err(|e| format!("Failed to open database: {}", e))?;

    // Query the database
    let mut stmt = conn
        .prepare(
            "SELECT ci.text, ci.attribution
             FROM iching_consultationinterpretation ci
             JOIN iching_consultation c ON ci.consultation_id = c.id
             WHERE c.compact_representation = ?1",
        )
        .map_err(|e| format!("Failed to prepare statement: {}", e))?;

    let mut rows = stmt
        .query(params![consultation_code])
        .map_err(|e| format!("Failed to query database: {}", e))?;

    if let Some(row) = rows
        .next()
        .map_err(|e| format!("Failed to fetch row: {}", e))?
    {
        Ok(Some(ConsultationInterpretation {
            text: row
                .get(0)
                .map_err(|e| format!("Failed to get text: {}", e))?,
            attribution: row
                .get(1)
                .map_err(|e| format!("Failed to get attribution: {}", e))?,
        }))
    } else {
        Ok(None)
    }
}

#[tauri::command]
pub async fn fetch_interpretation(
    app: AppHandle,
    consultation_code: String,
) -> Result<Option<ConsultationInterpretation>, String> {
    fetch_consultation_interpretation(app, &consultation_code)
}
