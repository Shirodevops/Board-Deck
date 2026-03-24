EXECUTION PIPELINE:

1. Run strategy_agent with strategy.json + context.md
2. Run data_agent with metrics.json
3. Run analysis_agent with outputs from (1) and (2)
4. Run content_agent with outputs from (1) and (3)
5. Run visualization_agent with outputs from (2) and (4)
6. Run qa_agent with all outputs

FINAL OUTPUT:
- slides.json
- visuals.json
- final_deck.md (assembled board presentation)