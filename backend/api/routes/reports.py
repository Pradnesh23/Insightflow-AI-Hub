from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
from agents import agent_graph, AgentState

router = APIRouter()


class ReportRequest(BaseModel):
    """Request model for report generation"""
    user_id: str
    dataset_id: str
    data: List[Dict[str, Any]]
    columns: List[str]


class ReportResponse(BaseModel):
    """Response model for report generation"""
    success: bool
    report: str
    error: Optional[str] = None


@router.post("/generate", response_model=ReportResponse)
async def generate_report(request: ReportRequest):
    """
    Generate professional report using LangGraph orchestrator
    Routes to Report Writer agent automatically
    """
    try:
        # Create initial state
        initial_state: AgentState = {
            "messages": [],
            "task_type": "report",
            "user_id": request.user_id,
            "dataset_id": request.dataset_id,
            "data": request.data,
            "columns": request.columns,
            "company_name": None,
            "topic": None,
            "context": None,
            "participants": None,
            "next_agent": "",
            "delegate_to": None,
            "collaboration_results": {},
            "final_output": None
        }
        
        # Run the agent graph
        result = agent_graph.invoke(initial_state)
        
        output = result.get("final_output", {})
        
        return ReportResponse(
            success=True,
            report=output.get("report", "")
        )
        
    except Exception as e:
        print(f"[Reports API] Error: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(
            status_code=500,
            detail=f"Report generation failed: {str(e)}"
        )


@router.get("/health")
async def health_check():
    """Health check for reports service"""
    return {"status": "healthy", "service": "reports"}
