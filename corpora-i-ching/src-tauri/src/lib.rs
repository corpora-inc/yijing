mod fetch_hex_data;

use crate::fetch_hex_data::fetch_hexagram_data;
use getrandom;
use serde::Serialize;
use tauri_plugin_log::{Builder as LogBuilder, Target, TargetKind};

#[derive(Debug, Clone, Copy)]
pub enum Line {
    OldYin,    // 6
    YoungYang, // 7
    YoungYin,  // 8
    OldYang,   // 9
}

/// Represents a hexagram with a compact consultation code and binary data.
#[derive(Serialize)]
pub struct Hexs {
    pub consultation_code: String, // 6-digit code (666666 to 999999)
    pub binary: String,            // Original binary (0s and 1s)
    pub transformed_binary: Option<String>, // Optional transformed binary
}

/// Simulates a coin toss (3 for heads, 2 for tails).
fn toss_coin() -> Result<u8, anyhow::Error> {
    let mut buf: [u8; 1] = [0u8; 1];
    getrandom::fill(&mut buf)
        .map_err(|e| anyhow::anyhow!("Failed to generate random byte: {:?}", e))?;
    Ok(if buf[0] % 2 == 0 { 2 } else { 3 }) // 50% chance for 2 or 3
}

/// Generates a line based on three coin tosses with I Ching probabilities.
fn toss_line() -> Result<Line, anyhow::Error> {
    let tosses: [u8; 3] = [toss_coin()?, toss_coin()?, toss_coin()?];
    let sum: u8 = tosses.iter().sum();

    match sum {
        6 => Ok(Line::OldYin),    // 2+2+2 = 6 (12.5%)
        7 => Ok(Line::YoungYang), // 2+2+3 or similar (37.5%)
        8 => Ok(Line::YoungYin),  // 3+3+2 or similar (37.5%)
        9 => Ok(Line::OldYang),   // 3+3+3 = 9 (12.5%)
        _ => Err(anyhow::anyhow!("Invalid sum: {}", sum)),
    }
}

/// Generates a 6-digit consultation code from bottom to top.
fn generate_consultation_code() -> Result<String, anyhow::Error> {
    let lines: Vec<Line> = (0..6).map(|_| toss_line()).collect::<Result<Vec<_>, _>>()?;
    Ok(lines
        .iter()
        .map(|line| match line {
            Line::OldYin => '6',
            Line::YoungYang => '7',
            Line::YoungYin => '8',
            Line::OldYang => '9',
        })
        .collect())
}

/// Derives the original binary from the consultation code (bottom to top).
fn original_binary(code: &str) -> String {
    code.chars()
        .map(|digit| match digit {
            '6' => '0', // Old Yin → Yin (0)
            '7' => '1', // Young Yang → Yang (1)
            '8' => '0', // Young Yin → Yin (0)
            '9' => '1', // Old Yang → Yang (1)
            _ => unreachable!(),
        })
        .collect()
}

/// Derives the transformed binary from the consultation code (bottom to top).
fn transformed_binary(code: &str) -> String {
    code.chars()
        .map(|digit| match digit {
            '6' => '1', // Old Yin → Yang (1)
            '7' => '1', // Young Yang → Yang (1)
            '8' => '0', // Young Yin → Yin (0)
            '9' => '0', // Old Yang → Yin (0)
            _ => unreachable!(),
        })
        .collect()
}

/// Generates a new random reading.
#[tauri::command]
fn generate_reading() -> Result<Hexs, String> {
    // Generate the consultation code (6 digits, 6-9).
    let consultation_code = generate_consultation_code().map_err(|e| e.to_string())?;

    // Derive the original binary.
    let original_bin = original_binary(&consultation_code);
    println!(
        "Consultation code: {}, binary: {}",
        consultation_code, original_bin
    );

    // Derive the transformed binary if there are changing lines.
    let transformed_bin = if consultation_code.contains('6') || consultation_code.contains('9') {
        let transformed = transformed_binary(&consultation_code);
        println!("Transformed binary: {}", transformed);
        Some(transformed)
    } else {
        None
    };

    Ok(Hexs {
        consultation_code,
        binary: original_bin,
        transformed_binary: transformed_bin,
    })
}

/// Rehydrates a reading from a given consultation_code.
#[tauri::command]
fn rehydrate_reading(consultation_code: String) -> Result<Hexs, String> {
    // Validate the consultation_code length and characters
    if consultation_code.len() != 6 || !consultation_code.chars().all(|c| c >= '6' && c <= '9') {
        return Err("Invalid consultation code: must be 6 digits (6-9)".to_string());
    }

    // Derive the original binary.
    let original_bin = original_binary(&consultation_code);
    println!(
        "Rehydrated consultation code: {}, binary: {}",
        consultation_code, original_bin
    );

    // Derive the transformed binary if there are changing lines.
    let transformed_bin = if consultation_code.contains('6') || consultation_code.contains('9') {
        let transformed = transformed_binary(&consultation_code);
        println!("Rehydrated transformed binary: {}", transformed);
        Some(transformed)
    } else {
        None
    };

    Ok(Hexs {
        consultation_code,
        binary: original_bin,
        transformed_binary: transformed_bin,
    })
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(
            LogBuilder::new()
                .targets([Target::new(TargetKind::Stdout)]) // Only stdout for now
                .level(log::LevelFilter::Info) // Match the frontend 'info' level
                .build(),
        )
        .invoke_handler(tauri::generate_handler![
            generate_reading,
            rehydrate_reading,
            fetch_hexagram_data
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
