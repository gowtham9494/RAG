"""Generator module — sends retrieved context + question to the LLM.

Prompts are stored as templates (not hardcoded strings) and the generation
layer is fully decoupled from the retrieval layer.
"""

from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate

from config import settings
from retrieval.retriever import retrieve_as_context


# ── Prompt Templates ─────────────────────────────────────────

SYSTEM_PROMPT = """You are a helpful AI assistant for Rock Insurance Company employees.
You answer questions using ONLY the provided context from the company's internal portal.

Rules:
1. Answer based solely on the context provided. Do not make up information.
2. If the context does not contain enough information to answer, say:
   "I don't have enough information from the company portal to answer that question.
    Please contact the relevant department for assistance."
3. Be concise, professional, and friendly.
4. When referencing specific policies or numbers, cite the section they come from.
5. Format your response in clean Markdown for readability.
"""

RAG_PROMPT_TEMPLATE = """Context from Rock Insurance Internal Portal:
---
{context}
---

Employee Question: {question}

Please provide a helpful answer based on the context above."""


def _get_llm() -> ChatOpenAI:
    """Return the configured LLM instance."""
    return ChatOpenAI(
        model=settings.llm_model,
        openai_api_key=settings.openai_api_key,
        openai_api_base=settings.openai_api_base,
        temperature=0.1,
        max_tokens=1024,
    )


def generate_answer(question: str) -> dict:
    """Run the full RAG pipeline: retrieve context → generate answer.

    Args:
        question: The employee's natural-language question.

    Returns:
        Dict with 'answer' and 'sources' keys.
    """
    # Step 1: Retrieve relevant context
    context, sources = retrieve_as_context(question)

    if not context:
        return {
            "answer": (
                "I couldn't find any relevant information in the company portal. "
                "Please try rephrasing your question or contact the IT Help Desk "
                "at helpdesk@rockinsurance.com / ext. 5000."
            ),
            "sources": [],
        }

    # Step 2: Build the prompt
    prompt = ChatPromptTemplate.from_messages([
        ("system", SYSTEM_PROMPT),
        ("human", RAG_PROMPT_TEMPLATE),
    ])

    # Step 3: Call the LLM
    llm = _get_llm()
    chain = prompt | llm
    response = chain.invoke({"context": context, "question": question})

    return {
        "answer": response.content,
        "sources": sources,
    }
