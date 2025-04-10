use candle_core::{Device, Tensor};
use candle_transformers::generation::LogitsProcessor;
use candle_transformers::models::llama::{Llama, LlamaConfig};
use std::path::Path;
use tokenizers::Tokenizer;

// State struct to hold the LLM and tokenizer
pub struct LlmState {
    model: Llama,
    tokenizer: Tokenizer,
    logits_processor: LogitsProcessor,
}

impl LlmState {
    pub fn new(model_path: &str, tokenizer_path: &str) -> anyhow::Result<Self> {
        // Load the tokenizer
        let tokenizer = Tokenizer::from_file(tokenizer_path).map_err(|e| anyhow::anyhow!(e))?;

        // Load the model configuration (you may need to adjust based on the model)
        let config = LlamaConfig::default();
        let device = Device::Cpu; // Use CPU for the PoC
        let model = Llama::load_from_safetensors(model_path, &config, &device)?;

        // Initialize the logits processor for sampling
        let logits_processor = LogitsProcessor::new(42, Some(0.7), Some(0.9)); // Seed, temp, top-p

        Ok(Self {
            model,
            tokenizer,
            logits_processor,
        })
    }

    pub fn generate(
        &mut self,
        prompt: &str,
        max_tokens: usize,
        sender: tauri::ipc::Channel<String>,
    ) -> anyhow::Result<()> {
        // Tokenize the input prompt
        let encoding = self
            .tokenizer
            .encode(prompt, true)
            .map_err(|e| anyhow::anyhow!(e))?;
        let mut tokens = encoding.get_ids().to_vec();

        // Generate tokens one at a time and stream to the frontend
        for _ in 0..max_tokens {
            let input = Tensor::new(&tokens, &self.model.device())?.unsqueeze(0)?;
            let logits = self.model.forward(&input)?;
            let logits = logits.squeeze(0)?;
            let next_token = self.logits_processor.sample(&logits)?;

            tokens.push(next_token);

            // Decode the token to text
            let decoded = self
                .tokenizer
                .decode(&[next_token], true)
                .map_err(|e| anyhow::anyhow!(e))?;

            // Stream the token to the frontend
            sender.send(decoded)?;

            // Check for EOS token (adjust based on your model's EOS token ID)
            if next_token == self.tokenizer.token_to_id("</s>").unwrap_or(2) {
                break;
            }
        }

        Ok(())
    }
}
