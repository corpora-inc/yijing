use rusqlite::{params, Connection, Result};
use serde::Serialize;
use tauri::AppHandle;

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
    pub name_es: String,
    pub name_pinyin: String,
    pub binary: String,
    pub judgment_zh: String,
    pub judgment_en: String,
    pub judgment_es: String,
    pub judgment_pinyin: String,
    pub changing_lines: Vec<IChingLine>,
}

/// Query the database by the binary representation of the hexagram.
pub fn get_hexagram_by_binary(conn: Connection, bin: &str) -> Result<IChingHexagram> {
    let hexagram = conn.query_row(
        "SELECT id, number, name_zh, name_pinyin, binary, judgment_zh, judgment_en, judgment_es, name_en, judgment_pinyin, name_es
         FROM iching_hexagram
         WHERE binary = ?1",
        params![bin],
        |row: &rusqlite::Row<'_>| {
            Ok(IChingHexagram {
                id: row.get(0)?,
                number: row.get(1)?,
                name_zh: row.get(2)?,
                name_pinyin: row.get(3)?,
                binary: row.get(4)?,
                judgment_zh: row.get(5)?,
                judgment_en: row.get(6)?,
                judgment_es: row.get(7)?,
                name_en: row.get(8)?,
                judgment_pinyin: row.get(9)?,
                name_es: row.get(10)?,
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
pub async fn fetch_hexagram_data(bin: String, _app: AppHandle) -> Result<IChingHexagram, String> {
    let conn =
        crate::db::open_embedded_db().map_err(|e| format!("could not open embedded DB: {}", e))?;

    get_hexagram_by_binary(conn, &bin).map_err(|err| format!("Database error: {:?}", err))
}
