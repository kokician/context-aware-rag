from dataclasses import dataclass
from typing import List, Dict, Optional


@dataclass
class CorpusDoc:
    id: str
    title: str
    content: str


@dataclass
class RetrievedDoc(CorpusDoc):
    score: float
    tokens: int
    included: bool = False
    tokens_used: Optional[int] = None
    reason: Optional[str] = None


@dataclass
class Section:
    content: str
    source: str
    priority: int
    truncated: bool = False
    details: Optional[List[RetrievedDoc]] = None
    budget_used: Optional[int] = None


@dataclass
class AssembleResult:
    sections: Dict[str, Section]
    budgets: Dict[str, int]
    final_context: str
    retrieved_docs_meta: List[RetrievedDoc]
