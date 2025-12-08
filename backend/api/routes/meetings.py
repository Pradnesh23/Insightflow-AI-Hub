from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Dict, Any
from agents import agent_graph, AgentState

router = APIRouter()


class MeetingRequest(BaseModel):
    """Request model for meeting generation"""
    user_id: str
    company_name: str
    topic: str
    context: str = ""
    participants: str = ""


class MeetingResponse(BaseModel):
    """Response model for meeting generation"""
    success: bool
    agenda: str
    research: str
    error: str = None


@router.post("/generate")
async def generate_meeting(request: MeetingRequest):
    """
    Generate meeting agenda and research using LangGraph orchestrator
    """
    try:
        # Create initial state
        initial_state: AgentState = {
            "messages": [],
            "task_type": "meeting",
            "user_id": request.user_id,
            "dataset_id": None,
            "data": None,
            "columns": None,
            "company_name": request.company_name,
            "topic": request.topic,
            "context": request.context,
            "participants": request.participants,
            "next_agent": "",
            "delegate_to": None,
            "collaboration_results": {},
            "final_output": None
        }
        
        # Run the agent graph
        result = agent_graph.invoke(initial_state)
        
        output = result.get("final_output", {})
        
        # Generate a meeting ID (in production, save to database)
        import uuid
        meeting_id = str(uuid.uuid4())
        
        return {
            "success": True,
            "meeting_id": meeting_id,
            "agenda": output.get("agenda", ""),
            "research": output.get("research", "")
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Meeting generation failed: {str(e)}"
        )


@router.get("/health")
async def health_check():
    """Health check for meetings service"""
    return {"status": "healthy", "service": "meetings"}
