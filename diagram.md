flowchart TD
    U[User Query] --> A[assemble_context]

    M[Conversation Memory] --> A
    T[Tool Outputs] --> A

    A -->|enforce_budget| I[Instructions Section]
    A -->|enforce_budget| G[Goal Section]
    A -->|enforce_budget| M2[Memory Section]
    A -->|enforce_budget| T2[Tool Outputs Section]

    A --> R[Deterministic Retrieval]
    R -->|budgeted| D1[Doc 1]
    R -->|excluded| D2[Doc 2]

    I --> F[Final Context]
    G --> F
    M2 --> F
    R --> F
    T2 --> F


flowchart LR
    Q[Query] --> S[Sort Documents by Score]
    S --> B{Budget Remaining?}
    B -->|Yes| I[Include Document]
    B -->|No| E[Exclude Document]
    I --> B
