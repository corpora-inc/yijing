use getrandom;
use serde::Serialize;
use tauri::command;

/// Represents one of the four possible lines in the I Ching.
#[derive(Debug, Clone, Copy)]
enum Line {
    StableYin,
    StableYang,
    ChangingYin,
    ChangingYang,
}

/// The structure returned by the command.
/// The `transformed` field is an `Option` so that when there are no changing lines,
/// no transformed hexagram is provided.
#[derive(Serialize)]
pub struct Hexs {
    pub original: Vec<String>,
    pub transformed: Option<Vec<String>>,
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

/// Generates a random boolean with the given probability (0.0 to 1.0).
fn custom_gen_bool(prob: f64) -> bool {
    let mut buf: [u8; 4] = [0u8; 4];
    getrandom::fill(&mut buf).expect("failed to get random bytes");
    let x: u32 = u32::from_ne_bytes(buf);
    let threshold: f64 = (u32::MAX as f64) * prob;
    x < threshold as u32
}

/// Toss three coins to determine one line.
/// Each toss uses a 50/50 chance; heads counts as 3, tails as 2.
fn toss() -> Line {
    let tosses: [bool; 3] = [
        custom_gen_bool(0.5),
        custom_gen_bool(0.5),
        custom_gen_bool(0.5),
    ];
    let sum: u8 = tosses.iter().map(|&coin| if coin { 3 } else { 2 }).sum();

    match sum {
        6 => Line::StableYin,
        7 => Line::StableYang,
        8 => Line::ChangingYin,
        9 => Line::ChangingYang,
        _ => unreachable!("Invalid sum: {}", sum),
    }
}

/// The Tauri command that generates the hexagrams.
/// If the original hexagram contains any changing lines, a transformed hexagram is created;
/// otherwise, the `transformed` field is `None`.
#[command]
fn build() -> Hexs {
    // Generate the original hexagram.
    let original_hex: Vec<Line> = (0..6).map(|_| toss()).collect();

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

    // Only generate a transformed hexagram if there are changing lines.
    let transformed_lines: Option<Vec<String>> = if has_changes {
        Some(
            original_hex
                .iter()
                .map(|line: &Line| {
                    let stable_line: Line = transform(line);
                    match stable_line {
                        Line::StableYin => "——— ——— 8".to_string(),
                        Line::StableYang => "——————— 7".to_string(),
                        _ => unreachable!("Transformed hexagram should only contain stable lines"),
                    }
                })
                .collect(),
        )
    } else {
        None
    };

    Hexs {
        original: original_lines,
        transformed: transformed_lines,
    }
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![build])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
