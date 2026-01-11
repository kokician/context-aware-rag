from budgets import BUDGETS
from models import Section, AssembleResult, RetrievedDoc
from tokenizer import estimate_tokens
from retrieval import retrieve


def truncate(text: str, max_tokens: int) -> tuple[str, bool]:
    tokens = estimate_tokens(text)
    if tokens <= max_tokens:
        return text, False

    ratio = max_tokens / tokens
    return text[: int(len(text) * ratio)], True


def assemble_context(
    query: str,
    memory: str,
    tool_outputs: str,
) -> AssembleResult:
    sections = {
        "instructions": Section(
            content="You are a helpful AI assistant. Follow system instructions strictly.",
            source="System",
            priority=1,
        ),
        "goal": Section(
            content=query,
            source="User Query",
            priority=2,
        ),
        "memory": Section(
            content=memory,
            source="Conversation Memory",
            priority=3,
        ),
        "retrieval": Section(
            content="",
            source="Vector DB",
            priority=4,
        ),
        "toolOutputs": Section(
            content=tool_outputs,
            source="Tool Outputs",
            priority=5,
        ),
    }

    # Truncate fixed sections
    for key in ["instructions", "goal", "memory", "toolOutputs"]:
        content, truncated = truncate(sections[key].content, BUDGETS[key])
        sections[key].content = content
        sections[key].truncated = truncated
        sections[key].budget_used = estimate_tokens(content)

    # Retrieval section
    retrieved_docs = retrieve(query)
    used_tokens = 0
    retrieval_text = ""
    meta: list[RetrievedDoc] = []

    for doc in retrieved_docs:
        block = f"[{doc.id.upper()}] {doc.title}\n{doc.content}\n"
        tokens = estimate_tokens(block)

        if used_tokens + tokens <= BUDGETS["retrieval"]:
            retrieval_text += block
            used_tokens += tokens
            doc.included = True
            doc.tokens_used = tokens
        else:
            doc.reason = "Budget exceeded"

        meta.append(doc)

    sections["retrieval"].content = retrieval_text
    sections["retrieval"].budget_used = used_tokens
    sections["retrieval"].details = meta
    sections["retrieval"].truncated = any(not d.included for d in meta)

    final_context = "\n---\n".join(
        sec.content for sec in sorted(sections.values(), key=lambda s: s.priority)
    )

    return AssembleResult(
        sections=sections,
        budgets=BUDGETS,
        final_context=final_context,
        retrieved_docs_meta=meta,
    )
