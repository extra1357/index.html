class Orchestrator:
    def __init__(self, planner, executor):
        self.planner = planner
        self.executor = executor

    def run(self, task):
        steps = self.planner.plan(task)
        results = []

        for step in steps:
            result = self.executor.execute(step)
            results.append(result)

        return results
