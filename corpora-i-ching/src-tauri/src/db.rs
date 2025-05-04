// src-tauri/src/db.rs

use rusqlite::ffi;
use rusqlite::Connection;
use std::convert::TryInto;
use std::ffi::CString;

/// The raw bytes of your pre-built SQLite DB
const DB_BYTES: &[u8] = include_bytes!("../resources/db.sqlite3");

/// Open an in-memory SQLite DB populated from our embedded bytes.
pub fn open_embedded_db() -> Result<Connection, String> {
    // 1) open an in-memory database
    let conn =
        Connection::open_in_memory().map_err(|e| format!("failed to open in-memory DB: {}", e))?;

    // 2) deserialize the blob into the "main" database
    unsafe {
        let db_handle = conn.handle(); // *mut sqlite3
        let name = CString::new("main").unwrap(); // target DB name
        let ptr = DB_BYTES.as_ptr() as *mut _; // raw pointer
        let len = DB_BYTES.len();

        // Convert usize -> i64 (panic if it doesn't fit, though it always will here)
        let read_bytes: i64 = len.try_into().unwrap();
        let alloc_bytes: i64 = len.try_into().unwrap();

        let rc = ffi::sqlite3_deserialize(
            db_handle,
            name.as_ptr(),
            ptr,
            read_bytes,  // number of bytes to read
            alloc_bytes, // number of bytes to allocate
            ffi::SQLITE_DESERIALIZE_READONLY,
        );
        if rc != ffi::SQLITE_OK {
            return Err(format!("sqlite3_deserialize failed: error code {}", rc));
        }
    }

    Ok(conn)
}
