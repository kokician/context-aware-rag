Context-Window-Aware Retrieval-Augmented Generation (RAG)
Overview

This project implements a context-window-aware Retrieval-Augmented Generation (RAG) system that explicitly assembles an LLM context under hard token constraints.

The objective is not to maximise context length, but to demonstrate deliberate context economics: prioritisation, truncation, and governance of multiple context sources under strict limits.

The system is implemented as a runnable demo (CLI / minimal UI) and is designed to make context-assembly decisions observable and auditable.

Problem Framing

Large Language Models operate within fixed context windows. In practical agentic systems, this window must be shared across multiple competing inputs:

system instructions

user goals

short-term memory

retrieved knowledge

recent tool outputs

This project treats the context window as a first-class constrained resource, rather than an implicit side effect.

Context Structure & Hard Budgets
Section	Token Budget
Instructions	255
Goal (User Query)	1,500
Memory	55
Retrieval	550
Recent Tool Outputs	855

Budgets are enforced independently per section.
Exceeding a budget triggers explicit fallback behaviour, not silent overflow.

System Architecture
High-Level Flow

User input is collected (query, optional memory, optional tool outputs)

The query is vectorised and used for similarity-based retrieval

Each context section is assembled independently

Token usage is estimated per section

Budgets are enforced via truncation or exclusion

Sections are assembled into a final ordered context

Assembly order reflects instruction hierarchy and priority, not token size.

Section-Level Design
Instructions

Source: System-defined prompt

Selection: Always included

Fallback: Truncated to budget

Rationale: Preserves system behaviour and safety guarantees

Goal

Source: User query

Selection: Always included

Fallback: Proportional truncation

Rationale: User intent must remain dominant but bounded

Memory

Source: Short-term conversation memory

Selection: Optional

Fallback: Aggressive truncation

Rationale: Memory is recency-based, not relevance-based

Retrieval

Source: Vector similarity search over a fixed corpus

Selection: Top-K by similarity score

Fallback: Lower-ranked documents excluded when budget is exceeded

Rationale: Retrieval is relevance-based and should displace memory when necessary

Recent Tool Outputs

Source: Prior tool calls

Selection: Included last

Fallback: Truncated first under pressure

Rationale: Tool outputs are useful but lowest priority for grounding

Memory vs Retrieval (Design Distinction)

Memory and retrieval serve different roles and are intentionally separated.

Memory	Retrieval
Recency-based	Relevance-based
Session-scoped	Corpus-scoped
Small fixed budget	Medium fixed budget
Lower priority	Higher priority

Memory never displaces retrieval, ensuring factual grounding is preserved even under tight constraints.

Constraint Handling (Demonstrated)

The system explicitly demonstrates:

retrieval budget overflow with document exclusion

deterministic truncation of oversized sections

per-section token accounting

preservation of instruction hierarchy under pressure

Screenshots illustrating these cases are included.

Worked Example

Inputs

Query: How do transformers work in neural networks?

Memory: Previously discussed: embeddings are vector representations.

Tool Outputs: Retrieved 3 papers on attention mechanisms.

Observed Behaviour

Retrieval selects top-scoring documents until the retrieval budget is exhausted

Lower-ranked documents are excluded and flagged

Tool outputs are truncated after retrieval is preserved

Final context reflects prioritised assembly rather than raw concatenation

Running the Demo
CLI
python app.py

Web UI (if applicable)
pnpm install
pnpm run dev

Design Rationale

This implementation prioritises:

explicit context budgeting

predictable truncation behaviour

auditability of retrieval decisions

separation of concerns between context sources

The system is intentionally simple in its embeddings and token estimation to keep decision logic transparent. These components can be replaced without altering the assembly model.

Extensibility Considerations

The architecture supports future extensions such as:

production-grade embeddings and vector stores

model-aligned tokenizers

section-level governance policies

adaptive budgeting strategies

agent-loop integration

Conclusion

This project demonstrates a deliberate approach to RAG context construction, focusing on constraint management, prioritisation, and explainability rather than model complexity.

The intent is to reflect how real-world agentic systems must reason about limited context under competing demands.