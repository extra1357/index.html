from fastapi import FastAPI
from workflows.autonomous_pipeline import AutonomousPipeline
from core.orchestrator import Orchestrator
from agents.planner_agent import PlannerAgent
from agents.executor_agent import ExecutorAgent
from core.tool_registry import ToolRegistry
from tools.default_tools import collect_data, analyze, generate_report, execute

app = FastAPI()

registry = ToolRegistry()
registry.register("collect_data", collect_data)
registry.register("analyze", analyze)
registry.register("generate_report", generate_report)
registry.register("execute", execute)

planner = PlannerAgent()
executor = ExecutorAgent(registry)
orch = Orchestrator(planner, executor)

pipeline = AutonomousPipeline(orch)

@app.get("/run")
def run(task: str):
    return {"result": pipeline.trigger(task)}
