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

Generate TWO sections with EXACT formatting:

**RESEARCH:**

Industry Trends:
• Trend about {topic}
• Another trend
• Third trend

Best Practices:
• Best practice for {topic}
• Another best practice
• Third best practice

Challenges:
• Challenge 1
• Challenge 2

Recommendations:
• Recommendation 1
• Recommendation 2
• Recommendation 3

**AGENDA:**

09:00-09:10 (10 min) **Welcome & Objectives**
• Brief welcome and introduction
• State meeting objectives
• Outline expected outcomes

09:10-09:25 (15 min) **Research Review**
• Present industry trends
• Discuss best practices
• Highlight key insights

09:25-09:40 (15 min) **Strategy Discussion**
• Define core strategy
• Identify target segments
• Set success metrics

09:40-09:55 (15 min) **Budget & Resources**
• Review budget allocation
• Discuss resource needs
• Assign responsibilities

09:55-10:10 (15 min) **Timeline & Milestones**
• Set key deadlines
• Define deliverables
• Establish checkpoints

10:10-10:25 (15 min) **Legal & Compliance**
• Review requirements
• Discuss approval process
• Address concerns

10:25-10:40 (15 min) **Action Items & Next Steps**
• Summarize decisions
• Assign action items
• Schedule follow-ups

