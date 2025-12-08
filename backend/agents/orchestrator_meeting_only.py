"""
Enhanced LangGraph Multi-Agent Orchestrator  
Complete analysis: stats, correlations, outliers, all columns listed
"""

from typing import TypedDict, Annotated
from langgraph.graph import StateGraph, END
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.messages import HumanMessage, SystemMessage
from config.settings import settings
import operator


class AgentState(TypedDict):
    messages: Annotated[list, operator.add]
    task_type: str
    user_id: str
    dataset_id: str | None
    data: list | None
    columns: list | None
    company_name: str | None
    topic: str | None
    context: str | None
    participants: str | None
    next_agent: str
    delegate_to: str | None
    collaboration_results: dict
    final_output: dict | None


llm = ChatGoogleGenerativeAI(
    model="gemini-2.5-flash",
    google_api_key=settings.gemini_api_key,
    temperature=0.7,
    max_output_tokens=4096
)


def router_agent(state: AgentState) -> AgentState:
    task_type = state["task_type"]
    if "collaboration_results" not in state:
        state["collaboration_results"] = {}
    
    routing_map = {
        "meeting": "meeting_agent",
        "data_analysis": "data_analyst_agent",
        "data_quality": "quality_agent",
        "statistical": "data_analyst_agent",
        "correlation": "data_analyst_agent",
        "outliers": "data_analyst_agent",
        "report": "report_writer_agent",
        "chat": "data_analyst_agent",
    }
    
    next_agent = routing_map.get(task_type, "data_analyst_agent")
    state["next_agent"] = next_agent
    state["delegate_to"] = None
    state["messages"].append(SystemMessage(content=f"🎯 Routing to {next_agent} for {task_type}"))
    print(f"[Router] Task: {task_type} → Agent: {next_agent}")
    return state


def meeting_agent(state: AgentState) -> AgentState:
    company_name = state.get("company_name", "")
    topic = state.get("topic", "")
    context = state.get("context", "")
    participants = state.get("participants", "")
    
    print(f"[Meeting Agent] Generating for: {company_name} - {topic}")
    
    try:
        prompt = f"""Create a meeting package for {company_name} on: {topic}

Context: {context}
Participants: {participants}

Generate TWO sections:

**RESEARCH:**

Industry Trends:
• Trend 1 about {topic}
• Trend 2 about {topic}
• Trend 3 about {topic}

Best Practices:
• Best practice 1 for {topic}
• Best practice 2 for {topic}
• Best practice 3 for {topic}

Challenges:
• Challenge 1
• Challenge 2
• Challenge 3

Recommendations:
• Recommendation 1
• Recommendation 2
• Recommendation 3

**AGENDA:**

09:00-09:10 (10 min) **Welcome & Objectives**
• Brief welcome
• State objectives
• Outline outcomes

09:10-09:25 (15 min) **Context Review**
• Present research findings
• Discuss industry trends
• Highlight key insights

[Add 4-6 more agenda items with same format, total 90-120 min]

IMPORTANT: Use EXACTLY this format. Keep bullet points concise (one line each)."""
        
        response = llm.invoke([HumanMessage(content=prompt)])
        content = response.content
        
        print(f"[Meeting Agent] LLM Response length: {len(content)} chars")
        
        # Split into research and agenda
        parts = content.split("**AGENDA:**")
        research = parts[0].replace("**RESEARCH:**", "").strip() if len(parts) > 0 else content
        agenda = parts[1].strip() if len(parts) > 1 else "See research above"
        
        state["final_output"] = {"agenda": agenda, "research": research}
        state["next_agent"] = "end"
        print(f"[Meeting Agent] ✓ Complete - Research: {len(research)} chars, Agenda: {len(agenda)} chars")
        
    except Exception as e:
        print(f"[Meeting Agent] ERROR: {str(e)}")
        state["final_output"] = {
            "agenda": f"Error: {str(e)}",
            "research": f"Error: {str(e)}"
        }
        state["next_agent"] = "end"
    
    return state
