use getrandom;
use tauri::command;

/// Represents one of the four possible lines in the I Ching.
#[derive(Debug)]
enum Line {
    StableYin,
    StableYang,
    ChangingYin,
    ChangingYang,
}

/// Generates a random boolean with the given probability (0.0 to 1.0).
fn custom_gen_bool(prob: f64) -> bool {
    // Get 4 random bytes.
    let mut buf = [0u8; 4];
    // This call uses the OS random source directly.
    // getrandom(&mut buf).expect("failed to get random bytes");
    getrandom::fill(&mut buf).expect("failed to get random bytes");
    let x = u32::from_ne_bytes(buf);
    // Compare x with a threshold based on the maximum u32 value.
    let threshold = (u32::MAX as f64) * prob;
    x < threshold as u32
}

/// Toss three coins to determine one line.
/// Each toss uses a 50/50 chance; heads counts as 3, tails as 2.
fn toss() -> Line {
    let tosses = [
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

#[command]
fn build() -> Vec<String> {
    // Generate 6 lines for the hexagram.
    let hexagram = (0..6).map(|_| toss()).collect::<Vec<Line>>();

    // Convert each line to its descriptive string.
    hexagram
        .into_iter()
        .map(|line| match line {
            Line::StableYin => "———O——— 6".to_string(),
            Line::StableYang => "——————— 7".to_string(),
            Line::ChangingYin => "——— ——— 8".to_string(),
            Line::ChangingYang => "———X——— 9".to_string(),
        })
        .collect()
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![build])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
