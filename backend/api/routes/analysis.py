from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
from agents import agent_graph, AgentState

router = APIRouter()


class AnalysisRequest(BaseModel):
    """Request model for data analysis"""
    user_id: str
    dataset_id: str
    data: List[Dict[str, Any]]
    columns: List[str]


class AnalysisResponse(BaseModel):
    """Response model for data analysis"""
    success: bool
    quality_report: str
    analysis_report: str
    statistics: Optional[Dict[str, Any]] = {}
    correlations: Optional[Dict[str, Any]] = {}
    outliers: Optional[Dict[str, Any]] = {}
    quality_score: Optional[float] = 0
    error: Optional[str] = None


@router.post("/analyze")
async def analyze_data(request: AnalysisRequest):
    """
    Analyze dataset using LangGraph orchestrator
    Returns complete analysis with stats, correlations, and outliers
    """
    try:
        # Create initial state
        initial_state: AgentState = {
            "messages": [],
            "task_type": "data_analysis",
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
        
        # Return complete analysis data
        return {
            "success": True,
            "quality_report": output.get("quality_report", ""),
            "analysis_report": output.get("analysis_report", ""),
            "statistics": output.get("statistics", {}),
            "correlations": output.get("correlations", {}),
            "outliers": output.get("outliers", {}),
            "quality_score": output.get("quality_score", 0)
        }
        
    except Exception as e:
        print(f"[Analysis API] Error: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(
            status_code=500,
            detail=f"Analysis failed: {str(e)}"
        )


@router.get("/health")
async def health_check():
    """Health check for analysis service"""
    return {"status": "healthy", "service": "analysis"}