CRITICAL: Use EXACT format "HH:MM-HH:MM (XX min) **Title**" for agenda. Keep bullets concise (one line each)."""
        
        response = llm.invoke([HumanMessage(content=prompt)])
        content = response.content
        
        print(f"[Meeting Agent] LLM Response length: {len(content)} chars")
        
        # Better splitting logic with multiple fallbacks
        agenda = ""
        research = ""
        
        if "**AGENDA:**" in content:
            parts = content.split("**AGENDA:**")
            research = parts[0].replace("**RESEARCH:**", "").strip()
            agenda = parts[1].strip()
        elif "AGENDA:" in content and "RESEARCH:" in content:
            parts = content.split("AGENDA:")
            research = parts[0].replace("RESEARCH:", "").replace("**RESEARCH:**", "").strip()
            agenda = parts[1].strip()
        else:
            # Fallback: split by finding first time pattern
            lines = content.split("\n")
            research_lines = []
            agenda_lines = []
            found_agenda = False
            
            for line in lines:
                # Look for time pattern like "09:00-09:10"
                if not found_agenda and ("09:00" in line or "10:00" in line or "11:00" in line):
                    found_agenda = True
                
                if found_agenda:
                    agenda_lines.append(line)
                else:
                    research_lines.append(line)
            
            research = "\n".join(research_lines).replace("**RESEARCH:**", "").replace("RESEARCH:", "").strip()
            agenda = "\n".join(agenda_lines).strip()
        
        # Ensure we have content
        if not agenda or len(agenda) < 50:
            agenda = "Meeting agenda not properly generated. Please try again."
        if not research or len(research) < 50:
            research = "Research not properly generated. Please try again."
        
        print(f"[Meeting Agent] Split - Research: {len(research)} chars, Agenda: {len(agenda)} chars")
        
        state["final_output"] = {"agenda": agenda, "research": research}
        state["next_agent"] = "end"
        print(f"[Meeting Agent] ✓ Complete - Research: {len(research)} chars, Agenda: {len(agenda)} chars")
        
    except Exception as e:
        print(f"[Meeting Agent] ERROR: {str(e)}")
        state["final_output"] = {
            "agenda": f"Error generating agenda: {str(e)}",
            "research": f"Error generating research: {str(e)}"
        }
        state["next_agent"] = "end"
    
    return state


def data_analyst_agent(state: AgentState) -> AgentState:
    import pandas as pd
    import numpy as np
    
    data = state.get("data", [])
    print(f"[Data Analyst] Processing {len(data)} rows")
    
    if not data or len(data) == 0:
        state["final_output"] = {"quality_report": "No data", "analysis_report": "No data"}
        state["next_agent"] = "end"
        return state
    
    try:
        df = pd.DataFrame(data)
        numeric_cols = df.select_dtypes(include=[np.number]).columns.tolist()
        
        # Statistics
        stats = {}
        for col in numeric_cols:
            col_data = df[col].dropna()
            if len(col_data) > 0:
                stats[col] = {
                    "count": int(len(col_data)),
                    "mean": round(float(col_data.mean()), 2),
                    "median": round(float(col_data.median()), 2),
                    "std": round(float(col_data.std()), 2),
                    "min": round(float(col_data.min()), 2),
                    "max": round(float(col_data.max()), 2)
                }
        
        # Correlations
        correlations = {}
        if len(numeric_cols) >= 1:
            corr_matrix = df[numeric_cols].corr()
            for col1 in numeric_cols:
                correlations[col1] = {}
                for col2 in numeric_cols:
                    correlations[col1][col2] = round(float(corr_matrix.loc[col1, col2]), 2)
        
        # Outliers
        outliers_summary = {}
        for col in numeric_cols:
            col_data = df[col].dropna()
            if len(col_data) > 0:
                Q1 = col_data.quantile(0.25)
                Q3 = col_data.quantile(0.75)
                IQR = Q3 - Q1
                lower = Q1 - 1.5 * IQR
                upper = Q3 + 1.5 * IQR
                outlier_count = int(((col_data < lower) | (col_data > upper)).sum())
                
                outliers_summary[col] = {
                    "count": outlier_count,
                    "percentage": round(float(outlier_count / len(col_data) * 100), 1) if outlier_count > 0 else 0,
                    "bounds": {"lower": round(float(lower), 2), "upper": round(float(upper), 2)},
                    "quartiles": {"Q1": round(float(Q1), 2), "Q3": round(float(Q3), 2), "IQR": round(float(IQR), 2)}
                }
        
        # Quality
        missing = int(df.isna().sum().sum())
        total = len(df) * len(df.columns)
        quality_score = round(100 - (missing / total * 100), 1)
        
        # All columns list
        all_cols_list = []
        for col in df.columns:
            col_type = "numeric" if col in numeric_cols else "text"
            all_cols_list.append(f"  - {col} ({col_type})")
        
        # AI Insights
        insight_prompt = "Dataset: " + str(len(df)) + " rows, " + str(len(df.columns)) + " cols. Quality: " + str(quality_score) + "/100. Give 2-3 key insights."
        response = llm.invoke([HumanMessage(content=insight_prompt)])
        
        analysis_report = "**Statistical Analysis**\n\n"
        for col, s in stats.items():
            analysis_report += f"**{col}**: Mean={s['mean']}, Median={s['median']}, StdDev={s['std']}, Range=[{s['min']}, {s['max']}]\n"
        analysis_report += "\n**Insights:**\n" + response.content
        
        quality_report = f"""**Quality Score: {quality_score}/100**
- Total Rows: {len(df)}
- Total Columns: {len(df.columns)} ({len(numeric_cols)} numeric, {len(df.columns) - len(numeric_cols)} text)
- Missing: {missing}/{total} ({round(missing/total*100,1)}%)
- Correlations: {len(correlations)} columns{' (self-corr)' if len(numeric_cols) == 1 else ''}
- Outliers: {sum(1 for v in outliers_summary.values() if v['count'] > 0)} columns

