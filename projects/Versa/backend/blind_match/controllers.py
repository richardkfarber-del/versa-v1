from .models import QuizAnswer
# In a real app, you'd import a database session object
# from .database import SessionLocal

def submit_quiz_answers(db_session, user_id, session_id, quiz_id, answers):
    """
    Saves a user's quiz answers to the database.
    """
    # Basic validation
    if not all(['question_id' in ans and 'answer' in ans for ans in answers]):
        raise ValueError("Invalid answer format")

    new_answers = QuizAnswer(
        user_id=user_id,
        session_id=session_id,
        quiz_id=quiz_id,
        answers=answers # Encryption would happen here in a real implementation
    )
    db_session.add(new_answers)
    db_session.commit()
    return new_answers

def get_blind_matches(db_session, session_id, quiz_id):
    """
    Calculates the 'blind match' between two partners in a session.
    """
    # Retrieve answers for both users in the session
    all_answers = db_session.query(QuizAnswer).filter_by(
        session_id=session_id,
        quiz_id=quiz_id
    ).all()

    if len(all_answers) < 2:
        # Not all partners have submitted their answers
        return None 

    partner_a_answers = {ans['question_id']: ans['answer'] for ans in all_answers[0].answers}
    partner_b_answers = {ans['question_id']: ans['answer'] for ans in all_answers[1].answers}

    matches = []
    
    # Define what constitutes a "match"
    matching_responses = {'yes', 'maybe'}

    for question_id, answer_a in partner_a_answers.items():
        answer_b = partner_b_answers.get(question_id)
        if answer_b and answer_a.lower() in matching_responses and answer_b.lower() in matching_responses:
            matches.append(question_id)
            
    return matches
