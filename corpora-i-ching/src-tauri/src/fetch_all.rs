// src-tauri/src/fetch_all.rs

use rusqlite::Result;
use tauri::{command, AppHandle};

// Import structs from fetch_hex_data.rs instead of redefining them
use crate::fetch_hex_data::{IChingHexagram, IChingLine};

// use crate::db::open_embedded_db;

// Function to fetch all hexagrams from the database
#[command]
pub async fn fetch_all_hexagrams(_app: AppHandle) -> Result<Vec<IChingHexagram>, String> {
    let conn =
        crate::db::open_embedded_db().map_err(|e| format!("could not open embedded DB: {}", e))?;

    // Fetch all hexagrams from the iching_hexagram table
    let mut stmt = conn
        .prepare(
            "SELECT id, number, name_zh, name_en, name_pinyin, binary, judgment_zh, judgment_en, judgment_es, judgment_pinyin, name_es
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
                name_es: row.get(10)?,
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