**All Columns:**
{chr(10).join(all_cols_list)}"""
        
        state["final_output"] = {
            "quality_report": quality_report,
            "analysis_report": analysis_report,
            "statistics": stats,
            "correlations": correlations,
            "outliers": outliers_summary,
            "quality_score": quality_score
        }
        state["next_agent"] = "end"
        print(f"[Data Analyst] ✓ Complete ({len(df)} rows, {len(df.columns)} cols: {len(numeric_cols)} numeric)")
        return state
        
    except Exception as e:
        print(f"[Data Analyst] ✗ Error: {e}")
        import traceback
        traceback.print_exc()
        state["final_output"] = {"quality_report": f"Error: {e}", "analysis_report": f"Error: {e}"}
        state[" next_agent"] = "end"
        return state


def quality_agent(state: AgentState) -> AgentState:
    import pandas as pd
    data = state.get("data", [])
    print(f"[Quality Agent] Checking {len(data)} rows")
    
    if not data:
        state["final_output"] = {"quality_report": "No data", "quality_score": 0}
        state["next_agent"] = "end"
        return state
    
    try:
        df = pd.DataFrame(data)
        missing = int(df.isna().sum().sum())
        total = len(df) * len(df.columns)
        duplicates = df.duplicated().sum()
        quality_score = round(100 - (missing / total * 100) - (duplicates / len(df) * 10), 1)
        
        report = f"""**Quality Assessment**

Score: **{quality_score}/100**

- Total Rows: {len(df):,}
- Total Columns: {len(df.columns)}
- Missing Values: {missing:,} ({round(missing/total*100,1)}%)
- Duplicate Rows: {duplicates}

**Recommendation:** {"Good quality data" if quality_score > 80 else "Consider data cleaning"}"""
        
        state["final_output"] = {"quality_report": report, "quality_score": quality_score}
        state["next_agent"] = "end"
        print(f"[Quality Agent] ✓ Score: {quality_score}/100")
        return state
    except Exception as e:
        print(f"[Quality Agent] ✗ Error: {e}")
        state["final_output"] = {"quality_report": f"Error: {e}", "quality_score": 0}
        state["next_agent"] = "end"
        return state


def report_writer_agent(state: AgentState) -> AgentState:
    print(f"[Report Writer] Starting")
    collab = state.get("collaboration_results", {})
    
    if not collab.get("data_analysis"):
        print(f"[Report Writer] → Delegating to Data Analyst")
        state["delegate_to"] = "data_analyst_agent"
        return state
    
    analysis = collab["data_analysis"]
    prompt = f"""Create a concise executive report:

**Analysis:** {analysis.get('analysis_report', 'N/A')}
**Quality:** {analysis.get('quality_report', 'N/A')}

Format as:
1. Executive Summary (2-3 sentences)
2. Key Findings (3 bullets)
3. Recommendations (2-3 bullets)"""
    
    response = llm.invoke([HumanMessage(content=prompt)])
    state["final_output"] = {"report": response.content}
    state["next_agent"] = "end"
    print(f"[Report Writer] ✓ Complete")
    return state


def create_agent_graph():
    workflow = StateGraph(AgentState)
    
    workflow.add_node("router", router_agent)
    workflow.add_node("meeting_agent", meeting_agent)
    workflow.add_node("data_analyst_agent", data_analyst_agent)
    workflow.add_node("quality_agent", quality_agent)
    workflow.add_node("report_writer_agent", report_writer_agent)
    
    workflow.set_entry_point("router")
    
    def route_from_router(state: AgentState) -> str:
        return state["next_agent"]
    
    workflow.add_conditional_edges(
        "router",
        route_from_router,
        {
            "meeting_agent": "meeting_agent",
            "data_analyst_agent": "data_analyst_agent",
            "quality_agent": "quality_agent",
            "report_writer_agent": "report_writer_agent",
        }
    )
    
    def route_from_agent(state: AgentState) -> str:
        next_agent = state.get("next_agent", "end")
        print(f"[Routing] next_agent = {next_agent}")
        return next_agent
    
    for agent in ["data_analyst_agent", "quality_agent", "report_writer_agent"]:
        workflow.add_conditional_edges(
            agent,
            route_from_agent,
            {
                "data_analyst_agent": "data_analyst_agent",
                "quality_agent": "quality_agent",
                "end": END
            }
        )
    
    workflow.add_edge("meeting_agent", END)
    return workflow.compile()


agent_graph = create_agent_graph()
print("✓ LangGraph: All columns listed, Stats, Correlations, Outliers, Meetings, Chat")
