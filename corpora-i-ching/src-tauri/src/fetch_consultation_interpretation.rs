// src/fetch_consultation_interpretation.rs
use rusqlite::{params, Result};
use serde::Serialize;
use tauri::AppHandle;

#[derive(Serialize)]
pub struct ConsultationInterpretation {
    pub text: String,
    pub attribution: String,
}

/// Fetches the consultation interpretation for a given consultation code from the database.
pub fn fetch_consultation_interpretation(
    _app: AppHandle,
    consultation_code: &str,
) -> Result<Option<ConsultationInterpretation>, String> {
    let conn =
        crate::db::open_embedded_db().map_err(|e| format!("could not open embedded DB: {}", e))?;

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
