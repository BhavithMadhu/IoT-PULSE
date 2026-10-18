from typing import List, Optional
from fastapi import APIRouter, HTTPException
from backend.app.services.statistics_service import statistics_service
from backend.app.schemas.responses import QuestionDetail, QuestionsListResponse, CorrelationResponse

router = APIRouter(tags=["Statistical Investigation"])

@router.get("/statistics/questions", response_model=QuestionsListResponse)
def get_all_questions():
    questions = statistics_service.get_all_questions()
    return QuestionsListResponse(
        total_questions=len(questions),
        questions=questions
    )

@router.get("/statistics/questions/{qid}", response_model=QuestionDetail)
def get_question_by_id(qid: str):
    q = statistics_service.get_question_by_id(qid)
    if not q:
        raise HTTPException(status_code=404, detail=f"Question '{qid}' not found. Valid IDs: Q1 through Q15.")
    return q

@router.get("/correlations", response_model=CorrelationResponse)
def get_correlations():
    return statistics_service.get_correlation_matrix()
