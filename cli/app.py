from context_builder import assemble_context
from tokenizer import estimate_tokens


def format_bar(used: int, max_tokens: int) -> str:
    pct = min(used / max_tokens, 1.0)
    blocks = int(pct * 10)
    return f"[{'█' * blocks}{'░' * (10 - blocks)}] {used}/{max_tokens}"


def main() -> None:
    print("\nContext-Window-Aware RAG (Python)\n")

    query = input("Query: ")
    memory = input("Memory: ")
    tool_outputs = input("Tool outputs: ")

    result = assemble_context(query, memory, tool_outputs)

    print("\nBUDGET OVERVIEW\n")
    for key, max_tokens in result.budgets.items():
        used = estimate_tokens(result.sections[key].content)
        print(f"{key.ljust(15)} {format_bar(used, max_tokens)}")

    print("\nFINAL CONTEXT\n")
    print(result.final_context)


if __name__ == "__main__":
    main()
