version: "2.0"
name: "JusticeLeague_Universal_UI_Build"
description: "Deterministic pipeline for UI components, bypassing orchestrator API loops."

stages:
  - name: "requirements_definition"
    agent: "oracle"
    model: "google/gemini-3-pro"
    instruction: "Read the target feature request, generate a strict technical PRD, and explicitly log the saved PRD file path to the console."
    next_stage: "architecture_scaffolding"

  - name: "architecture_scaffolding"
    agent: "lantern"
    model: "ollama/qwen-agent-32k"
    instruction: "Convert the PRD into UI component scaffolding and local state definitions. Explicitly log all saved file paths to the console."
    next_stage: "engineering_qa_loop"

  # Loop 1: Functionality & UI Verification
  - name: "engineering_qa_loop"
    type: "evaluator_loop"
    max_iterations: 5
    workers:
      builder: 
        agent: "lucius"
        model: "ollama/qwen-agent-32k"
        instruction: "Implement the code based on the scaffolding. Save to /app/workspace/Versa/... and log the saved path to the console."
      evaluator:
        agent: "cyborg"
        model: "ollama/qwen-agent-32k"
        instruction: "Run local static analysis and UI validation on Lucius's output. Log QA pass/fail status to the console."
    routing:
      on_fail: "builder"              
      on_success: "security_audit"    

  # Loop 2: The DevSecOps Hard Block
  - name: "security_audit"
    type: "evaluator_loop"
    max_iterations: 3
    workers:
      builder:
        agent: "lucius"
        model: "ollama/qwen-agent-32k"
        instruction: "Review Martian Manhunter's security report and patch the requested vulnerabilities. Log the updated file path."
      evaluator:
        agent: "manhunter"
        model: "ollama/qwen-agent-32k"
        instruction: "Run local SAST tools and scan the code for OWASP vulnerabilities. Log the audit results to the console."
    routing:
      on_fail: "builder"              
      on_success: "finalize"          

  - name: "finalize"
    agent: "alfred"
    model: "google/gemini-3-pro"
    instruction: "Log the finalized file path to the master session tracker and notify the user that the pipeline has completed."
    end_pipeline: true