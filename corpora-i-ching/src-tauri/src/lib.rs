mod fetch_hex_data;

use crate::fetch_hex_data::fetch_hexagram_data;
use getrandom;
use serde::Serialize;

#[derive(Debug, Clone, Copy)]
pub enum Line {
    StableYin,
    StableYang,
    ChangingYin,
    ChangingYang,
}

#[derive(Serialize)]
pub struct Hexs {
    pub original: Vec<String>,
    pub transformed: Option<Vec<String>>,
    pub binary: String, // Expose the binary representation for database lookup.
}

/// Generates a random boolean with the given probability (0.0 to 1.0).
fn custom_gen_bool(prob: f64) -> Result<bool, anyhow::Error> {
    let mut buf: [u8; 4] = [0u8; 4];
    getrandom::fill(&mut buf).map_err(|e: getrandom::Error| {
        anyhow::anyhow!("Failed to generate random bytes: {:?}", e)
    })?;
    let x: u32 = u32::from_ne_bytes(buf);
    let threshold: f64 = (u32::MAX as f64) * prob;
    Ok(x < threshold as u32)
}

/// Toss three coins to determine one line.
fn toss() -> Result<Line, anyhow::Error> {
    let tosses: [bool; 3] = [
        custom_gen_bool(0.5)?,
        custom_gen_bool(0.5)?,
        custom_gen_bool(0.5)?,
    ];
    let sum: u8 = tosses.iter().map(|&coin| if coin { 3 } else { 2 }).sum();

    let line = match sum {
        6 => Line::StableYin,
        7 => Line::StableYang,
        8 => Line::ChangingYin,
        9 => Line::ChangingYang,
        _ => {
            return Err(anyhow::anyhow!(
                "Invalid sum encountered: {} in {} at line {}",
                sum,
                file!(),
                line!()
            ))
        }
    };
    Ok(line)
}

/// Assign a binary digit to each line.
/// Yang (stable or changing) -> '1', Yin (stable or changing) -> '0'.
/// Returns a 6-character string (with the bottom line as the least-significant digit).
pub fn assign_bin(lines: &[Line]) -> String {
    lines
        .iter()
        .map(|line: &Line| match line {
            Line::StableYang | Line::ChangingYang => '1',
            Line::StableYin | Line::ChangingYin => '0',
        })
        .rev()
        .collect()
}

/// Transforms a changing line into its stable counterpart.
/// Stable lines are returned unchanged.
fn transform(line: &Line) -> Line {
    match line {
        Line::ChangingYin => Line::StableYang,
        Line::ChangingYang => Line::StableYin,
        Line::StableYin => Line::StableYin,
        Line::StableYang => Line::StableYang,
    }
}

#[tauri::command]
fn build() -> Result<Hexs, String> {
    // Generate the original hexagram by calling toss() six times.
    let original_hex: Vec<Line> = (0..6)
        .map(|_| toss())
        .collect::<Result<Vec<_>, _>>()
        .map_err(|err: anyhow::Error| format!("Failed to generate hexagram lines: {:#?}", err))?;

    // --- Compute and log the binary for the original hexagram ---
    let original_bin: String = assign_bin(&original_hex);
    println!(
        "Original hexagram lines in binary (bottom to top): {}",
        original_bin
    );

    // Check if there are any changing lines.
    let has_changes: bool = original_hex
        .iter()
        .any(|line: &Line| matches!(line, Line::ChangingYin | Line::ChangingYang));

    // Convert each line in the original hexagram to its descriptive string.
    let original_lines: Vec<String> = original_hex
        .iter()
        .map(|line: &Line| match line {
            Line::StableYin => "——— ——— 8".to_string(),
            Line::StableYang => "——————— 7".to_string(),
            Line::ChangingYin => "———O——— 6".to_string(),
            Line::ChangingYang => "———X——— 9".to_string(),
        })
        .collect();

    // If there are changing lines, transform them and log the binary of the transformed hexagram.
    let transformed_lines: Option<Vec<String>> = if has_changes {
        // Convert the changing lines to stable lines.
        let stable_lines: Vec<Line> = original_hex
            .iter()
            .map(|line: &Line| transform(line))
            .collect();

        // --- Log the binary for the transformed hexagram ---
        let transformed_bin: String = assign_bin(&stable_lines);
        println!(
            "Transformed hexagram lines in binary (bottom to top): {}",
            transformed_bin
        );

        // Convert stable lines to their descriptive strings.
        Some(
            stable_lines
                .iter()
                .map(|line: &Line| match line {
                    Line::StableYin => "——— ——— 8".to_string(),
                    Line::StableYang => "——————— 7".to_string(),
                    _ => unreachable!("Transformed hexagram should only contain stable lines"),
                })
                .collect(),
        )
    } else {
        None
    };

    // Return the Hexs struct including the computed binary string.
    Ok(Hexs {
        original: original_lines,
        transformed: transformed_lines,
        binary: original_bin,
    })
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![build, fetch_hexagram_data])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
